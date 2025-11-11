<template>
  <view class="message-container pageBg">
    <!-- 顶部导航栏 -->
    <custom-nav-bar title="群聊" background="#fff" title-color="#333"></custom-nav-bar>
    
    <!-- 群聊列表 -->
    <scroll-view scroll-y class="scroll-panel">
      <view class="chat-list">
        <view
          v-for="(chat, idx) in chatGroups"
          :key="idx"
          class="chat-item"
          @tap="enterChatRoom(chat)"
        >
          <image
            class="chat-avatar"
            :src="chat.avatar || '/static/images/group-default.png'"
            mode="aspectFill"
          ></image>
          <view class="chat-info">
            <view class="chat-name">{{ chat.name }}</view>
            <view class="chat-last-msg">{{ chat.lastMessage || '暂无消息' }}</view>
          </view>
          <view class="chat-meta">
            <view class="chat-time">{{ formatTime(chat.lastTime) }}</view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="chatGroups.length === 0" class="empty-data">
          <image class="empty-image" src="/static/img/empty-chat.png" mode="aspectFit"></image>
          <text class="empty-text">暂无聊天会话</text>
          <text class="empty-tip">加入群组或创建新群组开始聊天</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 创建群组按钮 -->
    <view v-if="isAdmin" class="float-btn" @tap="createChatGroup">
      <uni-icons type="plus" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { chatAPI } from '@/api/api.js';
import { getUser } from '@/utils/auth.js';

// 当前用户信息
const userInfo = getUser();
const isAdmin = ref(userInfo ? userInfo.isAdmin : false);

// 聊天群组数据
const chatGroups = ref([]);
const chatLoading = ref(false);

// 加载群组列表
async function loadChatGroups() {
  chatLoading.value = true;
  try {
    const response = await chatAPI.getGroups();
    if (response.code === 200) {
      chatGroups.value = response.data.map(group => ({
        id: group.id,
        name: group.name,
        avatar: group.avatar || '/static/images/group-default.png',
        lastMessage: group.lastMessage || '',
        lastTime: group.lastMessageTime != null ? Number(group.lastMessageTime) : null,
        unread: group.unreadCount || 0
      }));
    } else {
      uni.showToast({ title: response.msg || '获取群组失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取聊天群组数据失败:', error);
  } finally {
    chatLoading.value = false;
  }
}

onMounted(loadChatGroups);
/**
 * @description 页面展示时重新加载群组列表，确保最新消息显示
 */
onShow(loadChatGroups);

// 进入聊天室
const enterChatRoom = (chat) => {
  uni.navigateTo({
    url: `/pages/chat/room?id=${chat.id}&name=${encodeURIComponent(chat.name)}`
  });
};

// 创建群组
const createChatGroup = () => {
  uni.navigateTo({ url: '/pages/chat/create' });
};

// 时间格式化
function formatTime(timestamp) {
  if (!timestamp) return "";
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  }
  
  // 本周
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  
  // 更早
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
</script>

<style lang="scss">

.message-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .scroll-panel {
    flex: 1;
    padding: 20rpx 0;
  }
}

.chat-list {
  padding: 0 30rpx;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    background-color: #f9f9f9;
  }
}

.chat-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background-color: #f0f2f5;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.chat-info {
  flex: 1;
  margin-left: 25rpx;
  overflow: hidden;
}

.chat-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-last-msg {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 120rpx;
}

.chat-time {
  font-size: 24rpx;
  color: #bbb;
  margin-bottom: 15rpx;
}

.unread-badge {
  background-color: #ff3b30;
  color: #fff;
  font-size: 22rpx;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  border-radius: 18rpx;
  text-align: center;
  padding: 0 8rpx;
  box-shadow: 0 4rpx 8rpx rgba(255, 59, 48, 0.2);
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
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

.float-btn {
  position: fixed;
  bottom: 60rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #2979ff, #4dabf7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(41, 121, 255, 0.4);
  z-index: 100;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 15rpx rgba(41, 121, 255, 0.3);
  }
}
</style>