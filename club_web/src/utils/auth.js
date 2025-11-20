/**
 * 认证相关工具函数
 */

const TOKEN_KEY = 'club_system_admin_token'

/**
 * 从 localStorage 获取 token
 * @returns {string} token字符串
 */
export const getToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 保存 token 到 localStorage
 * @param {string} token - token字符串
 */
export const setToken = (token) => {
  if (typeof window === 'undefined') return
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY)
    return
  }
  window.localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 token
 */
export const removeToken = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

/**
 * 检查是否已登录（是否有token）
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return Boolean(getToken())
}
