import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { login as loginApi, logout as logoutApi } from '@/api/system/auth'

const TOKEN_KEY = 'club_system_admin_token'
const USER_KEY = 'club_system_admin_profile'
const ROLES_KEY = 'club_system_admin_roles'

const storage = typeof window !== 'undefined' ? window.localStorage : null

const readJSON = (key, defaultValue = null) => {
  if (!storage) return defaultValue
  try {
    const cached = storage.getItem(key)
    return cached ? JSON.parse(cached) : defaultValue
  } catch (error) {
    console.warn(`Failed to parse storage for ${key}`, error)
    storage.removeItem(key)
    return defaultValue
  }
}

const writeJSON = (key, value) => {
  if (!storage) return
  if (value === undefined || value === null) {
    storage.removeItem(key)
    return
  }
  storage.setItem(key, JSON.stringify(value))
}

const readText = (key, defaultValue = '') => {
  if (!storage) return defaultValue
  return storage.getItem(key) || defaultValue
}

const writeText = (key, value) => {
  if (!storage) return
  if (!value) {
    storage.removeItem(key)
    return
  }
  storage.setItem(key, value)
}

export const useAuthStore = defineStore('system-auth', () => {
  const token = ref(readText(TOKEN_KEY, ''))
  const user = ref(readJSON(USER_KEY))
  const roles = ref(readJSON(ROLES_KEY, []))
  const isProfileLoaded = ref(Boolean(user.value))
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const displayName = computed(
    () => user.value?.realName || user.value?.nickname || user.value?.username || '管理员',
  )
  const avatar = computed(() => user.value?.avatar || '')
  const roleBadges = computed(() => {
    if (user.value?.roleLabels?.length) return user.value.roleLabels
    if (roles.value?.length) return roles.value
    if (user.value?.type) return [user.value.type]
    return []
  })

  const setToken = (value) => {
    token.value = value || ''
    writeText(TOKEN_KEY, token.value)
  }

  const setUser = (profile) => {
    user.value = profile || null
    writeJSON(USER_KEY, user.value)
  }

  const setRoles = (value) => {
    roles.value = value || []
    writeJSON(ROLES_KEY, roles.value)
  }

  const resolveRoles = (profile) => {
    if (!profile) return []
    if (Array.isArray(profile.roles) && profile.roles.length) {
      return profile.roles
    }
    if (profile.roleCodes?.length) return profile.roleCodes
    if (profile.type) return [profile.type]
    if (typeof profile.role === 'string') return [profile.role]
    return []
  }

  const clearAuth = () => {
    setToken('')
    setUser(null)
    setRoles([])
    isProfileLoaded.value = false
  }

  const login = async (credentials) => {
    if (loading.value) return
    loading.value = true
    try {
      const response = await loginApi(credentials)
      const payload = response?.data || response || {}
      const {
        token: responseToken,
        accessToken: responseAccessToken,
        adminToken: responseAdminToken,
        ...profileData
      } = payload
      const accessToken =
        responseToken ||
        responseAccessToken ||
        responseAdminToken ||
        response?.token ||
        response?.adminToken
      if (!accessToken) {
        throw new Error('登录响应缺少令牌')
      }
      setToken(accessToken)
      const profile =
        Object.keys(profileData || {}).length > 0 ? profileData : payload
      if (!profile || Object.keys(profile).length === 0) {
        throw new Error('登录响应缺少管理员信息')
      }
      setUser(profile)
      setRoles(resolveRoles(profile))
      isProfileLoaded.value = true
      ElMessage.success('登录成功')
    } catch (error) {
      console.error('Login failed:', error)
      ElMessage.error(error?.message || '登录失败，请检查账号或网络')
      clearAuth()
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProfileData = async () => {
    try {
      if (!token.value) {
        throw new Error('未登录，无法获取管理员信息')
      }
      // 从本地存储读取用户信息
      const profile = user.value || readJSON(USER_KEY)
      if (!profile) {
        throw new Error('未找到本地管理员信息，请重新登录')
      }
      setUser(profile)
      setRoles(resolveRoles(profile))
      isProfileLoaded.value = true
      return profile
    } catch (error) {
      console.error('Fetch profile failed:', error)
      clearAuth()
      throw error
    }
  }

  const initAuth = async () => {
    if (!token.value) {
      clearAuth()
      return
    }
    if (!isProfileLoaded.value) {
      await fetchProfileData().catch(() => {
        /* handled in fetchProfileData */
      })
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await logoutApi()
      }
    } catch (error) {
      console.warn('Logout request failed, ignoring', error)
    } finally {
      clearAuth()
    }
  }

  return {
    token,
    user,
    roles,
    roleBadges,
    avatar,
    displayName,
    isAuthenticated,
    isProfileLoaded,
    loading,
    login,
    logout,
    initAuth,
    fetchProfile: fetchProfileData,
    clearAuth,
  }
})

