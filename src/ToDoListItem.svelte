<script>
  import { tagsColors, mapOrder } from "./utils.js";
  //   import { allUserItems, activeItems, allUserItemsIds } from "./store.js";

  export let item;
  export let items;
  export let saveTags;
  export let column;

  let editable = false;
  let newColor = "#c2f5e9";
  let ColorInput = null;

  function showInput() {
    editable = true;
    setTimeout(() => {
      ColorInput.focus();
    }, 100);
  }
  function hideInput() {
    editable = false;
  }

  function onColorChange() {
    items = items.map((tag) => {
      tag._id === item._id ? (tag.color = newColor) : tag;
      return tag;
    });
    saveTags(items, column);
    hideInput();
  }
</script>

<div
  class="item"
  style="background-color: {item.color}"
  on:dblclick={() => showInput()}
>
  {item.name}
  <button class="remove-tag-button" on:click
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width="10"
      height="10"
      ><path
        d="M7 4a.995.995 0 0 0-.707.293l-2 2a.999.999 0 0 0 0 1.414L11.586 15l-7.293 7.293a.999.999 0 0 0 0 1.414l2 2a.999.999 0 0 0 1.414 0L15 18.414l7.293 7.293a.999.999 0 0 0 1.414 0l2-2a.999.999 0 0 0 0-1.414L18.414 15l7.293-7.293a.999.999 0 0 0 0-1.414l-2-2a.999.999 0 0 0-1.414 0L15 11.586 7.707 4.293A.996.996 0 0 0 7 4z"
      /></svg
    ></button
  >
  {#if editable}
    <input
      bind:value={newColor}
      on:blur={() => hideInput()}
      on:change={() => onColorChange()}
      bind:this={ColorInput}
      type="color"
      class="color-tags-input"
      list="presetColors"
    />
    <datalist id="presetColors">
      {#each tagsColors as color}
        <option value={color} />
      {/each}
    </datalist>
  {/if}
</div>

<style>
  .remove-tag-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    border-radius: 100%;
    background-color: white;
    padding: 0;
    transition: 0.3s;
    cursor: pointer;
    font-size: 0;
    transition: 0.3s;
    border: 1px solid transparent;
  }
  .remove-tag-button:hover {
    background-color: beige;
    transform: scale(1.2);
  }

  .remove-tag-button svg {
    flex: none;
  }
  .item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    font-size: 14px;
    height: 25px;
    padding: 0 8px;
    border-radius: 25px;
    user-select: none;
    box-shadow: 0px 3px 10px rgba(34, 60, 80, 0.15);
  }

  :global(.sortable-ghost) {
    opacity: 0 !important;
  }

  .color-tags-input {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 5px;
    padding: 0;
    width: 100%;
    height: 25px;
    background: transparent;
    border: none;
  }
</style>
