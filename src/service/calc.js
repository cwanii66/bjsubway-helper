import { Member, MinHeap, Selection, decHeap, emptyHeap, initHeap, topHeap } from './data'

import { MAX } from '~/constants'

export function calcFare(int_as_weight) {
  if (int_as_weight <= 6)
    return 3
  if (int_as_weight <= 12)
    return 4
  if (int_as_weight <= 32)
    return 4 + Math.ceil((int_as_weight - 12) / 10)
  else return 6 + Math.ceil((int_as_weight - 32) / 20)
}

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

export function dijkstra(station_dict, start, end) {
  const heapsize = Object.keys(station_dict).length
  const minheap = new MinHeap(heapsize)
  const members = []

  let dijiResult

  for (const station_name in station_dict) {
    // const station = station_dict[station_name]
    const member = new Member(station_name, MAX)

    if (station_name === start)
      member.cost = 0

    members.push(member)
  }

  minheap.setData(members)
  initHeap(minheap)

  while (!emptyHeap(minheap)) {
    const mem = topHeap(minheap)

    if (mem.station_name === end) {
      dijiResult = mem.displayPath(mem.cost)
      continue
    }

    const station = station_dict[mem.station_name]

    for (const neibor of station.getNeibors()) {
      const newcost = mem.cost + station.getNeiborWeight(neibor)
      decHeap(minheap, neibor, newcost, mem)
    }
  }

  console.log('最短用时：', dijiResult)

  return dijiResult
}
