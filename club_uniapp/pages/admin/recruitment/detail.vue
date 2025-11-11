<template>
  <view class="admin-recruitment-detail pageBg">
    <custom-nav-bar title="招新详情" />
    
    <view v-if="isLoading" class="loading-container">
      <uni-icons type="spinner-cycle" size="32" color="#2979ff"></uni-icons>
      <text>加载中...</text>
    </view>
    
    <scroll-view v-else-if="detail" class="detail-content" scroll-y>
      <!-- 基本信息 -->
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="status-badge" :class="getStatusClass(detail.status)">
            {{ getStatusText(detail.status) }}
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-row">
            <text class="label">社团名称：</text>
            <text class="value">{{ detail.clubName }}</text>
          </view>
          <view class="info-row">
            <text class="label">招新标题：</text>
            <text class="value">{{ detail.title }}</text>
          </view>
          <view class="info-row">
            <text class="label">招新描述：</text>
            <text class="value desc">{{ detail.description || '无' }}</text>
          </view>
          <view class="info-row">
            <text class="label">招新时间：</text>
            <text class="value">{{ formatDate(detail.startTime) }} 至 {{ formatDate(detail.endTime) }}</text>
          </view>
          <view class="info-row">
            <text class="label">计划人数：</text>
            <text class="value">{{ detail.planCount }}人</text>
          </view>
          <view class="info-row">
            <text class="label">需要面试：</text>
            <text class="value">{{ detail.needInterview ? '是' : '否' }}</text>
          </view>
          <view class="info-row" v-if="detail.needInterview">
            <text class="label">面试地点：</text>
            <text class="value">{{ detail.interviewPlace || '待定' }}</text>
          </view>
          <view class="info-row">
            <text class="label">创建时间：</text>
            <text class="value">{{ formatDateTime(detail.createTime) }}</text>
          </view>
          <view class="info-row" v-if="detail.updateTime !== detail.createTime">
            <text class="label">更新时间：</text>
            <text class="value">{{ formatDateTime(detail.updateTime) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 统计信息 -->
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">统计信息</text>
        </view>
        
        <view class="card-content">
          <view class="stats-grid">
            <view class="stats-item">
              <text class="stats-number">{{ detail.joinCount || 0 }}</text>
              <text class="stats-label">申请人数</text>
            </view>
            <view class="stats-item">
              <text class="stats-number">{{ detail.passCount || 0 }}</text>
              <text class="stats-label">通过人数</text>
            </view>
            <view class="stats-item">
              <text class="stats-number">{{ getPassRate() }}%</text>
              <text class="stats-label">通过率</text>
            </view>
            <view class="stats-item">
              <text class="stats-number">{{ getRemainingCount() }}</text>
              <text class="stats-label">剩余名额</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 招新海报 -->
      <view class="detail-card" v-if="detail.poster">
        <view class="card-header">
          <text class="card-title">招新海报</text>
        </view>
        
        <view class="card-content">
          <image 
            class="poster-image" 
            :src="detail.poster" 
            mode="aspectFit"
            @tap="previewPoster"
          ></image>
        </view>
      </view>
      
      <!-- 报名表单配置 -->
      <view class="detail-card" v-if="formFields.length > 0">
        <view class="card-header">
          <text class="card-title">报名表单配置</text>
        </view>
        
        <view class="card-content">
          <view class="form-field" v-for="(field, index) in formFields" :key="index">
            <view class="field-header">
              <text class="field-name">{{ field.label }}</text>
              <view class="field-tags">
                <text class="field-tag type-tag">{{ getFieldTypeText(field.type) }}</text>
                <text class="field-tag required-tag" v-if="field.required">必填</text>
              </view>
            </view>
            <text class="field-placeholder" v-if="field.placeholder">
              提示：{{ field.placeholder }}
            </text>
            <view class="field-options" v-if="field.options && field.options.length > 0">
              <text class="options-label">选项：</text>
              <view class="options-list">
                <text class="option-item" v-for="(option, idx) in field.options" :key="idx">
                  {{ option }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 审核信息 -->
      <view class="detail-card" v-if="detail.reviewComment || detail.status !== 0">
        <view class="card-header">
          <text class="card-title">审核信息</text>
        </view>
        
        <view class="card-content">
          <view class="info-row">
            <text class="label">审核状态：</text>
            <text class="value" :class="getStatusClass(detail.status)">
              {{ getStatusText(detail.status) }}
            </text>
          </view>
          <view class="info-row" v-if="detail.reviewComment">
            <text class="label">审核意见：</text>
            <text class="value review-comment">{{ detail.reviewComment }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view v-else class="empty-container">
      <uni-icons type="info" size="60" color="#ccc"></uni-icons>
      <text>招新活动不存在</text>
      <button class="back-btn" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import apiModule from '@/api/api.js'

// 数据
const detail = ref(null)
const isLoading = ref(true)
const formFields = ref([])

// 页面参数
const recruitmentId = ref(null)

// 获取详情数据
const loadDetail = async () => {
  if (!recruitmentId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await apiModule.admin.recruitment.getRecruitmentDetail(recruitmentId.value)
    
    if (response.code === 200 && response.data) {
      detail.value = response.data
      
      // 解析表单字段
      if (detail.value.forms) {
        try {
          formFields.value = JSON.parse(detail.value.forms)
        } catch (e) {
          console.error('解析表单配置失败:', e)
          formFields.value = []
        }
      }
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取招新详情失败:', error)
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已结束',
    3: '已驳回'
  }
  return statusMap[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-approved',
    2: 'status-ended',
    3: 'status-rejected'
  }
  return classMap[status] || ''
}

// 获取表单字段类型文本
const getFieldTypeText = (type) => {
  const typeMap = {
    'text': '单行文本',
    'textarea': '多行文本',
    'select': '单选',
    'checkbox': '多选',
    'radio': '单选按钮',
    'number': '数字',
    'date': '日期',
    'phone': '手机号',
    'email': '邮箱'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(parseInt(timestamp))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化日期时间
const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(parseInt(timestamp))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 计算通过率
const getPassRate = () => {
  if (!detail.value || !detail.value.joinCount || detail.value.joinCount === 0) {
    return 0
  }
  return Math.round((detail.value.passCount || 0) / detail.value.joinCount * 100)
}

// 计算剩余名额
const getRemainingCount = () => {
  if (!detail.value) return 0
  const remaining = (detail.value.planCount || 0) - (detail.value.passCount || 0)
  return Math.max(0, remaining)
}

// 预览海报
const previewPoster = () => {
  if (detail.value && detail.value.poster) {
    uni.previewImage({
      urls: [detail.value.poster],
      current: detail.value.poster
    })
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onLoad((options) => {
  if (options.id) {
    recruitmentId.value = parseInt(options.id)
    loadDetail()
  } else {
    uni.showToast({
      title: '缺少招新ID参数',
      icon: 'none'
    })
  }
})

onMounted(() => {
  // 组件挂载后的逻辑
})
</script>

<style lang="scss" scoped>
.admin-recruitment-detail {
  min-height: 100vh;
  background: #f5f6fa;
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  color: #999;
  font-size: 28rpx;
  
  .uni-icons {
    margin-bottom: 20rpx;
  }
  
  .back-btn {
    margin-top: 40rpx;
    padding: 0 40rpx;
    height: 64rpx;
    background: #2979ff;
    color: #fff;
    border-radius: 32rpx;
    font-size: 28rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
}

.detail-content {
  padding: 24rpx 32rpx;
}

.detail-card {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 32rpx 0;
    
    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .status-badge {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 500;
      
      &.status-pending {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }
      
      &.status-approved {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
      
      &.status-ended {
        background: rgba(158, 158, 158, 0.1);
        color: #9e9e9e;
      }
      
      &.status-rejected {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
    }
  }
  
  .card-content {
    padding: 24rpx 32rpx 32rpx;
  }
}

.info-row {
  display: flex;
  margin-bottom: 20rpx;
  
  .label {
    min-width: 180rpx;
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
  }
  
  .value {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    word-break: break-all;
    
    &.desc {
      line-height: 1.6;
    }
    
    &.review-comment {
      background: #f8f9fa;
      padding: 16rpx;
      border-radius: 8rpx;
      border-left: 4rpx solid #2979ff;
      line-height: 1.6;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  
  .stats-item {
    text-align: center;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    
    .stats-number {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #2979ff;
      margin-bottom: 8rpx;
    }
    
    .stats-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.poster-image {
  width: 100%;
  max-height: 600rpx;
  border-radius: 12rpx;
}

.form-field {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .field-name {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
    }
    
    .field-tags {
      display: flex;
      gap: 8rpx;
      
      .field-tag {
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-size: 22rpx;
        
        &.type-tag {
          background: rgba(41, 121, 255, 0.1);
          color: #2979ff;
        }
        
        &.required-tag {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }
      }
    }
  }
  
  .field-placeholder {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  
  .field-options {
    .options-label {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 8rpx;
    }
    
    .options-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      
      .option-item {
        padding: 8rpx 16rpx;
        background: #f8f9fa;
        border-radius: 20rpx;
        font-size: 24rpx;
        color: #666;
        border: 1rpx solid #e0e0e0;
      }
    }
  }
}
</style> 