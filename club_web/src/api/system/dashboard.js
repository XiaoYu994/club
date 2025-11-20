import { get } from '@/utils/request'

/**
 * 获取统计数据
 */
export const getStatistics = () => get('/admin/statistics')

/**
 * 获取趋势数据
 * @param {number} days - 天数（7或30）
 */
export const getTrendData = (days = 7) => get('/admin/trend', { days })
