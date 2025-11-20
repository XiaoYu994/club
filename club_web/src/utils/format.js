// 通用时间格式化工具
// 统一被各管理页引用：import { formatTime } from '@/utils/format'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.locale('zh-cn')

const normalizeToDayjs = (value) => {
  if (value === undefined || value === null || value === '') return null
  if (dayjs.isDayjs?.(value)) return value
  if (value instanceof Date) return dayjs(value)

  if (typeof value === 'number') {
    const numeric = value < 1e12 ? value * 1000 : value
    return dayjs(numeric)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (/^\d+$/.test(trimmed)) {
      let numeric = Number(trimmed)
      if (trimmed.length === 10) numeric *= 1000
      return dayjs(numeric)
    }

    const normalized = trimmed.replace(' ', 'T')
    return dayjs(normalized)
  }

  return dayjs(value)
}

/**
 * 将时间戳/时间字符串格式化为目标格式
 */
export function formatTime(value, pattern = 'YYYY-MM-DD HH:mm:ss') {
  const d = normalizeToDayjs(value)
  if (!d || !d.isValid()) return '-'
  return d.format(pattern)
}

/**
 * 将时间戳/时间字符串格式化为日期
 */
export function formatDate(value, pattern = 'YYYY-MM-DD') {
  return formatTime(value, pattern)
}

/**
 * 相对时间，例如 “3分钟前”
 */
export function fromNow(value) {
  const d = normalizeToDayjs(value)
  if (!d || !d.isValid()) return '-'
  return d.fromNow()
}


