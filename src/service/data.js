import { Request } from '~/utils'
import sd from '~/_data/bj-subway.json'

export const subwayData = sd.subways.l // 所有原始线路数据

export const hashSubwayData = new Map()

subwayData.forEach((line) => {
  const curStationArr = line.p
    .filter(station => station.p_xmlattr.st) // st 标记是否是站点
    .map(station => [station.p_xmlattr.lb, station.p_xmlattr.ex, +(station.p_xmlattr?.int ?? 5)]) // [[站名, 是否换乘站, 权值int], ...]]
  hashSubwayData.set(line.l_xmlattr.lb, curStationArr)
})

export async function getSubwayData(url) { // online
  const subwayData = await Request.get(url)
  return subwayData.subways.l // 所有原始线路数据
}

export function reloadData() {
  const lines_data = Object.create(null)
  const weights = Object.create(null)

  for (const [line_name, stations] of hashSubwayData) {
    lines_data[line_name] = []
    // eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
    for (const [station_name, is_change, station_time] of stations) {
      if (!Object.hasOwn(weights, station_name))
        weights[station_name] = station_time

      lines_data[line_name].push(station_name)
    }
  }

  return {
    lines_data,
    weights,
  }
}

export function createSubwayMap(lines_data, weights) {
  const station_dict = Object.create(null)
  const line_dict = Object.create(null)

  for (const line_name in lines_data) {
    const line = lines_data[line_name]
    const subLine = new Line(line_name)

    for (const station_name of line) {
      subLine.addStation(station_name)
      if (!Reflect.has(station_dict, station_name))
        station_dict[station_name] = new Station(station_name)
    }

    line_dict[line_name] = subLine
  }

  for (const line_name in lines_data) {
    const line = lines_data[line_name]
    const line_length = line.length

    for (let i = 0; i < line_length - 1; i++) {
      const main_station = line[i]
      const neibor_station = line[i + 1]
      station_dict[main_station].addNeibor(neibor_station, weights[neibor_station])
    }

    for (let i = line_length - 1; i > 0; i--) {
      const main_station = line[i]
      const neibor_station = line[i - 1]

      if (!station_dict[main_station].getNeibors().includes(neibor_station))
        station_dict[main_station].addNeibor(neibor_station, weights[neibor_station])
    }
  }

  return [station_dict, line_dict]
}

function getAllStObjs() {
  return subwayData.flatMap((line) => {
    const { ld: lid, lc, lbx, lby } = line.l_xmlattr
    return line.p
      .filter(station => station.p_xmlattr.st)
      .map(station => ({
        ...station.p_xmlattr,
        lid,
        lc: lc.replace(/0x/, '#'),
        lbx,
        lby,
      }))
  })
}

function getNonStObjs() {}

function extractStations(stations) {
  const allStObjs = getAllStObjs()
  const allStations = []
  stations.forEach((station) => {
    allStations.push(
      allStObjs.find(st => st.lb === station),
    )
  })
  return allStations
}

export class Subway { // use for painting
  constructor(data) {
    this.data = data
    this.bugLineArray = []
    this.bugPointArray = []
  }

  getInvent() {
    const lineArray = []
    this.data.forEach((d) => {
      const { loop, lid } = d.l_xmlattr
      const allPoints = d.p.slice(0)
      loop && allPoints.push(allPoints[0])
      const path = this.formatPath(allPoints, 0, allPoints.length - 1)
      lineArray.push({
        lid,
        path,
      })
    })
    return lineArray
  }

  getPathArray() {
    const pathArray = []
    this.data.forEach((d) => {
      const { loop, lc, lbx, lby, lb, lid } = d.l_xmlattr
      const allPoints = d.p.slice(0)
      loop && allPoints.push(allPoints[0])
      const allStations = []
      allPoints.forEach((item, index) => {
        const tempObject = {}
        Object.keys(item.p_xmlattr).forEach((d) => {
          tempObject[d] = item.p_xmlattr[d]
        })
        tempObject.index = index
        if (item.p_xmlattr.st)
          allStations.push(tempObject)
      })
      const arr = []
      for (let i = 0; i < allStations.length - 1; i++) {
        const path = this.formatPath(allPoints, allStations[i].index, allStations[i + 1].index)
        arr.push({
          lid,
          id: `${allStations[i].sid}_${allStations[i + 1].sid}`,
          path,
          color: lc.replace(/0x/, '#'),
        })
      }
      pathArray.push({
        path: arr,
        lc: lc.replace(/0x/, '#'),
        lb,
        lbx,
        lby,
        lid,
      })
    })
    return pathArray
  }

  getPointArray() {
    const pointArray = []
    const tempPointsArray = []
    this.data.forEach((d) => {
      const { lid, lc, lb } = d.l_xmlattr
      const allPoints = d.p
      const allStations = []
      allPoints.forEach((item) => {
        const tempObject = {}
        Object.keys(item.p_xmlattr).forEach((d) => {
          tempObject[d] = item.p_xmlattr[d]
        })
        tempObject.lid = lid
        tempObject.pn = lb
        tempObject.lc = lc.replace(/0x/, '#')
        if (item.p_xmlattr.st && !item.p_xmlattr.ex) {
          allStations.push(tempObject)
        }
        else if (item.p_xmlattr.ex) {
          if (!tempPointsArray.includes(item.p_xmlattr.sid)) {
            allStations.push(tempObject)
            tempPointsArray.push(item.p_xmlattr.sid)
          }
        }
      })
      pointArray.push(allStations)
    })
    return pointArray
  }

  getCurrentPathArray(name) {
    const allBugLineName = this.bugLineArray.map(d => d.lines).flat(1)
    const d = this.data.filter(d => d.l_xmlattr.lid === name)[0]
    const { loop, lc, lbx, lby, lb, lid } = d.l_xmlattr
    const allPoints = d.p.slice(0)
    loop && allPoints.push(allPoints[0])
    const allStations = []
    allPoints.forEach((item, index) => {
      const tempObject = {}
      Object.keys(item.p_xmlattr).forEach((d) => {
        tempObject[d] = item.p_xmlattr[d]
      })
      tempObject.index = index
      item.p_xmlattr.st && allStations.push(tempObject)
    })
    const arr = []
    for (let i = 0; i < allStations.length - 1; i++) {
      const path = this.formatPath(allPoints, allStations[i].index, allStations[i + 1].index)
      const sid = `${allStations[i].sid}_${allStations[i + 1].sid}`
      arr.push({
        lid,
        id: sid,
        path,
        color: !allBugLineName.includes(sid) ? lc.replace(/0x/, '#') : '#333',
      })
    }
    return {
      path: arr,
      lc: lc.replace(/0x/, '#'),
      lb,

      lbx,

      lby,

      lid,
    }
  }

  getCurrentPointArray(name) {
    const allBugPointName = this.bugPointArray.map(d => d.sid)
    const d = this.data.filter(d => d.l_xmlattr.lid === name)[0]
    const { lid, lc, lb } = d.l_xmlattr
    const allPoints = d.p
    const allStations = []
    allPoints.forEach((item) => {
      if (item.p_xmlattr.st) {
        const tempObject = {}
        Object.keys(item.p_xmlattr).forEach((d) => {
          tempObject[d] = item.p_xmlattr[d]
        })
        tempObject.lid = lid
        tempObject.pn = lb
        tempObject.lc = lc.replace(/0x/, '#')
        if (!allBugPointName.includes(item.p_xmlattr.sid)) {
          tempObject.bug = false
          allStations.push(tempObject)
        }
        else {
          tempObject.bug = true
          allStations.push(tempObject)
        }
      }
    })
    console.log('getCurrentPointArray: ', allStations)
    return allStations
  }

  getSearchPointArray(stations) {
    const searchStations = extractStations(stations)
    return searchStations
  }

  getLineNameArray() {
    const nameArray = this.data.map((d) => {
      return {
        lb: d.l_xmlattr.lb,
        lid: d.l_xmlattr.lid,
        lc: d.l_xmlattr.lc.replace(/0x/, '#'),
      }
    })
    return nameArray
  }

  getBugLineArray(arr) {
    if (!arr || !arr.length)
      return []
    this.bugLineArray = []
    arr.forEach((item) => {
      const { start, end, cause, startingDate, closingDate, lid, lb } = item
      const lines = []
      const points = []
      const tempObj = this.data.filter(d => d.l_xmlattr.lid === lid)[0]
      const loop = tempObj.l_xmlattr.loop
      const lc = tempObj.l_xmlattr.lc
      const allPoints = tempObj.p
      const allStations = []
      allPoints.forEach((item) => {
        if (item.p_xmlattr.st)
          allStations.push(item.p_xmlattr.sid)
      })
      loop && allStations.push(allStations[0])
      for (let i = allStations.indexOf(start); i <= allStations.lastIndexOf(end); i++)
        points.push(allStations[i])

      for (let i = allStations.indexOf(start); i < allStations.lastIndexOf(end); i++)
        lines.push(`${allStations[i]}_${allStations[i + 1]}`)

      this.bugLineArray.push({
        cause,
        startingDate,
        closingDate,
        lid,
        lb,
        lines,
        points,
        lc: lc.replace(/0x/, '#'),
        start: points[0],
        end: points[points.length - 1],
      })
    })
    return this.bugLineArray
  }

  getBugPointArray(arr) {
    if (!arr || !arr.length)
      return []
    this.bugPointArray = []
    arr.forEach((item) => {
      const { sid, cause, startingDate, closingDate, lid, lb } = item
      const tempObj = this.data.filter(d => d.l_xmlattr.lid === lid)[0]
      const lc = tempObj.l_xmlattr.lc
      tempObj.p.forEach((d) => {
        if (d.p_xmlattr.sid === item.sid) {
          this.bugPointArray.push({
            cause,
            startingDate,
            closingDate,
            lid,
            lb,
            sid,
            lc: lc.replace(/0x/, '#'),
            x: d.p_xmlattr.x,
            y: d.p_xmlattr.y,
          })
        }
      })
    })
    return this.bugPointArray
  }

  formatPath(allPoints, before, after) {
    let str = ''
    for (let i = before; i < after + 1; i++) {
      if (i === before) {
        str = `M ${allPoints[i].p_xmlattr.x} ${allPoints[i].p_xmlattr.y}`
      }
      else if (allPoints[i].p_xmlattr.rc) {
        str = `${str} Q ${allPoints[i].p_xmlattr.x} ${allPoints[i].p_xmlattr.y} ${allPoints[i + 1].p_xmlattr.x} ${allPoints[i + 1].p_xmlattr.y}`
        i++
      }
      else {
        str = `${str} L ${allPoints[i].p_xmlattr.x} ${allPoints[i].p_xmlattr.y}`
      }
    }
    return str
  }
}

export class Station {
  constructor(station_name) {
    this.station_name = station_name
    this.neibor_stations = {}
    this.change = false
  }

  addNeibor(station_name, timecost) {
    this.neibor_stations[station_name] = timecost
  }

  getNeibors() {
    return Object.keys(this.neibor_stations)
  }

  getNeiborWeight(neibor) {
    return this.neibor_stations[neibor]
  }

  imchange() {
    this.change = true
  }
}

export class Line {
  constructor(line_name) {
    this.line_name = line_name
    this.stations = []
  }

  addStation(station_name) {
    this.stations.push(station_name)
  }

  intersectWith(other_line) {
    return this.stations.some(station => other_line.stations.includes(station))
  }

  inLine(station_name) {
    return this.stations.includes(station_name)
  }

  getExStations(other_line) {
    return this.stations.filter(station => other_line.stations.includes(station))
  }

  getRouteInLine(station1, station2, station_map) {
    const pos1 = this.stations.indexOf(station1)
    const pos2 = this.stations.indexOf(station2)
    let route

    if (pos1 > pos2)
      route = this.stations.slice(pos2, pos1 + 1).reverse()
    else
      route = this.stations.slice(pos1, pos2 + 1)

    const size = route.length
    let cost = 0
    const retRoute = []

    retRoute.push(route[0]) // 起点

    for (let i = 0; i < size - 1; i++) {
      const st1_name = route[i]
      const st2_name = route[i + 1]
      retRoute.push(st2_name)
      const st1 = station_map[st1_name]
      cost += st1.getNeiborWeight(st2_name)
    }

    return [cost, retRoute]
  }
}

export class Selection {
  constructor(station_name, height, timecost = 0, parent = null) {
    this.station_name = station_name
    this.timecost = timecost
    this.height = height
    this.parent = parent
  }

  inPath(station_name) {
    let ok = 0
    let cur_node = this
    while (!ok && cur_node) {
      if (cur_node.station_name === station_name)
        ok = 1

      cur_node = cur_node.parent
    }
    return ok
  }

  displayPath() {
    let cur_node = this
    const path = []
    while (cur_node) {
      path.push(cur_node.station_name)
      cur_node = cur_node.parent
    }
    path.reverse()
    return path
  }
}

export class Member {
  constructor(station_name, cost) {
    this.station_name = station_name
    this.cost = cost
    this.parent = null
  }

  displayPath(mincost) {
    let cur_node = this
    const path = []
    while (cur_node) {
      path.push(cur_node.station_name)
      cur_node = cur_node.parent
    }
    path.reverse()

    return [mincost, path]
  }
}

export class MinHeap {
  constructor(heapsize) {
    this.heapsize = heapsize
    this.heap = []
  }

  setData(members) {
    for (const member of members)
      this.heap.push(member)
  }
}

export function holdHeap(minheap, pos) {
  const left = 2 * pos + 1
  const right = 2 * pos + 2
  let minpos = pos
  // const minvalue = minheap.heap[pos].cost

  if (right < minheap.heapsize && minheap.heap[right].cost < minheap.heap[minpos].cost)
    minpos = right

  if (left < minheap.heapsize && minheap.heap[left].cost < minheap.heap[minpos].cost)
    minpos = left

  if (minpos !== pos) {
    [minheap.heap[pos], minheap.heap[minpos]] = [minheap.heap[minpos], minheap.heap[pos]]
    holdHeap(minheap, minpos)
  }
}

export function initHeap(minheap) {
  const haslastleaf = Math.floor(minheap.heapsize / 2) - 1
  for (let i = haslastleaf; i >= 0; i--)
    holdHeap(minheap, i)
}

export function emptyHeap(minheap) {
  return minheap.heapsize === 0
}

export function topHeap(minheap) {
  const minMem = minheap.heap[0]
  minheap.heap[0] = minheap.heap[minheap.heapsize - 1]
  minheap.heapsize -= 1
  holdHeap(minheap, 0)
  return minMem
}

export function decHeap(minheap, station_name, newcost, parent) {
  let targetPos = -1
  for (let i = 0; i < minheap.heapsize; i++) {
    if (targetPos !== -1)
      break

    if (minheap.heap[i].station_name === station_name)
      targetPos = i
  }
  if (targetPos <= 0 || minheap.heap[targetPos].cost <= newcost)
    return

  minheap.heap[targetPos].cost = newcost
  minheap.heap[targetPos].parent = parent

  let parentPos = Math.floor((targetPos - 1) / 2)

  while (parentPos >= 0) {
    if (minheap.heap[targetPos].cost >= minheap.heap[parentPos].cost)
      break;

    [minheap.heap[targetPos], minheap.heap[parentPos]] = [minheap.heap[parentPos], minheap.heap[targetPos]]
    targetPos = parentPos
    parentPos = Math.floor((targetPos - 1) / 2)
  }
}
