/* eslint-disable no-console */
import type { DirectionCompleteEvent, Line, Station, StationTapEvent } from '.'
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

BMapSub.Direction.prototype.search_ex = function (start: string | Station, end: string | Station) {
  const cc = this.subway.getCurrentCity().citycode
  const sy = 0
  const bCenter = true
  const noAnimation = false
  let sn = ''
  let en = ''
  if (typeof (start) === 'string')
    start = this.subway.getStation(start)

  if (typeof (end) === 'string')
    end = this.subway.getStation(end)

  if (typeof start !== 'string' && start.id)
    sn = `0$$${start.id}$$${start.px},${start.py}$$${encodeURIComponent(start.name)}$$`

  if (typeof end !== 'string' && end.id)
    en = `0$$${end.id}$$${end.px},${end.py}$$${encodeURIComponent(end.name)}$$`

  let url = ''
  if (this.subway.isMapServiceCity())
    url = `${BMapSub.mapUrl}?qt=bt`
  else
    url = `${BMapSub.apiUrl}?qt=bt2`

  url += `&newmap=1&ie=utf-8&f=[1,12,13,14]&c=${cc}&sn=${sn}&en=${en}&m=sbw&ccode=${cc}&from=dtzt&sy=${sy}&t=${new Date().getTime()}`

  this.reqTransData(url, bCenter, noAnimation)
}

function drctSearch() {
  const startInputEl = document.getElementById('bj-start') as HTMLInputElement
  const endInputEl = document.getElementById('bj-end') as HTMLInputElement
  if (!startInputEl || !endInputEl)
    return
  const start = startInputEl?.value
  const end = endInputEl?.value
  if (!start || !end) {
    // eslint-disable-next-line no-alert
    alert('请输入起点和终点')
    return
  }

  const checkStation = (stationName: string) => {
    const [isExist, name] = checkStationExist(stationName)
    if (!isExist)
      // eslint-disable-next-line no-alert
      alert(`站点“${name}”不存在，请检查输入`)
    return isExist
  }

  if (!checkStation(start) || !checkStation(end))
    return

  drct.search_ex(start, end)
}

function checkStationExist(stationName: string) {
  const allLines: Line[] = subway.getLines()
  const isExist = allLines.some((line) => {
    return line.stations.some((station: Station) => {
      return station.name === stationName
    })
  })
  return [isExist, stationName] as const
}

function syncStartInput(start: string) {
  const startInputEl = document.getElementById('bj-start') as HTMLInputElement
  startInputEl.value = start
}
function syncEndInput(end: string) {
  const endInputEl = document.getElementById('bj-end') as HTMLInputElement
  endInputEl.value = end
}

export function registerSubwayEventListener() {
  useEventListener(subway, 'subwayloaded', () => {
    // console.log(subway.getLines())
    const allLines = subway.getLines()
    console.log(allLines)
  })
  useEventListener(subway, 'directioncomplete', ({ totalTime, totalStops, lines }: DirectionCompleteEvent) => {
    console.log(totalTime, totalStops, lines)
    // eslint-disable-next-line no-alert
    alert(
      `
        共${totalStops}站，预计${totalTime}分钟，\n
        换乘线路: ${lines.join('、')}， 共计换乘${lines.length - 1}次。
      `,
    )
  })
  useEventListener(subway, 'tap', ({ station }: StationTapEvent) => {
    console.log(station)
  })

  useEventListener(navigation, 'starttap', ({ station }: StationTapEvent) => {
    console.log('click on nav station: ', station)
    syncStartInput(station.name)
  })
  useEventListener(navigation, 'endtap', ({ station }: StationTapEvent) => {
    console.log('click on nav station: ', station)
    syncEndInput(station.name)
  })

  useEventListener('keypress', (e) => {
    subway.clearOverlays()
    subway.closeInfoWindow()
    if (e.code === 'Enter')
      drctSearch()
  })
}
