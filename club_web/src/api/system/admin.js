import { get, post, put, del } from '@/utils/request'

/**
 * 获取管理员列表
 */
export const getAdminList = (params) => get('/admin', params)

/**
 * 创建管理员
 */
export const createAdmin = (data) => post('/admin', data)

/**
 * 更新管理员
 */
export const updateAdmin = (data) => put('/admin', data)

/**
 * 更新管理员状态
 */
export const updateAdminStatus = (data) => put('/admin/status', data)

/**
 * 重置管理员密码
 */
export const resetAdminPassword = (adminId) => put(`/admin/${adminId}/reset`)

/**
 * 删除管理员
 */
export const deleteAdmin = (adminId) => del(`/admin/${adminId}`)

/**
 * 修改当前管理员密码
 */
export const changePassword = (data) => put('/admin/password', data)

/**
 * 获取当前管理员信息
 */
export const getAdminInfo = () => get('/admin/info')