<script setup>
import { createRenderer } from '~/service/render'

let scale

onMounted(async () => {
  scale = createRenderer()
})
</script>

<template>
  <div class="wrap">
    <div id="sw">
      <div id="menu" />
      <div id="scale">
        <div onclick="scale(1)" class="plus">
          +
        </div>
        <hr>
        <div onclick="scale(0)" class="minu">
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
