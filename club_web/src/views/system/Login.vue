<template>
  <div class="login-page">
    <div class="login-illustration">
      <h1>Club Master 管理平台</h1>
      <p>统一运营学校社团、活动与招新流程，一站式掌握全局数据。</p>
      <ul>
        <li>
          <el-icon><DataAnalysis /></el-icon>
          <span>实时监控会员增长、活动活跃与财务动态</span>
        </li>
        <li>
          <el-icon><Stamp /></el-icon>
          <span>招新审批全流程跟踪，透明可回溯</span>
        </li>
        <li>
          <el-icon><Setting /></el-icon>
          <span>自定义配置运营策略与权限边界</span>
        </li>
      </ul>
    </div>

    <el-card class="login-form-card">
      <div class="form-header">
        <h2>管理员登录</h2>
        <p>请使用系统管理员账号登录，操作将被记录至审计日志。</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        autocomplete="off"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入管理员账号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            type="password"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="form.rememberMe">记住登录状态</el-checkbox>
            <el-link type="primary" :underline="false" @click.prevent="showSupport">
              登录遇到问题？
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="authStore.loading"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="security-hint">
        <el-icon><Warning /></el-icon>
        <span>请勿在公共设备保存密码，若遗失账号请联系系统超级管理员。</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { User, Lock, DataAnalysis, Stamp, Setting, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  rememberMe: true,
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      await authStore.login({
        username: form.username.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      })
      const redirect = route.query.redirect || '/dashboard'
      router.replace(redirect)
    } catch (error) {
      console.error('Login error', error)
    }
  })
}

const showSupport = () => {
  ElMessageBox.alert('请联系系统超级管理员或技术支持人员重置密码。', '登录帮助', {
    type: 'info',
    confirmButtonText: '了解',
  })
}

if (authStore.isAuthenticated) {
  ElMessage.info('已登录，正在跳转...')
  router.replace('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  padding: 48px;
  background: linear-gradient(135deg, #e8f1ff 0%, #f8fafc 50%, #edf2ff 100%);
}

.login-illustration {
  max-width: 420px;
  color: #334155;
}

.login-illustration h1 {
  font-size: 38px;
  line-height: 1.2;
  margin-bottom: 16px;
}

.login-illustration p {
  margin-bottom: 24px;
  color: #475569;
  font-size: 16px;
}

.login-illustration ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-illustration li {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 14px 18px;
  color: #475569;
}

.login-form-card {
  width: 420px;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  border: none;
}

.form-header {
  margin-bottom: 24px;
}

.form-header h2 {
  margin-bottom: 8px;
  font-size: 28px;
  color: #1f2937;
}

.form-header p {
  color: #6b7280;
  font-size: 14px;
}

.form-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 1px;
}

.security-hint {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .login-page {
    flex-direction: column;
    padding: 32px;
  }

  .login-illustration {
    text-align: center;
  }

  .login-illustration ul {
    align-items: center;
  }
}

@media (max-width: 600px) {
  .login-page {
    padding: 16px;
  }

  .login-form-card {
    width: 100%;
  }
}
</style>

