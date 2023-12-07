<script setup>
</script>

<template>
  <div class="wrap">
    <div id="sw">
      <div id="menu" />
      <div id="scale">
        <div class="plus" @click="scale(1)">
          +
        </div>
        <hr>
        <div class="minu" @click="scale(0)">
          -
        </div>
      </div>
      <div class="bjs-svg-container">
        <svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 2640 1760" class="svg-content-responsive" />
      </div>
    </div>
    <div id="tooltip">
      <div id="tool-head" />
      <div id="tool-body" />
    </div>
  </div>
</template>
