<script setup lang="ts" generic="T extends any, O extends any">
import {
  delLogo,
  registerBasicEventListener,
  subway,
  zoomControl,
} from '~/service'

defineOptions({
  name: 'IndexPage',
})

subway.setZoom(0.8)
subway.addControl(zoomControl)

registerBasicEventListener()

delLogo()
</script>

<template>
  <div container />
</template>
