import { Request } from '~/utils'

export async function getSubwayData(url: string) {
  const subwayData = await Request.get(url)
  return subwayData
}

export class Subway {
  data: any
  bugLineArray: any[]

  constructor(data: any) {
    this.data = data
    this.bugLineArray = []
  }

  getInvent() {} // 获取虚拟线路数据
  getPathArray() {} // 获取路径数据
  getPointArray() {} // 获取站点数组
  getCurrentPathArray() {} // 获取被选中线路的路径数组
  getCurrentPointArray() {} // 获取被选中线路的站点数组
  getLineNameArray() {} // 获取线路名称数组
  getBugLineArray() {} // 获取问题路段数组
}
