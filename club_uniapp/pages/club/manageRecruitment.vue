<template>
  <view class="manage-recruitment-container pageBg">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <custom-nav-bar title="招新管理" :showBack="true" @backClick="goBack"></custom-nav-bar>

    <!-- 招新活动列表 -->
    <scroll-view scroll-y class="recruitment-list" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="refreshData" @scrolltolower="loadMore">
      <!-- 当前招新活动 -->
      <view class="section" v-if="activeRecruitments.length > 0">
        <view class="section-title">当前招新</view>
        <view class="recruitment-card" v-for="(item, index) in activeRecruitments" :key="'active-' + index">
          <view class="card-header">
            <text class="title">{{ item.title }}</text>
            <view class="status-tag active">招新中</view>
          </view>
          <view class="card-content">
            <view class="info-item">
              <uni-icons type="calendar" size="16" color="#b13b7a"></uni-icons>
              <text>{{ formatDate(item.startTime) }} 至 {{ formatDate(item.endTime) }}</text>
            </view>
            <view class="info-item">
              <uni-icons type="personadd" size="16" color="#b13b7a"></uni-icons>
              <text>已报名: {{ item.joinCount || 0 }}人 / 已通过: {{ item.passCount || 0 }}人 / 计划: {{ item.planCount || 0 }}人</text>
            </view>
          </view>
          <view class="card-footer">
            <button class="action-btn edit" @tap="goToEditRecruitment(item)">编辑</button>
            <button class="action-btn view-applies" @tap="viewApplies(item)">查看申请</button>
            <button class="action-btn end" v-if="item.status === 1" @tap="endRecruitment(item)">结束招新</button>
          </view>
        </view>
      </view>

      <!-- 历史招新活动 -->
      <view class="section">
        <view class="section-title">历史招新</view>
        <view v-if="historyRecruitments.length === 0" class="empty-tip">
          <image src="/static/images/empty-club.png" mode="aspectFit"></image>
          <text>暂无历史招新记录</text>
        </view>
        <view class="recruitment-card" v-for="(item, index) in historyRecruitments" :key="'history-' + index">
          <view class="card-header">
            <text class="title">{{ item.title }}</text>
            <view class="status-tag" :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</view>
          </view>
          <view class="card-content">
            <view class="info-item">
              <uni-icons type="calendar" size="16" color="#999"></uni-icons>
              <text>{{ formatDate(item.startTime) }} 至 {{ formatDate(item.endTime) }}</text>
            </view>
            <view class="info-item">
              <uni-icons type="personadd" size="16" color="#999"></uni-icons>
              <text>报名: {{ item.joinCount || 0 }}人 / 通过: {{ item.passCount || 0 }}人 / 计划: {{ item.planCount || 0 }}人</text>
            </view>
          </view>
          <view class="card-footer">
            <button class="action-btn edit" @tap="goToEditRecruitment(item)">编辑</button>
            <button class="action-btn view-applies" @tap="viewApplies(item)">查看申请</button>
            <button class="action-btn copy" @tap="copyRecruitment(item)">复制创建</button>
          </view>
        </view>
        
        <!-- 加载提示 -->
        <view v-if="isLoading" class="loading-tip">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <!-- 加载完毕提示 -->
        <view v-if="historyRecruitments.length > 0 && !hasMore" class="no-more-tip">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部固定创建招新按钮 -->
    <view class="bottom-create-btn" @tap="goToCreateRecruitment">
      <uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
      <text>创建新招新</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 系统状态栏高度
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

// 数据加载状态
const isLoading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(10)

// 社团ID
const clubId = ref(null)

// 招新活动数据
const activeRecruitments = ref([])
const historyRecruitments = ref([])

// 页面初始化
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  clubId.value = currentPage.options.clubId
  
  // 加载数据
  loadData()
})

// 加载数据
const loadData = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 添加调试信息
    console.log('开始加载招新数据，社团ID:', clubId.value)
    
    // 加载当前招新活动
    await loadActiveRecruitments()
    
    // 加载历史招新活动
    await loadHistoryRecruitments()
  } catch (error) {
    console.error('加载招新数据失败', error)
    uni.showToast({
      title: '加载招新数据失败，请稍后重试',
      icon: 'none',
      duration: 3000
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

// 加载当前招新活动
const loadActiveRecruitments = async () => {
  try {
    // 直接使用备用方法：使用listRecruitments获取正在进行的招新
    const params = {
      pageNo: 1,
      pageSize: 10,
      status: 1 // 进行中状态
    }
    
    const res = await proxy.$api.club.listRecruitments(clubId.value, params)
    if (res.code === 200) {
      activeRecruitments.value = res.data.list || []
    } else {
      console.error('加载当前招新活动失败:', res.message)
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载当前招新活动失败', error)
    uni.showToast({
      title: '加载当前招新活动失败',
      icon: 'none'
    })
  }
}

// 备用加载历史招新数据方法（通过getRecruitmentList API）
const fallbackLoadHistoryRecruitments = async () => {
  try {
    console.log('使用备用方法加载历史招新数据')
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      clubId: clubId.value,
      status: 2 // 已结束状态
    }
    
    const res = await proxy.$api.club.getRecruitmentList(params)
    
    if (res.code === 200) {
      const list = res.data.list || []
      
      if (page.value === 1) {
        historyRecruitments.value = list
      } else {
        historyRecruitments.value = [...historyRecruitments.value, ...list]
      }
      
      hasMore.value = list.length === pageSize.value
      if (list.length > 0) {
        page.value++
      }
    } else {
      console.error('备用方法加载历史招新数据失败:', res.message)
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('备用方法加载历史招新数据失败:', error)
    uni.showToast({
      title: '加载历史招新活动失败',
      icon: 'none'
    })
  }
}

// 加载历史招新活动
const loadHistoryRecruitments = async () => {
  try {
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      status: 2 // 已结束状态
    }
    
    console.log('尝试加载历史招新数据，参数:', params)
    
    try {
      // 首先尝试使用listRecruitments方法
      const res = await proxy.$api.club.listRecruitments(clubId.value, params)
      
      if (res.code === 200) {
        const list = res.data.list || []
        
        if (page.value === 1) {
          historyRecruitments.value = list
        } else {
          historyRecruitments.value = [...historyRecruitments.value, ...list]
        }
        
        hasMore.value = list.length === pageSize.value
        if (list.length > 0) {
          page.value++
        }
      } else {
        throw new Error(res.message || '加载失败')
      }
    } catch (primaryError) {
      console.error('主方法加载历史招新数据失败:', primaryError)
      console.log('尝试使用备用方法加载历史招新数据')
      await fallbackLoadHistoryRecruitments()
    }
  } catch (error) {
    console.error('加载历史招新活动失败', error)
    uni.showToast({
      title: '加载历史招新活动失败',
      icon: 'none'
    })
  }
}

// 刷新数据
const refreshData = () => {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  loadData()
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadHistoryRecruitments()
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '招新中'
    case 2: return '已结束'
    default: return '未知状态'
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'pending'
    case 1: return 'active'
    case 2: return 'ended'
    default: return ''
  }
}

// 跳转到创建招新页面
const goToCreateRecruitment = () => {
  uni.navigateTo({
    url: `/pages/club/createRecruitment?clubId=${clubId.value}`
  })
}

// 跳转到编辑招新页面
const goToEditRecruitment = (item) => {
  uni.navigateTo({
    url: `/pages/club/editRecruitment?clubId=${clubId.value}&recruitmentId=${item.id}`
  })
}

// 查看申请
const viewApplies = (item) => {
  uni.navigateTo({
    url: `/pages/club/applies?clubId=${clubId.value}`
  })
}

// 查看招新详情
const viewRecruitmentDetail = (item) => {
  uni.navigateTo({
    url: `/pages/club/viewRecruitment?recruitmentId=${item.id}`
  })
}

// 复制创建招新
const copyRecruitment = (item) => {
  uni.navigateTo({
    url: `/pages/club/createRecruitment?clubId=${clubId.value}&copyFrom=${item.id}`
  })
}

// 结束招新
const endRecruitment = (item) => {
  uni.showModal({
    title: '结束招新',
    content: '确定要结束该招新活动吗？结束后将不再接受新的申请。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' })
          
          try {
            console.log('尝试更新招新状态:', item.id, 2)
            const updateRes = await proxy.$api.club.updateRecruitmentStatus(item.id, 2)
            
            if (updateRes.code === 200) {
              uni.showToast({
                title: '招新活动已结束',
                icon: 'success'
              })
              
              // 刷新数据
              refreshData()
            } else {
              throw new Error(updateRes.message || '操作失败')
            }
          } catch (primaryError) {
            console.error('主方法更新招新状态失败:', primaryError)
            console.log('尝试使用备用方法更新招新状态')
            
            // 备用方法：使用updateRecruitment
            const updateData = {
              id: item.id,
              status: 2
            }
            
            const updateRes = await proxy.$api.club.updateRecruitment(item.id, updateData)
            
            if (updateRes.code === 200) {
              uni.showToast({
                title: '招新活动已结束',
                icon: 'success'
              })
              
              // 刷新数据
              refreshData()
            } else {
              throw new Error(updateRes.message || '操作失败')
            }
          }
        } catch (error) {
          console.error('结束招新失败', error)
          uni.showToast({
            title: error.message || '网络异常，请稍后重试',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.manage-recruitment-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 180rpx; /* 为底部按钮留出空间 */
}

.status-bar {
  width: 100%;
  background-color: #b13b7a;
}

.recruitment-list {
  flex: 1;
  padding: 20rpx 30rpx 30rpx;
  box-sizing: border-box;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background: linear-gradient(135deg, #b13b7a, #e9629e);
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(177, 59, 122, 0.3);
  
  text {
    margin-left: 10rpx;
  }
}

.section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    position: relative;
    padding-left: 20rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 30rpx;
      background: #b13b7a;
      border-radius: 3rpx;
    }
  }
}

.recruitment-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .status-tag {
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      
      &.pending {
        color: #ff9800;
        background: rgba(255, 152, 0, 0.1);
      }
      
      &.active {
        color: #4caf50;
        background: rgba(76, 175, 80, 0.1);
      }
      
      &.ended {
        color: #999;
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
  
  .card-content {
    margin-bottom: 20rpx;
    
    .info-item {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 10rpx;
      
      text {
        margin-left: 10rpx;
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;
    
    .action-btn {
      margin-left: 16rpx;
      padding: 0 20rpx;
      height: 56rpx;
      line-height: 56rpx;
      font-size: 24rpx;
      border-radius: 28rpx;
      background: #f8f8f8;
      color: #666;
      
      &.edit, &.view {
        background: rgba(177, 59, 122, 0.1);
        color: #b13b7a;
      }
      
      &.view-applies {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }
      
      &.end {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
      
      &.copy {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }
    }
  }
}

.empty-tip, .loading-tip, .no-more-tip {
  padding: 30rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  image {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
    opacity: 0.7;
  }
  
  text {
    font-size: 26rpx;
    color: #999;
  }
}

.loading-tip {
  flex-direction: row;
  
  text {
    margin-left: 10rpx;
  }
}

.bottom-create-btn {
  position: fixed;
  bottom: 50rpx; /* 调整位置 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 90rpx;
  background: linear-gradient(135deg, #b13b7a, #e9629e);
  border-radius: 45rpx;
  color: #fff;
  font-size: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(177, 59, 122, 0.3);
  z-index: 10;
  
  text {
    margin-left: 10rpx;
  }
}
</style> 