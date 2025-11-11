<template>
  <view class="admin-recruitment-audit pageBg">
    <custom-nav-bar title="招新活动审核" />
    
    <!-- 筛选器 -->
    <view class="filter-bar">
      <view class="search-bar">
        <view class="search-input">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <input class="input" v-model="keyword" placeholder="搜索社团/标题/描述" confirm-type="search" @confirm="onSearchConfirm" />
          <uni-icons v-if="keyword" type="close" size="18" color="#bbb" @tap="clearKeyword"></uni-icons>
        </view>
        <button class="search-btn" @tap="onSearchConfirm">搜索</button>
      </view>
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentStatus === item.value }" 
          v-for="item in statusOptions" 
          :key="item.value"
          @tap="changeStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
    
    <!-- 招新列表 -->
    <scroll-view 
      class="audit-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-triggered="refresherTriggered"
      refresher-enabled
      @refresherrefresh="onRefresh"
      :scroll-top="scrollTop"
    >
      <view v-if="isLoading && currentPage === 1" class="loading-box">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      
      <template v-else>
        <view class="audit-item" v-for="item in auditList" :key="item.id">
          <view class="audit-header">
            <view class="club-info">
              <text class="club-name">{{ item.clubName }}</text>
              <text class="recruitment-title">{{ item.title }}</text>
            </view>
            <view class="status-badge" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </view>
          </view>
          
          <view class="audit-content">
            <view class="content-row">
              <text class="label">招新描述：</text>
              <text class="value">{{ item.description || '无' }}</text>
            </view>
            <view class="content-row">
              <text class="label">招新时间：</text>
              <text class="value">{{ formatDate(item.startTime) }} 至 {{ formatDate(item.endTime) }}</text>
            </view>
            <view class="content-row">
              <text class="label">计划人数：</text>
              <text class="value">{{ item.planCount }}人</text>
            </view>
            <view class="content-row" v-if="item.needInterview">
              <text class="label">面试地点：</text>
              <text class="value">{{ item.interviewPlace || '待定' }}</text>
            </view>
            <view class="content-row">
              <text class="label">创建时间：</text>
              <text class="value">{{ formatDateTime(item.createTime) }}</text>
            </view>
            <view class="content-row" v-if="item.reviewComment">
              <text class="label">审核意见：</text>
              <text class="value">{{ item.reviewComment }}</text>
            </view>
          </view>
          
          <!-- 招新海报 -->
          <view class="poster-section" v-if="item.poster">
            <text class="label">招新海报：</text>
            <image class="poster-img" :src="item.poster" mode="aspectFit" @tap="previewImage(item.poster)"></image>
          </view>
          
          <!-- 操作按钮 -->
          <view class="action-buttons" v-if="item.status === 0">
            <button class="action-btn approve-btn" @tap="showAuditModal(item, 1)">通过</button>
            <button class="action-btn reject-btn" @tap="showAuditModal(item, 3)">驳回</button>
            <button class="action-btn detail-btn" @tap="viewDetail(item)">详情</button>
            <button class="action-btn delete-btn" @tap="confirmDelete(item)">删除</button>
          </view>
          <view class="action-buttons" v-else>
            <button class="action-btn detail-btn" @tap="viewDetail(item)">详情</button>
            <button class="action-btn delete-btn" @tap="confirmDelete(item)">删除</button>
          </view>
        </view>
        
        <view v-if="auditList.length === 0" class="empty-tip">
          <uni-icons type="info" size="40" color="#999"></uni-icons>
          <text>{{ getEmptyText() }}</text>
        </view>
        
        <view v-if="isLoading && currentPage > 1" class="loading-more">
          <text>加载更多数据...</text>
        </view>
        <view v-if="!isLoading && !hasMore && auditList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </template>
    </scroll-view>
    
    <!-- 审核弹窗 -->
    <uni-popup ref="auditPopup" type="center">
      <view class="audit-modal">
        <view class="modal-header">
          <text class="modal-title">{{ auditForm.action === 1 ? '通过审核' : '驳回申请' }}</text>
          <view class="close-btn" @tap="closeAuditModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">{{ auditForm.action === 1 ? '审核意见' : '驳回原因' }}：</text>
            <textarea 
              class="form-textarea" 
              v-model="auditForm.comment" 
              :placeholder="auditForm.action === 1 ? '请输入审核意见（可选）' : '请输入驳回原因'"
              maxlength="200"
            ></textarea>
            <text class="char-count">{{ auditForm.comment.length }}/200</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeAuditModal">取消</button>
          <button class="confirm-btn" @tap="submitAudit">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import apiModule from '@/api/api.js'

// 状态选项
const statusOptions = [
  { label: '全部', value: -1 },
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已结束', value: 2 },
  { label: '已驳回', value: 3 }
]

// 数据
const auditList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(true)
const isLoading = ref(false)
const refresherTriggered = ref(false)
const currentStatus = ref(-1) // 默认显示全部
// 滚动控制
const scrollTop = ref(0)

// 搜索关键字
const keyword = ref('')

// 过滤后的列表（本地过滤：社团名/标题/描述）
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return auditList.value
  return auditList.value.filter(item => {
    const club = String(item.clubName || '').toLowerCase()
    const title = String(item.title || '').toLowerCase()
    const desc = String(item.description || '').toLowerCase()
    return club.includes(kw) || title.includes(kw) || desc.includes(kw)
  })
})

const onSearchConfirm = () => {
  scrollTop.value = 0
  loadAuditList(true)
}

const clearKeyword = () => {
  keyword.value = ''
  scrollTop.value = 0
  loadAuditList(true)
}

// 审核表单
const auditForm = reactive({
  id: null,
  action: null, // 1=通过，3=驳回
  comment: ''
})

// 弹窗引用
const auditPopup = ref(null)

// 加载审核列表
const loadAuditList = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
    auditList.value = []
    hasMore.value = true
    // 回到顶部
    scrollTop.value = 0
  }
  
  if (!hasMore.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 如果不是查看全部，则添加状态筛选
    if (currentStatus.value !== -1) {
      params.status = currentStatus.value
    }
    // 关键词传后端
    const kw = keyword.value.trim()
    if (kw) {
      params.keyword = kw
    }
    
    const response = await apiModule.admin.recruitment.getAuditList(params)
    
    if (response.code === 200) {
      const records = Array.isArray(response.data.records) ? response.data.records : []
      const totalCount = Number(response.data.total) || 0
      
      if (reset) {
        auditList.value = records
      } else {
        // 去重合并，按返回顺序追加
        const map = new Map()
        auditList.value.forEach(item => map.set(item.id, item))
        records.forEach(item => map.set(item.id, item))
        auditList.value = Array.from(map.values())
      }
      
      total.value = totalCount
      hasMore.value = auditList.value.length < total.value
      currentPage.value = currentPage.value + 1
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载审核列表失败:', error)
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    refresherTriggered.value = false
  }
}

// 切换状态
const changeStatus = (status) => {
  currentStatus.value = status
  // 回到顶部并刷新
  scrollTop.value = 0
  loadAuditList(true)
}

// 刷新列表
const onRefresh = () => {
  refresherTriggered.value = true
  scrollTop.value = 0
  loadAuditList(true)
}

// 加载更多
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    loadAuditList()
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '-1': '',
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

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 显示审核弹窗
const showAuditModal = (item, action) => {
  auditForm.id = item.id
  auditForm.action = action
  auditForm.comment = ''
  auditPopup.value.open()
}

// 关闭审核弹窗
const closeAuditModal = () => {
  auditPopup.value.close()
  auditForm.id = null
  auditForm.action = null
  auditForm.comment = ''
}

// 提交审核
const submitAudit = async () => {
  if (auditForm.action === 3 && !auditForm.comment.trim()) {
    uni.showToast({
      title: '请输入驳回原因',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const data = {
      id: auditForm.id,
      status: auditForm.action,
      reviewComment: auditForm.comment.trim()
    }
    
    const response = await apiModule.admin.recruitment.auditRecruitment(data)
    
    if (response.code === 200) {
      uni.showToast({
        title: auditForm.action === 1 ? '审核通过' : '已驳回',
        icon: 'success'
      })
      
      closeAuditModal()
      scrollTop.value = 0
      loadAuditList(true)
    } else {
      uni.showToast({
        title: response.message || '操作失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('审核失败:', error)
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 删除招新
const confirmDelete = (item) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除“${item.title}”吗？此操作不可恢复。`,
    confirmText: '删除',
    confirmColor: '#f44336',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const resp = await apiModule.admin.recruitment.deleteRecruitment(item.id)
          if (resp.code === 200) {
            // 本地移除，避免整页刷新卡顿
            auditList.value = auditList.value.filter(r => r.id !== item.id)
            total.value = Math.max(0, total.value - 1)
            hasMore.value = auditList.value.length < total.value
            uni.showToast({ title: '删除成功', icon: 'success' })
            // 如果当前列表为空，尝试拉取下一页以填充
            if (!isLoading.value && hasMore.value && auditList.value.length === 0) {
              loadAuditList()
            }
          } else {
            uni.showToast({ title: resp.message || '删除失败', icon: 'none' })
          }
        } catch (e) {
          console.error('删除失败：', e)
          uni.showToast({ title: '网络异常，请稍后再试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 查看详情
const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/admin/recruitment/detail?id=${item.id}`
  })
}

// 获取空数据提示文本
const getEmptyText = () => {
  if (currentStatus.value === -1) {
    return '暂无招新活动，试试更换关键字或筛选条件'
  }
  return `暂无${getStatusText(currentStatus.value)}的招新活动`
}

onShow(() => {
  loadAuditList(true)
})
</script>

<style lang="scss" scoped>
.admin-recruitment-audit {
  min-height: 100vh;
  background: #f5f6fa;
}

.filter-bar {
  background: #fff;
  padding: 24rpx 32rpx;
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx;
  }
  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 8rpx;
    padding: 12rpx 16rpx;
    .input {
      flex: 1;
      font-size: 26rpx;
      margin: 0 8rpx;
    }
  }
  .search-btn {
    background: #2979ff;
    color: #fff;
    border-radius: 8rpx;
    padding: 12rpx 24rpx;
    font-size: 26rpx;
  }
  
  .filter-tabs {
    display: flex;
    
    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx 20rpx;
      font-size: 28rpx;
      color: #666;
      border-bottom: 4rpx solid transparent;
      transition: all 0.3s;
      
      &.active {
        color: #2979ff;
        border-bottom-color: #2979ff;
        font-weight: bold;
      }
    }
  }
}

.audit-list {
  padding: 24rpx 32rpx;
  
  .loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
    
    .uni-icons {
      margin-right: 16rpx;
    }
  }
  
  .audit-item {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    
    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 32rpx 32rpx 0;
      
      .club-info {
        flex: 1;
        
        .club-name {
          display: block;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .recruitment-title {
          font-size: 28rpx;
          color: #666;
        }
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
    
    .audit-content {
      padding: 24rpx 32rpx;
      
      .content-row {
        display: flex;
        margin-bottom: 16rpx;
        
        .label {
          min-width: 160rpx;
          font-size: 28rpx;
          color: #666;
        }
        
        .value {
          flex: 1;
          font-size: 28rpx;
          color: #333;
          word-break: break-all;
        }
      }
    }
    
    .poster-section {
      padding: 0 32rpx 24rpx;
      
      .label {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
      }
      
      .poster-img {
        width: 100%;
        max-height: 400rpx;
        border-radius: 12rpx;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      padding: 0 32rpx 32rpx;
      gap: 16rpx;
      
      .action-btn {
        padding: 0 32rpx;
        height: 60rpx;
        border-radius: 30rpx;
        font-size: 26rpx;
        border: none;
        
        &.approve-btn {
          background: #4caf50;
          color: #fff;
        }
        
        &.reject-btn {
          background: #f44336;
          color: #fff;
        }
        
        &.detail-btn {
          background: #2979ff;
          color: #fff;
        }
        &.delete-btn {
          background: #ff5722;
          color: #fff;
        }
        &::after {
          border: none;
        }
      }
    }
  }
  
  .empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
    
    .uni-icons {
      margin-bottom: 16rpx;
    }
  }
  
  .loading-more, .no-more {
    text-align: center;
    padding: 20rpx 0;
    color: #999;
    font-size: 24rpx;
  }
}

.audit-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      padding: 8rpx;
    }
  }
  
  .modal-content {
    padding: 32rpx;
    
    .form-item {
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      .form-textarea {
        width: 100%;
        min-height: 160rpx;
        padding: 16rpx;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333;
        resize: none;
        box-sizing: border-box;
        
        &:focus {
          border-color: #2979ff;
        }
      }
      
      .char-count {
        display: block;
        text-align: right;
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }
  
  .modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    .cancel-btn, .confirm-btn {
      flex: 1;
      height: 88rpx;
      font-size: 28rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
    
    .cancel-btn {
      background: #f5f6fa;
      color: #666;
    }
    
    .confirm-btn {
      background: #2979ff;
      color: #fff;
    }
  }
}
</style> 