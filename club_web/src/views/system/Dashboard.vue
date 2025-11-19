<template>
  <div class="dashboard-placeholder">
    <el-empty
      description="仪表盘建设中，请稍后完成核心指标设计与图表搭建。"
      image-size="240"
    >
      <el-button type="primary" @click="goUsers">前往用户管理</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goUsers = () => {
  router.push('/users')
}
</script>

<style scoped>
.dashboard-placeholder {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
}
</style>

