import { ElMessage } from 'element-plus'
import { BeanLine, Selection, hashSubwayData } from './data'

import { MAX, edgesData } from '~/constants'

export const Dijkstra = (function () {
  const graph = {}
  // source起点    target终点    weight权重
  function addEdge(source, target, weight) {
    if (!(source in graph))
      graph[source] = {}
    if (!(target in graph))
      graph[target] = {}
    if (typeof weight !== 'number')
      weight = 1
    graph[source][target] = weight
    graph[target][source] = weight
  }
  function addEdges(edges) {
    for (let i = 0; i < edges.length; ++i) {
      const edge = edges[i]
      addEdge(edge[0], edge[1], edge[2])
    }
  }

  // 通过起点终点求最小路径
  function shortestPath(source, target) {
    if (!(source in graph) || !(target in graph))
      return 1 / 0 // 取1/0为无穷大，将邻接矩阵所有元素赋值正无穷
    const dist = {} // 存放最小距离
    const visited = {} // 判断是否到达过该点
    let numVertex = 0

    for (const v in graph) {
      dist[v] = 1 / 0 // 初始化最小距离的数组全为无穷大
      numVertex++
    }
    dist[source] = 0

    // 求最小路径核心
    for (let i = 0; i < numVertex; ++i) {
      let minDist = 1 / 0
      let minV

      for (const v in dist) {
        if (!(v in visited)) {
          if (minDist > dist[v]) {
            minDist = dist[v]
            minV = v
          }
        }
        else { ; }
      }
      if (!minV)
        break
      if (minV === target)
        return minDist

      visited[minV] = true
      const edges = graph[minV]
      for (const v in edges) {
        if (!(v in visited)) {
          const newDist = minDist + edges[v]
          if (dist[v] > newDist)
            dist[v] = newDist
        }
      }
    }
    return null
  }

  // 定义联结矩阵存放距离

  return {
    addEdge,
    addEdges,
    shortestPath,
  }
})()

function initDijkstra() {
  Dijkstra.addEdges(edgesData)
}

export function calcFare1(distance) {
  if (distance <= 3)
    return 2
  if (distance <= 6)
    return 3
  if (distance <= 18)
    return 3 + Math.ceil((distance - 6) / 6)
  if (distance <= 42)
    return 5 + Math.ceil((distance - 18) / 12)
  else return 7 + Math.ceil((distance - 42) / 18)
}

export function calcFare2(distance) {
  if (distance <= 6)
    return 3
  if (distance <= 12)
    return 4
  if (distance <= 32)
    return 4 + Math.ceil((distance - 12) / 10)
  else return 6 + Math.ceil((distance - 32) / 20)
}

initDijkstra()

class SLConnection {
  static slCon = new SLConnection()

  constructor() {
    this.stationMap = new Map() // 站点名 -> 站点
    this.lineSet = []
  }

  getSearchResult(start, end) {
    this.init()

    if (this._check(start, end))
      return null

    return SLConnection.slCon._searchRoute(this.stationMap, start, end)
  }

  // 完成station & line的初始化
  init() {
    for (const tuple of hashSubwayData) {
      const line = new BeanLine(tuple)
      this.lineSet.push(line)
    }

    for (const line of this.lineSet) {
      line.getSubStation().forEach((station, index) => {
        if (!this.stationMap.has(station.getStationName()))
          this.stationMap.set(station.getStationName(), station)

        // 加入前一站点
        if (index > 0) {
          const frontNeighbor = line.getSubStation()[index - 1]
          const currentStation = this.stationMap.get(station.getStationName())

          if (!currentStation.getNeighborStation().includes(frontNeighbor))
            currentStation.getNeighborStation().push(frontNeighbor)
        }

        // 加入后一站点
        if (index < line.getSubStation().length - 1) {
          const nextNeighbor = line.getSubStation()[index + 1]
          const currentStation = this.stationMap.get(station.getStationName())

          if (!currentStation.getNeighborStation().includes(nextNeighbor))
            currentStation.getNeighborStation().push(nextNeighbor)
        }

        // 记录所属线路
        const lineName = line.getLineName()
        this.stationMap.get(station.getStationName()).getBelongsToLine().push(lineName)
      })
    }
  }

  _searchRoute(stationMap, start, end) {
    const queue = []
    let nextStart = null
    let neighborSize = 0
    let temp = null
    let isFind = 0

    // 假设站点等距，使用宽度优先搜索
    queue.push(stationMap.get(start)) // 将起点放入队列
    stationMap.get(start).isVisited = 1 // 起点已访问

    while (queue.length > 0) {
      nextStart = queue[0].getStationName()
      neighborSize = stationMap.get(nextStart).neighborStation.length

      for (let i = 0; i < neighborSize; i++) {
        temp = stationMap.get(nextStart).neighborStation[i].stationName

        // 找到终点
        if (temp === end) {
          stationMap.get(temp).parent = nextStart
          isFind = 1
          break
        }
        else if (stationMap.get(temp).isVisited === 0) { // 若未被访问过
          stationMap.get(temp).parent = nextStart // 设父亲节点
          stationMap.get(temp).isVisited = 1 // 该点被访问
          queue.push(stationMap.get(temp)) // 加入队列
          // 必须先设父节点、改边isVisited，再放入queue，否则节点未更新，无限循环
          // 应该找到map对应键值更新父节点和 visit，而不是在 map 对应键值的邻居节点的父节点和 visit 进行更新, 故增加 temp
        }
      }

      if (isFind === 1)
        break // 设置判断标志，否则继续 while 循环
      queue.shift()
    }

    return this._getPath(end)
  }

  _getPath(end) {
    let count = 0
    // 需要判断相隔一个站点的两个站是否在一条线路上，用数组比栈方便
    const path = []
    let station
    station = this.stationMap.get(end)

    // 回溯父节点
    while (station.getParent() !== null) {
      path.push(station.getStationName())
      station = this.stationMap.get(station.getParent())
      count++
    }
    path.push(station.getStationName()) // 加入起点

    // 将站点按固定格式输出，此时 path 是反向存放的
    return {
      path: path.reverse(),
      count,
    }
  }

  _check(start, end) {
    let isFinished = false
    if (!this.stationMap.has(start) || !this.stationMap.has(end)) {
      isFinished = true
      ElMessage.warning('输入的站点不存在，请重新输入')
      return isFinished
    }
    if (start === end) {
      isFinished = true
      ElMessage.warning('输入的站点相同，请重新输入')
      return isFinished
    }
  }
}

export const slCon = SLConnection.slCon

export function createIntersectionMatrix(line_dict) {
  // const lineSize = Object.keys(line_dict).length
  const lineNames = Object.keys(line_dict)

  const intersectionMatrix = {}

  for (const lineName_i of lineNames) {
    intersectionMatrix[lineName_i] = {}

    for (const lineName_j of lineNames) {
      const mainLine = line_dict[lineName_i]
      const otherLine = line_dict[lineName_j]

      intersectionMatrix[lineName_i][lineName_j] = (
        lineName_i !== lineName_j
          && mainLine.intersectWith(otherLine)
      )
        ? 1
        : 0
    }
  }

  return intersectionMatrix
}

let min_total_cost = MAX
let best_exchange_way
export function printerAnswer(answer, step, mayex, line_dict, station_dict) {
  let total_cost = 0
  const retString = []
  console.log('mayex: ', mayex)

  for (let i = 0; i < mayex.length; i++) {
    const lineName = mayex[i]
    const source_st = answer[i]
    const dest_st = answer[i + 1]
    const line = line_dict[lineName]
    const [subcost, subString] = line.getRouteInLine(source_st, dest_st, station_dict)
    console.log('subString: ', subString)
    total_cost += subcost
    retString.push(subString)
  }
  if (min_total_cost > total_cost) {
    console.log('retString: ', retString)
    best_exchange_way = retString.slice(0)
    min_total_cost = total_cost
  }
}

export function arrangeAll(solutions, answer, step, bestExNum, mayex, line_dict, station_dict) {
  if (step === bestExNum) {
    printerAnswer(answer, step, mayex, line_dict, station_dict)
    return
  }

  for (const next of solutions[step]) {
    answer[step] = next // 收集所有换成站到answer
    console.log('answer: ', answer)
    arrangeAll(solutions, answer, step + 1, bestExNum, mayex, line_dict, station_dict)
  }
  console.log('solutions: ', solutions)
}

export function bestExchange(mayExchanges, line_dict, bestExNum, start, end, station_dict) {
  console.log('mayExchanges', mayExchanges)

  for (const mayex of mayExchanges) {
    const mySolutions = [[start]] // [[start], [st1, st2, ...], [end]]
    const exSize = mayex.length

    for (let i = 0; i < exSize - 1; i++) {
      const curlineName = mayex[i]
      const nextlineName = mayex[i + 1]
      const curLine = line_dict[curlineName]
      const nextLine = line_dict[nextlineName]
      mySolutions.push(curLine.getExStations(nextLine))
    }

    mySolutions.push([end])
    const answer = Array(bestExNum + 2).fill(null)
    arrangeAll(mySolutions, answer, 0, bestExNum + 2, mayex, line_dict, station_dict)
  }
  console.log('best_exchange_way: ', best_exchange_way)
  best_exchange_way = Array.from(new Set(best_exchange_way.flat()))
  return [min_total_cost, best_exchange_way]
}

export function leastExchange(intersectionMatrix, line_dict, station_dict, start, end) {
  const starts_line = []
  const lineNames = Object.keys(line_dict)

  for (const line_name of lineNames) {
    const line = line_dict[line_name]
    if (line.inLine(start)) {
      const sel = new Selection(line_name, 0)
      starts_line.push(sel)
    }
  }

  const queue = [...starts_line]
  let minExchange = MAX
  const mayExchanges = []

  while (queue.length > 0) {
    const cur = queue.shift()
    const line_name = cur.station_name

    if (cur.height > minExchange)
      break

    if (line_dict[line_name].inLine(end) && cur.height <= minExchange) {
      minExchange = cur.height
      mayExchanges.push(cur.displayPath())
      continue
    }

    for (const neibor of lineNames) {
      if (intersectionMatrix[cur.station_name][neibor] && !cur.inPath(neibor)) {
        const sel = new Selection(neibor, cur.height + 1, null, cur)
        queue.push(sel)
      }
    }
  }

  const bestExNum = minExchange
  return bestExchange(mayExchanges, line_dict, bestExNum, start, end, station_dict)
}
