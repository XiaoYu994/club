<template>
  <div class="recruit-configs-container">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">招新配置</h2>
        <p class="page-desc">管理社团招新的时间窗口和规则</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate" :icon="Plus">
          新建配置
        </el-button>
      </div>
    </div>

    <!-- 筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="配置名称"
            clearable
            @clear="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable @clear="handleSearch" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ (pagination.pageNo - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="配置标题" min-width="150" />
        <el-table-column label="招新时间段" min-width="300">
          <template #default="{ row }">
            {{ formatDate(row.globalStartTime) }} ~ {{ formatDate(row.globalEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)" :icon="Edit">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这条配置吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
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
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import * as recruitApi from '@/api/system/recruitment'
import { formatTime } from '@/utils/format'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])

const filterForm = reactive({
  keyword: '',
  status: null
})

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (val) => formatTime(val)

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      status: filterForm.status,
    }
    const res = await recruitApi.getRecruitConfigPage(params)
    if (res?.data) {
      tableData.value = res.data.list || []
      pagination.total = Number(res.data.total || 0)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNo = 1
  fetchData()
}

const handleReset = () => {
  filterForm.keyword = ''
  filterForm.status = null
  handleSearch()
}

const handleCreate = () => {
  router.push('/recruitment/configs/new') // Assuming 'new' maps to a create route or handle it in ConfigForm
}

const handleEdit = (row) => {
  router.push(`/recruitment/configs/${row.id}`)
}

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await recruitApi.updateRecruitConfig({
      id: row.id,
      name: row.name,
      globalStartTime: row.globalStartTime,
      globalEndTime: row.globalEndTime,
      description: row.description,
      status: newStatus
    })
    ElMessage.success(`已${newStatus === 1 ? '启用' : '禁用'}配置`)
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  try {
    await recruitApi.deleteRecruitConfig(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNo = 1
  fetchData()
}

const handlePageChange = (page) => {
  pagination.pageNo = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.recruit-configs-container {
  padding: 0;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
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
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

