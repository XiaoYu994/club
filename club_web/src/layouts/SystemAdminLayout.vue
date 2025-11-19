<template>
  <el-container class="system-admin-layout">
    <el-aside :width="isCollapsed ? '72px' : '248px'" class="layout-aside">
      <div class="brand">
        <div class="brand-logo" @click="goDashboard">
          <img v-if="brandLogoUrl" :src="brandLogoUrl" alt="Club Master" />
          <div class="brand-text">
            <span class="brand-title">{{ isCollapsed ? 'CM' : 'Club Master' }}</span>
            <small v-if="!isCollapsed">系统管理员</small>
          </div>
        </div>
        <el-button
          class="collapse-btn"
          @click="toggleCollapse"
          text
          circle
        >
          <template #icon>
            <el-icon>
              <component :is="isCollapsed ? Expand : Fold" />
            </el-icon>
          </template>
        </el-button>
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          class="system-menu"
          router
        >
          <template v-for="group in menuGroups" :key="group.name">
            <el-menu-item-group>
              <template #title>
                <span v-if="!isCollapsed" class="menu-group-title">{{ group.name }}</span>
              </template>
              <template v-for="item in group.items" :key="item.path">
                <el-menu-item :index="`/${item.path}`">
                  <el-icon v-if="item.meta?.icon">
                    <component :is="item.meta.icon" />
                  </el-icon>
                  <span>{{ item.meta?.title }}</span>
                </el-menu-item>
              </template>
            </el-menu-item-group>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item to="/dashboard">总览</el-breadcrumb-item>
            <el-breadcrumb-item
              v-for="crumb in breadcrumbs"
              :key="crumb.path"
              :to="crumb.path"
            >
              {{ crumb.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索功能或社团..."
            class="header-search"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />

          <div class="role-badges" v-if="roleBadges.length">
            <el-tag v-for="tag in roleBadges" :key="tag" effect="plain" size="small">
              {{ tag }}
            </el-tag>
          </div>

          <el-dropdown trigger="click" @command="handleCommand">
            <span class="admin-profile">
              <el-avatar :size="36" :src="avatar || undefined">
                {{ displayInitial }}
              </el-avatar>
              <span class="admin-name">{{ displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view v-slot="{ Component, route: viewRoute }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" :key="viewRoute.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, ArrowDown, Expand, Fold } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { systemMenuRoutes } from '@/router/routes/system'
import brandLogo from '@/assets/logo.svg'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const isCollapsed = ref(false)
const searchKeyword = ref('')

const brandLogoUrl = brandLogo

const checkPermission = (roles = []) => {
  if (!roles || roles.length === 0) return true
  if (!authStore.roles || authStore.roles.length === 0) return false
  return roles.some((role) => authStore.roles.includes(role))
}

const availableMenus = computed(() =>
  systemMenuRoutes.filter((item) => !item.meta?.hidden && checkPermission(item.meta?.roles)),
)

const menuGroups = computed(() => {
  const groups = new Map()
  availableMenus.value.forEach((item) => {
    const groupName = item.meta?.menuGroup || '其他'
    if (!groups.has(groupName)) {
      groups.set(groupName, [])
    }
    groups.get(groupName).push(item)
  })
  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    items,
  }))
})

const activeMenu = computed(() => route.meta?.activePath || route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title && item.path !== '/')
  return matched.map((item) => ({
    title: item.meta.title,
    path: item.path.startsWith('/') ? item.path : `/${item.path}`,
  }))
})

const displayName = computed(() => authStore.displayName)
const avatar = computed(() => authStore.avatar)
const roleBadges = computed(() => authStore.roleBadges || [])
const displayInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const goDashboard = () => {
  router.push('/dashboard')
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  const target = availableMenus.value.find((item) => item.meta?.title.includes(keyword))
  if (target) {
    router.push(`/${target.path}`)
    searchKeyword.value = ''
  } else {
    ElMessage.info('未找到匹配的功能')
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/dashboard')
      break
    case 'password':
      router.push('/account/password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确认退出登录？', '提示', {
          type: 'warning',
          confirmButtonText: '退出',
          cancelButtonText: '取消',
        })
        await authStore.logout()
        router.replace('/login')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Logout canceled or failed:', error)
        }
      }
      break
    default:
      break
  }
}
</script>

<style scoped>
.system-admin-layout {
  min-height: 100vh;
  background: var(--background-color-light);
}

.layout-aside {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.1), rgba(241, 245, 249, 0.6));
}

.brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px;
  min-height: 64px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-logo img {
  height: 36px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  color: var(--text-color-primary);
}

.brand-title {
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.6px;
}

.brand-text small {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.collapse-btn {
  color: var(--text-color-secondary);
}

.menu-scroll {
  flex: 1;
}

.menu-group-title {
  padding: 16px 18px 8px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-color-placeholder);
  text-transform: uppercase;
}

.system-menu {
  border-right: none;
  background-color: transparent;
}

.system-menu :deep(.el-menu-item) {
  margin: 4px 12px;
  border-radius: 10px;
  color: var(--text-color-secondary);
}

.system-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
  color: var(--primary-color, #1f6feb);
  font-weight: 600;
}

.layout-main {
  background: linear-gradient(120deg, rgba(232, 241, 255, 0.6), rgba(249, 250, 251, 0.8));
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.65);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-search {
  width: 240px;
}

.role-badges {
  display: flex;
  gap: 8px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color-primary);
}

.admin-name {
  font-weight: 500;
}

.layout-content {
  padding: 20px 28px 32px;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1280px) {
  .layout-aside {
    width: 220px !important;
  }

  .layout-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-search {
    width: 200px;
  }
}

@media (max-width: 960px) {
  .layout-aside {
    position: fixed;
    z-index: 1000;
    height: 100%;
    transform: translateX(0);
  }

  .layout-header {
    padding: 12px 16px;
  }

  .layout-content {
    padding: 16px;
  }
}
</style>

