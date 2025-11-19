<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>用户详情</span>
        <el-tag type="info">开发中</el-tag>
      </div>
    </template>
    <el-empty description="用户画像、社团参与记录、操作日志等信息将稍后补充。" />
  </el-card>
</template>

<script setup>
</script>

<style scoped>
.module-card {
  min-height: 380px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

