/* eslint-disable no-console */
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createSubwayMap, reloadData, subwayData } from './data'
import { calcFare1, createIntersectionMatrix, dijkstra, Dijkstra as fixTicketDiji, leastExchange } from './calc'

interface RuleForm {
  start: string
  end: string
  plan: number
}

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  start: '',
  end: '',
  plan: 0,
})

const rules = reactive<FormRules<RuleForm>>({
  start: [
    {
      required: true,
      message: '请选择起始站！',
      trigger: 'change',
    },
  ],
  end: [
    {
      required: true,
      message: '请选择终点站！',
      trigger: 'change',
    },
  ],
  plan: [
    {
      required: true,
      message: '请选择换乘计划',
      trigger: 'change',
    },
  ],
})

const options = [
  {
    value: 0,
    label: '换乘最少',
  },
  {
    value: 1,
    label: '用时最短',
  },
]

export function dedupeArray<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export const lineNames = subwayData.map(line => line.l_xmlattr.lb)
export const stations = dedupeArray(
  subwayData.map((line) => {
    return line.p
      .filter(station => station.p_xmlattr.st)
      .map((station) => {
        return {
          name: station.p_xmlattr.lb,
          key: station.p_xmlattr.sid,
        }
      })
  }).flat(),
)
const { lines_data, weights } = reloadData()
const [station_dict, line_dict] = createSubwayMap(lines_data, weights)

class SideController {
  static instance: SideController = new SideController()
  formSize: Ref<string>
  ruleFormRef: Ref<FormInstance | undefined>
  ruleForm: RuleForm
  rules: FormRules<RuleForm>
  options: { value: number; label: string }[]

  drawer: Ref<boolean> = ref(false)
  drawerContent: Ref<{
    route: string
    int_as_weight: number
    price: number
  }> = ref({
      route: '',
      int_as_weight: 0,
      price: 0,
    })

  searchResult!: any

  private constructor() {
    this.formSize = formSize
    this.ruleFormRef = ruleFormRef
    this.ruleForm = ruleForm
    this.rules = rules
    this.options = options
  }

  submitForm(ruleForm: RuleForm) {
    if (
      !ruleForm.start
      || !ruleForm.end
      || !ruleForm.plan
      || ruleForm.start === ruleForm.end
    ) {
      ElMessage.error('请填写正确的信息')
      return
    }

    switch (ruleForm.plan) {
      case 0: // 换乘最少
        this.minTransferSubmit(ruleForm)
        ElMessage.success('查询成功：换乘最少')
        break
      case 1: // 用时最短
        this.minTimeSubmit(ruleForm)
        ElMessage.success('查询成功：用时最短')
        break
      default:
        console.error('plan error')
        ElMessage.error('plan error')
    }
    // this.showSearchMessage()
    this.setDrawer(this.searchResult)
    return this.searchResult
  }

  minTransferSubmit(ruleForm: RuleForm) {
    const intersectionMatrix = createIntersectionMatrix(line_dict)
    this.searchResult = leastExchange(intersectionMatrix, line_dict, station_dict, ruleForm.start, ruleForm.end)
  }

  minTimeSubmit(ruleForm: RuleForm) {
    this.searchResult = dijkstra(station_dict, ruleForm.start, ruleForm.end)
  }

  setDrawer(content: [number, string[]]) {
    this.drawer.value = true
    this.drawerContent.value.route = content[1].join(' → ')
    this.drawerContent.value.int_as_weight = content[0]
    this.drawerContent.value.price = calcFare1(
      fixTicketDiji.shortestPath(ruleForm.start, ruleForm.end),
    )
  }

  cancelClick() {
    this.drawer.value = false
  }

  confirmClick() {
    this.drawer.value = false
  }

  resetForm(formEl: FormInstance | undefined) {
    if (!formEl)
      return
    formEl.resetFields()
  }
}

export const sideController = SideController.instance
