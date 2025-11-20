<template>
  <div class="websocket-monitor-container">
    <div class="page-header">
      <h2 class="page-title">WebSocket 实时监控</h2>
      <p class="page-desc">监控在线用户状态，发送测试通知和广播消息</p>
    </div>

    <el-row :gutter="20">
      <!-- 在线用户列表 -->
      <el-col :span="24">
        <el-card class="monitor-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>在线用户列表</span>
              <el-button type="primary" link icon="Refresh" @click="fetchOnlineUsers">刷新</el-button>
            </div>
          </template>
          <div class="online-stats">
            <el-statistic title="当前在线人数" :value="onlineCount" style="display: inline-block; margin-right: 40px;" />
            <el-statistic title="总用户数" :value="totalUserCount" style="display: inline-block;" />
          </div>
          <el-table :data="onlineUserList" style="width: 100%; margin-top: 15px" height="400" stripe>
            <el-table-column label="用户" min-width="200">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="40" :src="row.avatar || undefined">
                    {{ row.realName?.charAt(0) || row.username?.charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ row.realName || row.username }}</div>
                    <div class="user-meta">学号: {{ row.studentId || 'N/A' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column label="状态" width="100" align="center">
              <template #default>
                <el-tag type="success" effect="dark" size="small">在线</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="right" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openSendMessageDialog(row)">发送消息</el-button>
                <el-button type="info" link size="small" @click="fillUserId(row.userId)">填入ID</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 发送通知 (DB + WebSocket) -->
      <el-col :span="12">
        <el-card class="monitor-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>发送系统通知 (DB + WebSocket)</span>
            </div>
          </template>
          <el-form :model="notifyForm" label-width="80px">
            <el-form-item label="用户ID">
              <el-input v-model="notifyForm.userId" placeholder="接收用户ID" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="notifyForm.title" placeholder="通知标题" />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="notifyForm.message" type="textarea" rows="3" placeholder="通知内容" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSendNotification" :loading="sendingNotify">发送通知</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 广播通知 -->
      <el-col :span="12">
        <el-card class="monitor-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>全员广播通知</span>
              <el-tag type="danger" size="small">慎用</el-tag>
            </div>
          </template>
          <el-form :model="broadcastForm" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="broadcastForm.title" placeholder="广播标题" />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="broadcastForm.message" type="textarea" rows="3" placeholder="广播内容" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="handleBroadcast" :loading="broadcasting">发送全员广播</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 发送消息对话框 -->
    <el-dialog
      v-model="sendMessageDialog.visible"
      title="发送消息给用户"
      width="500px"
    >
      <el-form :model="sendMessageDialog.form" label-width="80px">
        <el-form-item label="接收用户">
          <div class="user-info-dialog">
            <el-avatar :size="50" :src="sendMessageDialog.form.avatar || undefined">
              {{ sendMessageDialog.form.realName?.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ sendMessageDialog.form.realName || sendMessageDialog.form.username }}</div>
              <div class="user-meta">ID: {{ sendMessageDialog.form.userId }} | 学号: {{ sendMessageDialog.form.studentId }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="消息标题">
          <el-input v-model="sendMessageDialog.form.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="sendMessageDialog.form.message" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendMessageDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSendDirectMessage" :loading="sendingDirectMessage">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import * as monitorApi from '@/api/system/monitor'

const onlineCount = ref(0)
const totalUserCount = ref(0)
const onlineUserList = ref([])
const sendingNotify = ref(false)
const broadcasting = ref(false)
const sendingDirectMessage = ref(false)

const notifyForm = reactive({
  userId: '',
  title: '系统通知',
  message: '这是一条来自管理员的系统通知'
})

const broadcastForm = reactive({
  title: '系统公告',
  message: '这是一条全员广播消息'
})

const sendMessageDialog = reactive({
  visible: false,
  form: {
    userId: '',
    username: '',
    realName: '',
    avatar: '',
    studentId: '',
    title: '管理员消息',
    message: ''
  }
})

const fetchOnlineUsers = async () => {
  try {
    const res = await monitorApi.getOnlineUsers()
    if (res?.data) {
      onlineCount.value = res.data.onlineCount || 0
      totalUserCount.value = res.data.totalUserCount || 0
      onlineUserList.value = res.data.onlineUsers || []
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取在线用户失败')
  }
}

const openSendMessageDialog = (user) => {
  sendMessageDialog.form.userId = user.userId
  sendMessageDialog.form.username = user.username
  sendMessageDialog.form.realName = user.realName
  sendMessageDialog.form.avatar = user.avatar
  sendMessageDialog.form.studentId = user.studentId
  sendMessageDialog.form.message = ''
  sendMessageDialog.visible = true
}

const handleSendDirectMessage = async () => {
  if (!sendMessageDialog.form.message) {
    ElMessage.warning('请输入消息内容')
    return
  }
  sendingDirectMessage.value = true
  try {
    const res = await monitorApi.sendTestNotification({
      userId: sendMessageDialog.form.userId,
      title: sendMessageDialog.form.title,
      message: sendMessageDialog.form.message,
      type: 'admin_notification'
    })
    ElMessage.success(res.msg || '消息已发送')
    sendMessageDialog.visible = false
  } catch (error) {
    console.error(error)
    ElMessage.error('发送失败')
  } finally {
    sendingDirectMessage.value = false
  }
}

const handleSendNotification = async () => {
  if (!notifyForm.userId || !notifyForm.title || !notifyForm.message) {
    ElMessage.warning('请填写完整信息')
    return
  }
  sendingNotify.value = true
  try {
    const res = await monitorApi.sendTestNotification({
      userId: notifyForm.userId,
      title: notifyForm.title,
      message: notifyForm.message,
      type: 'admin_notification'
    })
    await ElMessageBox.alert(res.msg || '通知发送成功！', '发送成功', {
      type: 'success',
      confirmButtonText: '确定'
    })
    // 清空表单
    notifyForm.userId = ''
    notifyForm.title = '系统通知'
    notifyForm.message = '这是一条来自管理员的系统通知'
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('发送失败')
    }
  } finally {
    sendingNotify.value = false
  }
}

const handleBroadcast = async () => {
  if (!broadcastForm.title || !broadcastForm.message) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要向所有用户发送广播吗？这将写入所有用户的消息表。', '警告', {
      confirmButtonText: '确定发送',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    broadcasting.value = true
    const res = await monitorApi.broadcastNotification({
      title: broadcastForm.title,
      message: broadcastForm.message,
      type: 'system_broadcast'
    })
    
    if (res?.data) {
      const { totalUsers, onlineUsers, pushSuccessCount } = res.data
      ElMessage.success(`广播成功！总用户: ${totalUsers}, 在线: ${onlineUsers}, 推送成功: ${pushSuccessCount}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('广播失败')
    }
  } finally {
    broadcasting.value = false
  }
}

const fillUserId = (id) => {
  notifyForm.userId = id
  // 滚动到发送通知表单
  setTimeout(() => {
    const element = document.querySelector('.monitor-card')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

onMounted(() => {
  fetchOnlineUsers()
})
</script>

<style scoped>
.websocket-monitor-container {
  padding: 0;
}
.page-header {
  margin-bottom: 20px;
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
.monitor-card {
  height: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.online-stats {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}
.check-form {
  margin-top: 10px;
}
.check-result {
  margin-top: 15px;
}
.user-info, .user-info-dialog {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-details {
  flex: 1;
}
.user-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.user-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
</style>
