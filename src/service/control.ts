/* eslint-disable no-console */
import type { FormInstance, FormRules } from 'element-plus'
import type { Ref } from 'vue'

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  type: string[]
  resource: string
  desc: string
}

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change',
    },
  ],
  desc: [
    { required: true, message: 'Please input activity form', trigger: 'blur' },
  ],
})

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))

class SideController {
  private static instance: SideController
  formSize: Ref<string>
  ruleFormRef: Ref<FormInstance | undefined>
  ruleForm: RuleForm
  rules: FormRules<RuleForm>
  options: { value: string; label: string }[]

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
