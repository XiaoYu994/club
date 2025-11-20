import { get, post, put, del } from '@/utils/request'

/**
 * 获取活动列表
 */
export const getActivityList = (params) => get('/admin/activities', params)

/**
 * 获取活动详情
 */
export const getActivityDetail = (id) => get(`/admin/activities/${id}/detail`)

/**
 * 更新活动状态
 */
export const updateActivityStatus = (data) => put('/admin/activities', data)

/**
 * 删除活动
 */
export const deleteActivity = (id) => del(`/admin/activities/${id}`)

/**
 * 导出活动报名名单
 */
export const exportActivityApply = (id) => get(`/admin/activities/export/${id}`)

/**
 * 导出活动列表
 */
export const exportActivities = (params) => get('/admin/activities/export', params)
