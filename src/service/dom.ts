// dom related service

export function delLogo() {
  const parentElement = document.getElementById('app')
  const firstChildElement = parentElement!.firstChild
  firstChildElement?.remove()
}

export const zoomControl = new BMapSub.ZoomControl({
  anchor: BMAPSUB_ANCHOR_BOTTOM_RIGHT,
  offset: new BMapSub.Size(10, 100),
})
