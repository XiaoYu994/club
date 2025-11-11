<template>
  <view class="club-container pageBg">
    <!-- 顶部导航 -->
    <custom-nav-bar title="十佳社团" :showBack="true" @backClick="goBack"></custom-nav-bar>
    <!-- 十佳社团列表 -->
    <scroll-view scroll-y class="club-list" :show-scrollbar="false">
      <view class="list-container">
        <view
          v-for="(item, idx) in clubList"
          :key="idx"
          class="club-card"
          @tap="goToDetail(item)"
        >
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
              <view class="meta-item">
                <uni-icons type="location" size="14" color="#666"></uni-icons>
                <text>{{ item.address || '暂无地址' }}</text>
              </view>
            </view>
            <view class="club-stats">
              <view class="view-count">
                <uni-icons type="eye" size="14" color="#999"></uni-icons>
                <text>{{ item.viewCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import CustomNavBar from '@/components/custom-nav-bar/custom-nav-bar.vue'
const { proxy } = getCurrentInstance()

// 列表数据
const clubList = ref([])

// 获取十佳社团
const loadTopTen = async () => {
  try {
    // 重用社团列表接口，取前10条，按order_num升序
    const params = { pageNo: 1, pageSize: 10, orderBy: 'order_num', isAsc: true }
    const res = await proxy.$api.club.getClubList(params)
    if (res.code === 200) {
      clubList.value = res.data.list || []
    } else {
      uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
    }
  } catch (error) {
    console.error('获取十佳社团失败', error)
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  }
}

// 跳转到社团详情
const goToDetail = (item) => {
  uni.navigateTo({ url: `/pages/club/detail?id=${item.id}` })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 类型文本
const getTypeText = (type) => {
  switch (type) {
    case 0: return '普通社团'
    case 1: return '院级社团'
    case 2: return '校级社团'
    default: return '未知类型'
  }
}
// 类型样式
const getTypeClass = (type) => {
  switch (type) {
    case 0: return 'normal'
    case 1: return 'college'
    case 2: return 'school'
    default: return ''
  }
}

onMounted(() => {
  loadTopTen()
})
</script>

<style lang="scss" scoped>
.club-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.club-list {
  flex: 1;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  /* 隐藏滚动条 */
  &::-webkit-scrollbar { width: 0; display: none; }
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.list-container {
  padding-bottom: 40rpx;
}
.club-card {
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
}
.club-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  flex-shrink: 0;
  margin-right: 24rpx;
  object-fit: cover;
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .club-type-tag {
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 20rpx;
      &.normal { color: #666; background: #f5f5f5; }
      &.college { color: #2979ff; background: rgba(41,121,255,0.1); }
      &.school { color: #b13b7a; background: rgba(177,59,122,0.1); }
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
      text { margin-left: 8rpx; }
    }
  }
  .club-stats {
    display: flex;
    .view-count {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #999;
      text { margin-left: 8rpx; }
    }
  }
}
</style> 