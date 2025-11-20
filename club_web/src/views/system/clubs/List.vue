<template>
  <div class="clubs-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">社团管理</h2>
        <p class="page-desc">管理系统内所有社团信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate" :icon="Plus">
          创建社团
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" :inline="true">
        <el-form-item label="社团名称" class="filter-item">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入社团名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="社团状态" class="filter-item">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            @clear="handleSearch"
            class="filter-select"
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <!-- 社团列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ getRowIndex($index) }}
          </template>
        </el-table-column>
        <el-table-column label="社团Logo" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.logo || '/default-club.png'"
              fit="cover"
              class="club-logo"
              :preview-src-list="row.logo ? [row.logo] : []"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="社团名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="社团简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="memberCount" label="成员数" width="100" align="center" sortable="custom">
          <template #default="{ row }">
            <el-tag type="info">{{ (row.memberCount ?? row.totalMembers ?? 0) }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="100" align="center" sortable="custom" />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)" :icon="View">
              查看
            </el-button>
            <el-button type="warning" link @click="handleEdit(row)" :icon="Edit">
              编辑
            </el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这个社团吗？"
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
          :current-page="pagination.pageNo"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="true"
          :hide-on-single-page="false"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑社团对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-loading="formLoading"
      >
        <el-form-item label="社团名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入社团名称" />
        </el-form-item>
        <el-form-item label="社团Logo" prop="logo">
          <el-upload
            class="logo-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="formData.logo" :src="formData.logo" class="logo-preview" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="社团简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入社团简介"
          />
        </el-form-item>
        <el-form-item label="社团类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择社团类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="社团地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入社团地址" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="formData.contact" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue'
import * as clubsApi from '@/api/system/clubs'
import { getToken } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const typeOptions = [
  { label: '普通社团', value: 0 },
  { label: '院级社团', value: 1 },
  { label: '校级社团', value: 2 },
]

const currentAdminId = computed(() => {
  const profile = authStore.user || {}
  return (
    profile.id ??
    profile.userId ??
    profile.adminId ??
    profile.uid ??
    null
  )
})

// 筛选表单
const filterForm = reactive({
  name: '',
  status: null,
})

// 分页
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})

// 序号计算
const getRowIndex = (index) => (pagination.pageNo - 1) * pagination.pageSize + index + 1

// 排序
const sortField = ref('')
const sortOrder = ref(null)
const sortFieldMap = {
  orderNum: 'order_num',
  memberCount: 'member_count',
  createTime: 'create_time',
}

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑社团' : '创建社团'))
const isEdit = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const formLoading = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  logo: '',
  description: '',
  type: 0,
  address: '',
  contact: '',
  orderNum: 0,
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入社团名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  logo: [{ required: true, message: '请上传社团Logo', trigger: 'change' }],
  description: [
    { required: true, message: '请输入社团简介', trigger: 'blur' },
    { max: 200, message: '长度不超过 200 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择社团类型', trigger: 'change' }],
}

// 上传配置
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const uploadUrl = `${apiBaseUrl}/common/upload`
const uploadHeaders = computed(() => ({
  token: getToken(),
}))

// 格式化日期
const formatDate = (value) => formatTime(value, 'YYYY-MM-DD HH:mm')

// 获取社团列表
const fetchClubList = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
    }
    if (sortField.value) {
      params.orderBy = sortFieldMap[sortField.value] || sortField.value
    }
    if (sortOrder.value !== null) {
      params.isAsc = sortOrder.value
    }
    const response = await clubsApi.getClubList(params)
    if (response?.data) {
      const list = response.data.list || []
      tableData.value = list
      const backendTotal = Number(response.data.total ?? 0)
      pagination.total = backendTotal > 0 ? backendTotal : list.length
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('Failed to fetch club list:', error)
    ElMessage.error('获取社团列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchClubList()
}

// 重置
const handleReset = () => {
  filterForm.name = ''
  filterForm.status = null
  sortField.value = ''
  sortOrder.value = null
  handleSearch()
}

// 排序变化
const handleSortChange = ({ prop, order }) => {
  sortField.value = order ? prop : ''
  sortOrder.value = order === 'ascending' ? true : order === 'descending' ? false : null
  fetchClubList()
}

// 分页变化
const handlePageChange = (page) => {
  pagination.pageNo = page
  fetchClubList()
}

const handleSizeChange = (size) => {
  pagination.pageNo = 1
  pagination.pageSize = size
  fetchClubList()
}

const openCreateDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (clubId) => {
  if (!clubId) return
  isEdit.value = true
  formLoading.value = true
  try {
    const response = await clubsApi.getClubDetail(clubId)
    const data = response?.data
    if (data) {
      Object.assign(formData, {
        id: data.id,
        name: data.name || '',
        logo: data.logo || '',
        description: data.description || '',
        type: data.type ?? 0,
        address: data.address || '',
        contact: data.contact || '',
        orderNum: data.orderNum ?? 0,
      })
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('Failed to load club detail:', error)
    ElMessage.error('获取社团详情失败')
  } finally {
    formLoading.value = false
  }
}

// 创建社团
const handleCreate = () => {
  openCreateDialog()
}

// 编辑社团
const handleEdit = (row) => {
  openEditDialog(row.id)
}

// 查看详情
const handleView = (row) => {
  router.push(`/clubs/${row.id}`)
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await clubsApi.updateClubStatus({
      clubId: row.id,
      status: newStatus,
    })
    ElMessage.success(`已${newStatus === 1 ? '启用' : '禁用'}社团`)
    fetchClubList()
  } catch (error) {
    console.error('Failed to toggle club status:', error)
    ElMessage.error('操作失败')
  }
}

// 删除社团
const handleDelete = async (row) => {
  try {
    await clubsApi.deleteClub(row.id)
    ElMessage.success('删除成功')
    fetchClubList()
  } catch (error) {
    console.error('Failed to delete club:', error)
    ElMessage.error('删除失败')
  }
}

// Logo上传成功
const handleLogoSuccess = (response) => {
  if (response?.code === 200) {
    formData.logo = response.data.url || response.data
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error('Logo上传失败')
  }
}

// Logo上传前验证
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const buildFormPayload = () => ({
  name: formData.name.trim(),
  logo: formData.logo,
  description: formData.description,
  type: formData.type,
  orderNum: formData.orderNum,
  address: formData.address,
  contact: formData.contact,
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    const payload = buildFormPayload()

    if (isEdit.value) {
      await clubsApi.updateClub(formData.id, payload)
      ElMessage.success('更新成功')
    } else {
      const createPayload = { ...payload }
      if (currentAdminId.value) {
        createPayload.createUserId = currentAdminId.value
      }
      await clubsApi.createClub(createPayload)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchClubList()
  } catch (error) {
    if (error !== false) {
      console.error('Failed to submit form:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    logo: '',
    description: '',
    type: 0,
    address: '',
    contact: '',
    orderNum: 0,
  })
  formRef.value?.clearValidate()
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

const clearRouteQuery = (key) => {
  if (!(key in route.query)) return
  const newQuery = { ...route.query }
  delete newQuery[key]
  router.replace({ path: route.path, query: newQuery })
}

watch(
  () => route.query.editId,
  (id) => {
    if (id) {
      openEditDialog(id)
      clearRouteQuery('editId')
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchClubList()
})
</script>

<style scoped>
.clubs-container {
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

.filter-item {
  min-width: 240px;
}

.filter-select {
  width: 100%;
}

.table-card {
  border-radius: 8px;
}

.club-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.logo-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.logo-uploader:hover {
  border-color: var(--el-color-primary);
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.logo-preview {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
