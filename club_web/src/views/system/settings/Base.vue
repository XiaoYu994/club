<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <h2>基础配置</h2>
        <el-tag type="info">开发中</el-tag>
      </div>
    </template>
    <el-empty description="系统参数、学期配置与全局 Banner 设置将稍后实现。" />
  </el-card>
</template>

<script setup>
</script>

<style scoped>
.module-card {
  min-height: 360px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

