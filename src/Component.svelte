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

  const { API, styleable, notificationStore } = getContext("sdk");
  const component = getContext("component");

  let userRow;
  let allTagsOrder = [];
  let items = [];

  const sortableOptions = {
    group: {
      name: "items",
    },
    animation: 300,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

  onMount(async () => {
    userRow = await fetchUserRow();

    //Get tags order
    allTagsOrder =
      (userRow[userTagsOrderColumn] &&
        JSON.parse(userRow[userTagsOrderColumn]).map(
          (item) => item && item._id
        )) ||
      [];

    //Sort tags by order
    if (allTagsOrder.length) {
      items = mapOrder(allUserTags.value, allTagsOrder, "_id");
    }
  });

  const fetchUserRow = async () => {
    if (!users?.tableId || !userRowId || !userTagsOrderColumn) {
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

  function itemOrderChanged(event, column) {
    saveTags(event.detail, column);
  }

  function getItemById(id) {
    return items.find((item) => item._id == id);
  }
</script>

<td colspan="2" use:styleable={$component.styles}>
  <h3 class="title">All user tags</h3>
  <div class="basket-wrappper">
    <SortableList
      ulClass="basket"
      liClass="basket-item"
      {sortableOptions}
      on:orderChanged={(e) => itemOrderChanged(e, userTagsOrderColumn)}
      bind:items
      idKey="_id"
      let:item
      {getItemById}
    >
      <ToDoListItem {item} on:click={() => removeItem(item._id)} />
    </SortableList>
    <ToDoInputForm {allTags} {addItem} {userRowId} />
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
  :global(button) {
    cursor: pointer;
  }
</style>
