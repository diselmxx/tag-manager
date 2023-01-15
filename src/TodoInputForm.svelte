<script>
  import { onMount, getContext } from "svelte";
  import SearchList from "./SearchList.svelte";

  export let allTags;
  export let addItem;
  export let userRowId;
  export let fetchAllTags;

  const { API, notificationStore } = getContext("sdk");

  let newItem = "";
  let newColor = "#c2f5e9";
  let newItemInputForm = null;
  let inputOpen = false;
  let fetchedAllTags = [];

  $: searchItems = fetchedAllTags.filter((tag) => tag.name.includes(newItem));

  onMount(async () => {
    fetchedAllTags = await fetchAllTags();
    console.log(fetchedAllTags);
  });

  async function createTag() {
    try {
      return await API.saveRow({
        ...allTags,
        ...{
          name: newItem,
          color: newColor,
          friends: [{ _id: userRowId }],
        },
      });
    } catch (e) {
      notificationStore.actions.error("Failed to create tags");
    }
  }

  async function addToList() {
    if (newItem) {
      const newTag = await createTag();
      addItem(newTag);
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

  function setValue(value) {
    newItem = value;
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
      <div style="position:relative;">
        <input
          bind:value={newItem}
          bind:this={newItemInputForm}
          on:blur={() => newItem || hideInput()}
          on:keydown={(e) => {
            e.key === "Enter" ? addToList() : "";
            e.key === "Escape" ? hideInput() : "";
          }}
          type="text"
          placeholder="Add a new tag"
          class="tags-input"
        />
        <SearchList bind:items={searchItems} {setValue} isVisible={newItem} />
      </div>
      {#if newItem}
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
    height: 25px;
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
    border: 1px solid transparent;
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
