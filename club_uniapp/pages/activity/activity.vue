<template>
  <view class="activity-container pageBg">
    <!-- 顶部导航 -->
	<!-- #ifndef MP-TOUTIAO -->
	<custom-nav-bar title="社团活动	"></custom-nav-bar>
	<!-- #endif -->
    
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
      <view class="filter-btn" @tap="showFilterDrawer">
        <uni-icons type="paperplane" size="18" color="#b13b7a"></uni-icons>
      </view>
    </view>
    
    <!-- 标签筛选 -->
    <scroll-view class="filter-tags" scroll-x>
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
      class="activity-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshActivities"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <!-- 活动卡片 -->
        <view
          v-for="(item, idx) in filteredActivityList"
          :key="idx"
          class="activity-card"
          @tap="goToDetail(item)"
        >
          <image class="activity-poster" :src="getPosterUrl(item.poster)" mode="aspectFill"></image>
          <view class="activity-info">
            <view class="activity-title">{{ item.title }}</view>
            <view class="activity-meta">
              <view class="meta-item">
                <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                <text>{{ formatDate1(item.startTime)}}</text>
              </view>
              <view class="meta-item">
                <uni-icons type="location" size="14" color="#666"></uni-icons>
                <text>{{ item.address || '待定' }}</text>
              </view>
            </view>
            <view class="activity-stats">
              <view class="status-tag" :class="getStatusClass(item)">{{ getStatusText(item) }}</view>
              <view class="join-count">
                <text>{{ item.joinCount || 0 }}人参与</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>

        <!-- 无数据提示 -->
        <view v-if="filteredActivityList.length === 0 && !isLoading" class="empty-data">
          <image src="/static/images/empty-activity.png" mode="aspectFit"></image>
          <text>暂无活动信息</text>
        </view>

        <!-- 加载完毕提示 -->
        <view v-if="filteredActivityList.length > 0 && !hasMore" class="no-more">
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
          <text class="section-title">活动时间</text>
          <view class="time-inputs">
            <picker mode="date" :value="filters.startDate" @change="onStartDateChange">
                <view class="time-picker">
                  <text :class="{ 'placeholder': !filters.startDate }">{{ filters.startDate || '开始日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                </view>
            </picker>
            <text class="to-text">至</text>
            <picker mode="date" :value="filters.endDate" @change="onEndDateChange">
                <view class="time-picker">
                  <text :class="{ 'placeholder': !filters.endDate }">{{ filters.endDate || '结束日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                </view>
            </picker>
          </view>
        </view>
        
        <view class="filter-section">
          <text class="section-title">社团类型</text>
          <view class="filter-options">
            <view 
              v-for="(type, idx) in clubTypeOptions" 
              :key="idx"
              :class="['filter-option', filters.clubType === type.value ? 'active' : '']"
              @tap="selectClubType(type.value)"
            >
              {{ type.name }}
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
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, onBeforeUnmount } from 'vue'
import {formatDate, getImageUrl} from '@/utils/common.js'
import { listenActivityDataChanged } from '@/utils/activity.js'

const { proxy } = getCurrentInstance()
// 状态栏高度
const statusBarHeight = ref(0)

// 用户角色
const isAdmin = ref(true) // 根据实际登录用户身份设置

// 搜索关键字
const searchKeyword = ref('')

// 当前选中的标签
const currentTag = ref(0)

// 筛选标签
const filterTags = ref([
  { name: '全部活动', type: 'all' },
  { name: '正在报名', type: 'enrolling' },
  { name: '进行中', type: 'ongoing' },
  { name: '已结束', type: 'ended' }
])

// 社团类型选项
const clubTypeOptions = [
  { name: '全部', value: -1 },
  { name: '普通社团', value: 0 },
  { name: '院级社团', value: 1 },
  { name: '校级社团', value: 2 }
]

// 筛选条件
const filters = reactive({
  startDate: '',
  endDate: '',
  clubType: -1
})

// 列表数据
const activityList = ref([])  // 从后端获取的完整活动列表
const filteredActivityList = ref([])  // 前端筛选后显示的列表
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)

// 弹窗引用
const filterPopup = ref(null)

// 记录上次离开页面的时间
let lastHideTime = 0
// 用于清理事件监听的函数
let unlistenActivityDataChanged = null

// 获取海报URL（不添加时间戳，保留缓存机制）
const getPosterUrl = (url) => {
  return getImageUrl(url, '/static/images/default-poster.png', false); // 传入false表示不添加时间戳
}

// 格式化日期
const formatDate1 = (timestamp) => {
  if (!timestamp) return '未设置'
  timestamp = Number(timestamp)
  const date = new Date(timestamp)
  // 这个是utils中的方法
  return formatDate(date)
}

// 获取活动实际状态
// 注意：前端直接使用后端返回的status字段，不再根据时间计算
// status = 0: 已取消
// status = 1: 计划中（等待审批，不显示在列表中）
// status = 2: 进行中（已审批通过，可以报名）
// status = 3: 已结束
const getActualStatus = (activity) => {
  if (!activity) return -1;

  const now = Date.now();
  const startTime = Number(activity.startTime || 0);
  const endTime = Number(activity.endTime || 0);

  // 如果是已结束状态，直接返回
  if (activity.status === 3) {
    return 3; // 已结束
  }

  // 如果是已取消状态，直接返回
  if (activity.status === 0) {
    return 0; // 已取消
  }

  // 如果是进行中状态（status=2），根据时间判断是报名中还是活动进行中
  if (activity.status === 2) {
    if (now < startTime) {
      return 1; // 报名中（未到活动开始时间）
    } else if (now >= startTime && now < endTime) {
      return 2; // 活动进行中
    } else {
      return 3; // 已结束（理论上不会走到这里，因为定时任务会更新status=3）
    }
  }

  // 如果是计划中状态（status=1），返回-1（不应该显示在列表中）
  return -1;
}

// 获取状态文本
const getStatusText = (activity) => {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0: return '已取消';
    case 1: return '报名中';
    case 2: return '进行中';
    case 3: return '已结束';
    default: return '未知';
  }
}

// 获取状态类名
const getStatusClass = (activity) => {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0: return 'cancelled';
    case 1: return 'enrolling';
    case 2: return 'ongoing';
    case 3: return 'ended';
    default: return '';
  }
}

// 本地筛选活动列表
const filterActivitiesLocally = () => {
  const now = Date.now();

  if (currentTag.value === 0) {
    // 全部活动：显示所有
    filteredActivityList.value = activityList.value;
  } else if (currentTag.value === 1) {
    // 正在报名：status=2 且 当前时间 < 开始时间
    filteredActivityList.value = activityList.value.filter(activity => {
      return activity.status === 2 && now < Number(activity.startTime);
    });
  } else if (currentTag.value === 2) {
    // 进行中：status=2 且 开始时间 <= 当前时间 < 结束时间
    filteredActivityList.value = activityList.value.filter(activity => {
      const startTime = Number(activity.startTime);
      const endTime = Number(activity.endTime);
      return activity.status === 2 && now >= startTime && now < endTime;
    });
  } else if (currentTag.value === 3) {
    // 已结束：status=3
    filteredActivityList.value = activityList.value.filter(activity => {
      return activity.status === 3;
    });
  }
}

// 切换标签
const switchTag = (index) => {
  currentTag.value = index;
  // 只进行本地筛选，不重新加载数据
  filterActivitiesLocally();
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
      keyword: searchKeyword.value
    }

    // 不再根据标签添加status参数，后端会返回所有status=2和3的活动
    // 前端根据标签在本地筛选

    // 添加筛选条件
    if (filters.startDate) {
      params.startTime = new Date(filters.startDate).getTime()
    }

    if (filters.endDate) {
      params.endTime = new Date(filters.endDate).getTime()
    }

    if (filters.clubType !== -1) {
      params.clubType = filters.clubType
    }

    // 调用API获取数据
    const res = await proxy.$api.activity.getActivityList(params)

    if (res.code === 200) {
      const activities = res.data.list || []

      // 确保每个活动的海报URL都添加时间戳防止缓存
      activities.forEach(activity => {
        if (activity.poster) {
          activity.poster = getImageUrl(activity.poster)
        }
      })

      if (page.value === 1) {
        activityList.value = activities
      } else {
        activityList.value = [...activityList.value, ...activities]
      }

      // 进行本地筛选
      filterActivitiesLocally()

      hasMore.value = activities.length === pageSize.value
      page.value++
    } else {
      uni.showToast({
        title: res.msg || '加载失败',
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

// 显示筛选抽屉
const showFilterDrawer = () => {
  filterPopup.value.open()
}

// 关闭筛选抽屉
const closeFilterDrawer = () => {
  filterPopup.value.close()
}

// 选择社团类型
const selectClubType = (type) => {
  filters.clubType = type
}

// 开始日期变更
const onStartDateChange = (e) => {
  filters.startDate = e.detail.value
}

// 结束日期变更
const onEndDateChange = (e) => {
  filters.endDate = e.detail.value
}

// 重置筛选条件
const resetFilters = () => {
  filters.startDate = ''
  filters.endDate = ''
  filters.clubType = -1
}

// 应用筛选条件
const applyFilters = () => {
  page.value = 1
  closeFilterDrawer()
  loadActivities()
}

// 发布活动
const publishActivity = () => {
  uni.navigateTo({
    url: '/pages/activity/publish'
  })
}

// 跳转到活动详情
const goToDetail = (item) => {
  try {
    // 确保时间戳是数字类型
    const processedItem = {
      ...item,
      startTime: Number(item.startTime),
      endTime: Number(item.endTime)
    };
    
    // 将活动数据转为 JSON 字符串传递
    const itemData = encodeURIComponent(JSON.stringify(processedItem));
    
    // 通过url携带数据
    uni.navigateTo({
      url: `/pages/activity/activityDeatil?id=${item.id}&itemData=${itemData}`
    });
  } catch (error) {
    console.error('跳转详情页出错', error);
    // 如果数据处理出错，只传递ID
  uni.navigateTo({
    url: `/pages/activity/activityDeatil?id=${item.id}`
    });
}
}

// 初始化
onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 加载活动列表
  loadActivities()
  
  // 监听活动数据变化事件
  unlistenActivityDataChanged = listenActivityDataChanged(() => {
    console.log('接收到活动数据变化事件，刷新列表')
    // 重置页码并重新加载数据
    page.value = 1
    loadActivities()
  })
})

// 组件卸载前清理事件监听
onBeforeUnmount(() => {
  // 移除活动数据变化事件监听
  if (unlistenActivityDataChanged) {
    unlistenActivityDataChanged()
  }
})

// 在uni-app中，使用defineExpose来处理页面生命周期
defineExpose({
  onShow() {
    // 从其他页面返回时，直接重新加载数据
    const now = Date.now()
    // 无论时间间隔多长，都刷新数据，确保从编辑页面返回时能看到最新数据
    console.log('页面显示，刷新活动列表')
    // 重置页码并重新加载数据
    page.value = 1
    loadActivities()
    // 记录当前时间
    lastHideTime = now
  },
  onHide() {
    lastHideTime = Date.now()
  }
})
</script>

<style lang="scss" scoped>
.activity-container {
  .status-bar {
    width: 100%;
    background: #fff;
  }
  
  .nav-header {
    background: #fff;
    padding: 0 30rpx;
    height: 90rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1rpx solid #eee;
    
    .nav-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #222;
    }
    
    .nav-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f0f7ff;
    }
  }
  
  .search-bar {
    padding: 30rpx;
    display: flex;
    align-items: center;
    margin-top: -10rpx;
    
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
  
  .filter-tags {
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
  
  .activity-list {
    height: calc(100vh - 310rpx);
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
    }
    
    .activity-card {
      margin-bottom: 30rpx;
      background: #fff;
      border-radius: 18rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
      /* 添加过渡效果，使交互更流畅 */
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
      box-sizing: border-box;
      
      /* 点击缩放效果 */
      &:active {
        transform: scale(0.98);
        box-shadow: 0 1rpx 5rpx rgba(0,0,0,0.05);
      }
      
      .activity-poster {
        width: 100%;
        height: 300rpx;
        transition: opacity 0.3s;
      }
      
      .activity-info {
        padding: 24rpx;
        
        .activity-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 16rpx;
        }
        
        .activity-meta {
          display: flex;
          margin-bottom: 20rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #666;
            margin-right: 30rpx;
            
            text {
              margin-left: 8rpx;
            }
          }
        }
        
        .activity-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .status-tag {
            padding: 6rpx 18rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
            font-weight: 500;

            &.enrolling {
              color: #52c41a;
              background: rgba(82, 196, 26, 0.1);
            }

            &.planned {
              color: #b13b7a;
              background: rgba(177, 59, 122, 0.1);
            }

            &.ongoing {
              color: #2979ff;
              background: rgba(41, 121, 255, 0.1);
            }

            &.ended {
              color: #999;
              background: #f5f5f5;
            }

            &.cancelled {
              color: #f44336;
              background: rgba(244, 67, 54, 0.1);
            }
          }
          
          .join-count {
            font-size: 24rpx;
            color: #999;
          }
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
      
      .time-inputs {
        display: flex;
        align-items: center;
        
        .time-picker {
          flex: 1;
          padding: 16rpx 20rpx;
          background: #f9f9f9;
          border-radius: 12rpx;
          font-size: 26rpx;
          color: #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .placeholder {
            color: #999;
          }
        }
        
        .to-text {
          margin: 0 20rpx;
          color: #999;
          font-size: 26rpx;
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
}
</style>