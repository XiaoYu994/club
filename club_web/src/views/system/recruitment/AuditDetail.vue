<template>
  <div class="audit-detail-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="goBack" :icon="ArrowLeft">返回</el-button>
            <span class="title">审核详情</span>
          </div>
          <div class="header-right" v-if="detail && detail.status === 0">
            <el-button type="success" @click="handleAudit(1)">通过</el-button>
            <el-button type="danger" @click="handleAudit(2)">驳回</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="detail-content" v-if="detail">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="招新标题">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="所属社团">{{ detail.clubName }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDate(detail.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDate(detail.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDate(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 招新海报 -->
        <div class="section-title">招新海报</div>
        <div class="poster-wrapper">
          <el-image
            v-if="detail.poster"
            :src="detail.poster"
            :preview-src-list="[detail.poster]"
            fit="cover"
            class="poster-img"
          />
          <span v-else class="no-data">暂无海报</span>
        </div>

        <!-- 招新内容 -->
        <div class="section-title">招新内容</div>
        <div class="content-wrapper" v-html="detail.content || '暂无内容'"></div>
      </div>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="审核确认"
      width="400px"
    >
      <el-form :model="auditForm">
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as recruitApi from '@/api/system/recruitment'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref(null)

const auditDialogVisible = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
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
    const res = await recruitApi.getRecruitAuditDetail(route.params.id)
    if (res?.data) {
      detail.value = res.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

const handleAudit = (status) => {
  auditForm.status = status
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  if (!detail.value) return
  auditLoading.value = true
  try {
    await recruitApi.auditRecruitment({
      id: detail.value.id,
      status: auditForm.status,
      remark: auditForm.remark
    })
    ElMessage.success('审核完成')
    auditDialogVisible.value = false
    fetchData() // Refresh detail
  } catch (error) {
    console.error(error)
    ElMessage.error('审核失败')
  } finally {
    auditLoading.value = false
  }
}

const goBack = () => {
  router.push('/recruitment/audit')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.audit-detail-container {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.detail-content {
  padding: 20px 0;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 16px;
  padding-left: 10px;
  border-left: 4px solid var(--el-color-primary);
}
.poster-img {
  max-width: 300px;
  border-radius: 8px;
}
.content-wrapper {
  line-height: 1.6;
  color: var(--el-text-color-primary);
}
.no-data {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>

