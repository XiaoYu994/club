<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>审核详情</span>
        <el-tag type="info">开发中</el-tag>
      </div>
    </template>
    <el-empty description="招新审核详情页尚未完成，将展示流程节点、审批意见等数据。" />
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

