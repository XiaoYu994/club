import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import SystemAdminLayout from '@/layouts/SystemAdminLayout.vue'
import systemRoutes from './routes/system'
import { useAuthStore } from '@/stores/auth'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
  routes: [
    {
      path: '/login',
      name: 'SystemLogin',
      component: () => import('@/views/system/Login.vue'),
      meta: { public: true, layout: 'blank' },
    },
    {
      path: '/',
      component: SystemAdminLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true, layout: 'system' },
      children: systemRoutes,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  NProgress.start()

  // 公开路由直接放行
  if (to.meta.public) {
    if (to.path === '/login' && authStore.isAuthenticated) {
      next({ path: '/' })
    } else {
      next()
    }
    NProgress.done()
    return
  }

  // 需要认证的路由
  try {
    // 如果未认证，尝试初始化
    if (!authStore.isAuthenticated) {
      await authStore.initAuth()
    }

    // 如果仍然未认证，重定向到登录页
    if (!authStore.isAuthenticated) {
      // 避免重定向循环：如果已经在登录页，直接放行
      if (to.path !== '/login') {
        next({ path: '/login', query: { redirect: to.fullPath } })
      } else {
        next()
      }
      NProgress.done()
      return
    }

    // 如果已认证但用户信息未加载，尝试加载
    if (!authStore.isProfileLoaded) {
      try {
        await authStore.fetchProfile()
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        // 如果加载失败，清除认证状态并重定向到登录页
        authStore.clearAuth()
        if (to.path !== '/login') {
          next({ path: '/login', query: { redirect: to.fullPath } })
        } else {
          next()
        }
        NProgress.done()
        return
      }
    }

    // 检查角色权限（只对子路由检查，避免父路由重定向导致循环）
    if (to.matched.length > 0) {
      // 获取最后一个匹配的路由记录（通常是实际要访问的路由）
      const matchedRoute = to.matched[to.matched.length - 1]
      if (matchedRoute.meta?.roles?.length) {
        const authorized = matchedRoute.meta.roles.some((role) => authStore.roles.includes(role))
        if (!authorized) {
          // 如果权限不足，重定向到登录页而不是 dashboard，避免循环
          console.warn('Insufficient permissions, redirecting to login')
          authStore.clearAuth()
          if (to.path !== '/login') {
            next({ path: '/login', query: { redirect: to.fullPath } })
          } else {
            next()
          }
          NProgress.done()
          return
        }
      }
    }

    next()
  } catch (error) {
    console.error('Route guard error:', error)
    // 发生错误时，清除认证状态并重定向到登录页
    authStore.clearAuth()
    if (to.path !== '/login') {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router

