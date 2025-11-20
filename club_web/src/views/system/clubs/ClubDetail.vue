<template>
  <div class="club-detail-page">
    <div class="detail-header">
      <div class="header-left">
        <el-button class="back-btn" link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回社团列表
        </el-button>
        <div class="title-group">
          <h2>{{ detail?.name || '社团详情' }}</h2>
          <el-tag v-if="detail" :type="detail.status === 1 ? 'success' : 'danger'">
            {{ detail.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions" v-if="detail">
        <el-button
          :type="detail.status === 1 ? 'warning' : 'success'"
          :loading="statusLoading"
          @click="handleToggleStatus"
        >
          {{ detail.status === 1 ? '禁用社团' : '启用社团' }}
        </el-button>
        <el-button plain type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button
          plain
          type="danger"
          :loading="deleteLoading"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="!detail" description="未找到社团信息">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>
    <div v-else class="detail-body">
      <el-card class="overview-card" shadow="hover">
        <div class="overview-main">
          <div class="logo-panel">
            <el-image
              :src="detail.logo || '/default-club.png'"
              :preview-src-list="detail.logo ? [detail.logo] : []"
              fit="cover"
            >
              <template #error>
                <div class="logo-placeholder">暂无Logo</div>
              </template>
            </el-image>
          </div>
          <div class="overview-content">
            <div class="overview-title">
              <h2>{{ detail.name }}</h2>
              <el-tag effect="dark" type="info">
                {{ detail.typeName || resolveTypeName(detail.type) }}
              </el-tag>
              <el-tag :type="detail.status === 1 ? 'success' : 'danger'">
                {{ detail.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </div>
            <p class="overview-desc">
              {{ detail.description || '这个社团暂未填写简介。' }}
            </p>
            <div class="overview-meta">
              <div class="meta-item">
                <span>创建时间</span>
                <strong>{{ formatDate(detail.createTime) }}</strong>
              </div>
              <div class="meta-item">
                <span>排序号</span>
                <strong>{{ detail.orderNum ?? '-' }}</strong>
              </div>
              <div class="meta-item">
                <span>浏览量</span>
                <strong>{{ detail.viewCount ?? 0 }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="overview-footer">
          <div class="meta-item">
            <span>社团地址</span>
            <strong>{{ detail.address || '未填写' }}</strong>
          </div>
          <div class="meta-item">
            <span>联系方式</span>
            <strong>{{ detail.contact || '未填写' }}</strong>
          </div>
          <div class="meta-item">
            <span>自定义表单</span>
            <strong>{{ detail.forms ? '已配置' : '未配置' }}</strong>
          </div>
        </div>
      </el-card>

      <el-row :gutter="20" class="info-grid">
        <el-col :xs="24" :lg="16">
          <el-card class="stats-card" shadow="never">
            <template #header>数据总览</template>
            <div class="stat-grid">
              <div v-for="item in stats" :key="item.label" class="stat-item">
                <div class="stat-label">{{ item.label }}</div>
                <div class="stat-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="side-column">
            <el-card class="president-card" shadow="never">
              <template #header>社长信息</template>
              <template v-if="detail.president">
                <div class="president-info">
                  <el-avatar
                    :size="48"
                    :src="detail.president.avatar"
                  >
                    {{ detail.president.username?.charAt(0)?.toUpperCase() }}
                  </el-avatar>
                  <div>
                    <div class="president-name">{{ detail.president.username || '未设置' }}</div>
                    <div class="president-contact">
                      {{ detail.president.mobile || detail.president.email || '暂无联系方式' }}
                    </div>
                  </div>
                </div>
              </template>
              <el-empty v-else description="尚未配置社长信息" :image-size="80" />
            </el-card>

            <el-card class="status-card" shadow="never">
              <template #header>运行状态</template>
              <ul class="status-list">
                <li>
                  <span>当前状态</span>
                  <strong :class="detail.status === 1 ? 'text-success' : 'text-danger'">
                    {{ detail.status === 1 ? '正常运行' : '已禁用' }}
                  </strong>
                </li>
                <li>
                  <span>社团类型</span>
                  <strong>{{ detail.typeName || resolveTypeName(detail.type) }}</strong>
                </li>
                <li>
                  <span>表单配置</span>
                  <strong>{{ detail.forms ? '已配置' : '未配置' }}</strong>
                </li>
              </ul>
            </el-card>
          </div>
        </el-col>
      </el-row>

      <el-card class="description-card" shadow="never">
        <template #header>社团介绍</template>
        <p class="description-text">{{ detail.description || '暂无简介' }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import * as clubsApi from '@/api/system/clubs'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const statusLoading = ref(false)
const deleteLoading = ref(false)
const detail = ref(null)

const typeMap = {
  0: '普通社团',
  1: '院级社团',
  2: '校级社团',
}

const clubId = computed(() => route.params.id)

const resolveTypeName = (type) => typeMap[type] || '未知类型'

const formatDate = (value) => formatTime(value, 'YYYY-MM-DD HH:mm')

const stats = computed(() => {
  if (!detail.value) return []
  return [
    { label: '成员总数', value: detail.value.totalMembers ?? detail.value.memberCount ?? 0 },
    { label: '干部/管理', value: detail.value.officers ?? 0 },
    { label: '普通成员', value: detail.value.normalMembers ?? 0 },
    { label: '活动数量', value: detail.value.activityCount ?? 0 },
    { label: '招新数量', value: detail.value.recruitmentCount ?? 0 },
    { label: '申请人数', value: detail.value.applicationCount ?? detail.value.joinCount ?? 0 },
  ]
})

const fetchDetail = async () => {
  if (!clubId.value) return
  loading.value = true
  try {
    const response = await clubsApi.getClubDetail(clubId.value)
    detail.value = response?.data || null
  } catch (error) {
    console.error('Failed to fetch club detail:', error)
    detail.value = null
    ElMessage.error('获取社团详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/clubs')
}

const handleToggleStatus = async () => {
  if (!detail.value) return
  statusLoading.value = true
  try {
    const newStatus = detail.value.status === 1 ? 0 : 1
    await clubsApi.updateClubStatus({
      clubId: detail.value.id,
      status: newStatus,
    })
    ElMessage.success(`已${newStatus === 1 ? '启用' : '禁用'}社团`)
    await fetchDetail()
  } catch (error) {
    console.error('Failed to toggle club status:', error)
    ElMessage.error('操作失败')
  } finally {
    statusLoading.value = false
  }
}

const handleEdit = () => {
  if (!detail.value) return
  router.push({ path: '/clubs', query: { editId: detail.value.id } })
}

const handleDelete = async () => {
  if (!detail.value) return
  try {
    await ElMessageBox.confirm(
      `确认删除社团「${detail.value.name}」吗？删除后数据无法恢复。`,
      '提示',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    )
    deleteLoading.value = true
    await clubsApi.deleteClub(detail.value.id)
    ElMessage.success('删除成功')
    goBack()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('Failed to delete club:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

watch(
  () => clubId.value,
  () => {
    fetchDetail()
  },
  { immediate: true },
)
</script>

<style scoped>
.club-detail-page {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
  min-width: 240px;
}

.back-btn {
  padding-left: 0;
  color: var(--el-color-primary);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-group h2 {
  margin: 8px 0;
  font-size: 24px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-card {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.12), rgba(236, 249, 255, 0.9));
  border: none;
}

.overview-main {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.logo-panel {
  width: 180px;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.logo-panel :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-info-light-9);
  color: var(--el-text-color-secondary);
  font-weight: 600;
}

.overview-content {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.overview-title h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.overview-desc {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.7;
}

.overview-meta,
.overview-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.meta-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.meta-item span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.3px;
}

.meta-item strong {
  font-size: 18px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.overview-footer .meta-item {
  background: rgba(64, 158, 255, 0.12);
}

.info-grid {
  margin-top: 8px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  padding: 18px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.12);
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.president-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.president-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.president-contact {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-list li {
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-list span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.status-list strong {
  font-size: 16px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.description-card .description-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.text-success {
  color: var(--el-color-success);
}

.text-danger {
  color: var(--el-color-danger);
}

@media (max-width: 768px) {
  .overview-meta,
  .overview-footer {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}
</style>

