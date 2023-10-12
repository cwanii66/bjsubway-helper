export interface DirectionCompleteEvent {
  totalTime: number
  totalStops: number
  lines: string[]
}

export interface StationTapEvent {
  station: Station
}

export interface Station {
  id?: string // 地铁站id

  name: string // 地铁站名
  city: SubwayCity // 地铁站所在城市
  col: string // 当前站点默认颜色

  x?: number
  y?: number
  px?: number // 像素坐标
  py?: number // 像素坐标
}

export interface SubwayCity {
  keyword: string // 汉语拼音
  name: string // 中文名
  cityCode: string
}

export interface Line {
  name: string
  stations: Station[]
  city: SubwayCity
}

const subwayCity = BMapSub.SubwayCitiesList.find((city: any) => city.name === '北京')

// get data of bjsubway and initialize the map
export const subway = new BMapSub.Subway('app', subwayCity.citycode)
