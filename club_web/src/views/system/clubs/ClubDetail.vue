<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>社团详情</span>
        <el-tag type="info">建设中</el-tag>
      </div>
    </template>
    <el-empty description="社团详情页面正在搭建，稍后提供完整信息面板与操作。">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.push('/clubs')
</script>

<style scoped>
.module-card {
  min-height: 480px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

