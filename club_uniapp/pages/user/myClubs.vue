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
            <text class="member-status">{{ getMemberStatusText(club.memberStatus) }}</text>
          </view>
        </view>
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text>加载中...</text>
        </view>
        <view v-if="clubList.length === 0 && !isLoading" class="empty-data">
          <text>暂无社团</text>
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
    const res = await proxy.$api.club.getMyClubs();
    if (res.code === 200) {
      let list = res.data || [];
      // 并行获取每个社团的申请状态
      list = await Promise.all(
        list.map(async (c) => {
          const statusRes = await proxy.$api.club.checkApplyStatus(c.id);
          c.memberStatus = statusRes.code === 200 && statusRes.data ? statusRes.data.status : 0;
          return c;
        })
      );
      clubList.value = list;
    }
  } catch (error) {
    console.error('加载我的社团失败', error);
    clubList.value = [];
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
.club-card {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  background: #fff;
}
.club-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
  background: #fff;	
}
.club-name {
  font-size: 30rpx;
  color: #333;
  line-height: 80rpx;
}
.member-status, .status-tag {
  display: inline-block;
  margin-left: 10rpx;
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #fff;
  background: #409EFF;
}
.loading-more,
.empty-data {
  text-align: center;
  padding: 30rpx;
}
</style>