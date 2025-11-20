<template>
  <div class="users-container">
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <div>
            <h2>用户管理</h2>
            <p class="subtitle">管理系统用户信息，支持搜索、筛选和状态管理</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleExport" :loading="exportLoading">
              <el-icon><Download /></el-icon>
              导出用户
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="关键词">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索用户名、学号、手机号"
              clearable
              @keyup.enter="handleSearch"
              style="width: 240px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部状态"
              clearable
              style="width: 140px"
            >
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ row.username || '未设置' }}</div>
                <div class="student-id" v-if="row.studentId">
                  {{ row.studentId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="college" label="学院" min-width="120" show-overflow-tooltip />
        <el-table-column prop="major" label="专业" min-width="120" show-overflow-tooltip />
        <el-table-column prop="className" label="班级" min-width="100" show-overflow-tooltip />
        <el-table-column prop="mobile" label="手机号" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          sortable="custom"
          align="center"
        >
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              <el-icon><Switch /></el-icon>
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :background="true"
          :hide-on-single-page="false"
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
import { Search, Refresh, Download, View, Switch } from '@element-plus/icons-vue'
import { usersApi } from '@/api/system'
import dayjs from 'dayjs'
import { formatTime as formatTimeDisplay } from '@/utils/format'

const router = useRouter()

const loading = ref(false)
const exportLoading = ref(false)
const userList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  limit: 20,
  keyword: '',
  status: undefined,
})

const formatTime = (timestamp) => formatTimeDisplay(timestamp, 'YYYY-MM-DD HH:mm:ss')

const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await usersApi.getUserList(queryParams)
    if (response?.data) {
      userList.value = response.data.list || []
      const backendTotal = Number(response.data.total ?? 0)
      total.value = backendTotal > 0 ? backendTotal : userList.value.length
    } else {
      userList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch user list:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchUserList()
}

const handleReset = () => {
  queryParams.page = 1
  queryParams.limit = 20
  queryParams.keyword = ''
  queryParams.status = undefined
  fetchUserList()
}

const handleSortChange = ({ prop, order }) => {
  // 可以在这里处理排序逻辑
  fetchUserList()
}

const handleSizeChange = (size) => {
  queryParams.limit = size
  queryParams.page = 1
  fetchUserList()
}

const handlePageChange = (page) => {
  queryParams.page = page
  fetchUserList()
}

const handleView = (row) => {
  router.push(`/users/${row.id}`)
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认${action}用户 "${row.username}" 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
    // 确保 id 是数字类型
    const userId = Number(row.id)
    if (isNaN(userId)) {
      ElMessage.error('用户ID无效')
      return
    }
    await usersApi.updateUserStatus(userId, { status: newStatus })
    ElMessage.success(`${action}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to update user status:', error)
      const errorMsg = error?.response?.data?.msg || error?.message || '操作失败，请重试'
      ElMessage.error(errorMsg)
    }
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const response = await usersApi.exportUsers(queryParams)
    // 创建下载链接
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `用户列表_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export users:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
  padding: 0;
}

.main-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.filter-form {
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.student-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .filter-form {
    display: flex;
    flex-direction: column;
  }

  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style>
