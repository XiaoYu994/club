<template>
  <div class="admins-container">
    <div class="page-header">
      <h2 class="page-title">平台管理员</h2>
      <el-button type="primary" icon="Plus" @click="handleAdd">新增管理员</el-button>
    </div>

    <!-- Search and Filter -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="用户名/手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="fetchData">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Admin List Table -->
    <el-card shadow="never">
      <el-table :data="adminList" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" :index="(index) => (queryParams.pageNo - 1) * queryParams.pageSize + index + 1" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'danger' : 'primary'">
              {{ row.type === 1 ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastLoginTime) || '未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-popconfirm title="确定删除该管理员吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.adminId" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            {{ form.adminId ? '留空则不修改密码' : '密码最少6位' }}
          </div>
        </el-form-item>
        <el-form-item label="管理员类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">普通管理员</el-radio>
            <el-radio :label="1">超级管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/format'
import * as adminApi from '@/api/system/admin'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const adminList = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  keyword: '',
  status: null
})

const form = reactive({
  adminId: null,
  username: '',
  password: '',
  phone: '',
  type: 0,
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { validator: (rule, value, callback) => {
      if (!form.adminId && !value) {
        callback(new Error('请输入密码'))
      } else if (value && value.length < 6) {
        callback(new Error('密码最少6位'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAdminList(queryParams)
    if (res?.data) {
      adminList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
    // 错误提示已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = null
  queryParams.pageNo = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增管理员'
  dialogVisible.value = true
  Object.assign(form, {
    adminId: null,
    username: '',
    password: '',
    phone: '',
    type: 0,
    status: 1
  })
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑管理员'
  dialogVisible.value = true
  Object.assign(form, {
    adminId: row.id,
    username: row.username,
    password: '',
    phone: row.phone || '',
    type: row.type,
    status: row.status
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          username: form.username,
          phone: form.phone,
          type: form.type,
          status: form.status
        }
        if (form.password) {
          data.password = form.password
        }

        if (form.adminId) {
          data.id = form.adminId
          await adminApi.updateAdmin(data)
          ElMessage.success('更新成功')
        } else {
          await adminApi.createAdmin(data)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error(error)
        // 错误提示已在拦截器中处理
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleStatusChange = async (row) => {
  try {
    await adminApi.updateAdminStatus({ adminId: row.id, status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error(error)
    row.status = row.status === 1 ? 0 : 1 // Revert on error
    // 错误提示已在拦截器中处理
  }
}

const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置 ${row.username} 的密码为 123456 吗？`, '重置密码', {
      type: 'warning'
    })
    await adminApi.resetAdminPassword(row.id)
    ElMessage.success('密码已重置为：123456')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      // 错误提示已在拦截器中处理
    }
  }
}

const handleDelete = async (row) => {
  try {
    await adminApi.deleteAdmin(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    // 错误提示已在拦截器中处理
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admins-container {
  padding: 0;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}
.filter-card {
  margin-bottom: 20px;
}
</style>
