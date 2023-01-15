<script>
  import { onMount, getContext } from "svelte";
  import { mapOrder } from "./utils.js";
  import SortableList from "@palsch/svelte-sortablejs";
  import ToDoListItem from "./ToDoListItem.svelte";
  import ToDoInputForm from "./TodoInputForm.svelte";

  export let users;
  export let allTags;
  export let allUserTags;
  export let userRowId;
  export let userTagsOrderColumn;
  export let userHighlightedTagsOrderColumn;

  const { API, styleable, notificationStore } = getContext("sdk");
  const component = getContext("component");

  let userRow;
  let allTagsOrder = [];
  let highlightedTagsOrder = [];
  let items = [];
  let items2 = [];

  const sortableOptions = {
    group: "items",
    animation: 300,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

  onMount(async () => {
    userRow = await fetchUserRow();
    const userTagsParse = JSON.parse(userRow[userTagsOrderColumn]);
    const userHighlightedTagsParse = JSON.parse(
      userRow[userHighlightedTagsOrderColumn]
    );

    const allUserTagsValue = setColors(
      allUserTags.value,
      userTagsParse,
      userHighlightedTagsParse
    );

    allTagsOrder =
      (userTagsParse.length && userTagsParse.map((item) => item && item._id)) ||
      [];

    highlightedTagsOrder =
      (userHighlightedTagsParse.length &&
        userHighlightedTagsParse.map((item) => item && item._id)) ||
      [];

    if (allTagsOrder.length) {
      const allTags = allUserTagsValue.filter((item) =>
        allTagsOrder.includes(item._id)
      );
      items = mapOrder(allTags, allTagsOrder, "_id");
    }

    if (highlightedTagsOrder.length) {
      const highlightedTags = allUserTagsValue.filter((item) =>
        highlightedTagsOrder.includes(item._id)
      );
      items2 = mapOrder(highlightedTags, highlightedTagsOrder, "_id");
    }
  });

  const fetchUserRow = async () => {
    if (
      !users?.tableId ||
      !userRowId ||
      !userTagsOrderColumn ||
      !userHighlightedTagsOrderColumn
    ) {
      return null;
    }
    return await API.fetchRow({ rowId: userRowId, tableId: users.tableId });
  };

  const fetchTagRow = async (id) => {
    if (!allTags?.tableId || !userRowId || !id) {
      return null;
    }
    return await API.fetchRow({ rowId: id, tableId: allTags.tableId });
  };

  const saveTags = async (tags, column) => {
    const tagsMinify = tags.map((tag) => {
      return { _id: tag._id, color: tag.color };
    });
    try {
      const userRow = await fetchUserRow();
      notificationStore.actions.success("Saved...");
      notificationStore.actions.blockNotifications(2000);
      return await API.saveRow({
        ...{ ...userRow, [column]: JSON.stringify(tagsMinify) },
        ...users,
      });
    } catch (e) {
      notificationStore.actions.error("Failed to save tags");
    }
  };

  function addItem(newTag) {
    items.push(newTag);
    saveTags([...items, newTag], userTagsOrderColumn);
    items = items;
  }

  function setColors(allValues, list1, list2) {
    const commonList = [...list1, ...list2];
    return allValues.map((item) => {
      return (item = {
        ...item,
        color: commonList.find((i) => i._id === item._id)?.color || "#c2f5e9",
      });
    });
  }

  function itemOrderChanged(event, column, timeout) {
    setTimeout(() => {
      saveTags(event.detail, column);
    }, timeout);
  }

  function getItemById(id) {
    return items.concat(items2).find((item) => item._id == id);
  }
</script>

<td colspan="2" use:styleable={$component.styles}>
  <h3 class="title">All user tags</h3>
  <div class="basket-wrappper">
    <SortableList
      ulClass="basket"
      liClass="basket-item"
      {sortableOptions}
      on:orderChanged={(e) => itemOrderChanged(e, userTagsOrderColumn, 0)}
      bind:items
      idKey="_id"
      let:item
      {getItemById}
    >
      <ToDoListItem
        {item}
        bind:items
        {saveTags}
        {fetchTagRow}
        column={userTagsOrderColumn}
      />
    </SortableList>
    <ToDoInputForm {allTags} {addItem} {userRowId} />
  </div>

  <h3 class="title">Highlighted tags</h3>
  <div class="basket-wrappper">
    <SortableList
      ulClass="basket"
      liClass="basket-item"
      {sortableOptions}
      bind:items={items2}
      on:orderChanged={(e) =>
        itemOrderChanged(e, userHighlightedTagsOrderColumn, 500)}
      idKey="_id"
      let:item
      {getItemById}
    >
      <ToDoListItem
        {item}
        bind:items={items2}
        {saveTags}
        {fetchTagRow}
        column={userHighlightedTagsOrderColumn}
      />
    </SortableList>
  </div>
</td>

<style>
  :global(.basket) {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    min-height: 50px;
    margin: -4px;
  }

  :global(.basket-item) {
    position: relative;
    padding: 0;
    margin: 4px;
    font-size: 0;
    border-radius: 25px;
    font-size: 0;
  }

  :global(.basket-wrapper:hover) {
    border: 1px solid rgb(212, 164, 5);
  }

  :global(.basket-wrappper) {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid rgb(56, 43, 43);
    border-radius: 20px;
  }

  :global(.basket-wrappper + .basket-wrappper) {
    margin-top: 40px;
  }

  :global(.title) {
    margin-bottom: 10px;
  }
  :global(li) {
    list-style: none;
  }
  :global(ul) {
    padding: 0;
  }
</style>
