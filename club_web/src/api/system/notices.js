import { get, post, put, del } from '@/utils/request'

/**
 * 获取公告列表
 */
export const getNoticeList = (params) => get('/admin/notices', params)

/**
 * 获取公告详情
 */
export const getNoticeDetail = (id) => get(`/admin/notices/${id}`)

/**
 * 创建公告
 */
export const createNotice = (data) => post('/admin/notices', data)

/**
 * 更新公告
 */
export const updateNotice = (id, data) => put(`/admin/notices/${id}`, data)

/**
 * 删除公告
 */
export const deleteNotice = (id) => del(`/admin/notices/${id}`)

/**
 * 设置公告置顶
 */
export const updateNoticeTop = (id, isTop) => put(`/admin/notices/${id}/top`, { isTop }, { params: { isTop } })
