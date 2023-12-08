<!-- eslint-disable no-console -->
<script setup lang="ts" generic="T extends any, O extends any">
import BJSMap from '~/components/BJSMap.vue'
import { sideController, stations } from '~/service/control'
import { createRenderer } from '~/service/render'
import { Request } from '~/utils'
import { bdSubwayUrl } from '~/constants'

const {
  ruleForm,
  ruleFormRef,
  rules,
  formSize,
  options,
  submitForm,
  resetForm,

  drawer,
  drawerContent,
  cancelClick,
  confirmClick,
} = sideController

Request.get(bdSubwayUrl).then(() => {
  // console.log(res.subways.l)
})

let renderSearchPoint: (stations: string[]) => void

onMounted(() => {
  renderSearchPoint = createRenderer().renderSearchPoint
})
</script>

<template>
  <aside position-absolute left-3 top-3 z-999 b-1 b-coolgray-3 rounded bg-white p-3>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
      mr-6
      mt-6
    >
      <el-form-item label="请输入起点" prop="start">
        <el-select filterable v-model="ruleForm.start" placeholder="Select start point...">
          <el-option v-for="point in stations" :key="point.key" :label="point.name" :value="point.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="请输入终点" prop="end">
        <el-select filterable v-model="ruleForm.end" placeholder="Select end point...">
          <el-option v-for="point in stations" :key="point.key" :label="point.name" :value="point.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="请选择策略" prop="plan">
        <el-select-v2
          v-model="ruleForm.plan"
          placeholder="请选择路线策略..."
          :options="options"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="renderSearchPoint(submitForm.call(sideController, ruleForm)[1])">
          查询
        </el-button>
        <el-button @click="resetForm(ruleFormRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </aside>
  <div class="map-container">
    <BJSMap />
  </div>
  <el-drawer
    v-model="drawer"
    title="BJSUBWAY-HELPER：查询结果面板"
    direction="btt"
    :modal="false"
    :lock-scroll="false"
  >
    <template #default>
      <p font-mono>{{ drawerContent.route }}</p>
      <p mt-1.2>DATA INT AS WEIGHT：<em font-800 color-pink font-size-6>{{ drawerContent.int_as_weight }}</em> km，票价<em font-800 color-pink font-size-6>{{ drawerContent.price }}</em> 元！</p>
      <p font-size-3 color-stone font-italic>计费公式：起步6公里内每人次3元，6-12公里每人次4元，12-32公里每10公里加1元，32公里以上每20公里加1元，票价不封顶。</p>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick.call(sideController)">取消</el-button>
        <el-button type="primary" @click="confirmClick.call(sideController)">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
