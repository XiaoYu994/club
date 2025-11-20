<template>
  <div class="user-detail-container">
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="primary" link :icon="ArrowLeft" @click="goBack">返回</el-button>
            <span class="page-title">用户详情</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="detail-content">
        <div v-if="userDetail" class="detail-sections">
          <!-- 基本信息 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">用户ID：</span>
                <span class="value">{{ userDetail.userInfo?.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ userDetail.userInfo?.username || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">学号：</span>
                <span class="value">{{ userDetail.userInfo?.studentId || '未绑定' }}</span>
              </div>
              <div class="info-item">
                <span class="label">学院：</span>
                <span class="value">{{ userDetail.userInfo?.college || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">专业：</span>
                <span class="value">{{ userDetail.userInfo?.major || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">班级：</span>
                <span class="value">{{ userDetail.userInfo?.className || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号：</span>
                <span class="value">{{ userDetail.userInfo?.mobile || '未绑定' }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ userDetail.userInfo?.email || '未绑定' }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <el-tag :type="userDetail.userInfo?.status === 1 ? 'success' : 'danger'">
                  {{ userDetail.userInfo?.status === 1 ? '正常' : '已禁用' }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="label">注册时间：</span>
                <span class="value">{{ formatDate(userDetail.userInfo?.createTime) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 社团参与记录 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><OfficeBuilding /></el-icon>
                <span>社团参与记录 ({{ userDetail.clubCount || 0 }})</span>
              </div>
            </template>
            <el-table :data="userDetail.clubs || []" stripe style="width: 100%">
              <el-table-column prop="clubName" label="社团名称" min-width="200" />
              <el-table-column prop="roleName" label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.role === 2 ? 'danger' : row.role === 1 ? 'warning' : 'info'">
                    {{ row.roleName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '正常' : row.status === 0 ? '待审核' : '已退出' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="joinTime" label="加入时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.joinTime) }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!userDetail.clubs || userDetail.clubs.length === 0" description="暂无社团参与记录" />
          </el-card>

          <!-- 活动参与记录 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><Calendar /></el-icon>
                <span>活动参与记录 ({{ userDetail.activityCount || 0 }})</span>
              </div>
            </template>
            <el-table :data="userDetail.activities || []" stripe style="width: 100%">
              <el-table-column prop="activityName" label="活动名称" min-width="200" />
              <el-table-column prop="clubName" label="所属社团" width="150" />
              <el-table-column prop="status" label="报名状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">
                    {{ row.status === 1 ? '已通过' : row.status === 2 ? '已拒绝' : '待审核' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkInStatus" label="签到状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.checkInStatus === 1 ? 'success' : 'info'">
                    {{ row.checkInStatus === 1 ? '已签到' : '未签到' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="applyTime" label="报名时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.applyTime) }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!userDetail.activities || userDetail.activities.length === 0" description="暂无活动参与记录" />
          </el-card>
        </div>
        <el-empty v-else description="用户不存在" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, OfficeBuilding, Calendar } from '@element-plus/icons-vue'
import * as usersApi from '@/api/system/users'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const userDetail = ref(null)

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return formatTime(timestamp, 'YYYY-MM-DD HH:mm')
}

const fetchUserDetail = async () => {
  const userId = route.params.id
  if (!userId) {
    ElMessage.error('用户ID不能为空')
    return
  }

  loading.value = true
  try {
    const response = await usersApi.getUserDetail(userId)
    if (response?.data) {
      userDetail.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch user detail:', error)
    ElMessage.error('获取用户详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchUserDetail()
})
</script>

<style scoped>
.user-detail-container {
  padding: 0;
}

.detail-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-content {
  min-height: 400px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
  min-width: 80px;
}

.value {
  color: var(--el-text-color-primary);
}

@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
