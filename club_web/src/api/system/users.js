import { get, put, post } from '@/utils/request'

/**
 * 获取用户列表
 */
export const getUserList = (params) => get('/admin/users', params)

/**
 * 获取用户详情
 */
export const getUserDetail = (id) => get(`/admin/users/${id}`)

/**
 * 更新用户信息
 */
export const updateUser = (id, data) => put(`/admin/users/${id}`, data)

/**
 * 更新用户状态
 */
export const updateUserStatus = (id, data) => put(`/admin/users/${id}/status`, data)

/**
 * 导出用户列表
 */
export const exportUsers = (params) =>
  get('/admin/users/export', params, {
    responseType: 'blob',
  })

