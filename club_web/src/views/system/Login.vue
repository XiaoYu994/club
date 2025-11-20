<template>
  <div class="login-wrapper">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-bg-gradient"></div>
      <div class="brand-content">
        <div class="brand-header">
          <img src="@/assets/logo.svg" alt="Club Master" class="brand-logo-img" />
          <div class="brand-title-group">
            <h1 class="brand-title">Club Master</h1>
            <p class="brand-subtitle">社团管理系统</p>
          </div>
        </div>

        <div class="brand-showcase">
          <h2 class="showcase-title">
            统一运营，高效管理<br />
            <span class="highlight-gradient">一站式掌控全局</span>
          </h2>
          <p class="showcase-desc">
            专为高校社团打造的数字化管理平台，整合数据洞察、招新审批、权限配置等核心功能，助力社团高效运营。
          </p>

          <div class="feature-glass-panel">
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon :size="24"><DataAnalysis /></el-icon>
                </div>
                <div class="feature-text">
                  <h4>数据洞察</h4>
                  <p>实时监控核心指标</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon :size="24"><Stamp /></el-icon>
                </div>
                <div class="feature-text">
                  <h4>智能审批</h4>
                  <p>全流程透明管理</p>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon :size="24"><Setting /></el-icon>
                </div>
                <div class="feature-text">
                  <h4>灵活配置</h4>
                  <p>自定义运营策略</p>
                </div>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value">100+</span>
                <span class="stat-label">社团接入</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">5000+</span>
                <span class="stat-label">活跃用户</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">99.9%</span>
                <span class="stat-label">系统稳定性</span>
              </div>
            </div>
          </div>
        </div>

        <div class="brand-footer">
          <p>© 2025 湖南工业职业技术学院-社团管理系统</p>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-section">
      <div class="login-container">
        <div class="login-header">
          <h2>欢迎回来</h2>
          <p>请使用管理员账号登录系统控制台</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          class="login-form"
          @keyup.enter="handleSubmit"
        >
          <el-form-item label="管理员账号" prop="username" class="form-item">
            <el-input
              v-model="form.username"
              placeholder="请输入管理员账号"
              clearable
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="登录密码" prop="password" class="form-item">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入登录密码"
              show-password
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="form.rememberMe" class="remember-checkbox">
              记住登录状态
            </el-checkbox>
            <el-link type="primary" :underline="false" @click="showSupport">
              登录遇到问题？
            </el-link>
          </div>

          <el-button
            type="primary"
            class="submit-button"
            :loading="authStore.loading"
            @click="handleSubmit"
          >
            <span v-if="!authStore.loading">登录</span>
            <span v-else>登录中...</span>
            <el-icon class="button-icon" v-if="!authStore.loading">
              <ArrowRight />
            </el-icon>
          </el-button>
        </el-form>

        <div class="security-notice">
          <el-icon class="notice-icon"><Lock /></el-icon>
          <span>所有操作将被记录至审计日志，请勿在公共设备保存密码</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import {
  User,
  Lock,
  DataAnalysis,
  Stamp,
  Setting,
  ArrowRight,
} from '@element-plus/icons-vue'

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

      await new Promise((resolve) => setTimeout(resolve, 100))
      const redirect = route.query.redirect || '/dashboard'
      await router.push(redirect)
    } catch (error) {
      console.error('登录失败:', error)
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
  router.replace('/dashboard')
}
</script>

<style scoped lang="scss">
@import '@/styles/tokens.scss';

.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: $color-neutral-50;
}

/* ========== 左侧品牌区 ========== */
.brand-section {
  width: 50%;
  min-width: 560px;
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
  overflow: hidden;
}

.brand-bg-gradient {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 120%;
  height: 140%;
  background: radial-gradient(
      circle at 30% 40%,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 60%,
      rgba(139, 92, 246, 0.12) 0%,
      transparent 50%
    );
  animation: gradientShift 15s ease-in-out infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-5%, -5%) scale(1.05);
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
  color: #ffffff;
  animation: fadeInLeft 0.8s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 64px;
}

.brand-logo-img {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 8px 16px rgba(99, 102, 241, 0.3));
}

.brand-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 14px;
  color: $color-neutral-400;
  margin: 0;
  font-weight: 500;
}

.showcase-title {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 24px 0;
  letter-spacing: -1px;
}

.highlight-gradient {
  background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.showcase-desc {
  font-size: 16px;
  line-height: 1.7;
  color: $color-neutral-300;
  margin-bottom: 48px;
}

.feature-glass-panel {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-lg;
  padding: 32px;
}

.feature-grid {
  display: grid;
  gap: 24px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: $color-secondary-500;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.feature-text h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
}

.feature-text p {
  font-size: 14px;
  color: $color-neutral-400;
  margin: 0;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 12px;
  color: $color-neutral-400;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
}

.brand-footer {
  margin-top: 80px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-footer p {
  font-size: 13px;
  color: $color-neutral-500;
  margin: 0;
}

/* ========== 右侧登录区 ========== */
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: $color-neutral-50;
}

.login-container {
  width: 100%;
  max-width: 440px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: $color-neutral-900;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  color: $color-neutral-500;
  margin: 0;
}

.login-form {
  background: #ffffff;
  border-radius: $radius-xl;
  padding: 40px;
  box-shadow: $shadow-md;
  border: 1px solid $color-neutral-200;
}

.form-item {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: $color-neutral-700;
  margin-bottom: 8px;
}

.custom-input :deep(.el-input__wrapper) {
  background: $color-neutral-100;
  border-radius: $radius-sm;
  border: 1px solid transparent;
  box-shadow: none;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: #ffffff;
  border-color: $color-neutral-300;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  border-color: $color-secondary-500;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
}

.custom-input :deep(.el-input__inner) {
  font-size: 15px;
  color: $color-neutral-900;
}

.input-icon {
  color: $color-neutral-400;
  font-size: 18px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.remember-checkbox :deep(.el-checkbox__label) {
  font-size: 14px;
  color: $color-neutral-600;
}

.submit-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, $color-neutral-900 0%, $color-neutral-700 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.submit-button:hover .button-icon {
  transform: translateX(4px);
}

.security-notice {
  margin-top: 32px;
  padding: 16px;
  background: $color-neutral-100;
  border-radius: $radius-md;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: $color-neutral-600;
  line-height: 1.5;
}

.notice-icon {
  color: $color-neutral-400;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1280px) {
  .brand-section {
    width: 45%;
    min-width: 480px;
    padding: 60px;
  }

  .showcase-title {
    font-size: 36px;
  }
}

@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .login-section {
    padding: 32px 24px;
  }

  .login-form {
    padding: 32px 24px;
  }
}

@media (max-width: 640px) {
  .login-header h2 {
    font-size: 28px;
  }

  .login-form {
    padding: 24px;
    border-radius: $radius-lg;
  }

  .submit-button {
    height: 48px;
    font-size: 15px;
  }
}
</style>
