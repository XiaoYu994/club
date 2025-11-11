<template>
  <view class="my-activities">
    <custom-nav-bar title="我的活动" :showBack="true" @backClick="goBack" />
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
        <view
          v-for="(act, idx) in activityList"
          :key="idx"
          class="activity-card"
          @tap="goToDetail(act)"
        >
          <image
            class="activity-cover"
            :src="act.poster || '/static/images/default-activity.png'"
            mode="aspectFill"
          />
          <view class="activity-info">
            <view class="activity-name">{{ act.title }}</view>
            <view class="status-tags">
              <text class="status-tag">{{ getApplyStatusText(act.status) }}</text>
              <text class="status-tag">{{ getCheckInStatusText(act.checkInStatus) }}</text>
            </view>
          </view>
        </view>
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text>加载中...</text>
        </view>
        <view v-if="activityList.length === 0 && !isLoading" class="empty-data">
          <text>暂无活动</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const activityList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)

// 加载当前用户报名的活动列表
const loadActivities = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const res = await proxy.$api.activity.getMyActivities();
    if (res.code === 200) {
      const applies = res.data || [];
      // 并行获取活动详情
      const enriched = await Promise.all(
        applies.map(async (apply) => {
          const detailRes = await proxy.$api.activity.getActivityDetail(apply.activityId);
          if (detailRes.code === 200) {
            apply.poster = detailRes.data.poster;
            apply.title = detailRes.data.title;
          }
          return apply;
        })
      );
      activityList.value = enriched;
    }
  } catch (error) {
    console.error('加载我的活动失败', error);
  } finally {
    isLoading.value = false;
    refreshing.value = false;
  }
};

// 获取报名状态文本
const getApplyStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 获取签到状态文本
const getCheckInStatusText = (status) => {
  switch (status) {
    case 0: return '未签到';
    case 1: return '已签到';
    default: return '未知';
  }
};

const refreshActivities = () => {
  refreshing.value = true
  page.value = 1
  loadActivities()
}

const loadMore = () => {
  if (hasMore.value && !isLoading.value) loadActivities()
}

const goBack = () => {
  uni.navigateBack()
}

const goToDetail = (act) => {
  uni.navigateTo({ url: `/pages/activity/activityDeatil?id=${act.activityId}` })
}

onMounted(() => {
  loadActivities()
})
</script>

<style lang="scss" scoped>
.activity-card {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  background: #fff;
}
.activity-cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  background: #fff;
}
.activity-name {
  font-size: 30rpx;
  color: #333;
  line-height: 80rpx;
}
.loading-more,
.empty-data {
  text-align: center;
  padding: 30rpx;
}
.status-tags {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
}
.status-tag {
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #fff;
  background: #409EFF;
}
</style>