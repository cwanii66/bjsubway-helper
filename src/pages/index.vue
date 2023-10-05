<script setup lang="ts" generic="T extends any, O extends any">
defineOptions({
  name: 'IndexPage',
})

const subwayCityName = '北京'
const list = BMapSub.SubwayCitiesList
let subwaycity = null
for (let i = 0; i < list.length; i++) {
  if (list[i].name === subwayCityName) {
    subwaycity = list[i]
    break
  }
}
// 获取北京地铁数据-初始化地铁图
const subway = new BMapSub.Subway('app', subwaycity.citycode)
subway.setZoom(0.5)

function delLogo() {
  const parentElement = document.getElementById('app')
  const firstChildElement = parentElement!.firstChild
  firstChildElement?.remove()
}
delLogo()
</script>

<template>
  <h1>
    hello
  </h1>
</template>
