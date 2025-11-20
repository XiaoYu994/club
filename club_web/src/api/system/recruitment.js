import { get, post, put, del } from '@/utils/request'

// --- 招新配置 ---

/**
 * 分页获取招新配置
 */
export const getRecruitConfigPage = (params) => get('/admin/recruitment/configs/page', params)

/**
 * 获取招新配置详情
 */
export const getRecruitConfigDetail = (id) => get(`/admin/recruitment/configs/${id}`)

/**
 * 添加招新配置
 */
export const createRecruitConfig = (data) => post('/admin/recruitment/configs', data)

/**
 * 修改招新配置
 */
export const updateRecruitConfig = (data) => put('/admin/recruitment/configs', data)

/**
 * 删除招新配置
 */
export const deleteRecruitConfig = (id) => del(`/admin/recruitment/configs/${id}`)


// --- 招新审核 ---

/**
 * 分页获取招新审核列表
 */
export const getRecruitAuditList = (params) => get('/admin/recruitment/audit', params)

/**
 * 获取招新详情
 */
export const getRecruitAuditDetail = (id) => get(`/admin/recruitment/audit/${id}`)

/**
 * 审核招新活动
 * @param {Object} data { id, status, remark }
 */
export const auditRecruitment = (data) => put('/admin/recruitment/audit', data)

/**
 * 删除招新活动
 */
export const deleteRecruitment = (id) => del(`/admin/recruitment/${id}`)
