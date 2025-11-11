<template>
  <view class="notice-list-container pageBg">
    <!-- #ifndef MP-TOUTIAO -->
    <custom-nav-bar title="公告"></custom-nav-bar>
    <!-- #endif -->
    <view class="notice-list">
      <view v-if="noticeList.length === 0" class="empty">暂无公告</view>
      <view v-for="item in noticeList" :key="item.id" class="notice-item" :class="{ 'top-notice': item.isTop === 1 }" @click="goDetail(item)">
        <view class="notice-header">
          <view class="title-wrapper">
            <view v-if="item.isTop === 1" class="top-badge">
              <uni-icons type="star" size="14" color="#ff6b35"></uni-icons>
              <text>置顶</text>
            </view>
            <view class="notice-title">{{ item.title }}</view>
          </view>
        </view>
        <view class="notice-meta">
          <text class="notice-time">{{ formatDateTime(item.createTime) }}</text>
          <text v-if="item.publisherName" class="notice-publisher">{{ item.publisherName }}</text>
          <view class="view-count">
            <uni-icons type="eye" size="14" color="#999"></uni-icons>
            <text>{{ item.viewCount || 0 }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomNavBar from '@/components/custom-nav-bar/custom-nav-bar.vue'
import { formatDate } from '@/utils/common.js'
import api from '@/api/api.js'
const noticeList = ref([])

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDate(Number(timestamp))
}

const getNoticeList = async () => {
  try {
    const res = await api.notice.getNoticeList({ pageNo: 1, pageSize: 20, orderBy: 'is_top', isAsc: false })
    if (res.code === 200) {
      noticeList.value = res.data.list || []
    }
  } catch (e) {
    uni.showToast({ title: '获取公告失败', icon: 'none' })
  }
}

const goDetail = (item) => {
  uni.navigateTo({ url: `/pages/notice/detail?id=${item.id}` })
}

onMounted(() => {
  getNoticeList()
})
</script>

<style lang="scss" scoped>
.notice-list-container {
  min-height: 100vh;
  
  .notice-list {
    padding: 20rpx 30rpx;
    
    .empty {
      text-align: center;
      color: #999;
      margin-top: 120rpx;
    }
    
    .notice-item {
      background: #fff;
      border-radius: 12rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
      padding: 20rpx 24rpx;
      margin-bottom: 24rpx;
      
      // 置顶公告样式
      &.top-notice {
        border: 2rpx solid #ff6b35;
        background: linear-gradient(135deg, #fff9f7 0%, #ffffff 100%);
        
        .notice-title {
          color: #ff6b35;
        }
      }
      
      .notice-header {
        .title-wrapper {
          .top-badge {
            display: flex;
            align-items: center;
            margin-bottom: 8rpx;
            
            text {
              margin-left: 6rpx;
              font-size: 24rpx;
              color: #ff6b35;
              font-weight: 500;
            }
          }
        }
      }
      
      .notice-title {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 10rpx;
        line-height: 1.3;
      }
      
      .notice-meta {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;
        
        .notice-time {
          margin-right: 20rpx;
        }
        
        .notice-publisher {
          margin-right: 20rpx;
        }
        
        .view-count {
          margin-left: auto;
          display: flex;
          align-items: center;
          
          uni-icons {
            margin-right: 6rpx;
          }
        }
      }
    }
  }
}
</style>