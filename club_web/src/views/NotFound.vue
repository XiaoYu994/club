<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isAuthenticated) {
    router.replace('/dashboard')
  } else {
    router.replace('/login')
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
}
.content {
  text-align: center;
}
h1 {
  margin: 0 0 12px;
  font-size: 96px;
  line-height: 1;
  color: #606266;
}
p {
  margin: 0 0 24px;
  color: #909399;
}
</style>


