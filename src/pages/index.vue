<script setup lang="ts" generic="T extends any, O extends any">
import {
  createBJSearchPanel,
  delLogo,
  registerSubwayEventListener,
  subway,
  zoomControl,
} from '~/service'

defineOptions({
  name: 'IndexPage',
})

subway.setZoom(0.8)
subway.addControl(zoomControl)

registerSubwayEventListener()

delLogo()
nextTick(() => {
  createBJSearchPanel()
})
</script>

<template>
  <div container />
</template>
