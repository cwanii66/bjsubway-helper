import { Subway, getSubwayData } from './data'
import { bdSubwayUrl } from '~/constants'

export async function render() {
  const subwayData = await getSubwayData(bdSubwayUrl)
  const subway = new Subway(subwayData)
}
