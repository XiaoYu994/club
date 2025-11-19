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
            <view class="activity-title">{{ act.title || '活动标题加载中...' }}</view>
            <view class="activity-meta">
              <view class="meta-item" v-if="act.startTime">
                <uni-icons type="calendar" size="14" color="#999" />
                <text class="meta-text">{{ formatTime(act.startTime) }}</text>
              </view>
              <view class="meta-item" v-if="act.address">
                <uni-icons type="location" size="14" color="#999" />
                <text class="meta-text">{{ act.address }}</text>
              </view>
            </view>
            <view class="status-tags">
              <text :class="['status-tag', getApplyStatusClass(act.status)]">
                {{ getApplyStatusText(act.status) }}
              </text>
              <text :class="['status-tag', getCheckInStatusClass(act.checkInStatus)]">
                {{ getCheckInStatusText(act.checkInStatus) }}
              </text>
              <text :class="['status-tag', getActivityStatusClass(act.activityStatus)]" v-if="act.activityStatus !== undefined">
                {{ getActivityStatusText(act.activityStatus) }}
              </text>
            </view>
          </view>
        </view>
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text>加载中...</text>
        </view>
        <view v-if="activityList.length === 0 && !isLoading" class="empty-data">
          <uni-icons type="inbox" size="80" color="#ddd" />
          <text class="empty-text">暂无活动记录</text>
          <text class="empty-hint">快去参加活动吧~</text>
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

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  // 判断时间戳是秒级还是毫秒级（秒级小于10000000000）
  const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(ts);

  // 验证日期是否有效
  if (isNaN(date.getTime())) {
    console.warn('[时间格式化] 无效的时间戳:', timestamp);
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

// 加载当前用户报名的活动列表
const loadActivities = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    console.log('[我的活动] 开始加载活动列表...');
    const res = await proxy.$api.activity.getMyActivities();
    console.log('[我的活动] API响应:', res);

    if (res.code === 200) {
      const applies = res.data || [];
      console.log('[我的活动] 获取到报名记录数:', applies.length);

      // 并行获取活动详情，但确保即使失败也能显示基本信息
      const enriched = await Promise.all(
        applies.map(async (apply) => {
          try {
            const detailRes = await proxy.$api.activity.getActivityDetail(apply.activityId);
            if (detailRes.code === 200) {
              const detail = detailRes.data;
              // 合并报名信息和活动详情
              return {
                ...apply,
                poster: detail.poster,
                title: detail.title,
                description: detail.description,
                startTime: detail.startTime,
                endTime: detail.endTime,
                address: detail.address,
                activityStatus: detail.status, // 活动状态（0=取消 1=计划中 2=进行中 3=已结束）
              };
            } else {
              console.warn(`[我的活动] 获取活动详情失败 activityId=${apply.activityId}`, detailRes);
              return apply; // 即使详情加载失败，也返回报名信息
            }
          } catch (err) {
            console.error(`[我的活动] 获取活动详情异常 activityId=${apply.activityId}`, err);
            return apply; // 即使详情加载失败，也返回报名信息
          }
        })
      );

      activityList.value = enriched;
      console.log('[我的活动] 最终活动列表:', enriched);
    } else {
      console.error('[我的活动] API返回错误码:', res.code, res.msg);
      uni.showToast({
        title: res.msg || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('[我的活动] 加载活动列表异常:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
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

// 获取报名状态样式类
const getApplyStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending';
    case 1: return 'status-approved';
    case 2: return 'status-rejected';
    default: return 'status-unknown';
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

// 获取签到状态样式类
const getCheckInStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-not-checked';
    case 1: return 'status-checked';
    default: return 'status-unknown';
  }
};

// 获取活动状态文本
const getActivityStatusText = (status) => {
  switch (status) {
    case 0: return '已取消';
    case 1: return '计划中';
    case 2: return '进行中';
    case 3: return '已结束';
    default: return '';
  }
};

// 获取活动状态样式类
const getActivityStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-cancelled';
    case 1: return 'status-planned';
    case 2: return 'status-ongoing';
    case 3: return 'status-finished';
    default: return 'status-unknown';
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
.my-activities {
  height: 100vh;
  background: #f5f5f5;
}

.activity-list {
  height: calc(100vh - 88rpx);
}

.list-container {
  padding: 20rpx;
}

.activity-card {
  display: flex;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

.activity-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; // 防止flex子元素溢出
}

.activity-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 44rpx;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
  line-height: 32rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;

  &.status-pending {
    background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
  }

  &.status-approved {
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  }

  &.status-rejected {
    background: linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%);
  }

  &.status-not-checked {
    background: linear-gradient(135deg, #FAAD14 0%, #D48806 100%);
  }

  &.status-checked {
    background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  }

  &.status-cancelled {
    background: linear-gradient(135deg, #D9D9D9 0%, #8C8C8C 100%);
  }

  &.status-planned {
    background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%);
  }

  &.status-ongoing {
    background: linear-gradient(135deg, #13C2C2 0%, #08979C 100%);
  }

  &.status-finished {
    background: linear-gradient(135deg, #595959 0%, #262626 100%);
  }

  &.status-unknown {
    background: #D9D9D9;
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