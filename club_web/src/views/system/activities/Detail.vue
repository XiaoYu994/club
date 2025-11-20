<template>
  <div class="activity-detail-page">
    <div class="detail-header">
      <div class="header-left">
        <el-button class="back-btn" link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回活动列表
        </el-button>
        <div class="title-group">
          <h2>{{ detail?.title || detail?.activityName || '活动详情' }}</h2>
          <el-tag v-if="detail" :type="getStatusType(detail.status)">
            {{ getStatusText(detail.status) }}
          </el-tag>
          <el-tag v-if="detail" effect="plain">ID: {{ detail.id }}</el-tag>
        </div>
      </div>
      <div class="header-actions" v-if="detail">
        <el-button plain :loading="loading" @click="fetchDetail">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="!detail" description="未找到活动信息">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>

    <div v-else class="detail-body">
      <el-card class="intro-card" shadow="hover">
        <div class="intro-main">
          <el-image
            :src="detail.poster || detail.activityImg || '/default-activity.png'"
            fit="cover"
            class="activity-poster"
            :preview-src-list="detail.poster || detail.activityImg ? [detail.poster || detail.activityImg] : []"
          />
          <div class="intro-info">
            <div class="info-header">
              <h3>{{ detail.title || detail.activityName || '未命名活动' }}</h3>
              <div class="stats-row">
                <div class="stat-item">
                  <el-icon><User /></el-icon>
                  <span>{{ detail.joinCount ?? detail.applyCount ?? 0 }} 人参与</span>
                </div>
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ detail.viewCount ?? 0 }} 次浏览</span>
                </div>
              </div>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">主办社团</span>
                <span class="value">{{ detail.clubName || '未知社团' }}</span>
              </div>
              <div class="info-item">
                <span class="label">活动地点</span>
                <span class="value">{{ detail.address || '未设置' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">活动时间</span>
                <span class="value highlight">
                  {{ formatDate(detail.startTime || detail.start_time) }} ~ {{ formatDate(detail.endTime || detail.end_time) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16">
        <el-col :xs="24" :md="16">
          <el-card shadow="never" class="content-card">
            <template #header>
              <div class="card-header">
                <span>活动介绍</span>
              </div>
            </template>
            <div class="activity-content" v-html="detail.content || detail.description || '暂无介绍'"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="meta-card">
            <template #header>基础信息</template>
            <ul class="meta-list">
              <li>
                <span>创建时间</span>
                <strong>{{ formatDate(detail.createTime || detail.create_time) }}</strong>
              </li>
              <li>
                <span>更新时间</span>
                <strong>{{ formatDate(detail.updateTime || detail.update_time) }}</strong>
              </li>
              <li>
                <span>报名限制</span>
                <strong>{{ detail.maxPeople ? `${detail.maxPeople}人` : '不限' }}</strong>
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh, User, View } from '@element-plus/icons-vue'
import * as activitiesApi from '@/api/system/activities'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref(null)

const activityId = computed(() => route.params.id)

const formatDate = (value) => (value ? formatTime(value, 'YYYY-MM-DD HH:mm') : '--')

const statusMap = {
  0: { text: '报名中', type: 'warning' },
  1: { text: '进行中', type: 'success' },
  2: { text: '已结束', type: 'info' },
  3: { text: '已取消', type: 'danger' },
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchDetail = async () => {
  if (!activityId.value) return
  loading.value = true
  try {
    const response = await activitiesApi.getActivityDetail(activityId.value)
    detail.value = response?.data || null
  } catch (error) {
    console.error('Failed to fetch activity detail:', error)
    ElMessage.error('获取活动详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/activities')
}

watch(
  () => activityId.value,
  () => {
    fetchDetail()
  },
  { immediate: true }
)
</script>

<style scoped>
.activity-detail-page {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.back-btn {
  padding-left: 0;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-group h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.intro-card {
  border: none;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
}

.intro-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.activity-poster {
  width: 240px;
  height: 160px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.intro-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-item .value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.info-item .value.highlight {
  color: var(--el-color-primary);
  font-weight: 600;
}

.content-card {
  min-height: 300px;
}

.activity-content {
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.meta-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.meta-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-list span {
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .intro-main {
    flex-direction: column;
  }
  
  .activity-poster {
    width: 100%;
    height: 200px;
  }
}
</style>

