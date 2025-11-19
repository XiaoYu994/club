<template>
  <view class="notification-container pageBg">
    <!-- 顶部导航栏 -->
    <custom-nav-bar title="消息通知" background="#fff" title-color="#333">
      <template #left>
        <view class="nav-actions">
          <text v-if="unreadCount > 0" class="read-all-btn" @tap="handleMarkAllRead">全部已读</text>
        </view>
      </template>
    </custom-nav-bar>

    <!-- 消息通知列表 -->
    <scroll-view
      scroll-y
      class="scroll-panel"
      @scrolltolower="loadMore"
      lower-threshold="100"
    >
      <view class="notification-list">
        <view
          v-for="(notification, idx) in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': notification.isRead === 0 }"
          @tap="handleNotificationClick(notification)"
        >
          <!-- 未读标记 -->
          <view v-if="notification.isRead === 0" class="unread-dot"></view>

          <!-- 通知图标 -->
          <view class="notification-icon" :class="getTypeClass(notification.type)">
            <uni-icons :type="getTypeIcon(notification.type)" size="24" color="#fff"></uni-icons>
          </view>

          <!-- 通知内容 -->
          <view class="notification-content">
            <view class="notification-title">{{ notification.title }}</view>
            <view class="notification-message">{{ notification.message }}</view>
            <view class="notification-time">{{ formatTime(notification.createTime) }}</view>
          </view>

          <!-- 删除按钮 -->
          <view class="notification-actions" @tap.stop="handleDelete(notification)">
            <uni-icons type="trash" size="18" color="#999"></uni-icons>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>

        <!-- 没有更多 -->
        <view v-if="noMore && notifications.length > 0" class="no-more">
          <text>没有更多消息了</text>
        </view>

        <!-- 空状态 -->
        <view v-if="notifications.length === 0 && !loading" class="empty-data">
          <image class="empty-image" src="/static/img/empty-notification.png" mode="aspectFit"></image>
          <text class="empty-text">暂无消息通知</text>
          <text class="empty-tip">您的活动通知将在这里显示</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const { proxy } = getCurrentInstance();

// 消息通知数据
const notifications = ref([]);
const loading = ref(false);
const unreadCount = ref(0);
const page = ref(1);
const pageSize = ref(20);
const noMore = ref(false);

// 加载消息通知列表
async function loadNotifications(refresh = false) {
  if (loading.value) return;

  if (refresh) {
    page.value = 1;
    noMore.value = false;
    notifications.value = [];
  }

  loading.value = true;
  console.log('【通知】开始加载消息通知，page:', page.value, 'size:', pageSize.value);

  try {
    const response = await proxy.$api.notification.getNotifications({
      page: page.value,
      size: pageSize.value
    });

    console.log('【通知】接口返回:', response);

    if (response.code === 200) {
      const newData = response.data.list || [];
      console.log('【通知】获取到数据条数:', newData.length, '数据:', newData);

      if (refresh) {
        notifications.value = newData;
      } else {
        notifications.value = [...notifications.value, ...newData];
      }

      // 判断是否还有更多数据
      if (newData.length < pageSize.value) {
        noMore.value = true;
      }

      // 更新页码
      if (newData.length > 0) {
        page.value++;
      }
    } else {
      console.error('【通知】接口返回错误:', response.message);
      uni.showToast({ title: response.message || '获取消息失败', icon: 'none' });
    }
  } catch (error) {
    console.error('【通知】获取消息通知失败:', error);
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

// 加载未读数量
async function loadUnreadCount() {
  try {
    const response = await proxy.$api.notification.getUnreadCount();
    if (response.code === 200) {
      unreadCount.value = response.data || 0;
    }
  } catch (error) {
    console.error('获取未读数量失败:', error);
  }
}

// 加载更多
function loadMore() {
  if (!noMore.value && !loading.value) {
    loadNotifications(false);
  }
}

// 点击通知
async function handleNotificationClick(notification) {
  // 标记为已读
  if (notification.isRead === 0) {
    try {
      await proxy.$api.notification.markAsRead(notification.id);
      notification.isRead = 1;
      unreadCount.value = Math.max(0, unreadCount.value - 1);

      // 更新tabBar红点
      updateTabBarBadge();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }

  // 根据通知类型跳转到相应页面
  if (notification.relatedId) {
    const typeToPage = {
      'activity_cancel': `/pages/activity/activityDeatil?id=${notification.relatedId}`,
      'check_in': `/pages/activity/activityDeatil?id=${notification.relatedId}`,
      'apply_approved': `/pages/activity/activityDeatil?id=${notification.relatedId}`,
      'apply_rejected': `/pages/activity/activityDeatil?id=${notification.relatedId}`,
      'activity_reminder': `/pages/activity/activityDeatil?id=${notification.relatedId}`,
      'club_apply_approved': `/pages/club/detail?id=${notification.relatedId}`,
      'club_apply_rejected': `/pages/club/detail?id=${notification.relatedId}`,
      'club_member_removed': `/pages/club/detail?id=${notification.relatedId}`,
      'club_quit_apply': `/pages/club/detail?id=${notification.relatedId}`,
      'club_quit_approved': `/pages/club/detail?id=${notification.relatedId}`,
      'club_quit_rejected': `/pages/club/detail?id=${notification.relatedId}`
    };

    const url = typeToPage[notification.type];
    if (url) {
      uni.navigateTo({ url });
    }
  }
}

// 更新tabBar红点
function updateTabBarBadge() {
  if (unreadCount.value > 0) {
    uni.setTabBarBadge({
      index: 3,
      text: unreadCount.value > 99 ? '99+' : String(unreadCount.value)
    });
  } else {
    uni.removeTabBarBadge({ index: 3 });
  }
}

// 全部标记为已读
function handleMarkAllRead() {
  uni.showModal({
    title: '确认操作',
    content: '确定要将所有消息标记为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          const response = await proxy.$api.notification.markAllAsRead();

          if (response.code === 200) {
            // 更新本地数据
            notifications.value.forEach(item => {
              item.isRead = 1;
            });
            unreadCount.value = 0;

            // 更新tabBar红点
            updateTabBarBadge();

            uni.showToast({ title: '已全部标记为已读', icon: 'success' });
          } else {
            uni.showToast({ title: response.message || '操作失败', icon: 'none' });
          }
        } catch (error) {
          console.error('标记全部已读失败:', error);
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
}

// 删除消息
function handleDelete(notification) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await proxy.$api.notification.deleteNotification(notification.id);

          if (response.code === 200) {
            // 从列表中移除
            const index = notifications.value.findIndex(item => item.id === notification.id);
            if (index !== -1) {
              notifications.value.splice(index, 1);
            }

            // 更新未读数量
            if (notification.isRead === 0) {
              unreadCount.value = Math.max(0, unreadCount.value - 1);
              // 更新tabBar红点
              updateTabBarBadge();
            }

            uni.showToast({ title: '删除成功', icon: 'success' });
          } else {
            uni.showToast({ title: response.message || '删除失败', icon: 'none' });
          }
        } catch (error) {
          console.error('删除消息失败:', error);
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        }
      }
    }
  });
}

// 获取通知类型对应的图标
function getTypeIcon(type) {
  const iconMap = {
    'activity_cancel': 'closeempty',
    'check_in': 'checkmarkempty',
    'apply_approved': 'checkmarkempty',
    'apply_rejected': 'closeempty',
    'activity_reminder': 'calendar',
    'apply_review': 'chatboxes',
    'club_apply_approved': 'checkmarkempty',
    'club_apply_rejected': 'closeempty',
    'club_member_removed': 'closeempty',
    'club_quit_apply': 'info',
    'club_quit_approved': 'checkmarkempty',
    'club_quit_rejected': 'closeempty'
  };
  return iconMap[type] || 'notification';
}

// 获取通知类型对应的样式类
function getTypeClass(type) {
  const classMap = {
    'activity_cancel': 'type-cancel',
    'check_in': 'type-success',
    'apply_approved': 'type-success',
    'apply_rejected': 'type-cancel',
    'activity_reminder': 'type-warning',
    'apply_review': 'type-info',
    'club_apply_approved': 'type-success',
    'club_apply_rejected': 'type-cancel',
    'club_member_removed': 'type-cancel',
    'club_quit_apply': 'type-warning',
    'club_quit_approved': 'type-success',
    'club_quit_rejected': 'type-cancel'
  };
  return classMap[type] || 'type-default';
}

// 时间格式化
function formatTime(timestamp) {
  if (!timestamp) return "";

  // 确保timestamp是数字类型
  const time = typeof timestamp === 'string' ? Number(timestamp) : timestamp;

  if (isNaN(time)) {
    console.error('【通知】时间格式错误:', timestamp);
    return "";
  }

  const date = new Date(time);
  const now = new Date();

  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `今天 ${hours}:${minutes}`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `昨天 ${hours}:${minutes}`;
  }

  // 本周
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${days[date.getDay()]} ${hours}:${minutes}`;
  }

  // 更早
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

onMounted(() => {
  loadNotifications(true);
  loadUnreadCount();
});

onShow(() => {
  loadNotifications(true);
  loadUnreadCount();
});
</script>

<style lang="scss" scoped>
.notification-container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .nav-actions {
    display: flex;
    align-items: center;
    padding-left: 30rpx;

    .read-all-btn {
      font-size: 28rpx;
      color: #2979ff;
      padding: 10rpx 20rpx;
    }
  }

  .scroll-panel {
    flex: 1;
    padding: 20rpx 0;
  }
}

.notification-list {
  padding: 0 30rpx;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &.unread {
    background: linear-gradient(to right, #f0f7ff 0%, #fff 100%);
    border-left: 4rpx solid #2979ff;
  }

  &:active {
    transform: scale(0.98);
    background-color: #f9f9f9;
  }

  .unread-dot {
    position: absolute;
    top: 30rpx;
    left: 10rpx;
    width: 12rpx;
    height: 12rpx;
    background-color: #ff3b30;
    border-radius: 50%;
  }
}

.notification-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.type-cancel {
    background: linear-gradient(135deg, #ff6b6b, #ff8787);
  }

  &.type-success {
    background: linear-gradient(135deg, #51cf66, #69db7c);
  }

  &.type-info {
    background: linear-gradient(135deg, #2979ff, #4dabf7);
  }

  &.type-warning {
    background: linear-gradient(135deg, #ff9800, #ffa726);
  }

  &.type-default {
    background: linear-gradient(135deg, #868e96, #adb5bd);
  }
}

.notification-content {
  flex: 1;
  margin-left: 25rpx;
  overflow: hidden;
}

.notification-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.notification-message {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 24rpx;
  color: #999;
}

.notification-actions {
  padding: 15rpx;
  margin-left: 10rpx;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;

  text {
    margin-left: 15rpx;
  }
}

.no-more {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  text-align: center;

  .empty-image {
    width: 280rpx;
    height: 280rpx;
    opacity: 0.8;
  }

  .empty-text {
    font-size: 32rpx;
    color: #999;
    margin-top: 30rpx;
    font-weight: 500;
  }

  .empty-tip {
    font-size: 26rpx;
    color: #bbb;
    margin-top: 15rpx;
  }
}
</style>
