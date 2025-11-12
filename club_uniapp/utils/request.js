// utils/request.js
import { removeUser } from '@/utils/auth.js'

class Request {
  constructor() {
    // this.baseURL = 'http://localhost:8081'
	this.baseURL = 'https://cecille-insertional-keva.ngrok-free.dev'
    this.timeout = 30000 // 增加超时时间到30秒
    this.header = {
      'content-type': 'application/json',
      'ngrok-skip-browser-warning': 'true'  // 跳过 ngrok 的浏览器警告页面
    }
  }

  // 设置请求头
  setHeader(header) {
    this.header = Object.assign(this.header, header)
    return this
  }
  
  // 修正setConfig方法
  setConfig(config) {
    if (config.baseURL) {
      this.baseURL = config.baseURL
    }
    if (config.timeout) {
      this.timeout = config.timeout
    }
    if (config.header) {
      this.header = Object.assign(this.header, config.header)
    }
    return this
  }

  // 获取完整URL（添加debug日志）
  getUrl(url) {
    if (url.startsWith('http')) {
      return url
    }
    const fullUrl = this.baseURL + url
    return fullUrl
  }

  // 发起请求的核心方法
  request(options = {}) {
    return new Promise((resolve, reject) => {
      // 获取token
      let token = null;
      let headerKey = 'authentication';
      
      // 判断是否是admin路径，使用不同的token和header key
      if (options.url.startsWith('/admin')) {
        token = uni.getStorageSync('adminToken');
        headerKey = 'token'; // 管理员token的header key
      } else {
        token = uni.getStorageSync('token');
      }
      
      if (token) {
        this.header[headerKey] = `Bearer ${token}`;
      }

      uni.request({
        url: this.getUrl(options.url),
        method: options.method || 'GET',
        data: options.data,
        header: this.header,
        timeout: this.timeout,
        success: (res) => {
          // 打印请求详情（调试用）
          console.log('【请求】URL:', this.getUrl(options.url))
          console.log('【请求】Method:', options.method || 'GET')
          console.log('【请求】Headers:', this.header)
          console.log('【响应】Status:', res.statusCode)
          console.log('【响应】Data类型:', typeof res.data)

          // 检查是否返回了 HTML（ngrok 确认页面）
          if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
            console.error('【错误】收到 HTML 响应，可能是 ngrok 确认页面')
            console.error('【错误】响应内容:', res.data.substring(0, 200))
            uni.showToast({
              title: '网络配置错误，请检查 ngrok 设置',
              icon: 'none',
              duration: 3000
            })
            reject({
              code: -1,
              message: '收到 HTML 响应而不是 JSON，请检查请求头配置'
            })
            return
          }

          // 根据HTTP状态码处理
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // HTTP请求成功，但需要检查业务状态码
            if (res.data && res.data.code !== undefined) {
              // 业务状态码为200表示成功
              if (res.data.code === 200) {
                resolve(res.data)
              } else {
                // 业务状态码非200，显示错误提示
                // 使用 setTimeout 确保 loading 已关闭，toast 能正常显示
                setTimeout(() => {
                  uni.showToast({
                    title: res.data.message || '操作失败',
                    icon: 'none',
                    duration: 2500
                  })
                }, 100)
                reject(res.data)
              }
            } else {
              // 没有业务状态码，直接返回
              resolve(res.data)
            }
          } else if (res.statusCode === 401) {
            // 未授权，需要登录
            // 判断是否是管理员路径
            if (options.url.startsWith('/admin')) {
              uni.showToast({
                title: '管理员登录已过期，请重新登录',
                icon: 'none'
              })
              // 清除管理员token
              uni.removeStorageSync('adminToken')
              uni.removeStorageSync('adminInfo')
              // 跳转到管理员登录页
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/admin/login'
                })
              }, 1500)
            } else {
              // 普通用户登录过期处理
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              })
              // 清除token
              uni.removeStorageSync('token')
              // 同步清除本地用户信息
              try {
                removeUser()
              } catch (e) { /* ignore */ }
              // 跳转到登录页
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/user/login'
                })
              }, 1500)
            }
            reject(res)
          } else {
            // 其他HTTP错误
            uni.showToast({
              title: res.data?.message || '请求失败',
              icon: 'none'
            })
            reject(res)
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络异常',
            icon: 'none'
          })
          console.error('请求失败:', err)
          reject(err)
        }
      })
    })
  }

  // GET请求
  get(url, params = {}) {
    return this.request({
      url: params ? `${url}${this.paramsToString(params)}` : url,
      method: 'GET'
    })
  }

  // POST请求
  post(url, data = {}) {
    return this.request({
      url,
      method: 'POST',
      data
    })
  }

  // PUT请求
  put(url, data = {}) {
    return this.request({
      url,
      method: 'PUT',
      data
    })
  }

  // DELETE请求
  delete(url, data = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data
    })
  }

  // PATCH请求
  patch(url, data = {}) {
    return this.request({
      url,
      method: 'PATCH',
      data
    })
  }

  // 将参数转换为查询字符串
  paramsToString(params) {
    if (!params) return ''
    return '?' + Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  // 文件上传
  upload(url, filePath, formData = {}, name = 'file') {
    return new Promise((resolve, reject) => {
      // 根据URL判断使用哪个token
      let token = null;
      let headerKey = 'Authorization';
      
      if (url.startsWith('/admin')) {
        token = uni.getStorageSync('adminToken');
      } else {
        token = uni.getStorageSync('token');
      }
      
      const header = { ...this.header }
      
      if (token) {
        header[headerKey] = `Bearer ${token}`
      }
      
      uni.uploadFile({
        url: this.getUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // 上传文件返回的数据是字符串，需要转成JSON
            let data = res.data
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data)
              } catch (e) {
                console.error('上传响应数据解析失败', e)
              }
            }
            resolve(data)
          } else {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(res)
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          console.error('上传失败:', err)
          reject(err)
        }
      })
    })
  }
}

// 导出实例
export default new Request()