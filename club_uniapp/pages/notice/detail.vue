<template>
  <view class="notice-detail-container pageBg">
    <CustomNavBar title="公告详情" backButton />
    <view v-if="!notice" class="empty">公告不存在或已删除</view>
    <view v-else class="notice-detail">
      <view class="notice-title">{{ notice.title }}</view>
      <view class="notice-meta">
        <text class="notice-time">{{ formatDateTime(notice.createTime) }}</text>
        <text v-if="notice.publisherName" class="notice-publisher">{{ notice.publisherName }}</text>
        <view class="view-count">
          <uni-icons type="eye" size="14" color="#999"></uni-icons>
          <text>{{ notice.viewCount || 0 }}</text>
        </view>
      </view>
      
      <image 
        v-if="notice.coverImage" 
        class="cover-image" 
        :src="notice.coverImage" 
        mode="widthFix" 
        @click="previewImage(notice.coverImage)"
      ></image>
      
      <rich-text v-if="notice && notice.content" :nodes="notice.content" class="notice-content"></rich-text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomNavBar from '@/components/custom-nav-bar/custom-nav-bar.vue'
import { formatDate } from '@/utils/common.js'
import api from '@/api/api.js'
const notice = ref(null)

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDate(Number(timestamp))
}

const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

const getNoticeDetail = async (id) => {
  try {
    const res = await api.notice.getNoticeDetail(id)
    if (res.code === 200) {
      notice.value = res.data
    }
  } catch (e) {
    uni.showToast({ title: '获取公告详情失败', icon: 'none' })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  let id = null
  if (current.options && current.options.id) id = current.options.id
  else if (current.$route && current.$route.query.id) id = current.$route.query.id
  if (id) getNoticeDetail(id)
})
</script>

<style lang="scss" scoped>
.notice-detail-container {
  min-height: 100vh;
  .notice-detail {
    background: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
    padding: 40rpx 30rpx 30rpx 30rpx;
    margin: 30rpx;
    .notice-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #2979ff;
      margin-bottom: 18rpx;
    }
    .notice-meta {
      display: flex;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 24rpx;
      align-items: center;
      
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
    
    .cover-image {
      width: 100%;
      border-radius: 8rpx;
      margin-bottom: 24rpx;
    }
    
    .notice-content {
      font-size: 30rpx;
      color: #333;
      line-height: 1.8;
      margin-top: 10rpx;
      word-break: break-all;
    }
  }
  .empty {
    text-align: center;
    color: #999;
    margin-top: 120rpx;
  }
}
</style>