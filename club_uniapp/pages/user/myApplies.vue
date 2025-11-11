<template>
  <view class="my-applies">
    <custom-nav-bar title="我的申请" :showBack="true" @backClick="goBack" />
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
        <view
          v-for="(item, idx) in applyList"
          :key="idx"
          class="apply-card"
          @tap="goToDetail(item.clubId)"
        >
          <view class="apply-header">
            <view class="club-info">
              <image 
                v-if="item.clubLogo" 
                :src="item.clubLogo" 
                class="club-logo"
                mode="aspectFill"
              />
              <view class="club-text">
                <view class="club-name">{{ item.clubName }}</view>
                <view v-if="item.recruitmentTitle" class="recruitment-title">{{ item.recruitmentTitle }}</view>
              </view>
            </view>
            <text :class="['apply-status', 'status-' + item.status]">{{ getStatusText(item.status) }}</text>
          </view>
          
          <view class="apply-details">
            <view class="detail-item">
              <text class="label">申请时间：</text>
              <text class="value">{{ formatTime(Number.parseInt(item.createTime)) }}</text>
            </view>
            <view v-if="item.feedback" class="detail-item">
              <text class="label">反馈意见：</text>
              <text class="value">{{ item.feedback }}</text>
            </view>
          </view>
        </view>
        
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text>加载中...</text>
        </view>
        <view v-if="applyList.length === 0 && !isLoading" class="empty-data">
          <text>暂无申请记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'
import { formatTime } from '@/utils/common.js';
const { proxy } = getCurrentInstance()

const applyList = ref([])
const isLoading = ref(false)
const refreshing = ref(false)

const loadApplies = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    // 获取用户真正的社团申请记录
    const res = await proxy.$api.club.getMyClubApplies();
    console.log('申请数据:', res); // 调试信息
    if (res.code === 200) {
      applyList.value = res.data || [];
      console.log('申请列表:', applyList.value); // 调试信息
    } else {
      console.error('获取申请记录失败：', res.message);
      applyList.value = [];
      uni.showToast({
        title: res.message || '获取申请记录失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载我的申请失败', error);
    applyList.value = [];
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    refreshing.value = false;
  }
};

const refreshApplies = () => {
  refreshing.value = true
  loadApplies()
}

const loadMore = () => {
  // 暂不分页
}

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

const goBack = () => {
  uni.navigateBack()
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/club/detail?id=${id}` })
}

onMounted(() => {
  loadApplies()
})
</script>

<style lang="scss" scoped>
.apply-card {
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.apply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.club-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.club-logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.club-text {
  flex: 1;
}

.club-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.recruitment-title {
  font-size: 26rpx;
  color: #666;
}

.apply-status {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}

.status-0 { background-color: #909399; }
.status-1 { background-color: #67C23A; }
.status-2 { background-color: #F56C6C; }
.status-3 { background-color: #E6A23C; }
.status-4 { background-color: #409EFF; }

.apply-details {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 8rpx;
  font-size: 26rpx;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  min-width: 140rpx;
}

.value {
  color: #333;
  flex: 1;
}

.loading-more,
.empty-data {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}
</style>