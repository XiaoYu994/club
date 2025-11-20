import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后重试'
const FILE_RESPONSE_TYPES = ['blob', 'arraybuffer']

const serializeParams = (params) => {
  if (!params || typeof params !== 'object') return ''
  const parts = []
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
      })
    } else if (typeof value === 'object') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  })
  return parts.join('&')
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => serializeParams(params),
})

service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (!config.skipAuth && authStore.token) {
      // 根据URL路径判断使用不同的请求头名称
      // 管理员API使用 'token' 请求头，用户API使用 'authentication' 请求头
      const url = config.url || ''
      const baseURL = config.baseURL || service.defaults.baseURL || ''
      const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
      
      // 判断是否为管理员接口（/admin路径）
      if (url.includes('/admin') || fullUrl.includes('/admin')) {
        // 管理员接口使用 'token' 请求头
        config.headers.token = `Bearer ${authStore.token}`
      } else {
        // 其他接口使用 'authentication' 请求头（兼容用户端）
        config.headers.authentication = `Bearer ${authStore.token}`
      }
    }
    config.headers['ngrok-skip-browser-warning'] = 'true'
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => {
    const { data, config, headers, request } = response
    const silent = Boolean(config.silent)

    if (config.rawResponse) {
      return response
    }

    if (config.responseType && FILE_RESPONSE_TYPES.includes(config.responseType)) {
      return data
    }

    const contentType = headers['content-type'] || ''
    if (
      FILE_RESPONSE_TYPES.includes(request?.responseType) ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/vnd')
    ) {
      return data
    }

    if (data?.code === 200 || data?.code === 0 || data?.success === true) {
      if (config.successMessage) {
        ElMessage.success(config.successMessage)
      }
      return data
    }

    const message = data?.message || DEFAULT_ERROR_MESSAGE
    if (!silent) {
      ElMessage.error(message)
    }
    return Promise.reject(new Error(message))
  },
  async (error) => {
    const { response, config } = error || {}
    const silent = Boolean(config?.silent)
    let message = DEFAULT_ERROR_MESSAGE

    if (response) {
      const authStore = useAuthStore()
      const { status, data } = response
      switch (status) {
        case 400:
          message = data?.message || '请求参数有误'
          break
        case 401:
          message = '登录已过期，请重新登录'
          await authStore.logout()
          router.push('/login')
          break
        case 403:
          message = '没有权限执行该操作'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = data?.message || '服务器异常，请稍后重试'
          break
        default:
          message = data?.message || `请求失败（${status}）`
      }
    } else if (error?.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络连接'
    }

    if (!silent) {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export default service

export const get = (url, params, config = {}) =>
  service({
    method: 'get',
    url,
    params,
    ...config,
  })

export const post = (url, data, config = {}) =>
  service({
    method: 'post',
    url,
    data,
    ...config,
  })

export const put = (url, data, config = {}) =>
  service({
    method: 'put',
    url,
    data,
    ...config,
  })

export const patch = (url, data, config = {}) =>
  service({
    method: 'patch',
    url,
    data,
    ...config,
  })

export const del = (url, params, config = {}) =>
  service({
    method: 'delete',
    url,
    params,
    ...config,
  })

export const upload = (url, formData, config = {}) =>
  service({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(config.headers || {}),
    },
    ...config,
  })
