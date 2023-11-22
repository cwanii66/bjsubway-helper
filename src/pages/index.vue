<!-- eslint-disable no-console -->
<script setup lang="ts" generic="T extends any, O extends any">
import BJSMap from '~/components/BJSMap.vue'
import { sideController } from '~/service/control'

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
  <aside bg-white p-3 position-absolute z-999>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      <el-form-item label="请输入起点" prop="region">
        <el-select v-model="ruleForm.region" placeholder="Please enter start point...">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item label="请输入终点" prop="region">
        <el-select v-model="ruleForm.region" placeholder="Please enter end point...">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item label="请选择策略" prop="count">
        <el-select-v2
          v-model="ruleForm.count"
          placeholder="Activity count"
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
