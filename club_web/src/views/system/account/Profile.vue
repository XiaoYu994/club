<template>
  <div class="profile-container">
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="120" :src="userInfo.avatar || undefined">
              {{ userInfo.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <h3 class="username">{{ userInfo.username }}</h3>
            <el-tag :type="userInfo.type === 1 ? 'danger' : 'primary'" size="large">
              {{ userInfo.type === 1 ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </div>
          <div class="actions">
            <el-button type="primary" @click="showEditDialog" style="width: 100%; margin-bottom: 10px">
              编辑信息
            </el-button>
            <el-button @click="showPasswordDialog" style="width: 100%">
              修改密码
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="16">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userInfo.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ userInfo.description || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
                {{ userInfo.status === 1 ? '正常' : '已禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后登录时间">
              {{ formatTime(userInfo.lastLoginTime) || '从未登录' }}
            </el-descriptions-item>
            <el-descriptions-item label="登录次数">{{ userInfo.loginCount || 0 }} 次</el-descriptions-item>
            <el-descriptions-item label="账号创建时间">
              {{ formatTime(userInfo.createTime) || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- Edit Info Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入描述信息（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editing">保存</el-button>
      </template>
    </el-dialog>

    <!-- Change Password Dialog -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="450px"
      destroy-on-close
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange" :loading="changingPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/format'
import * as adminApi from '@/api/system/admin'

const route = useRoute()
const authStore = useAuthStore()
const userInfo = ref({})
const editDialogVisible = ref(false)
const editing = ref(false)
const editFormRef = ref(null)
const passwordDialogVisible = ref(false)
const changingPassword = ref(false)
const passwordFormRef = ref(null)

const editForm = reactive({
  id: null,
  username: '',
  phone: '',
  description: ''
})

const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value && value.trim() !== '') {
          if (!/^1[3-9]\d{9}$/.test(value)) {
            callback(new Error('请输入正确的手机号'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const fetchUserInfo = async () => {
  try {
    // 优先从API获取最新信息
    const response = await adminApi.getAdminInfo()
    if (response?.data) {
      userInfo.value = {
        id: response.data.id,
        username: response.data.username || authStore.displayName,
        phone: response.data.phone || '',
        description: response.data.description || '',
        type: response.data.type || (authStore.roles?.includes('SUPER') ? 1 : 0),
        status: response.data.status || 1,
        lastLoginTime: response.data.lastLoginTime,
        loginCount: response.data.loginCount || 0,
        createTime: response.data.createTime,
        avatar: response.data.avatar || authStore.avatar
      }
    } else {
      // 如果API失败，从auth store获取
      const userProfile = authStore.user || {}
      userInfo.value = {
        id: userProfile.id,
        username: userProfile.username || authStore.displayName,
        phone: userProfile.phone || '',
        description: userProfile.description || '',
        type: userProfile.type || (authStore.roles?.includes('SUPER') ? 1 : 0),
        status: userProfile.status || 1,
        lastLoginTime: userProfile.lastLoginTime || userProfile.last_login_time,
        loginCount: userProfile.loginCount || userProfile.login_count || 0,
        createTime: userProfile.createTime || userProfile.create_time,
        avatar: userProfile.avatar || authStore.avatar
      }
    }
  } catch (error) {
    console.error('Failed to fetch admin info:', error)
    // 如果API失败，从auth store获取
    const userProfile = authStore.user || {}
    userInfo.value = {
      id: userProfile.id,
      username: userProfile.username || authStore.displayName,
      phone: userProfile.phone || '',
      description: userProfile.description || '',
      type: userProfile.type || (authStore.roles?.includes('SUPER') ? 1 : 0),
      status: userProfile.status || 1,
      lastLoginTime: userProfile.lastLoginTime || userProfile.last_login_time,
      loginCount: userProfile.loginCount || userProfile.login_count || 0,
      createTime: userProfile.createTime || userProfile.create_time,
      avatar: userProfile.avatar || authStore.avatar
    }
  }
}

const showEditDialog = () => {
  editForm.id = userInfo.value.id
  editForm.username = userInfo.value.username || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.description = userInfo.value.description || ''
  editDialogVisible.value = true
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      editing.value = true
      try {
        await adminApi.updateAdmin({
          id: editForm.id,
          username: editForm.username,
          phone: editForm.phone,
          description: editForm.description
        })
        ElMessage.success('信息更新成功')
        editDialogVisible.value = false
        // 刷新用户信息
        await fetchUserInfo()
        // 更新auth store中的用户信息
        if (authStore.user) {
          authStore.user.username = editForm.username
          authStore.user.phone = editForm.phone
          authStore.user.description = editForm.description
        }
        authStore.displayName = editForm.username
      } catch (error) {
        console.error(error)
        ElMessage.error(error.response?.data?.msg || '更新失败')
      } finally {
        editing.value = false
      }
    }
  })
}

const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true
      try {
        await adminApi.changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        // Logout after password change
        setTimeout(() => {
          authStore.logout()
          window.location.href = '/login'
        }, 1500)
      } catch (error) {
        console.error(error)
        ElMessage.error(error.response?.data?.msg || '密码修改失败')
      } finally {
        changingPassword.value = false
      }
    }
  })
}

onMounted(() => {
  fetchUserInfo()
  // 如果路由是修改密码页面，直接打开密码修改对话框
  if (route.path === '/account/password') {
    passwordDialogVisible.value = true
  }
})
</script>

<style scoped>
.profile-container {
  padding: 0;
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}
.profile-card {
  text-align: center;
}
.avatar-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 20px;
}
.username {
  margin: 15px 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.actions {
  padding: 20px;
}
.info-card .card-header {
  font-weight: 600;
  font-size: 16px;
}
</style>
