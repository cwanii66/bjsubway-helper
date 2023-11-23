import { ElMessage } from 'element-plus'
import { BeanLine, hashSubwayData } from './data'

// import { edgesData } from './const'

// // Dijkstra算法
// const Dijkstra = (function () {
//   const graph = {}
//   // source起点    target终点    weight权重
//   function addEdge(source, target, weight) {
//     if (!(source in graph))
//       graph[source] = {}
//     if (!(target in graph))
//       graph[target] = {}
//     if (typeof weight !== 'number')
//       weight = 1
//     graph[source][target] = weight
//     graph[target][source] = weight
//   }
//   function addEdges(edges) {
//     for (let i = 0; i < edges.length; ++i) {
//       const edge = edges[i]
//       addEdge(edge[0], edge[1], edge[2])
//     }
//     console.log(graph)
//   }

//   // 通过起点终点求最小路径
//   function shortestPath(source, target) {
//     if (!(source in graph) || !(target in graph))
//       return 1 / 0 // 取1/0为无穷大，将邻接矩阵所有元素赋值正无穷
//     const dist = {} // 存放最小距离
//     const visited = {} // 判断是否到达过该点
//     let numVertex = 0

//     for (const v in graph) {
//       dist[v] = 1 / 0 // 初始化最小距离的数组全为无穷大
//       numVertex++
//     }
//     dist[source] = 0

//     // 求最小路径核心
//     for (let i = 0; i < numVertex; ++i) {
//       let minDist = 1 / 0
//       let minV

//       for (const v in dist) {
//         if (!(v in visited)) {
//           if (minDist > dist[v]) {
//             minDist = dist[v]
//             minV = v
//           }
//         }
//         else { ; }
//       }
//       if (!minV)
//         break
//       if (minV === target)
//         return minDist

//       visited[minV] = true
//       const edges = graph[minV]
//       for (const v in edges) {
//         if (!(v in visited)) {
//           const newDist = minDist + edges[v]
//           if (dist[v] > newDist)
//             dist[v] = newDist
//         }
//       }
//     }
//     return null
//   }

//   // 定义联结矩阵存放距离

//   return {
//     addEdge,
//     addEdges,
//     shortestPath,
//   }
// })()

// function initDijkstra() {
//   Dijkstra.addEdges(edgesData)
//   const res = Dijkstra.shortestPath('西直门', '东直门')
//   res && console.log(res)
// }

// initDijkstra()

export class SLConnection {
  constructor() {
    this.stationMap = new Map()
    this.lineSet = []
  }

  static start() {
    const slCon = new SLConnection()
    slCon.init()
  }

  // 完成station & line的初始化
  init() {
    Object.entries(hashSubwayData).forEach((tuple) => {
      const line = new BeanLine(tuple)
      this.lineSet.push(line)
    })

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

  searchRoute(stationMap, start, end) {
    const queue = []
    let nextStart = null
    let neighborSize = 0
    let temp = null
    let isFind = 0

    // 等距图中，单源最短距离计算，使用BFS代替Dijkstra
    queue.push(stationMap[start]) // 将起点放入队列
    stationMap[start].isVisited = 1 // 起点已访问

    while (queue.length > 0) {
      nextStart = queue[0].getStationName()
      neighborSize = stationMap[nextStart].neighborStation.length

      for (let i = 0; i < neighborSize; i++) {
        temp = stationMap[nextStart].neighborStation[i].stationName

        // 找到终点
        if (temp === end) {
          stationMap[temp].parent = nextStart
          isFind = 1
          break
        }
        else if (stationMap[temp].isVisited === 0) { // 若未被访问过
          stationMap[temp].parent = nextStart // 设父亲节点
          stationMap[temp].isVisited = 1 // 该点被访问
          queue.push(stationMap[temp]) // 加入队列
          // 必须先设父节点、改边isVisited，再放入queue，否则节点未更新，无限循环
          // 应该找到map对应键值更新父节点和 visit，而不是在 map 对应键值的邻居节点的父节点和 visit 进行更新, 故增加 temp
        }
      }

      if (isFind === 1)
        break // 设置判断标志，否则继续 while 循环
      queue.shift()
    }

    this.getPath(end)
  }

  getPath(end) {
    let count = 0
    // 需要判断相隔一个站点的两个站是否在一条线路上，用数组比栈方便
    const path = []
    let station
    station = this.stationMap.get(end)

    // 回溯父节点
    while (station.getParent() !== null) {
      path.push(station.getStationName())
      station = this.StationMap.get(station.getParent())
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
      ElMessage.warning('输入的站点不存在')
      return isFinished
    }
    if (start === end) {
      isFinished = true
      ElMessage.warning('输入的站点相同')
      return isFinished
    }
  }
}
