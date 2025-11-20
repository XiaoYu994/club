import { get, post, put, del } from '@/utils/request'

/**
 * 获取社团列表
 */
export const getClubList = (params) => get('/admin/clubs', params)

/**
 * 获取社团详情
 */
export const getClubDetail = (id) => get(`/admin/clubs/${id}/detail`)

/**
 * 创建社团
 */
export const createClub = (data) => post('/admin/clubs', data)

/**
 * 更新社团信息
 */
export const updateClub = (id, data) => put(`/admin/clubs/${id}`, data)

/**
 * 删除社团
 */
export const deleteClub = (id) => del(`/admin/clubs/${id}`)

/**
 * 更新社团状态
 */
export const updateClubStatus = (data) => put('/admin/clubs', data)

