<template>
  <view class="admin-notices pageBg">
    <custom-nav-bar title="公告管理" />
    
    <!-- 搜索区 -->
    <view class="search-box">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchParams.keyword" 
          placeholder="搜索公告标题" 
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
      <view class="search-btn" @tap="handleSearch">搜索</view>
    </view>
    
    <!-- 公告列表 -->
    <scroll-view 
      class="notice-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-triggered="refresherTriggered"
      refresher-enabled
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading && page === 1" class="loading-box">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      
      <template v-else>
        <view class="notice-item" v-for="item in noticeList" :key="item.id" :class="{ 'top-notice': item.isTop === 1 }">
          <view class="notice-header">
            <view class="title-section">
              <view class="title-wrapper">
                <view v-if="item.isTop === 1" class="top-badge">
                  <uni-icons type="star" size="14" color="#ff6b35"></uni-icons>
                  <text>置顶</text>
                </view>
                <text class="notice-title">{{ item.title }}</text>
              </view>
            </view>
            <view class="action-buttons">
              <button 
                class="action-btn top-btn" 
                :class="{ 'is-top': item.isTop === 1 }"
                @tap="toggleTopStatus(item)"
              >
                {{ item.isTop === 1 ? '取消置顶' : '置顶' }}
              </button>
              <button class="action-btn edit-btn" @tap="editNotice(item)">编辑</button>
              <button class="action-btn delete-btn" @tap="deleteNotice(item)">删除</button>
            </view>
          </view>
          
          <view class="notice-content">
            <text class="content-preview">{{ getContentPreview(item.content) }}</text>
          </view>
          
          <view class="notice-footer">
            <text class="notice-time">{{ formatDateTime(item.createTime) }}</text>
            <text class="notice-author">发布者: {{ item.publisherName || '管理员' }}</text>
            <view class="view-count">
              <uni-icons type="eye" size="14" color="#999"></uni-icons>
              <text>{{ item.viewCount || 0 }}</text>
            </view>
          </view>
        </view>
        
        <view v-if="noticeList.length === 0" class="empty-tip">
          <uni-icons type="info" size="40" color="#999"></uni-icons>
          <text>暂无公告数据</text>
        </view>
        
        <view v-if="loading && page > 1" class="loading-more">
          <text>加载更多数据...</text>
        </view>
        
        <view v-if="!loading && !hasMore && noticeList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </template>
    </scroll-view>
    
    <!-- 悬浮添加按钮 -->
    <view class="floating-add-btn" @tap="navigateToCreate">
      <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import apiModule from '@/api/api.js';

// 搜索参数
const searchParams = reactive({
  keyword: '',
  page: 1,
  pageSize: 10
});

// 列表数据
const noticeList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const refresherTriggered = ref(false);

/**
 * @description 处理搜索
 */
const handleSearch = () => {
  page.value = 1;
  noticeList.value = [];
  hasMore.value = true;
  loadNoticeList();
};

/**
 * @description 跳转到创建公告页面
 */
const navigateToCreate = () => {
  uni.navigateTo({
    url: '/pages/admin/notices/edit'
  });
};

/**
 * @description 加载公告列表
 */
const loadNoticeList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      ...searchParams,
      page: page.value,
	  orderBy: 'is_top',
	  isAsc: false
    };
    
    const response = await apiModule.admin.notice.getNotices(params);
    
    if (response.code === 200) {
      const { list, total, pageNum, pageSize } = response.data;
      
      if (page.value === 1) {
        noticeList.value = list || [];
      } else {
        noticeList.value = [...noticeList.value, ...(list || [])];
      }
      
      hasMore.value = noticeList.value.length < total;
    } else {
      uni.showToast({
        title: response.message || '获取公告列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
    uni.showToast({
      title: '获取公告列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refresherTriggered.value = false;  // 确保每次加载完成后重置下拉刷新状态
  }
};

/**
 * @description 加载更多
 */
const loadMore = () => {
  if (loading.value || !hasMore.value) return;
  page.value++;
  loadNoticeList();
};

/**
 * @description 下拉刷新
 */
const onRefresh = () => {
  refresherTriggered.value = true;  // 设置为true以显示刷新动画
  page.value = 1;
  noticeList.value = [];
  hasMore.value = true;
  loadNoticeList();
};


/**
 * @description 编辑公告
 */
const editNotice = (notice) => {
  uni.navigateTo({
    url: `/pages/admin/notices/edit?id=${notice.id}`
  });
  console.log('Editing notice with id:', notice.id); // 添加日志便于调试
};

/**
 * @description 删除公告
 */
const deleteNotice = (notice) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该公告吗？',
    success: async function(res) {
      if (res.confirm) {
        try {
          const response = await apiModule.admin.notice.deleteNotice(notice.id);
          
          if (response.code === 200) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 从列表中删除该公告
            const index = noticeList.value.findIndex(item => item.id === notice.id);
            if (index !== -1) {
              noticeList.value.splice(index, 1);
            }
          } else {
            uni.showToast({
              title: response.message || '删除失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('删除公告失败:', error);
          uni.showToast({
            title: '删除失败，请重试',
            icon: 'none'
          });
        }
      }
    }
  });
};

/**
 * @description 切换置顶状态
 */
const toggleTopStatus = (notice) => {
  const newTopStatus = notice.isTop === 1 ? 0 : 1;
  const action = newTopStatus === 1 ? '置顶' : '取消置顶';
  
  uni.showModal({
    title: '提示',
    content: `确定要${action}该公告吗？`,
    success: async function(res) {
      if (res.confirm) {
        try {
          const response = await apiModule.admin.notice.updateTopStatus(notice.id, newTopStatus);
          
          if (response.code === 200) {
            uni.showToast({
              title: `${action}成功`,
              icon: 'success'
            });
            
            // 更新本地数据
            notice.isTop = newTopStatus;
            
            // 如果是设置置顶，可以考虑重新排序列表（置顶的显示在前面）
            if (newTopStatus === 1) {
              // 重新加载列表以保证置顶公告排在前面
              onRefresh();
            }
          } else {
            uni.showToast({
              title: response.message || `${action}失败`,
              icon: 'none'
            });
          }
        } catch (error) {
          console.error(`${action}公告失败:`, error);
          uni.showToast({
            title: `${action}失败，请重试`,
            icon: 'none'
          });
        }
      }
    }
  });
};

/**
 * @description 获取内容预览
 */
const getContentPreview = (content) => {
  if (!content) return '暂无内容';
  // 去除HTML标签，只保留文本
  let plainText = content.replace(/<[^>]+>/g, '');
  // 去除多余空白字符
  plainText = plainText.replace(/\s+/g, ' ').trim();
  // 截取前100个字符
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};

/**
 * @description 格式化日期时间
 */
const formatDateTime = (timestamp) => {
  if (!timestamp) return '--';
  // 处理可能是字符串的情况
  const time = parseInt(timestamp);
  if (isNaN(time)) return '--';
  
  const d = new Date(time);
  // 检查日期是否有效
  if (isNaN(d.getTime())) return '--';
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 页面加载
onMounted(() => {
  // 验证管理员登录状态
  const token = uni.getStorageSync('adminToken');
  if (!token) {
    uni.reLaunch({
      url: '/pages/admin/login'
    });
    return;
  }
  
  loadNoticeList();
});

// 每次显示页面时刷新数据
onShow(() => {
  if (noticeList.value.length > 0) {
    page.value = 1;
    noticeList.value = [];
    hasMore.value = true;
    refresherTriggered.value = false; // 确保重置下拉刷新状态
    loadNoticeList();
  }
});
</script>

<style lang="scss" scoped>
.admin-notices {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333333;
  }
  
  .placeholder {
    width: 60rpx;
  }
}

.search-box {
  display: flex;
  padding: 24rpx;
  background-color: #ffffff;
  margin-top: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  margin-left: 24rpx;
  margin-right: 24rpx;
  
  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f8f8f8;
    border-radius: 30rpx;
    padding: 12rpx 24rpx;
    margin-right: 24rpx;
    border: 1px solid #eaeaea;
    
    uni-icons {
      margin-right: 12rpx;
    }
    
    input {
      flex: 1;
      height: 64rpx;
      font-size: 28rpx;
    }
  }
  
  .search-btn {
    width: 140rpx;
    height: 70rpx;
    background-color: #2979ff;
    color: #ffffff;
    font-size: 28rpx;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.add-btn-box {
  padding: 24rpx;
  display: flex;
  justify-content: flex-end;
  
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #07c160;
    color: #ffffff;
    font-size: 28rpx;
    padding: 0 36rpx;
    border-radius: 35rpx;
    height: 70rpx;
    box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
    
    uni-icons {
      margin-right: 12rpx;
    }
    
    &::after {
      border: none;
    }
  }
}

.notice-list {
  flex: 1;
  height: calc(100vh - 220rpx);
  
  .loading-box, .empty-tip {
    padding: 120rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999999;
    
    text {
      margin-top: 24rpx;
      font-size: 28rpx;
    }
  }
  
  .notice-item {
    margin: 24rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
    
    // 置顶公告样式
    &.top-notice {
      border: 2rpx solid #ff6b35;
      background: linear-gradient(135deg, #fff9f7 0%, #ffffff 100%);
      
      .notice-title {
        color: #ff6b35;
      }
    }
    
    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24rpx;
      
      .title-section {
        flex: 1;
        margin-right: 24rpx;
        
        .title-wrapper {
          display: flex;
          flex-direction: column;
          
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
        font-weight: bold;
        color: #333333;
        line-height: 1.5;
      }
      
      .action-buttons {
        display: flex;
        flex-shrink: 0;
        
        .action-btn {
          margin-left: 16rpx;
          font-size: 24rpx;
          padding: 8rpx 20rpx;
          border-radius: 20rpx;
          line-height: 1.5;
          
          &.edit-btn {
            color: #2979ff;
            border: 1rpx solid #2979ff;
            background-color: rgba(41, 121, 255, 0.05);
          }
          
          &.delete-btn {
            color: #ff3b30;
            border: 1rpx solid #ff3b30;
            background-color: rgba(255, 59, 48, 0.05);
          }
          
          &.top-btn {
            color: #ff6b35;
            border: 1rpx solid #ff6b35;
            background-color: rgba(255, 107, 53, 0.05);
            
            &.is-top {
              color: #fff;
              background-color: #ff6b35;
              border-color: #ff6b35;
            }
          }
          
          &::after {
            border: none;
          }
        }
      }
    }
    
    .notice-content {
      margin-bottom: 24rpx;
      
      .content-preview {
        font-size: 28rpx;
        color: #666666;
        line-height: 1.6;
      }
    }
    
    .notice-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .notice-time, .notice-author {
        font-size: 24rpx;
        color: #999999;
      }
      
      .view-count {
        display: flex;
        align-items: center;
        
        text {
          margin-left: 6rpx;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
  
  .loading-more, .no-more {
    text-align: center;
    padding: 24rpx 0;
    color: #999999;
    font-size: 24rpx;
  }
}

/* 悬浮添加按钮 */
.floating-add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #07c160;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(7, 193, 96, 0.3);
  z-index: 99;
}
</style> 