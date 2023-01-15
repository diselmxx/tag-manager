<script>
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  export let items;
  export let isVisible;
  export let setValue;
</script>

{#if isVisible && items.length}
  <ul
    class="search-list"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
  >
    {#each items as item}
      <li on:click={() => setValue(item.name)}>{item.name}</li>
    {/each}
  </ul>
{/if}

<style>
  .search-list {
    padding: 5px;
    margin: 5px 0 0;
    position: absolute;
    left: 0;
    width: 100%;
    height: auto;
    max-height: 300px;
    overflow: hidden;
    background-color: white;
    z-index: 10;
    border-radius: 10px;
  }
  .search-list li {
    font-size: 14px;
    font-weight: normal;
    padding: 2px 5px;
    transition: 0.3s;
  }
  .search-list li:hover {
    background: #c2f5e9;
  }
  .search-list.visible {
    visibility: visible;
    opacity: 100;
    top: 100%;
  }
  .search-list__item {
    padding: 4px 8px;
    background: white;
    width: 100%;
    transition: 0.3s;
  }
  .search-list__item:hover {
    background: rgb(190, 181, 181);
  }
</style>
