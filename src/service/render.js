/* eslint-disable no-console */
/* eslint-disable no-new-func */
/* eslint-disable style/no-tabs */
/* eslint-disable no-invalid-this */
import * as d3 from 'd3'
import $ from 'jquery'
import { Subway, subwayData } from './data'

// import { bdSubwayUrl } from '~/constants'

export function createRenderer() {
  const subway = new Subway(subwayData) // local

  // let deviceWidth = document.body.offsetWidth;
  // let deviceWidth = 1920
  const baseScale = 2

  const deviceScale = 1400 / 2640
  const width = 2640
  const height = 1760
  const transX = 1320 + 260 + 260
  const transY = 580
  const scaleExtent = [0.8, 4]
  let currentScale = 2

  // let deviceScale = deviceWidth / 1920;
  // let width = 2640;
  // // let height = 1485;
  // let height = 1475;
  // let transX = 1320 + 260;
  // let transY = 580;
  // let scaleExtent = [0.8, 4];
  // let currentScale = 2;

  let currentX = 0
  let currentY = 0
  let selected = false
  const scaleStep = 0.5
  const animateDuration = 1000
  const tooltip = d3.select('#tooltip')
  const svg = d3.select('svg.svg-content-responsive')
    .on('click', () => {
      if (selected) {
        d3.selectAll('.origin').attr('opacity', 1)
        d3.selectAll('.animate1').attr('display', 'block')
        d3.selectAll('.animate2').attr('display', 'block')
        d3.selectAll('.temp').remove()
        selected = false
      }
    })

  const group = svg.append('g').attr('transform', `translate(${transX}, ${transY}) scale(1)`)
  const whole = group.append('g').attr('class', 'whole-line')
  const path = group.append('g').attr('class', 'path')
  const point = group.append('g').attr('class', 'point')

  const zoom = d3.zoom().scaleExtent(scaleExtent).on('zoom', zoomed)

  svg.call(zoom)
  svg.call(zoom.transform, d3.zoomIdentity.translate((1 - baseScale) * transX, (1 - baseScale) * transY).scale(baseScale))

  const pathArray = subway.getPathArray()
  const pointArray = subway.getPointArray()

  function getData() {
    $.ajax({
      // 请求方式
      type: 'GET',
      contentType: 'application/json;charset=UTF-8',
      // url : "http://39.105.60.124:9535/interface/sealing/selectAll",
      url: 'http://192.168.43.119:8080/interface/sealing/selectAll',
      success(data) {
        const result = JSON.parse(data)
        const data0 = result.data0
        const data1 = result.data1
        renderBugLine(data0)
        renderBugPoint(data1)
      },
      error(e) {
        console.log('数据请求失败：', e.statusText)
      },
    })
  }

  // renderBugLine(datas1);
  // renderBugPoint(datas2);
  renderBugLine([])
  renderBugPoint([])
  getData()

  // 定期请求数据
  setInterval(() => {
    getData()
  }, 1000 * 60)

  renderInventLine()
  renderAllStation()

  function renderInventLine() {
    const arr = subway.getInvent()
    whole.selectAll('path')
      .data(arr)
      .enter()
      .append('path')
      .attr('d', d => d.path)
      .attr('class', d => d.lid)
      .attr('stroke', 'none')
      .attr('fill', 'none')
  }

  function renderAllLine() {
    for (let i = 0; i < pathArray.length; i++) {
      path.append('g')
        .selectAll('path')
        .data(pathArray[i].path)
        .enter()
        .append('path')
        .attr('d', d => d.path)
        .attr('lid', d => d.lid)
        .attr('id', d => d.id)
        .attr('class', 'lines origin')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 7)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')
      path.append('text')
        .attr('x', pathArray[i].lbx)
        .attr('y', pathArray[i].lby)
        .attr('dy', '1em')
        .attr('dx', '-0.3em')
        .attr('fill', pathArray[i].lc)
        .attr('lid', pathArray[i].lid)
        .attr('class', 'line-text origin')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .text(pathArray[i].lb)
    }
  }

  function renderAllPoint() {
    for (let i = 0; i < pointArray.length; i++) {
      for (let j = 0; j < pointArray[i].length; j++) {
        const item = pointArray[i][j]
        const box = point.append('g')
        if (item.ex) {
          box.append('image')
            .attr('href', 'src/assets/trans.png')
            .attr('class', 'points origin')
            .attr('id', item.sid)
            .attr('x', item.x - 8)
            .attr('y', item.y - 8)
            .attr('width', 16)
            .attr('height', 16)
        }
        else {
          box.append('circle')
            .attr('cx', item.x)
            .attr('cy', item.y)
            .attr('r', 5)
            .attr('class', 'points origin')
            .attr('id', item.sid)
            .attr('stroke', item.lc)
            .attr('stroke-width', 1.5)
            .attr('fill', '#ffffff')
        }
        box.append('text')
          .attr('x', item.x + item.rx)
          .attr('y', item.y + item.ry)
          .attr('dx', '0.3em')
          .attr('dy', '1.1em')
          .attr('font-size', 11)
          .attr('class', 'point-text origin')
          .attr('lid', item.lid)
          .attr('id', item.sid)
          .text(item.lb)
      }
    }
  }

  function renderCurrentLine(name) {
    const arr = subway.getCurrentPathArray(name)
    console.log('arr', arr)
    path.append('g')
      .attr('class', 'temp')
      .selectAll('path')
      .data(arr.path)
      .enter()
      .append('path')
      .attr('d', d => d.path)
      .attr('lid', d => d.lid)
      .attr('id', d => d.id)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 7)
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')
    path.append('text')
      .attr('class', 'temp')
      .attr('x', arr.lbx)
      .attr('y', arr.lby)
      .attr('dy', '1em')
      .attr('dx', '-0.3em')
      .attr('fill', arr.lc)
      .attr('lid', arr.lid)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text(arr.lb)
  }

  function renderCurrentPoint(name) {
    const arr = subway.getCurrentPointArray(name)
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      const box = point.append('g').attr('class', 'temp')
      if (item.bug) {
        box.append('image')
          .attr('href', 'src/assets/exc1.png')
          .attr('x', item.x - 10)
          .attr('y', item.y - 10)
          .attr('width', 20)
          .attr('height', 20)
          .attr('id', item.sid)
      }
      else if (item.ex) {
        box.append('image')
          .attr('href', 'src/assets/trans.png')
          .attr('x', item.x - 8)
          .attr('y', item.y - 8)
          .attr('width', 16)
          .attr('height', 16)
          .attr('id', item.sid)
      }
      else {
        box.append('circle')
          .attr('cx', item.x)
          .attr('cy', item.y)
          .attr('r', 5)
          .attr('id', item.sid)
          .attr('stroke', item.lc)
          .attr('stroke-width', 1.5)
          .attr('fill', '#ffffff')
      }
      box.append('text')
        .attr('class', 'temp')
        .attr('x', item.x + item.rx)
        .attr('y', item.y + item.ry)
        .attr('dx', '0.3em')
        .attr('dy', '1.1em')
        .attr('font-size', 11)
        .attr('lid', item.lid)
        .attr('id', item.sid)
        .text(item.lb)
    }
  }

  function renderBugLine(modal) {
    const bugLineArray = subway.getBugLineArray(modal)
    group.select('.path').html('')
    renderAllLine()
    bugLineArray.forEach((d) => {
      d.lines.forEach((dd) => {
        d3.selectAll(`path#${dd}`)
          .attr('stroke', '#333')
          .attr('class', 'lines origin animate1')
      })
    })
    d3.selectAll('.lines').on('click', function () {
      const id = d3.select(this).attr('id')
      const bool = judgeBugLine(bugLineArray, id)
      if (bool) {
        const x = d3.select(this).attr('d').split(' ')[1]
        const y = d3.select(this).attr('d').split(' ')[2]
        const toolX = (x * currentScale + transX - ((1 - currentScale) * transX - currentX)) * deviceScale
        const toolY = (y * currentScale + transY - ((1 - currentScale) * transY - currentY)) * deviceScale
        const toolH = document.getElementById('tooltip').offsetHeight
        const toolW = 110
        if (toolY < 935 / 2)
          tooltip.style('left', `${toolX - toolW}px`).style('top', `${toolY + 80}px`)

        else
          tooltip.style('left', `${toolX - toolW}px`).style('top', `${toolY - toolH + 50}px`)
      }
    })
    if (bugLineArray && bugLineArray.length)
      animate1()
  }

  function renderBugPoint(modal) {
    const bugPointArray = subway.getBugPointArray(modal)
    group.select('.point').html('')
    renderAllPoint()
    bugPointArray.forEach((item) => {
      const parent = d3.select(point.select(`#${item.sid}.points`).node().parentNode)
      parent.select(`#${item.sid}.points`).remove()
      parent.append('image')
        .attr('href', 'src/assets/exc1.png')
        .attr('x', item.x - 10)
        .attr('y', item.y - 10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('id', item.sid)
        .attr('class', 'points origin animate2')

      d3.selectAll('.points').on('click', function () {
        const id = d3.select(this).attr('id')
        const bool = judgeBugPoint(bugPointArray, id)
        if (bool) {
          let x, y
          if (d3.select(this).attr('href')) {
            x = Number.parseFloat(d3.select(this).attr('x')) + 8
            y = Number.parseFloat(d3.select(this).attr('y')) + 8
          }
          else {
            x = d3.select(this).attr('cx')
            y = d3.select(this).attr('cy')
          }
          const toolX = (x * currentScale + transX - ((1 - currentScale) * transX - currentX)) * deviceScale
          const toolY = (y * currentScale + transY - ((1 - currentScale) * transY - currentY)) * deviceScale
          const toolH = document.getElementById('tooltip').offsetHeight
          const toolW = 110
          if (toolY < 935 / 2)
            tooltip.style('left', `${toolX - toolW}px`).style('top', `${toolY + 80}px`)

          else
            tooltip.style('left', `${toolX - toolW}px`).style('top', `${toolY - toolH + 50}px`)
        }
      })
    })

    if (bugPointArray && bugPointArray.length)
      animate2()
  }

  function animate1() {
    d3.selectAll('.animate1').each(function () {
      // let x = d3.select(this).attr('x');
      // let y = d3.select(this).attr('y');
      d3.select(this)
        .transition()
        .duration(animateDuration)
        .ease(d3.easeCubicIn)
        .attr('stroke', '#eee')
      // .attr('x', x - 8)
      // .attr('y', y - 8)
      // .attr('width', 32)
      // .attr('height', 32)
        .transition()
        .duration(animateDuration)
        .ease(d3.easeCubicOut)
        .attr('stroke', '#333')
      // .attr('x', x + 8)
      // .attr('y', y + 8)
      // .attr('width', 16)
      // .attr('height', 16)
        .on('end', () => {
          if (d3.select('.animate1').size()) {
            animate1()
            animate2()
          }
        })
    })
  }

  function animate2() {
    d3.selectAll('.animate2').each(function () {
      // let x = d3.select(this).attr('x');
      // let y = d3.select(this).attr('y');
      d3.select(this)
        .transition()
        .duration(animateDuration)
        .ease(d3.easeCubicIn)
        .attr('opacity', 0)
      // .attr('x', x - 8)
      // .attr('y', y - 8)
      // .attr('width', 32)
      // .attr('height', 32)
        .transition()
        .duration(animateDuration)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
      // .attr('x', x + 8)
      // .attr('y', y + 8)
      // .attr('width', 16)
      // .attr('height', 16)
        .on('end', () => {
          if (d3.select('.animate2').size()) {
            animate1()
            animate2()
          }
        })
    })
  }

  function judgeBugLine(arr, id) {
    if (!arr || !arr.length || !id)
      return false
    const bugLine = arr.filter((d) => {
      return d.lines.includes(id)
    })
    if (bugLine.length) {
      console.log(bugLine)
      removeTooltip()
      tooltip.select('#tool-head').html(`<span>${id}</span><div class="deletes" onclick="removeTooltip()">×</div>`)
      bugLine.forEach((d) => {
        const item = tooltip.select('#tool-body').append('div').attr('class', 'tool-item')
        item.html(`
        <div class="tool-content">
          <div style="color: #ffffff;border-bottom: 2px solid ${d.lc};">
            <span style="background: ${d.lc};padding: 4px 6px;">${d.lb}</span>
          </div>
          <div>
            <div class="content-left">开始时间</div><div class="content-right">${formatDate(d.startingDate)}</div>
          </div>
          <div>
            <div class="content-left">结束时间</div><div class="content-right">${formatDate(d.closingDate)}</div>
          </div>
          <div>
            <div class="content-left">封路原因</div><div class="content-right">${d.cause}</div>
          </div>
          <div>
            <div class="content-left">封路路段</div><div class="content-right">${d.start}-${d.end}</div>
          </div>
        </div>
      `)
      })
      d3.select('#tooltip').style('display', 'block')
      return true
    }
    else {
      return false
    }
  }

  function judgeBugPoint(arr, id) {
    if (!arr || !arr.length || !id)
      return false
    const bugPoint = arr.filter((d) => {
      return d.sid === id
    })
    if (bugPoint.length) {
      removeTooltip()
      tooltip.select('#tool-head').html(`<span>${id}</span><div class="deletes" onclick="removeTooltip()">×</div>`)
      bugPoint.forEach((d) => {
        const item = tooltip.select('#tool-body').append('div').attr('class', 'tool-item')
        item.html(`
        <div class="tool-content">
          <div style="color: #ffffff;border-bottom: 2px solid ${d.lc};">
            <span style="background: ${d.lc};padding: 4px 6px;">${d.lb}</span>
          </div>
          <div>
            <div class="content-left">开始时间</div><div class="content-right">${formatDate(d.startingDate)}</div>
          </div>
          <div>
            <div class="content-left">结束时间</div><div class="content-right">${formatDate(d.closingDate)}</div>
          </div>
          <div>
            <div class="content-left">封站原因</div><div class="content-right">${d.cause}</div>
          </div>
          <div>
            <div class="content-left">封站站点</div><div class="content-right">${d.sid}</div>
          </div>
        </div>
      `)
      })
      d3.select('#tooltip').style('display', 'block')
      return true
    }
    else {
      return false
    }
  }

  function formatDate(string) {
    const y = string.substr(0, 4)
    const m = string.substr(5, 2)
    const d = string.substr(8, 2)
    const h = string.substr(11, 2)
    console.log(`${y}年${m}月${d}日${h}点`)
    return `${y}年${m}月${d}日${h}点`
  }

  function removeTooltip() {
    d3.selectAll('.tool-item').remove()
    d3.select('#tooltip').style('display', 'none')
  }

  function zoomed() {
    removeTooltip()
    const { x, y, k } = d3.event.transform
    currentScale = k
    currentX = x
    currentY = y
    group.transition().duration(50).ease(d3.easeLinear).attr('transform', () => `translate(${x + transX * k}, ${y + transY * k}) scale(${k})`)
  }

  function getCenter(str) {
    if (!str)
      return null

    const tempArr = []
    const tempX = []
    const tempY = []
    str.split(' ').forEach((d) => {
      if (!Number.isNaN(d))
        tempArr.push(d)
    })

    tempArr.forEach((d, i) => {
      if (i % 2 === 0)
        tempX.push(Number.parseFloat(d))

      else
        tempY.push(Number.parseFloat(d))
    })
    const x = (d3.min(tempX) + d3.max(tempX)) / 2
    const y = (d3.min(tempY) + d3.max(tempY)) / 2
    return [x, y]
  }

  function renderAllStation() {
    const nameArray = subway.getLineNameArray()
    const len = Math.ceil(nameArray.length / 5)
    const box = d3.select('#menu').append('div')
      .attr('class', 'name-box')
    for (let i = 0; i < len; i++) {
      const subwayCol = box.append('div')
        .attr('class', 'subway-col')
      const item = subwayCol.selectAll('div')
        .data(nameArray.slice(i * 5, (i + 1) * 5))
        .enter()
        .append('div')
        .attr('id', d => d.lid)
        .attr('class', 'name-item')
      item.each(function (d) {
        d3.select(this).append('span').attr('class', 'p_mark').style('background', d.lc)
        d3.select(this).append('span').attr('class', 'p_name').text(d.lb)
        d3.select(this).on('click', (d) => {
          selected = true
          d3.selectAll('.origin').attr('opacity', 0.1)
          d3.selectAll('.animate1').attr('display', 'none')
          d3.selectAll('.animate2').attr('display', 'none')
          d3.selectAll('.temp').remove()
          renderCurrentLine(d.lid)
          renderCurrentPoint(d.lid)
          const arr = getCenter(d3.select(`path.${d.lid}`).attr('d'))
          svg.call(zoom.transform, d3.zoomIdentity.translate((width / 2 - transX) - arr[0] - (arr[0] + transX) * (currentScale - 1), (height / 2 - transY) - arr[1] - (arr[1] + transY) * (currentScale - 1)).scale(currentScale))
        })
      })
    }
  }

  function scale(type) {
    if (type && currentScale + scaleStep <= scaleExtent[1])
      svg.call(zoom.transform, d3.zoomIdentity.translate((1 - currentScale - scaleStep) * transX - ((1 - currentScale) * transX - currentX) * (currentScale + scaleStep) / currentScale, (1 - currentScale - scaleStep) * transY - ((1 - currentScale) * transY - currentY) * (currentScale + scaleStep) / currentScale).scale(currentScale + scaleStep))

    else if (!type && currentScale - scaleStep >= scaleExtent[0])
      svg.call(zoom.transform, d3.zoomIdentity.translate((1 - (currentScale - scaleStep)) * transX - ((1 - currentScale) * transX - currentX) * (currentScale - scaleStep) / currentScale, (1 - (currentScale - scaleStep)) * transY - ((1 - currentScale) * transY - currentY) * (currentScale - scaleStep) / currentScale).scale(currentScale - scaleStep))
  }

  return {
    scale,
  }
}

window.onload = function () {
  if (typeof (document.onselectstart) !== 'undefined') {
    document.onselectstart = new Function('return false')
  }
  else {
    document.onmousedown = new Function('return false')
    document.onmouseup = new Function('return true')
  }
}
