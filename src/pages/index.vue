<!-- eslint-disable no-console -->
<script setup lang="ts" generic="T extends any, O extends any">
import BJSMap from '~/components/BJSMap.vue'
import { sideController, stations } from '~/service/control'

const {
  ruleForm,
  ruleFormRef,
  rules,
  formSize,
  options,
  submitForm,
  resetForm,
} = sideController
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
        <el-select v-model="ruleForm.start" placeholder="Please enter start point...">
          <el-option v-for="point in stations" :key="point.key" :label="point.name" :value="point.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="请输入终点" prop="end">
        <el-select v-model="ruleForm.end" placeholder="Please enter end point...">
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
        <el-button type="primary" @click="submitForm(ruleFormRef)">
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
</template>
