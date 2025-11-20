<template>
  <div class="recruit-audit-container">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">招新审核</h2>
        <p class="page-desc">审核各社团提交的招新活动申请</p>
      </div>
    </div>

    <!-- 筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="社团名称/招新标题"
            clearable
            @clear="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable @clear="handleSearch" style="width: 140px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
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
        <el-table-column prop="clubName" label="社团名称" min-width="150" />
        <el-table-column prop="title" label="招新标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="招新时间" min-width="250">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }} ~ {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)" :icon="View">
              详情
            </el-button>
            <template v-if="row.status === 0">
              <el-button type="success" link @click="handleAudit(row, 1)" :icon="Check">
                通过
              </el-button>
              <el-button type="danger" link @click="handleAudit(row, 2)" :icon="Close">
                驳回
              </el-button>
            </template>
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="审核招新申请"
      width="500px"
    >
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAudit" :loading="auditLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, Check, Close } from '@element-plus/icons-vue'
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

const auditDialogVisible = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
  id: null,
  status: 1,
  remark: ''
})

const formatDate = (val) => formatTime(val)

const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      status: filterForm.status
    }
    const res = await recruitApi.getRecruitAuditList(params)
    if (res?.data) {
      tableData.value = res.data.records || [] // Note: IPage returns 'records' usually, check backend
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

const handleView = (row) => {
  router.push(`/recruitment/audit/${row.id}`)
}

const handleAudit = (row, status) => {
  auditForm.id = row.id
  auditForm.status = status
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  if (!auditForm.id) return
  auditLoading.value = true
  try {
    await recruitApi.auditRecruitment({
      id: auditForm.id,
      status: auditForm.status,
      remark: auditForm.remark
    })
    ElMessage.success('审核完成')
    auditDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('审核失败')
  } finally {
    auditLoading.value = false
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
.recruit-audit-container {
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

