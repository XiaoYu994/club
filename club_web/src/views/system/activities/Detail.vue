<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>活动详情</span>
        <el-tag type="info">建设中</el-tag>
      </div>
    </template>
    <el-empty description="活动报名情况、签到数据与审核记录将稍后补充。" />
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

