import type { DirectionCompleteEvent, StationTapEvent } from '.'
import { subway } from '.'

// const startIcon = new BMapSub.Icon(
//   'https://api.map.baidu.com/images/subway/start-bak.png',
//   new BMapSub.Size(50, 80),
// )
// const endIcon = new BMapSub.Icon(
//   'https://api.map.baidu.com/images/subway/end-bak.png',
//   new BMapSub.Size(50, 80),
// )

export const detail = new BMapSub.DetailInfo(subway, {})
export const drct = new BMapSub.Direction(subway, {})
export const navigation = new BMapSub.Navigation(subway, {}) // give the basic click navigation

export function registerBasicEventListener() {
  useEventListener(subway, 'subwayloaded', () => {
    // drct.search('西直门', '西红门')
  })
  useEventListener(subway, 'directioncomplete', ({ totalTime, totalStops, lines }: DirectionCompleteEvent) => {
    console.log(totalTime, totalStops, lines)
  })
  useEventListener(subway, 'tap', ({ station }: StationTapEvent) => {
    console.log(station)
  })
}
