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

  const sortableOptions1 = {
    group: {
      name: "items",
      pull: "clone",
      put: false,
    },
    animation: 300,
    easing: "cubic-bezier(1, 0, 0, 1)",
    onAdd: function (evt) {
      items = items;
    },
    onRemove: function (evt) {
      items = items;
    },
    onEnd: function (evt) {
      items = items;
    },
  };

  const sortableOptions2 = {
    group: {
      name: "items",
    },
    animation: 300,
    easing: "cubic-bezier(1, 0, 0, 1)",
    onAdd: function (evt) {
      items2 = items2;
    },
    onRemove: function (evt) {
      items2 = items2;
    },
    onEnd: function (evt) {
      items2 = items2;
    },
  };

  onMount(async () => {
    userRow = await fetchUserRow();

    allTagsOrder =
      (userRow[userTagsOrderColumn] &&
        JSON.parse(userRow[userTagsOrderColumn]).map(
          (item) => item && item._id
        )) ||
      [];

    highlightedTagsOrder =
      (userRow[userHighlightedTagsOrderColumn] &&
        JSON.parse(userRow[userHighlightedTagsOrderColumn]).map(
          (item) => item && item._id
        )) ||
      [];

    if (allTagsOrder.length) {
      items = mapOrder(allUserTags.value, allTagsOrder, "_id");
    }

    if (highlightedTagsOrder.length) {
      const highlightedTags = allUserTags.value.filter((item) =>
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
    try {
      const userRow = await fetchUserRow();
      return await API.saveRow({
        ...{ ...userRow, [column]: JSON.stringify(tags) },
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
    console.log("New tag created ans saved", newTag);
  }

  const removeItem = async (id) => {
    const tagRow = await fetchTagRow(id);
    const tagFriends =
      tagRow.friends.filter((item) => item._id !== userRowId) || [];

    await API.saveRow({
      ...{ ...tagRow, friends: tagFriends },
      ...allTags,
    });
    const newItems = items.filter((item) => item._id !== id);
    saveTags(newItems, userTagsOrderColumn);
    items = newItems;
  };

  function itemOrderChanged(event, column, timeout) {
    console.log(`item order changed in ${column}`, event.detail);
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
      sortableOptions={sortableOptions1}
      on:orderChanged={(e) => itemOrderChanged(e, userTagsOrderColumn, 0)}
      {items}
      idKey="_id"
      let:item
      {getItemById}
    >
      <ToDoListItem {item} on:click={() => removeItem(item._id)} />
    </SortableList>
    <ToDoInputForm {allTags} {addItem} {userRowId} />
  </div>

  <h3 class="title">Highlighted tags</h3>
  <div class="basket-wrappper">
    <SortableList
      ulClass="basket"
      liClass="basket-item"
      sortableOptions={sortableOptions2}
      items={items2}
      on:orderChanged={(e) =>
        itemOrderChanged(e, userHighlightedTagsOrderColumn, 500)}
      idKey="_id"
      let:item
      {getItemById}
    >
      <ToDoListItem {item} on:click={() => removeItem(item._id)} />
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
