<template>
  <div class="module-placeholder">
    <el-result
      icon="info"
      title="社团管理模块构建中"
      sub-title="后续将支持社团筛选、排序、详情与导出功能。"
    >
      <template #extra>
        <el-button type="primary" @click="goDashboard">返回仪表盘</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goDashboard = () => router.push('/dashboard')
</script>

<style scoped>
.module-placeholder {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
}
</style>

