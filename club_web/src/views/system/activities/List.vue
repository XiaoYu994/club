<template>
  <div class="activities-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">活动管理</h2>
        <p class="page-desc">管理系统内所有社团活动</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="handleExportAll" :icon="Download">
          批量导出
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" :inline="true">
        <el-form-item label="活动名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入活动名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="社团">
          <el-input
            v-model="filterForm.clubName"
            placeholder="请输入社团名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable @clear="handleSearch">
            <el-option label="报名中" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活动列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column label="活动封面" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.poster || '/default-activity.png'"
              fit="cover"
              class="activity-cover"
              :preview-src-list="[row.poster]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="clubName" label="所属社团" width="140" show-overflow-tooltip />
        <el-table-column prop="address" label="活动地点" width="150" show-overflow-tooltip />
        <el-table-column label="活动时间" width="340">
          <template #default="{ row }">
            <div class="time-range">
              <el-text type="primary" size="small">
                {{ formatDate(row.startTime) }}
              </el-text>
              <el-text type="info" size="small"> 至 </el-text>
              <el-text type="primary" size="small">
                {{ formatDate(row.endTime) }}
              </el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="报名情况" width="140" align="center">
          <template #default="{ row }">
            <el-tooltip :content="`已报名: ${row.joinCount || 0}人`" placement="top">
              <el-tag type="info">{{ row.joinCount || 0 }} 人</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)" :icon="View">
              查看
            </el-button>
            <el-button type="success" link @click="handleExport(row)" :icon="Download">
              导出名单
            </el-button>
            <el-dropdown @command="(cmd) => handleStatusCommand(cmd, row)">
              <el-button type="warning" link>
                状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="0" :disabled="row.status === 0">报名中</el-dropdown-item>
                  <el-dropdown-item :command="1" :disabled="row.status === 1">进行中</el-dropdown-item>
                  <el-dropdown-item :command="2" :disabled="row.status === 2">已结束</el-dropdown-item>
                  <el-dropdown-item :command="3" :disabled="row.status === 3">已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-popconfirm
              title="确定要删除这个活动吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  View,
  Delete,
  Download,
  ArrowDown,
} from '@element-plus/icons-vue'
import * as activitiesApi from '@/api/system/activities'
import { formatTime } from '@/utils/format'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  name: '',
  clubName: '',
  status: null,
})

// 分页
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})

// 排序
const sortField = ref('')
const sortOrder = ref('')

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 活动状态映射
const statusMap = {
  0: { text: '报名中', type: 'warning' },
  1: { text: '进行中', type: 'success' },
  2: { text: '已结束', type: 'info' },
  3: { text: '已取消', type: 'danger' },
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

// 格式化日期
const formatDate = (value) => formatTime(value, 'YYYY-MM-DD HH:mm')

// 获取活动列表
const fetchActivityList = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }
    const response = await activitiesApi.getActivityList(params)
    if (response?.data) {
      tableData.value = response.data.list || []
      const backendTotal = Number(response.data.total ?? 0)
      pagination.total = backendTotal > 0 ? backendTotal : tableData.value.length
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('Failed to fetch activity list:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchActivityList()
}

// 重置
const handleReset = () => {
  filterForm.name = ''
  filterForm.clubName = ''
  filterForm.status = null
  sortField.value = ''
  sortOrder.value = ''
  handleSearch()
}

// 排序变化
const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
  fetchActivityList()
}

// 分页变化
const handlePageChange = () => {
  fetchActivityList()
}

const handleSizeChange = () => {
  pagination.pageNo = 1
  fetchActivityList()
}

// 查看详情
const handleView = (row) => {
  router.push(`/activities/${row.id}`)
}

// 修改状态
const handleStatusCommand = async (newStatus, row) => {
  try {
    await activitiesApi.updateActivityStatus({
      id: row.id,
      status: newStatus,
    })
    ElMessage.success(`已将活动状态更改为 ${getStatusText(newStatus)}`)
    fetchActivityList()
  } catch (error) {
    console.error('Failed to update activity status:', error)
    ElMessage.error('状态更新失败')
  }
}

// 删除活动
const handleDelete = async (row) => {
  try {
    await activitiesApi.deleteActivity(row.id)
    ElMessage.success('删除成功')
    fetchActivityList()
  } catch (error) {
    console.error('Failed to delete activity:', error)
    ElMessage.error('删除失败')
  }
}

// 导出单个活动报名名单
const handleExport = async (row) => {
  try {
    ElMessage.info('正在导出报名名单...')
    const response = await activitiesApi.exportActivityApply(row.id)

    if (response?.data) {
      // 处理导出数据（这里假设后端返回Excel数据）
      const data = response.data

      // 创建下载链接
      if (data.url) {
        window.open(data.url, '_blank')
        ElMessage.success('导出成功')
      } else {
        // 如果返回的是原始数据，可以在前端生成Excel
        ElMessage.warning('导出功能开发中')
      }
    }
  } catch (error) {
    console.error('Failed to export activity apply list:', error)
    ElMessage.error('导出失败')
  }
}

// 批量导出所有活动
const handleExportAll = async () => {
  try {
    ElMessage.info('正在导出活动列表...')
    const params = {
      ...filterForm,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    }
    const response = await activitiesApi.exportActivities(params)
    
    if (response?.data) {
      const data = response.data
      // 处理导出数据
      if (data.url) {
        window.open(data.url, '_blank')
        ElMessage.success('导出成功')
      } else if (data.fileName) {
        // 如果返回的是文件名，构建下载URL
        const downloadUrl = `/api/admin/activities/export/download?fileName=${data.fileName}`
        window.open(downloadUrl, '_blank')
        ElMessage.success('导出成功')
      } else {
        ElMessage.warning('导出功能开发中')
      }
    }
  } catch (error) {
    console.error('Failed to export activities:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchActivityList()
})
</script>

<style scoped>
.activities-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.activity-cover {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
