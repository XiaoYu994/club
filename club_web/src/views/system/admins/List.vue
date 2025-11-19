<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <h2>平台管理员</h2>
        <el-tag type="danger">超级管理员专属</el-tag>
      </div>
    </template>
    <el-empty description="管理员账号管理即将接入，包括角色配置与密码重置。" />
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

