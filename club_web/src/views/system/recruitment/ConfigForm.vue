<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>配置详情</span>
        <el-tag type="info">开发中</el-tag>
      </div>
    </template>
    <el-empty description="招新配置表单将在后续支持字段模板、状态控制等功能。" />
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

