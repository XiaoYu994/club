<template>
  <view class="admin-index pageBg">
    <custom-nav-bar title="系统管理控制台">
    </custom-nav-bar>
    
    <!-- 数据概览 -->
    <view class="data-overview">
      <view class="data-card" @tap="navigateTo('/pages/admin/users')">
        <view class="card-value">{{ statistics.userCount || 0 }}</view>
        <view class="card-title">
          <uni-icons type="person" size="22" color="#2979ff"></uni-icons>
          <text>用户总数</text>
        </view>
      </view>
      <view class="data-card" @tap="navigateTo('/pages/admin/clubs')">
        <view class="card-value">{{ statistics.clubCount || 0 }}</view>
        <view class="card-title">
          <uni-icons type="flag" size="22" color="#2979ff"></uni-icons>
          <text>社团总数</text>
        </view>
      </view>
      <view class="data-card" @tap="navigateTo('/pages/admin/activities')">
        <view class="card-value">{{ statistics.activityCount || 0 }}</view>
        <view class="card-title">
          <uni-icons type="calendar" size="22" color="#2979ff"></uni-icons>
          <text>活动总数</text>
        </view>
      </view>
      <view class="data-card" @tap="navigateTo('/pages/admin/notices')">
        <view class="card-value">{{ statistics.noticeCount || 0 }}</view>
        <view class="card-title">
          <uni-icons type="notification" size="22" color="#2979ff"></uni-icons>
          <text>公告总数</text>
        </view>
      </view>
    </view>
    
    <!-- 管理功能区 -->
    <view class="module-section">
      <view class="section-title">管理功能</view>
      <view class="module-grid">
        <view class="module-item" @tap="navigateTo('/pages/admin/users')">
          <view class="module-icon">
            <uni-icons type="personadd" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">用户管理</text>
        </view>
        <view class="module-item" @tap="navigateTo('/pages/admin/clubs')">
          <view class="module-icon">
            <uni-icons type="flag" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">社团管理</text>
        </view>
        <view class="module-item" @tap="navigateTo('/pages/admin/activities')">
          <view class="module-icon">
            <uni-icons type="calendar" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">活动管理</text>
        </view>
        <view class="module-item" @tap="navigateTo('/pages/admin/notices')">
          <view class="module-icon">
            <uni-icons type="notification" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">公告管理</text>
        </view>
        <view class="module-item" @tap="navigateTo('/pages/admin/recruitment/configs')">
          <view class="module-icon">
            <uni-icons type="paperplane" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">招新配置</text>
        </view>
        <view class="module-item" @tap="navigateTo('/pages/admin/recruitment/audit')">
          <view class="module-icon">
            <uni-icons type="checkmarkempty" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">招新审核</text>
        </view>
      </view>
    </view>
    
    <!-- 管理员设置区 -->
    <view class="module-section">
      <view class="section-title">管理员设置</view>
      <view class="module-grid">
        <!-- 超级管理员才能看到的功能 -->
        <view class="module-item" @tap="navigateTo('/pages/admin/admins')" v-if="isSuper">
          <view class="module-icon">
            <uni-icons type="staff" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">管理员</text>
        </view>
        <!-- 移动过来的修改密码 -->
        <view class="module-item" @tap="navigateTo('/pages/admin/password')">
          <view class="module-icon">
            <uni-icons type="locked" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">修改密码</text>
        </view>
        <!-- 新增退出登录按钮 -->
        <view class="module-item" @tap="confirmLogout">
          <view class="module-icon">
            <uni-icons type="close" size="38" color="#2979ff"></uni-icons>
          </view>
          <text class="module-name">退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- 最近公告 -->
    <view class="notice-section">
      <view class="section-title">最近公告</view>
      <view class="notice-list" v-if="notices.length > 0">
        <view class="notice-card" v-for="(item, index) in notices" :key="index" >
          <view class="notice-title">{{ item.title }}</view>
          <view class="notice-date">{{ formatDate(item.createTime) }}</view>
        </view>
      </view>
      <view class="empty-tip" v-else>
        <text>暂无公告数据</text>
      </view>
    </view>
    <!-- 管理员菜单弹出层 -->
    <uni-popup ref="adminMenuPopup" type="bottom">
      <view class="admin-menu">
        <view class="menu-item" @tap="modifyPassword">
          <uni-icons type="locked" size="20" color="#666"></uni-icons>
          <text>修改密码</text>
        </view>
        <view class="menu-item" @tap="handleLogout">
          <uni-icons type="poweroff" size="20" color="#666"></uni-icons>
          <text>退出登录</text>
        </view>
        <view class="menu-cancel" @tap="closeAdminMenu">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import apiModule from '@/api/api.js';

// 数据统计
const statistics = reactive({
  userCount: 0,
  clubCount: 0,
  activityCount: 0,
  noticeCount: 0
});

// 最近公告
const notices = ref([]);

// 新增
// 判断是否为超级管理员
const isSuper = ref(false);

// 防止重复请求的标志
const isInitialLoadDone = ref(false);

// 弹出层引用
const adminMenuPopup = ref(null);

/**
 * @description 获取统计数据
 */
const loadStatistics = async () => {
  try {
    const response = await apiModule.admin.getStatistics();
    if (response.code === 200) {
      Object.assign(statistics, response.data);
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

/**
 * @description 获取最近公告
 */
const loadRecentNotices = async () => {
  try {
    const response = await apiModule.admin.getRecentNotices();
    if (response.code === 200) {
      notices.value = response.data || [];
    }
  } catch (error) {
    console.error('获取最近公告失败:', error);
  }
};

/**
 * @description 页面导航
 */
const navigateTo = (url) => {
  uni.navigateTo({ url });
};


/**
 * @description 显示管理员菜单
 */
const showAdminMenu = () => {
  adminMenuPopup.value.open();
};

/**
 * @description 关闭管理员菜单
 */
const closeAdminMenu = () => {
  adminMenuPopup.value.close();
};

/**
 * @description 修改密码
 */
const modifyPassword = () => {
  closeAdminMenu();
  navigateTo('/pages/admin/password');
};

/**
 * @description 管理员退出登录
 */
const confirmLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出登录？',
    success: function(res) {
      if (res.confirm) {
        // 清除管理员登录信息
        uni.removeStorageSync('adminToken');
        uni.removeStorageSync('adminInfo');
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/admin/login'
        });
      }
    }
  });
};

/**
 * @description 格式化日期
 */
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  // 确保时间戳是数字类型
  const time = parseInt(timestamp);
  if (isNaN(time)) return '';
  
  const d = new Date(time);
  
  // 检查日期对象是否有效
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 页面加载
onMounted(() => {
  // 检查管理员是否已登录
  const token = uni.getStorageSync('adminToken');
  if (!token) {
    uni.reLaunch({
      url: '/pages/admin/login'
    });
    return;
  }
  
  // 检查是否为超级管理员
  const adminInfo = uni.getStorageSync('adminInfo');
  if (adminInfo && adminInfo.type === 1) {
    isSuper.value = true;
  }
  
  loadStatistics();
  loadRecentNotices();
  isInitialLoadDone.value = true;
});

// 每次显示页面时刷新数据
onShow(() => {
  // 如果初次加载已完成，才执行刷新，避免重复请求
  if (isInitialLoadDone.value) {
    loadStatistics();
    loadRecentNotices();
  }
});
</script>

<style lang="scss" scoped>
.admin-index {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
  position: relative;
}

.admin-avatar-btn {
  display: flex;
  align-items: center;
  margin-right: 8rpx;
  .admin-avatar {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    box-shadow: 0 2rpx 8rpx rgba(41,121,255,0.08);
    border: 2rpx solid #fff;
  }
}

.data-overview {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 40rpx 24rpx 0 24rpx;
  gap: 32rpx 0;
  .data-card {
    width: 48%;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 24rpx rgba(41,121,255,0.08);
    padding: 38rpx 0 32rpx 0;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: box-shadow 0.2s;
    &:active {
      box-shadow: 0 8rpx 32rpx rgba(41,121,255,0.18);
    }
    .card-value {
      font-size: 54rpx;
      font-weight: 700;
      color: #2979ff;
      margin-bottom: 12rpx;
    }
    .card-title {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 28rpx;
      text {
        margin-left: 10rpx;
      }
    }
  }
}

.module-section {
  margin: 48rpx 24rpx 0 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 36rpx 0 24rpx 0;
  box-shadow: 0 4rpx 24rpx rgba(41,121,255,0.08);
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #2979ff;
    margin-bottom: 32rpx;
    padding-left: 32rpx;
    border-left: 6rpx solid #2979ff;
  }
  .module-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
    .module-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      .module-icon {
        width: 104rpx;
        height: 104rpx;
        background: linear-gradient(135deg, #e3f0ff 0%, #f5faff 100%);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 12rpx;
        box-shadow: 0 2rpx 12rpx rgba(41,121,255,0.08);
      }
      .module-name {
        font-size: 28rpx;
        color: #222;
        font-weight: 600;
      }
    }
  }
}

.notice-section {
  margin: 48rpx 24rpx 0 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 36rpx 24rpx 24rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(41,121,255,0.08);
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #2979ff;
    margin-bottom: 32rpx;
    padding-left: 32rpx;
    border-left: 6rpx solid #2979ff;
  }
  .notice-list {
    .notice-card {
      background: #f8faff;
      border-radius: 16rpx;
      padding: 28rpx 24rpx;
      margin-bottom: 18rpx;
      box-shadow: 0 2rpx 8rpx rgba(41,121,255,0.04);
      .notice-title {
        font-size: 28rpx;
        color: #222;
        font-weight: 600;
        margin-bottom: 8rpx;
      }
      .notice-date {
        font-size: 22rpx;
        color: #aaa;
      }
    }
  }
  .empty-tip {
    padding: 40rpx 0;
    text-align: center;
    color: #bbb;
    font-size: 26rpx;
  }
}

.admin-menu {
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
    text {
      margin-left: 20rpx;
      font-size: 28rpx;
      color: #333;
    }
    &.logout text {
      color: #dd524d;
    }
  }
  .menu-cancel {
    padding: 30rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    background-color: #f5f5f5;
  }
}
</style> 