<template>
  <view class="container pageBg">
	  <!-- #ifndef MP-TOUTIAO -->
	  <custom-nav-bar title=""></custom-nav-bar>
	  <!-- #endif -->
	  
    <!-- 顶部Banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">校园社团活动小程序</text>
      </view>
    </view>

    <!-- 功能区九宫格 -->
    <view class="grid">
      <view
        v-for="(item, index) in gridList"
        :key="index"
        class="grid-item"
        @click="onGridClick(index)"
      >
        <image :src="item.icon" class="grid-icon"></image>
        <text class="grid-text">{{ item.text }}</text>
      </view>
    </view>
	
	<!-- 公告通知 -->
	<view class="notice-bar" @click="goNotice">
	  <view class="notice-content">
	    <uni-icons type="sound-filled" size="20"></uni-icons>
	    <text class="notice-text">公告</text>
	    <view class="center">
	      <swiper vertical autoplay interval="1500" duration="300" circular>
	        <swiper-item v-for="(notice, index) in noticeList" :key="index">
	          <text>{{ notice.title }}</text>
	        </swiper-item>
	      </swiper>
	    </view>
	    <view class="notice-arrow">
	      <uni-icons type="right" size="16" color="#333"></uni-icons>
	    </view>
	  </view>
	</view>
	


    <!-- 热门活动 -->
    <view class="section">
      <view class="section-title">
        <view class="dot"></view>
        <text>热门活动</text>
      </view>
      <view class="section-content">
        <!-- 热门活动列表 -->
        <view v-if="hotActivities.length > 0">
          <view v-for="(item, index) in hotActivities" :key="index" @click="goToActivityDetail(item)">
            <view class="activity-card">
              <image class="activity-poster" :src="item.poster || '/static/images/default-poster.png'" mode="aspectFill"></image>
              <view class="activity-info">
                <view class="activity-title">{{ item.title }}</view>
                <view class="activity-meta">
                  <view class="meta-item">
                    <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                    <text>{{ formatDate(new Date(Number(item.startTime))) }}</text>
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
          </view>
          <view class="view-more" @click="goToActivityList">查看更多活动</view>
        </view>
        <text v-else class="empty">暂无热门活动</text>
      </view>
    </view>

    <!-- 推荐社团 -->
    <view class="section">
      <view class="section-title">
		<view class="dot"></view>
        <text>社团推荐</text>
      </view>
      <view class="section-content">
        <!-- 推荐社团列表 -->
        <view v-if="recommendClubs.length > 0">
          <view v-for="(item, index) in recommendClubs" :key="index" @click="goToClubDetail(item)">
            <view class="club-card">
              <image class="club-logo" :src="item.logo || '/static/images/default-club.png'" mode="aspectFill"></image>
              <view class="club-info">
                <view class="club-header">
                  <view class="club-name">{{ item.name }}</view>
                  <view class="club-type-tag" :class="getTypeClass(item.type)">{{ getTypeText(item.type) }}</view>
                </view>
                <view class="club-desc">{{ item.description || '暂无简介' }}</view>
                <view class="club-meta">
                  <view class="meta-item">
                    <uni-icons type="person" size="14" color="#666"></uni-icons>
                    <text>{{ item.memberCount || 0 }}名成员</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="view-more" @click="goToClubList">查看更多社团</view>
        </view>
        <text v-else class="empty">暂无推荐社团</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 九宫格数据
const gridList = [
  { icon: '/static/images/notice.png', text: '公告通知' },
  { icon: '/static/images/map.png', text: '校园导览' },
  { icon: '/static/images/recommend.png', text: '所有社团' },
  { icon: '/static/images/star.png', text: '十佳社团' },
  { icon: '/static/images/join.png', text: '招新报名' },
  { icon: '/static/images/activity.png', text: '社团活动' },
]

// 公告列表数据
const noticeList = ref([])
// 热门活动数据
const hotActivities = ref([])
// 推荐社团数据
const recommendClubs = ref([])

// 页面加载时获取数据
onMounted(() => {
  // 获取公告列表
  getNoticeList()
  // 获取热门活动
  getHotActivities()
  // 获取推荐社团
  getRecommendClubs()
})

// 获取公告列表
const getNoticeList = async () => {
  try {
    const res = await proxy.$api.notice.getNoticeList({ pageNo: 1, pageSize: 5 })
    if (res.code === 200) {
      noticeList.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取公告列表失败', error)
  }
}

// 获取热门活动
const getHotActivities = async () => {
  try {
    const res = await proxy.$api.activity.getActivityList({ 
      pageNo: 1, 
      pageSize: 3,
      orderBy: 'join_count',
      isAsc: false // 按参与人数降序排列
    })
    if (res.code === 200) {
      hotActivities.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取热门活动失败', error)
  }
}

// 获取推荐社团
const getRecommendClubs = async () => {
  try {
    const res = await proxy.$api.club.getClubList({ 
      pageNo: 1, 
      pageSize: 3,
      orderBy: 'view_count',
      isAsc: false // 按浏览量降序排列
    })
    if (res.code === 200) {
      recommendClubs.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取推荐社团失败', error)
  }
}

// 九宫格点击事件
const onGridClick = (index) => {
  switch(index) {
    case 0: // 公告通知
      uni.navigateTo({ url: '/pages/notice/notice' })
      break
    case 1: // 校园导览
      uni.navigateTo({ url: '/pages/map/map' })
      break
    case 2: // 所有社团
      uni.navigateTo({ url: '/pages/club/club' })
      break
    case 3: // 十佳社团
      uni.navigateTo({ url: '/pages/club/topTen' })
      break
    case 4: // 招新报名
      uni.navigateTo({ url: '/pages/club/recruitment' })
      break
    case 5: // 社团活动
      uni.switchTab({ url: '/pages/activity/activity' })
      break
    default:
      uni.showToast({
        title: `点击了：${gridList[index].text}`,
        icon: 'none'
      })
  }
}

// 公告点击事件
const goNotice = () => {
  uni.navigateTo({ url: '/pages/notice/notice' })
}

// 跳转到活动详情页
const goToActivityDetail = (item) => {
  try {
    // 确保时间戳是数字类型
    const processedItem = {
      ...item,
      startTime: Number(item.startTime),
      endTime: Number(item.endTime)
    }
    
    // 将活动数据转为 JSON 字符串传递
    const itemData = encodeURIComponent(JSON.stringify(processedItem))
    
    // 通过url携带数据
    uni.navigateTo({
      url: `/pages/activity/activityDeatil?id=${item.id}&itemData=${itemData}`
    })
  } catch (error) {
    console.error('跳转详情页出错', error)
    // 如果数据处理出错，只传递ID
    uni.navigateTo({
      url: `/pages/activity/activityDeatil?id=${item.id}`
    })
  }
}

// 跳转到社团详情页
const goToClubDetail = (item) => {
  uni.navigateTo({
    url: `/pages/club/detail?id=${item.id}`
  })
}

// 跳转到活动列表页
const goToActivityList = () => {
  uni.switchTab({ url: '/pages/activity/activity' })
}

// 跳转到社团列表页
const goToClubList = () => {
  uni.navigateTo({ url: '/pages/club/club' })
}

// 获取活动实际状态
const getActualStatus = (activity) => {
  if (!activity) return -1
  
  const now = Date.now()
  const startTime = Number(activity.startTime || 0)
  const endTime = Number(activity.endTime || 0)
  
  if (activity.status === 0) {
    return 0 // 已取消
  } else if (now > endTime) {
    return 3 // 已结束
  } else if (now > startTime && now < endTime) {
    return 2 // 进行中
  } else {
    return 1 // 报名中
  }
}

// 获取活动状态文本
const getStatusText = (activity) => {
  const actualStatus = getActualStatus(activity)
  switch (actualStatus) {
    case 0: return '已取消'
    case 1: return '报名中'
    case 2: return '进行中'
    case 3: return '已结束'
    default: return '未知'
  }
}

// 获取活动状态类名
const getStatusClass = (activity) => {
  const actualStatus = getActualStatus(activity)
  switch (actualStatus) {
    case 0: return 'cancelled'
    case 1: return 'planned'
    case 2: return 'ongoing'
    case 3: return 'ended'
    default: return ''
  }
}

// 获取社团类型文本
const getTypeText = (type) => {
  switch (type) {
    case 0: return '普通社团'
    case 1: return '院级社团'
    case 2: return '校级社团'
    default: return '未知类型'
  }
}

// 获取社团类型样式类
const getTypeClass = (type) => {
  switch (type) {
    case 0: return 'normal'
    case 1: return 'college'
    case 2: return 'school'
    default: return ''
  }
}
</script>

<style lang="scss" scoped>
.container{
	  padding-bottom: 40rpx; // 保证底部有留白
	  min-height: calc(100vh - 180rpx - 40rpx); // 避免内容区刚好撑满
	.banner {
	  position: relative;
	  height: 350rpx;
	  overflow: hidden;
	  .banner-bg {
	    width: 100%;
	    height: 100%;
	    position: absolute;
	    left: 0; top: 0;
	    z-index: 1;
	  }
	  .banner-content {
	    position: relative;
	    z-index: 2;
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	    justify-content: center;
	    height: 100%;
	    .banner-title {
	      color: $text-color-primary;
	      font-size: 40rpx;
	      font-weight: bold;
	      margin-bottom: 20rpx;
	    }
	    .banner-people {
	      width: 300rpx;
	      margin-top: 10rpx;
	    }
	  }
	}
	.grid {
	  margin: -60rpx 20rpx 20rpx 20rpx;
	  border-radius: 30rpx;
	  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
	  display: flex;
	  flex-wrap: wrap;
	  padding: 30rpx 0;
	  position: relative;
	  .grid-item {
	    width: 25%;
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	    margin-bottom: 30rpx;
	    .grid-icon {
	      width: 60rpx;
	      height: 60rpx;
	      margin-bottom: 10rpx;
	    }
	    .grid-text {
	      font-size: 24rpx;
	      color: $text-color-secondary;
	    }
	  }
	}
	.notice-bar {
	  margin: 0 20rpx 20rpx 20rpx; // 与九宫格左右对齐，底部留间距
	  background: $bg-color-light;
	  border-radius: 32rpx;
	  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	  padding: 0; // 外层不需要内边距
	  display: flex;
	  align-items: center;
	  min-height: 100rpx;
	  .notice-content {
	    width: 100%;
	    // background: #f7f8fa;
	    border-radius: 32rpx;
	    display: flex;
		line-height: 80rpx;
	    align-items: center;
	    padding: 0 32rpx;
	    height: 80rpx;
	    cursor: pointer;
		:deep(){
			.uni-icons{
				color:$success-color !important;
			}
		}	
	    .notice-icon {
	      width: 36rpx;
	      height: 36rpx;
	      margin-right: 12rpx;
	    }
	    .notice-text {
	      color: $success-color;
	      font-weight: bold;
	      font-size: 30rpx;
		  // 公告内容和公告之间的距离
	       margin-right: 20rpx;
	    }
		.center {
		  flex: 1;
		  height: 100%;
		  // 不要加display: flex; align-items: center;
		  swiper {
		    height: 100%;
		    .swiper-item {
		      height: 100%;
		      font-size: 30rpx;
		      color: #222;
		      overflow: hidden;
		      white-space: nowrap;
		      text-overflow: ellipsis;
		    }
		  }
		}
		.notice-arrow {
	      margin-left: auto;
	      color: $text-color-primary;
	      font-size: 36rpx;
	      .uni-icons {
	        font-family: 'uniicons';
	      }
	    }
	  }
	}
	
	.section {
	  background: $bg-color-light;
	  margin: 20rpx;
	  border-radius: 20rpx;
	  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	  padding: 20rpx;
	  .section-title {
	    display: flex;
	    align-items: center;
	    font-weight: bold;
	    font-size: 30rpx;
	    margin-bottom: 10rpx;
	    .dot {
	      width: 8rpx;
	      height: 28rpx;
	      background: $info-color;
	      border-radius: 4rpx;
	      margin-right: 12rpx;
	    }
	  }
	  .section-content {
	    min-height: 60rpx;
	    .empty {
	      color: $text-color-secondary;
	      font-size: 24rpx;
	    }
	  }
	}
}

/* 修改活动卡片样式为横向布局 */
.activity-card {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  display: flex; /* 改为flex布局 */
  padding: 24rpx; /* 添加内边距 */
  
  .activity-poster {
    width: 160rpx; /* 调整宽度 */
    height: 120rpx; /* 调整高度 */
    border-radius: 8rpx; /* 添加圆角 */
    flex-shrink: 0; /* 防止图片被压缩 */
    margin-right: 24rpx; /* 添加右边距 */
  }
  
  .activity-info {
    flex: 1; /* 占据剩余空间 */
    overflow: hidden; /* 防止内容溢出 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直排列 */
    justify-content: space-between; /* 均匀分布 */
    
    .activity-title {
      font-size: 28rpx; /* 减小字体大小 */
      font-weight: 600;
      color: #333;
      margin-bottom: 10rpx;
      white-space: nowrap; /* 单行显示 */
      overflow: hidden;
      text-overflow: ellipsis; /* 超出显示省略号 */
    }
    
    .activity-meta {
      display: flex;
      flex-direction: column; /* 改为垂直排列 */
      margin-bottom: 10rpx;
      
      .meta-item {
        display: flex;
        align-items: center;
        font-size: 22rpx; /* 减小字体大小 */
        color: #666;
        margin-bottom: 6rpx; /* 添加底部间距 */
        
        text {
          margin-left: 8rpx;
          white-space: nowrap; /* 单行显示 */
          overflow: hidden;
          text-overflow: ellipsis; /* 超出显示省略号 */
          max-width: 85%; /* 限制最大宽度 */
        }
      }
    }
    
    .activity-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .status-tag {
        padding: 2rpx 12rpx; /* 减小内边距 */
        border-radius: 20rpx;
        font-size: 20rpx; /* 减小字体大小 */
        
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
        font-size: 20rpx; /* 减小字体大小 */
        color: #999;
      }
    }
  }
}

/* 添加社团卡片样式 */
.club-card {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  display: flex;
  padding: 24rpx;
  
  .club-logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    flex-shrink: 0;
    margin-right: 24rpx;
    border: 1px solid #f0f0f0;
  }
  
  .club-info {
    flex: 1;
    overflow: hidden;
    
    .club-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .club-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .club-type-tag {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
        margin-left: 12rpx;
        flex-shrink: 0;
        
        &.normal {
          color: #666;
          background: #f5f5f5;
        }
        
        &.college {
          color: #2979ff;
          background: rgba(41, 121, 255, 0.1);
        }
        
        &.school {
          color: #b13b7a;
          background: rgba(177, 59, 122, 0.1);
        }
      }
    }
    
    .club-desc {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }
    
    .club-meta {
      display: flex;
      flex-wrap: wrap;
      
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
  }
}

/* 添加查看更多按钮样式 */
.view-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #b13b7a;
}
</style>