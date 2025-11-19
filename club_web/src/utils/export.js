import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { get, post } from '@/utils/request'

const DEFAULT_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const buildFilename = (baseName, extension = 'xlsx') => {
  const time = dayjs().format('YYYYMMDD_HHmmss')
  return `${baseName || 'export'}_${time}.${extension}`
}

export const downloadBlob = (blob, filename, mimeType = DEFAULT_MIME) => {
  if (!(blob instanceof Blob)) {
    ElMessage.error('导出失败：数据格式错误')
    return
  }
  const file = new Blob([blob], { type: mimeType })
  saveAs(file, filename || buildFilename('export'))
}

export const exportByGet = async (url, params, filename, config = {}) => {
  const response = await get(url, params, {
    responseType: 'blob',
    silent: true,
    ...config,
  })
  downloadBlob(response, filename)
}

export const exportByPost = async (url, data, filename, config = {}) => {
  const response = await post(url, data, {
    responseType: 'blob',
    silent: true,
    ...config,
  })
  downloadBlob(response, filename)
}

export const exportJsonToXlsx = (rows = [], columns = [], filename) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    ElMessage.warning('暂无可导出的数据')
    return
  }

  let sheetData = rows
  if (Array.isArray(columns) && columns.length) {
    sheetData = rows.map((row) => {
      const mapped = {}
      columns.forEach((col) => {
        const dataIndex = col.field || col.prop || col.dataIndex
        mapped[col.title || col.label || dataIndex] = row[dataIndex]
      })
      return mapped
    })
  }

  const worksheet = XLSX.utils.json_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  downloadBlob(new Blob([buffer], { type: DEFAULT_MIME }), filename || buildFilename('data'))
}

