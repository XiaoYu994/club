// 通用时间格式化工具
// 统一被各管理页引用：import { formatTime } from '@/utils/format'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.locale('zh-cn')

/**
 * 将时间戳/时间字符串格式化为 YYYY-MM-DD HH:mm:ss
 */
export function formatTime(value) {
  if (!value) return '-'
  const d = dayjs(value)
  if (!d.isValid()) return '-'
  return d.format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 相对时间，例如 “3分钟前”
 */
export function fromNow(value) {
  if (!value) return '-'
  const d = dayjs(value)
  if (!d.isValid()) return '-'
  return d.fromNow()
}


