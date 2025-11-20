<template>
  <div class="notices-container">
    <!-- 头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">公告管理</h2>
        <p class="page-desc">发布和管理系统公告通知</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate" :icon="Plus">
          新建公告
        </el-button>
      </div>
    </div>

    <!-- 筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="公告标题"
            clearable
            @clear="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable @clear="handleSearch" style="width: 140px">
            <el-option label="普通公告" :value="0" />
            <el-option label="重要公告" :value="1" />
            <el-option label="紧急公告" :value="2" />
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
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isTop" label="置顶" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isTop"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleTopChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" />
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)" :icon="Edit">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这条公告吗？"
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

    <!-- 编辑/新建弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑公告' : '新建公告'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="普通公告" :value="0" />
            <el-option label="重要公告" :value="1" />
            <el-option label="紧急公告" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import * as noticeApi from '@/api/system/notices'
import { formatTime } from '@/utils/format'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const filterForm = reactive({
  keyword: '',
  type: null
})

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  title: '',
  content: '',
  type: 0,
  isTop: 0,
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const formatDate = (val) => formatTime(val)

const getTypeText = (type) => {
  const map = { 0: '普通', 1: '重要', 2: '紧急' }
  return map[type] || '未知'
}

const getTypeTag = (type) => {
  const map = { 0: 'info', 1: 'warning', 2: 'danger' }
  return map[type] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      type: filterForm.type
    }
    const res = await noticeApi.getNoticeList(params)
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
  filterForm.type = null
  handleSearch()
}

const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.id = row.id
  form.title = row.title
  form.content = row.content
  form.type = row.type
  form.isTop = row.isTop
  form.status = row.status
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await noticeApi.deleteNotice(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
}

const handleTopChange = async (row, val) => {
  try {
    await noticeApi.updateNoticeTop(row.id, val)
    ElMessage.success('更新成功')
  } catch (error) {
    console.error(error)
    row.isTop = val === 1 ? 0 : 1 // revert
    ElMessage.error('更新失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (form.id) {
          await noticeApi.updateNotice(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await noticeApi.createNotice(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error(error)
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  form.id = null
  form.title = ''
  form.content = ''
  form.type = 0
  form.isTop = 0
  form.status = 1
  if (formRef.value) formRef.value.resetFields()
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
.notices-container {
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

