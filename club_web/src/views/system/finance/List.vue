<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <h2>财务管理</h2>
        <el-tag type="warning">超级管理员限定</el-tag>
      </div>
    </template>
    <el-empty description="经费申请、审批与预算图表即将接入。" />
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

