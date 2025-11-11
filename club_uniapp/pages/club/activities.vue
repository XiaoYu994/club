<template>
  <view class="activities-container pageBg">
    <!-- 顶部导航 -->
    <custom-nav-bar :title="'社团活动 - ' + clubName" :showBack="true" @backClick="goBack"></custom-nav-bar>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索活动" 
          confirm-type="search"
          @confirm="searchActivities"
        />
      </view>
      <view v-if="isAdmin" class="filter-btn" @tap="showFilterDrawer">
        <uni-icons type="paperplane" size="18" color="#b13b7a"></uni-icons>
      </view>
    </view>
    
    <!-- 标签筛选 -->
    <scroll-view class="filter-tabs" scroll-x>
      <view 
        v-for="(tag, idx) in filterTags" 
        :key="idx" 
        :class="['tag-item', currentTag === idx ? 'active' : '']"
        @tap="switchTag(idx)"
      >
        {{ tag.name }}
      </view>
    </scroll-view>
    
    <!-- 活动列表 -->
    <scroll-view 
      scroll-y 
      class="activities-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshActivities"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <!-- 使用活动卡片组件 -->
        <activity-card
          v-for="(item, idx) in activityList" 
          :key="idx"
          :activity="item"
          :isAdmin="isAdmin"
          @detail="goToActivityDetail"
          @edit="editActivity"
          @delete="deleteActivity"
        ></activity-card>
        
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <!-- 无数据提示 -->
        <view v-if="activityList.length === 0 && !isLoading" class="empty-data">
          <image src="/static/images/empty-club.png" mode="aspectFit"></image>
          <text>暂无活动信息</text>
        </view>
        
        <!-- 加载完毕提示 -->
        <view v-if="activityList.length > 0 && !hasMore" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 筛选抽屉 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-drawer">
        <view class="drawer-header">
          <text>筛选条件</text>
          <view class="close-btn" @tap="closeFilterDrawer">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <scroll-view scroll-y class="filter-content">
          <view class="filter-section">
            <text class="section-title">活动状态</text>
            <view class="filter-options">
              <view 
                v-for="(status, idx) in statusOptions" 
                :key="idx"
                :class="['filter-option', filters.status === status.value ? 'active' : '']"
                @tap="selectStatus(status.value)"
              >
                {{ status.name }}
              </view>
            </view>
          </view>
          
          <view class="filter-section">
            <text class="section-title">排序方式</text>
            <view class="filter-options">
              <view 
                v-for="(sort, idx) in sortOptions" 
                :key="idx"
                :class="['filter-option', filters.sortBy === sort.value ? 'active' : '']"
                @tap="selectSort(sort.value)"
              >
                {{ sort.name }}
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="drawer-footer">
          <button class="reset-btn" @tap="resetFilters">重置</button>
          <button class="confirm-btn" @tap="applyFilters">确认</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 创建活动按钮 -->
    <view v-if="isAdmin" class="create-btn" @tap="createActivity">
      <uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'
import ActivityCard from '@/components/activity-card/activity-card.vue'

const { proxy } = getCurrentInstance()

// 社团ID和名称
const clubId = ref(null)
const clubName = ref('')

// 搜索关键字
const searchKeyword = ref('')

// 当前选中的标签
const currentTag = ref(0)

// 筛选标签
const filterTags = ref([
  { name: '全部活动', type: 'all' },
  { name: '进行中', type: 'ongoing' },
  { name: '报名中', type: 'signup' },
  { name: '已结束', type: 'ended' }
])

// 状态选项
const statusOptions = [
  { name: '全部', value: -1 },
  { name: '报名中', value: 1 },
  { name: '进行中', value: 2 },
  { name: '已结束', value: 3 },
  { name: '已取消', value: 0 }
]

// 排序选项
const sortOptions = [
  { name: '创建时间', value: 'create_time' },
  { name: '开始时间', value: 'start_time' },
  { name: '报名人数', value: 'join_count' }
]

// 筛选条件
const filters = reactive({
  status: -1,
  sortBy: 'create_time',
  isAsc: false
})

// 列表数据
const activityList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)
const isAdmin = ref(false)

// 弹窗引用
const filterPopup = ref(null)

// 初始化
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  clubId.value = currentPage.options.clubId
  clubName.value = decodeURIComponent(currentPage.options.clubName || '')
  
  // 检查用户角色
  checkUserRole()
  
  // 加载活动列表
  loadActivities()
})

// 检查用户角色
const checkUserRole = async () => {
  try {
    if (!clubId.value) return
    
    const res = await proxy.$api.club.getUserRole(clubId.value)
    
    if (res.code === 200 && res.data) {
      // 检查是否是管理员
      isAdmin.value = res.data.type > 0 && res.data.status === 1
    } else {
      isAdmin.value = false
    }
  } catch (error) {
    isAdmin.value = false
  }
}

// 加载活动列表
const loadActivities = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 构建查询参数
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      orderBy: filters.sortBy,
      isAsc: filters.isAsc
    }
    
    // 根据当前选中的标签添加对应的筛选条件
    if (currentTag.value > 0) {
      const tagType = filterTags.value[currentTag.value].type
      if (tagType === 'ongoing') {
        params.status = 2
      } else if (tagType === 'signup') {
        params.status = 1
      } else if (tagType === 'ended') {
        params.status = 3
      }
    }
    
    // 添加筛选条件
    if (filters.status !== -1) {
      params.status = filters.status
    }
    
    // 调用API获取数据 - 使用getClubActivities而不是getActivityList
    const res = await proxy.$api.activity.getClubActivities(clubId.value, params)
    
    if (res.code === 200) {
      const activities = res.data.list || []
      
      if (page.value === 1) {
        activityList.value = activities
      } else {
        activityList.value = [...activityList.value, ...activities]
      }
      
      hasMore.value = activities.length === pageSize.value
      page.value++
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载活动列表失败', error)
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

// 刷新活动列表
const refreshActivities = () => {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  
  // 重置搜索关键字
  searchKeyword.value = ''
  
  // 重置当前选中的标签
  currentTag.value = 0
  
  // 重置筛选条件
  resetFilters()
  
  // 重新加载数据
  loadActivities()
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadActivities()
  }
}

// 搜索活动
const searchActivities = () => {
  page.value = 1
  loadActivities()
}

// 切换标签
const switchTag = (idx) => {
  if (currentTag.value === idx) return
  currentTag.value = idx
  page.value = 1
  loadActivities()
}

// 显示筛选抽屉
const showFilterDrawer = () => {
  filterPopup.value.open()
}

// 关闭筛选抽屉
const closeFilterDrawer = () => {
  filterPopup.value.close()
}

// 选择活动状态
const selectStatus = (status) => {
  filters.status = status
}

// 选择排序方式
const selectSort = (sort) => {
  filters.sortBy = sort
  // 其他的都按照降序排
  filters.isAsc = false
}

// 重置筛选条件
const resetFilters = () => {
  filters.status = -1
  filters.sortBy = 'create_time'
  filters.isAsc = false
}

// 应用筛选条件
const applyFilters = () => {
  page.value = 1
  closeFilterDrawer()
  loadActivities()
}

// 跳转到活动详情
const goToActivityDetail = (activity) => {
  uni.navigateTo({
    url: `/pages/activity/activityDeatil?id=${activity.id}`
  })
}

// 创建活动
const createActivity = () => {
  uni.navigateTo({
    url: `/pages/activity/edit?clubId=${clubId.value}`
  })
}

// 编辑活动
const editActivity = (activity) => {
  uni.navigateTo({
    url: `/pages/activity/edit?id=${activity.id}&clubId=${clubId.value}`
  })
}

// 删除活动
const deleteActivity = (activity) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除活动"${activity.title}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' })
          
          const result = await proxy.$api.activity.deleteActivity(activity.id)
          
          if (result.code === 200) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            // 更新本地数据
            activityList.value = activityList.value.filter(item => item.id !== activity.id)
          } else {
            uni.showToast({
              title: result.message || '删除失败',
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
    }
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.activities-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .search-bar {
    padding: 30rpx;
    display: flex;
    align-items: center;
    
    .search-input {
      flex: 1;
      height: 72rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
      
      input {
        flex: 1;
        height: 72rpx;
        font-size: 28rpx;
        margin-left: 20rpx;
      }
    }
    
    .filter-btn {
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
    }
  }
  
  .filter-tabs {
    height: 80rpx;
    white-space: nowrap;
    padding: 0 20rpx;
    margin: 0 10rpx;
    
    .tag-item {
      display: inline-block;
      padding: 12rpx 30rpx;
      font-size: 28rpx;
      color: #666;
      margin-right: 20rpx;
      border-radius: 30rpx;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      &.active {
        color: #fff;
        background: #b13b7a;
        box-shadow: 0 2rpx 10rpx rgba(177, 59, 122, 0.3);
      }
    }
  }
  
  .activities-list {
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
  
  .filter-drawer {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 30rpx 30rpx 0;
    box-sizing: border-box;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 30rpx;
      border-bottom: 1rpx solid #eee;
      
      text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        padding: 10rpx;
      }
    }
    
    .filter-content {
      flex: 1;
      overflow-y: auto;
      max-height: 60vh;
    }
    
    .filter-section {
      margin: 30rpx 0;
      
      .section-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        
        .filter-option {
          padding: 12rpx 24rpx;
          border: 1rpx solid #eee;
          border-radius: 30rpx;
          font-size: 26rpx;
          color: #666;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          
          &.active {
            background: #b13b7a;
            color: #fff;
            border-color: #b13b7a;
          }
        }
      }
    }
    
    .drawer-footer {
      padding: 20rpx 0 40rpx;
      display: flex;
      border-top: 1rpx solid #f5f5f5;
      
      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;
        margin: 0 10rpx;
        font-size: 28rpx;
      }
      
      .reset-btn {
        background: #f5f5f5;
        color: #666;
      }
      
      .confirm-btn {
        background: #b13b7a;
        color: #fff;
      }
    }
  }
  
  .create-btn {
    position: fixed;
    right: 40rpx;
    bottom: 40rpx;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #b13b7a;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(177, 59, 122, 0.4);
    z-index: 100;
  }
}
</style> 