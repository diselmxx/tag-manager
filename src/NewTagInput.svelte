<script>
  import { onMount, getContext } from "svelte";
  import SearchList from "./SearchList.svelte";

  export let allTags;
  export let addItem;
  export let userRowId;
  //   export let fetchSearchTags;

  const { API, notificationStore } = getContext("sdk");

  let newItem = "";
  let newColor = "#c2f5e9";
  let newItemInputForm = null;
  let inputOpen = false;
  let searchItems = [];

  $: search = fetchSearchTags(newItem);
  $: tagExistGlobal = Boolean(
    searchItems.filter(
      (tag) => tag.name.toLowerCase() === newItem.toLowerCase()
    ).length
  );

  const fetchSearchTags = async (tag) => {
    if (!tag) {
      return [];
    }

    const response = await API.post({
      url: `/api/${allTags.tableId}/search`,
      body: {
        query: {
          string: {},
          fuzzy: { "1:name": tag },
          range: {},
          equal: {},
          notEqual: {},
          empty: {},
          notEmpty: {},
          contains: {},
          notContains: {},
          oneOf: {},
          containsAny: {},
        },
        bookmark: null,
        limit: 999,
        sortOrder: "descending",
        sortType: "string",
        paginate: false,
      },
    });
    searchItems = response.rows;
  };

  async function createTag() {
    try {
      return await API.saveRow({
        ...allTags,
        ...{
          //(name,color,friends now are hardcoded(columns name))
          name: newItem,
          color: newColor,
          friends: [{ _id: userRowId }],
        },
      });
    } catch (e) {
      notificationStore.actions.error("Failed to create tags");
    }
  }

  async function updateTag(tag) {
    try {
      return await API.saveRow({
        ...allTags,
        ...{
          //(name,color,friends now are hardcoded(columns name))
          _id: tag._id,
          name: tag.name,
          color: newColor,
          friends: [...tag.friends, { _id: userRowId }],
        },
      });
    } catch (e) {
      notificationStore.actions.error("Failed to create tags");
    }
  }

  async function addToList(tag) {
    if (newItem) {
      const newOrUpdatedTag = tag?._id
        ? await updateTag(tag)
        : await createTag();
      addItem(newOrUpdatedTag);
      newItem = "";
      hideInput();
    } else {
      setTimeout(() => {
        newItemInputForm.focus();
      }, 100);
    }
  }

  function hideInput() {
    inputOpen = false;
  }
</script>

<div class="hidden-input">
  {#if !inputOpen}
    <button
      class="add-tag-button"
      on:click={() => {
        inputOpen = true;
        setTimeout(() => {
          newItemInputForm.focus();
        }, 100);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 50 50"
        style="enable-background:new 0 0 50 50"
        xml:space="preserve"
        ><circle style="fill:#43b05c" cx="25" cy="25" r="25" /><path
          style="fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"
          d="M25 13v25M37.5 25h-25"
        /></svg
      >
    </button>
  {/if}
  {#if inputOpen}
    <div class="tags-input-wrapper">
      <div style="position:relative;font-size:0">
        <input
          bind:value={newItem}
          bind:this={newItemInputForm}
          on:blur={() => newItem || hideInput()}
          on:keydown={(e) => {
            e.key === "Escape" ? hideInput() : "";
          }}
          on:keydown={(e) => {
            e.key === "Enter" && !tagExistGlobal ? addToList() : "";
          }}
          type="text"
          placeholder="Add a new tag"
          class="tags-input"
        />
        <SearchList
          bind:items={searchItems}
          {addToList}
          {tagExistGlobal}
          isVisible={newItem}
        />
      </div>
      {#if newItem && !tagExistGlobal}
        <button class="add-tag-button2" on:click={addToList}>Add</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tags-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tags-input {
    width: 250px;
    height: 24px;
    font-size: 14px;
    padding: 0 4px;
    border: 1px solid #ccc;
    outline: none;
  }
  .hidden-input {
    display: inline-flex;
    list-style: none;
    font-size: 24px;
    flex: none;
    padding: 0;
    margin: 10px 0 0;
    /* margin: 4px; */
    font-weight: bold;
    align-self: flex-start;
    cursor: pointer;
    order: 999;
  }

  .add-tag-button,
  .add-tag-button2 {
    background: none;
    padding: 0;
    margin: 0;
    outline: none;
    border: none !important;
  }
  .add-tag-button {
    border-radius: 100%;
    font-size: 0;
  }
  .add-tag-button2:hover {
    background: #dfdcdc;
  }
  .add-tag-button2 {
    background: #f5f1f1;
    height: 100%;
    padding: 2px 5px;
    font-size: 14px;
    margin-left: 8px;
    border-radius: 3px;
    transition: 0.2s;
  }
  .hidden-input .add-tag-button {
    /* visibility: hidden;
    opacity: 0; */
    transition: 0.2s;
  }
  .hidden-input .add-tag-button:hover {
    transform: scale(1.1);
  }
</style>
