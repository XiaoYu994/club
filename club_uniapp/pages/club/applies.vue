<template>
  <view class="applies-container pageBg">
    <!-- 顶部导航 -->
    <custom-nav-bar :title="'社团申请 - ' + clubName" :showBack="true" @backClick="goBack"></custom-nav-bar>
    
    <!-- 筛选标签 -->
    <scroll-view class="filter-tabs" scroll-x>
      <view 
        v-for="(tab, idx) in tabs" 
        :key="idx" 
        :class="['tab-item', currentTab === idx ? 'active' : '']"
        @tap="switchTab(idx)"
      >
        {{ tab.name }}
        <text class="count" v-if="tab.count > 0">({{ tab.count }})</text>
      </view>
    </scroll-view>
    
    <!-- 创建招新按钮 -->
    <view class="action-bar">
      <button class="recruit-btn" @tap="handleManageRecruitment">管理招新</button>
    </view>
    
    <!-- 申请列表 -->
    <scroll-view 
      scroll-y 
      class="applies-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshApplies"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <!-- 申请卡片 -->
        <view 
          v-for="(item, idx) in applyList" 
          :key="idx" 
          class="apply-card"
          @tap="showApplyDetail(item)"
        >
          <image class="user-avatar" :src="item.user.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
          <view class="apply-info">
            <view class="apply-header">
              <view class="user-name">{{ item.user.username }}</view>
              <view :class="['apply-status', getStatusClass(item.status)]">{{ getStatusText(item.status) }}</view>
            </view>
            <view class="apply-meta">
              <view class="meta-item">
                <uni-icons type="person" size="14" color="#666"></uni-icons>
                <text>{{ item.user.studentId || '未填写学号' }}</text>
              </view>
              <view class="meta-item">
                <uni-icons type="location" size="14" color="#666"></uni-icons>
                <text>{{ item.user.college || '未填写学院' }}</text>
              </view>
            </view>
            <view class="apply-time">
              申请时间: {{ formatDate(item.createTime) }}
            </view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <!-- 无数据提示 -->
        <view v-if="applyList.length === 0 && !isLoading" class="empty-data">
          <image src="/static/images/empty-club.png" mode="aspectFit"></image>
          <text>暂无申请记录</text>
        </view>
        
        <!-- 加载完毕提示 -->
        <view v-if="applyList.length > 0 && !hasMore" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 申请详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">申请详情</text>
          <view class="close-btn" @tap="closeDetailPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <scroll-view scroll-y class="popup-content">
          <view v-if="currentApply" class="detail-content">
            <!-- 用户信息 -->
            <view class="user-info">
              <image class="user-avatar" :src="currentApply.user.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
              <view class="user-detail">
                <view class="user-name">{{ currentApply.user.username }}</view>
                <view class="user-meta">
                  <text>{{ currentApply.user.studentId || '未填写学号' }}</text>
                  <text>{{ currentApply.user.college || '未填写学院' }}</text>
                </view>
              </view>
              <view :class="['apply-status', getStatusClass(currentApply.status)]">
                {{ getStatusText(currentApply.status) }}
              </view>
            </view>
            
            <!-- 申请信息 -->
            <view class="form-info">
              <view class="section-title">申请信息</view>
              <view class="form-items">
                <!-- 遍历显示所有表单字段 -->
                <view v-for="(value, key, index) in parsedForms" :key="index" class="form-item">
                  <text class="item-label">{{ getFieldLabel(key) }}：</text>
                  <text class="item-value">{{ value }}</text>
                </view>
                
                <!-- 无表单数据提示 -->
                <view class="empty-form" v-if="Object.keys(parsedForms).length === 0">
                  未提供申请信息
                </view>
              </view>
            </view>
            
            <!-- 申请时间 -->
            <view class="time-info">
              <view class="time-item">
                <text class="time-label">申请时间：</text>
                <text class="time-value">{{ formatDate(currentApply.createTime, 'yyyy-MM-dd hh:mm:ss') }}</text>
              </view>
              <view class="time-item" v-if="currentApply.reviewTime">
                <text class="time-label">审核时间：</text>
                <text class="time-value">{{ formatDate(currentApply.reviewTime, 'yyyy-MM-dd hh:mm:ss') }}</text>
              </view>
            </view>
            
            <!-- 审核反馈 -->
            <view class="feedback-info" v-if="currentApply.feedback">
              <view class="section-title">审核反馈</view>
              <view class="feedback-content">{{ currentApply.feedback }}</view>
            </view>
            
            <!-- 审核操作 -->
            <view class="review-actions" v-if="currentApply.status === 0">
              <view class="section-title">审核操作</view>
              <view class="feedback-input">
                <text class="input-label">反馈信息：</text>
                <textarea 
                  v-model="feedbackContent" 
                  placeholder="请输入反馈信息（可选）"
                  class="feedback-textarea"
                />
              </view>
              <view class="action-buttons">
                <button class="reject-btn" @tap="rejectApply">拒绝申请</button>
                <button class="approve-btn" @tap="approveApply">通过申请</button>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 社团ID和名称
const clubId = ref(null)
const clubName = ref('')

// 当前选中的标签
const currentTab = ref(0)

// 筛选标签
const tabs = ref([
  { name: '待审核', status: 0, count: 0 },
  { name: '已通过', status: 1, count: 0 },
  { name: '已拒绝', status: 2, count: 0 },
  { name: '全部', status: -1, count: 0 }
])

// 列表数据
const applyList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)

// 当前选中的申请
const currentApply = ref(null)
// 反馈内容
const feedbackContent = ref('')
// 解析后的表单数据
const parsedForms = ref({})

// 弹窗引用
const detailPopup = ref(null)

// 初始化
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  clubId.value = currentPage.options.clubId
  clubName.value = decodeURIComponent(currentPage.options.clubName || '')
  
  // 加载申请列表
  loadApplies()
  
  // 加载申请计数
  loadApplyCounts()
})

// 加载申请计数
const loadApplyCounts = async () => {
  try {
    const res = await proxy.$api.club.getApplyCounts(clubId.value)
    
    if (res.code === 200 && res.data) {
      // 更新计数
      tabs.value[0].count = res.data.pending || 0
      tabs.value[1].count = res.data.approved || 0
      tabs.value[2].count = res.data.rejected || 0
      tabs.value[3].count = res.data.total || 0
    }
  } catch (error) {
    console.error('加载申请计数失败', error)
  }
}

// 加载申请列表
const loadApplies = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 构建查询参数
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value
    }
    
    // 根据当前选中的标签添加对应的筛选条件
    const status = tabs.value[currentTab.value].status
    if (status !== -1) {
      params.status = status
    }
    
    // 调用API获取数据
    const res = await proxy.$api.club.getApplyList(clubId.value, params)
    
    if (res.code === 200) {
      const applies = res.data.list || []
      
      if (page.value === 1) {
        applyList.value = applies
      } else {
        applyList.value = [...applyList.value, ...applies]
      }
      
      hasMore.value = applies.length === pageSize.value
      page.value++
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载申请列表失败', error)
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

// 刷新申请列表
const refreshApplies = () => {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  
  // 重新加载数据
  loadApplies()
  
  // 重新加载计数
  loadApplyCounts()
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadApplies()
  }
}

// 切换标签
const switchTab = (idx) => {
  if (currentTab.value === idx) return
  currentTab.value = idx
  page.value = 1
  loadApplies()
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    case 3: return '已面试';
    case 4: return '已入社';
    default: return '未知';
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'pending';
    case 1: return 'approved';
    case 2: return 'rejected';
    case 3: return 'interviewed';
    case 4: return 'joined';
    default: return '';
  }
}

// 获取字段标签
const getFieldLabel = (key) => {
  // 常见字段映射表
  const labelMap = {
    name: '姓名',
    student_id: '学号',
    studentId: '学号',
    phone: '手机号',
    mobile: '手机号',
    email: '邮箱',
    college: '学院',
    class_name: '班级',
    className: '班级',
    major: '专业',
    reason: '申请理由',
    interest: '兴趣特长',
    experience: '相关经验',
    introduction: '自我介绍',
    expectation: '期望与目标',
    specialty: '专业特长',
    hobby: '爱好',
    skill: '技能',
    contact: '联系方式'
  }
  
  // 检查是否在映射表中
  if (labelMap[key]) {
    return labelMap[key]
  }
  
  // 处理自定义字段，将下划线和驼峰转换为空格，并首字母大写
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// 显示申请详情
const showApplyDetail = (apply) => {
  currentApply.value = apply
  feedbackContent.value = ''
  
  // 解析表单数据
  try {
    console.log('表单数据:', apply.forms)
    
    if (apply.forms) {
      let formsData = apply.forms
      
      // 如果是字符串，尝试解析JSON
      if (typeof formsData === 'string') {
        try {
          formsData = JSON.parse(formsData)
        } catch (e) {
          console.error('JSON解析失败:', e)
          // 如果解析失败，尝试把它作为申请理由
          formsData = { reason: formsData }
        }
      }
      
      // 如果解析后是数组，转换为对象格式
      if (Array.isArray(formsData)) {
        const obj = {}
        formsData.forEach(item => {
          if (typeof item === 'object' && item.name && item.value !== undefined) {
            obj[item.name.toLowerCase().replace(/\s/g, '_')] = item.value
          }
        })
        formsData = obj
      }
      
      // 确保解析结果是对象
      if (formsData && typeof formsData === 'object') {
        parsedForms.value = formsData
        console.log('解析后的表单数据:', parsedForms.value)
      } else {
        parsedForms.value = {}
      }
    } else {
      parsedForms.value = {}
    }
  } catch (error) {
    console.error('解析表单数据失败', error)
    parsedForms.value = {}
  }
  
  detailPopup.value.open()
}

// 关闭详情弹窗
const closeDetailPopup = () => {
  detailPopup.value.close()
}

// 通过申请
const approveApply = async () => {
  if (!currentApply.value) return
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const res = await proxy.$api.club.reviewApply(currentApply.value.id, {
      status: 1, // 通过
      feedback: feedbackContent.value
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '已通过申请',
        icon: 'success'
      })
      
      // 更新本地数据
      const index = applyList.value.findIndex(item => item.id === currentApply.value.id)
      if (index !== -1) {
        applyList.value[index].status = 1
        applyList.value[index].feedback = feedbackContent.value
        applyList.value[index].reviewTime = Date.now()
      }
      
      // 更新计数
      tabs.value[0].count--
      tabs.value[1].count++
      
      closeDetailPopup()
      
      // 如果当前是待审核标签，则刷新列表
      if (currentTab.value === 0) {
        refreshApplies()
      }
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 拒绝申请
const rejectApply = async () => {
  if (!currentApply.value) return
  
  // 检查是否填写了反馈信息
  if (!feedbackContent.value) {
    uni.showToast({
      title: '请填写拒绝原因',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const res = await proxy.$api.club.reviewApply(currentApply.value.id, {
      status: 2, // 拒绝
      feedback: feedbackContent.value
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '已拒绝申请',
        icon: 'success'
      })
      
      // 更新本地数据
      const index = applyList.value.findIndex(item => item.id === currentApply.value.id)
      if (index !== -1) {
        applyList.value[index].status = 2
        applyList.value[index].feedback = feedbackContent.value
        applyList.value[index].reviewTime = Date.now()
      }
      
      // 更新计数
      tabs.value[0].count--
      tabs.value[2].count++
      
      closeDetailPopup()
      
      // 如果当前是待审核标签，则刷新列表
      if (currentTab.value === 0) {
        refreshApplies()
      }
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 添加创建招新跳转方法
const handleManageRecruitment = () => {
  uni.navigateTo({
    url: `/pages/club/manageRecruitment?clubId=${clubId.value}`
  });
};
</script>

<style lang="scss" scoped>
.applies-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .filter-tabs {
    height: 80rpx;
    white-space: nowrap;
    padding: 0 20rpx;
    margin: 20rpx 10rpx;
    
    .tab-item {
      display: inline-block;
      padding: 12rpx 30rpx;
      font-size: 28rpx;
      color: #666;
      margin-right: 20rpx;
      border-radius: 30rpx;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      .count {
        font-size: 24rpx;
        margin-left: 4rpx;
      }
      
      &.active {
        color: #fff;
        background: #b13b7a;
        box-shadow: 0 2rpx 10rpx rgba(177, 59, 122, 0.3);
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 10;

    .recruit-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      font-size: 28rpx;
      background: #b13b7a;
      color: #fff;
    }
  }
  
  .applies-list {
    flex: 1;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    
    /* 隐藏滚动条 - 样式方式 */
    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
      display: none;
    }
    
    /* 兼容Firefox浏览器 */
    scrollbar-width: none;
    /* 兼容IE和Edge浏览器 */
    -ms-overflow-style: none;
    
    .list-container {
      padding-bottom: 40rpx;
      width: 100%;
    }
    
    .apply-card {
      margin-bottom: 30rpx;
      background: #fff;
      border-radius: 18rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
      display: flex;
      padding: 24rpx;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      
      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        flex-shrink: 0;
        margin-right: 24rpx;
        border: 1px solid #f0f0f0;
      }
      
      .apply-info {
        max-width: calc(100% - 144rpx);
        overflow: hidden;
        
        .apply-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;
          
          .user-name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .apply-status {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            margin-left: 12rpx;
            flex-shrink: 0;
            
            &.pending {
              color: #ff9800;
              background: rgba(255, 152, 0, 0.1);
            }
            
            &.approved {
              color: #4caf50;
              background: rgba(76, 175, 80, 0.1);
            }
            
            &.rejected {
              color: #f44336;
              background: rgba(244, 67, 54, 0.1);
            }
          }
        }
        
        .apply-meta {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 16rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #666;
            margin-right: 30rpx;
            margin-bottom: 8rpx;
            
            text {
              margin-left: 8rpx;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
        
        .apply-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30rpx 0;
      
      text {
        font-size: 24rpx;
        color: #999;
        margin-left: 10rpx;
      }
    }
    
    .empty-data {
      padding: 100rpx 0;
      text-align: center;
      
      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
        opacity: 0.8;
      }
      
      text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .no-more {
      text-align: center;
      padding: 30rpx 0;
      
      text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .detail-popup {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 30rpx 30rpx 0;
    box-sizing: border-box;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 30rpx;
      border-bottom: 1rpx solid #eee;
      
      .popup-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        padding: 10rpx;
      }
    }
    
    .popup-content {
      flex: 1;
      overflow-y: auto;
      max-height: 60vh;
      padding: 20rpx 0;
      
      .detail-content {
        .user-info {
          display: flex;
          align-items: center;
          padding: 20rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          
          .user-avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50rpx;
            margin-right: 20rpx;
          }
          
          .user-detail {
            flex: 1;
            
            .user-name {
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
              margin-bottom: 8rpx;
            }
            
            .user-meta {
              font-size: 24rpx;
              color: #666;
              
              text {
                margin-right: 20rpx;
              }
            }
          }
          
          .apply-status {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            
            &.pending {
              color: #ff9800;
              background: rgba(255, 152, 0, 0.1);
            }
            
            &.approved {
              color: #4caf50;
              background: rgba(76, 175, 80, 0.1);
            }
            
            &.rejected {
              color: #f44336;
              background: rgba(244, 67, 54, 0.1);
            }
          }
        }
        
        .section-title {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          margin: 30rpx 0 20rpx;
        }
        
        .form-info {
          .form-items {
            .form-item {
              display: flex;
              margin-bottom: 20rpx;
              
              .item-label {
                min-width: 160rpx;
                width: auto;
                font-size: 26rpx;
                color: #666;
                flex-shrink: 0;
                padding-right: 20rpx;
              }
              
              .item-value {
                flex: 1;
                font-size: 26rpx;
                color: #333;
                word-break: break-all;
                white-space: pre-wrap;
                line-height: 1.5;
              }
            }
          }
          
          .empty-form {
            font-size: 26rpx;
            color: #999;
            padding: 20rpx 0;
            text-align: center;
            background: #f9f9f9;
            border-radius: 10rpx;
          }
        }
        
        .time-info {
          padding: 20rpx 0;
          border-top: 1rpx solid #f5f5f5;
          border-bottom: 1rpx solid #f5f5f5;
          
          .time-item {
            display: flex;
            margin-bottom: 10rpx;
            
            .time-label {
              font-size: 24rpx;
              color: #666;
              width: 160rpx;
              flex-shrink: 0;
            }
            
            .time-value {
              font-size: 24rpx;
              color: #333;
            }
          }
        }
        
        .feedback-info {
          .feedback-content {
            font-size: 26rpx;
            color: #333;
            background: #f9f9f9;
            padding: 20rpx;
            border-radius: 10rpx;
          }
        }
        
        .review-actions {
          .feedback-input {
            margin-bottom: 30rpx;
            
            .input-label {
              display: block;
              font-size: 26rpx;
              color: #666;
              margin-bottom: 10rpx;
            }
            
            .feedback-textarea {
              width: 100%;
              height: 200rpx;
              background: #f9f9f9;
              border-radius: 10rpx;
              padding: 20rpx;
              box-sizing: border-box;
              font-size: 26rpx;
            }
          }
          
          .action-buttons {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40rpx;
            
            button {
              width: 48%;
              height: 80rpx;
              line-height: 80rpx;
              text-align: center;
              border-radius: 40rpx;
              font-size: 28rpx;
            }
            
            .reject-btn {
              background: #f5f5f5;
              color: #f44336;
            }
            
            .approve-btn {
              background: #b13b7a;
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style> 