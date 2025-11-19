<template>
  <view class="my-clubs">
    <custom-nav-bar title="我的社团" :showBack="true" @backClick="goBack" />
    <scroll-view
      scroll-y
      class="club-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshClubs"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <view
          v-for="(club, idx) in clubList"
          :key="idx"
          class="club-card"
          @tap="goToDetail(club)"
        >
          <image
            class="club-logo"
            :src="club.logo || '/static/images/default-club.png'"
            mode="aspectFill"
          />
          <view class="club-info">
            <view class="club-name">{{ club.name }}</view>
            <view class="club-desc" v-if="club.description">{{ club.description }}</view>
            <view class="club-meta">
              <view class="meta-item" v-if="club.memberCount !== undefined">
                <uni-icons type="person" size="14" color="#999" />
                <text class="meta-text">{{ club.memberCount }}人</text>
              </view>
              <view class="meta-item" v-if="club.category">
                <uni-icons type="flag" size="14" color="#999" />
                <text class="meta-text">{{ club.category }}</text>
              </view>
            </view>
          </view>
          <view class="club-status">
            <text :class="['status-badge', getMemberStatusClass(club.memberStatus)]">
              {{ getMemberStatusText(club.memberStatus) }}
            </text>
          </view>
        </view>
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text>加载中...</text>
        </view>
        <view v-if="clubList.length === 0 && !isLoading" class="empty-data">
          <uni-icons type="home" size="80" color="#ddd" />
          <text class="empty-text">暂未加入社团</text>
          <text class="empty-hint">快去发现感兴趣的社团吧~</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const clubList = ref([])
const page = ref(1)
const pageSize = ref(9999)  // 临时调整为大分页，拉取所有社团以展示所有已加入社团
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)

const loadClubs = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    console.log('[我的社团] 开始加载社团列表...');
    const res = await proxy.$api.club.getMyClubs();
    console.log('[我的社团] API响应:', res);

    if (res.code === 200) {
      let list = res.data || [];
      console.log('[我的社团] 获取到社团数:', list.length);

      // 并行获取每个社团的申请状态
      list = await Promise.all(
        list.map(async (c) => {
          try {
            const statusRes = await proxy.$api.club.checkApplyStatus(c.id);
            c.memberStatus = statusRes.code === 200 && statusRes.data ? statusRes.data.status : 0;
            return c;
          } catch (err) {
            console.warn(`[我的社团] 获取社团状态失败 clubId=${c.id}`, err);
            c.memberStatus = 0;
            return c;
          }
        })
      );

      clubList.value = list;
      console.log('[我的社团] 最终社团列表:', list);
    } else {
      console.error('[我的社团] API返回错误码:', res.code, res.msg);
      uni.showToast({
        title: res.msg || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('[我的社团] 加载社团列表异常:', error);
    clubList.value = [];
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    refreshing.value = false;
  }
};

// 获取会员状态文本
const getMemberStatusText = (status) => {
  switch (status) {
    case 0: return '未通过';
    case 1: return '已入社';
    case 2: return '退社申请中';
    default: return '未知';
  }
};

// 获取会员状态样式类
const getMemberStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-rejected';
    case 1: return 'status-active';
    case 2: return 'status-pending';
    default: return 'status-unknown';
  }
};

const refreshClubs = () => {
  refreshing.value = true
  page.value = 1
  loadClubs()
}

const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadClubs()
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goToDetail = (club) => {
  uni.navigateTo({ url: `/pages/club/detail?id=${club.id}` })
}

onMounted(() => {
  loadClubs()
})
</script>

<style lang="scss" scoped>
.my-clubs {
  height: 100vh;
  background: #f5f5f5;
}

.club-list {
  height: calc(100vh - 88rpx);
}

.list-container {
  padding: 20rpx;
}

.club-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

.club-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 24rpx;
  background: #f0f0f0;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.club-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-right: 20rpx;
}

.club-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 44rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.club-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 36rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.club-meta {
  display: flex;
  gap: 20rpx;
  margin-top: 4rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #999;
  line-height: 28rpx;
}

.club-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;

  &.status-active {
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  }

  &.status-pending {
    background: linear-gradient(135deg, #FAAD14 0%, #D48806 100%);
  }

  &.status-rejected {
    background: linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%);
  }

  &.status-unknown {
    background: linear-gradient(135deg, #D9D9D9 0%, #8C8C8C 100%);
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-top: 24rpx;
  font-weight: 500;
}

.empty-hint {
  font-size: 26rpx;
  color: #bbb;
  margin-top: 12rpx;
}
</style>