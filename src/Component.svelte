<script>
  import { onMount, getContext } from "svelte";
  import { mapOrder } from "./utils.js";
  import SortableList from "@palsch/svelte-sortablejs";
  import Tag from "./Tag.svelte";
  import NewTagInput from "./NewTagInput.svelte";

  export let users;
  export let allTags;
  export let allUserTags;
  export let userRowId;
  export let firstFieldTagsColumn;
  export let firstFieldTitle;
  export let secondField;
  export let secondFieldTitle;
  export let secondFieldTagsColumn;

  const { API, styleable, notificationStore } = getContext("sdk");
  const component = getContext("component");

  let userRow;
  let firstFieldTagsOrder = [];
  let items = [];
  let secondFieldTagsOrder = [];
  let items2 = [];

  const sortableOptions = {
    group: "items",
    animation: 300,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

  onMount(async () => {
    userRow = await fetchUserRow();
    const firstFieldTagsParse = JSON.parse(userRow[firstFieldTagsColumn]) || [];
    const secondFieldTagsParse =
      JSON.parse(userRow[secondFieldTagsColumn]) || [];

    const allUserTagsValue = setColors(
      allUserTags.value,
      firstFieldTagsParse,
      secondFieldTagsParse
    );

    firstFieldTagsOrder =
      (firstFieldTagsParse.length &&
        firstFieldTagsParse.map((item) => item && item._id)) ||
      [];

    secondFieldTagsOrder =
      (secondFieldTagsParse.length &&
        secondFieldTagsParse.map((item) => item && item._id)) ||
      [];

    if (firstFieldTagsOrder.length) {
      const firstFieldTags = allUserTagsValue.filter((item) =>
        firstFieldTagsOrder.includes(item._id)
      );
      items = mapOrder(firstFieldTags, firstFieldTagsOrder, "_id");
    }

    if (secondFieldTagsOrder.length) {
      const secondFieldTags = allUserTagsValue.filter((item) =>
        secondFieldTagsOrder.includes(item._id)
      );
      items2 = mapOrder(secondFieldTags, secondFieldTagsOrder, "_id");
    }
  });

  const fetchUserRow = async () => {
    if (
      !users?.tableId ||
      !userRowId ||
      !firstFieldTagsColumn ||
      !secondFieldTagsColumn
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
    saveTags([...items, newTag], firstFieldTagsColumn);
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
  {#if firstFieldTitle}
    <h3 class="title">{firstFieldTitle}</h3>
  {/if}
  <div class="basket-wrappper">
    <SortableList
      ulClass="basket"
      liClass="basket-item"
      {sortableOptions}
      on:orderChanged={(e) => itemOrderChanged(e, firstFieldTagsColumn, 0)}
      bind:items
      idKey="_id"
      let:item
      {getItemById}
    >
      <Tag
        {item}
        bind:items
        {saveTags}
        {fetchTagRow}
        {userRowId}
        {allTags}
        column={firstFieldTagsColumn}
      />
    </SortableList>
    <NewTagInput {allTags} {addItem} {userRowId} />
  </div>

  {#if secondField}
    {#if secondFieldTitle}
      <h3 class="title">{secondFieldTitle}</h3>
    {/if}
    <div class="basket-wrappper">
      <SortableList
        ulClass="basket"
        liClass="basket-item"
        {sortableOptions}
        bind:items={items2}
        on:orderChanged={(e) => itemOrderChanged(e, secondFieldTagsColumn, 500)}
        idKey="_id"
        let:item
        {getItemById}
      >
        <Tag
          {item}
          bind:items={items2}
          {saveTags}
          {fetchTagRow}
          {userRowId}
          {allTags}
          column={secondFieldTagsColumn}
        />
      </SortableList>
    </div>
  {/if}
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
