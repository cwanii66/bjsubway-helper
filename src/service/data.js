import { Request } from '~/utils'
import sd from '~/_data/bj-subway.json'

export const subwayData = sd.subways.l // 所有原始线路数据

export async function getSubwayData(url) { // online
  const subwayData = await Request.get(url)
  return subwayData.subways.l // 所有原始线路数据
}

export class Subway {
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

    return allStations
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
