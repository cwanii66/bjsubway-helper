/* eslint-disable no-console */
import type { FormInstance, FormRules } from 'element-plus'
import type { Ref } from 'vue'
import { subwayData } from './data'

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

export const lineNames = subwayData.map(line => line.l_xmlattr.lb)
export const stations = subwayData.map((line) => {
  return line.p.map((station) => {
    return {
      name: station.p_xmlattr.lb,
      key: station.p_xmlattr.sid,
    }
  })
}).flat()

class SideController {
  private static instance: SideController
  formSize: Ref<string>
  ruleFormRef: Ref<FormInstance | undefined>
  ruleForm: RuleForm
  rules: FormRules<RuleForm>
  options: { value: number; label: string }[]

  static getSideController() {
    // 单例模式
    if (!this.instance)
      this.instance = new SideController()
    return this.instance
  }

  private constructor() {
    this.formSize = formSize
    this.ruleFormRef = ruleFormRef
    this.ruleForm = ruleForm
    this.rules = rules
    this.options = options
  }

  async submitForm(formEl: FormInstance | undefined) {
    if (!formEl)
      return
    await formEl.validate((valid, fields) => {
      if (valid)
        console.log('submit!')
      else
        console.log('error submit!', fields)
    })
  }

  resetForm(formEl: FormInstance | undefined) {
    if (!formEl)
      return
    formEl.resetFields()
  }
}

export const sideController = SideController.getSideController()