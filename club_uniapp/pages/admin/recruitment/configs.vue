<template>
QQ_1753415115562.png  <view class="admin-recruitment-configs pageBg">
    <custom-nav-bar title="招新配置管理" />
    <!-- 搜索区 -->
    <view class="search-box">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索配置名称/学期" 
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
      <view class="search-btn" @tap="onSearch">搜索</view>
    </view>
    <!-- 配置列表 -->
    <scroll-view 
      class="config-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-triggered="refresherTriggered"
      refresher-enabled
      @refresherrefresh="onRefresh"
    >
      <view v-if="isLoading && currentPage === 1" class="loading-box">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      <template v-else>
        <view class="config-item" v-for="item in configList" :key="item.id">
          <view class="config-info">
            <view class="config-title-row">
              <text class="config-title">{{ item.name || '未命名配置' }}</text>
              <text class="config-status" :class="item.status === 1 ? 'normal' : 'disabled'">
                {{ item.status === 1 ? '启用中' : '已禁用' }}
              </text>
            </view>
            <view class="config-semester">学期：{{ item.semester || '未设置' }}</view>
            <view class="config-time">招新时间：{{ formatDate(item.globalStartTime) }} 至 {{ formatDate(item.globalEndTime) }}</view>
            <view class="config-desc">说明：{{ item.description || '无说明' }}</view>
            <view class="config-date">创建时间：{{ formatDate(item.createTime) }}</view>
            <view class="action-buttons-horizontal">
              <button class="action-btn edit-btn" @tap="editConfig(item)">编辑</button>
              <button class="action-btn" :class="item.status === 1 ? 'disable-btn' : 'enable-btn'" @tap="toggleStatus(item)">
                {{ item.status === 1 ? '禁用' : '启用' }}
              </button>
              <button class="action-btn delete-btn" @tap="confirmDelete(item)">删除</button>
            </view>
          </view>
        </view>
        <view v-if="configList.length === 0" class="empty-tip">
          <uni-icons type="info" size="40" color="#999"></uni-icons>
          <text>暂无招新配置</text>
        </view>
        <view v-if="isLoading && currentPage > 1" class="loading-more">
          <text>加载更多数据...</text>
        </view>
        <view v-if="!isLoading && !hasMore && configList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </template>
    </scroll-view>
    <!-- 悬浮添加按钮 -->
    <view class="floating-add-btn" @tap="createConfig">
      <uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
    </view>
    <!-- 确认删除弹窗 -->
    <uni-popup ref="deletePopup" type="dialog">
      <uni-popup-dialog
        title="确认删除"
        content="确定要删除该招新配置吗？删除后无法恢复"
        :before-close="true"
        @confirm="handleDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import apiModule from '@/api/api.js';

// 数据
const configList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const searchKeyword = ref('');
const refresherTriggered = ref(false);
const selectedConfig = ref(null);
const deletePopup = ref(null);

// 加载配置列表
const loadConfigList = async (reset = false) => {
  if (reset) {
    currentPage.value = 1;
    configList.value = [];
    hasMore.value = true;
  }
  
  if (!hasMore.value || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    };
    
    const response = await apiModule.admin.recruitment.getConfigPage(params);
    if (response.code === 200) {
      const records = Array.isArray(response.data.list) ? response.data.list : [];
      const totalCount = Number(response.data.total) || 0;
      const current = Number(params.pageNo || 1);
      if (reset) {
        configList.value = records;
      } else {
        configList.value = [...configList.value, ...records];
      }
      total.value = totalCount;
      hasMore.value = configList.value.length < total.value;
      currentPage.value = current + 1;
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载招新配置列表失败:', error);
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    refresherTriggered.value = false;
  }
};

// 刷新列表
const onRefresh = () => {
  refresherTriggered.value = true;
  loadConfigList(true);
};

// 加载更多
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    loadConfigList();
  }
};

// 搜索
const onSearch = () => {
  loadConfigList(true);
};

// 格式化日期
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

// 编辑配置
const editConfig = (config) => {
  uni.navigateTo({
    url: `/pages/admin/recruitment/edit?id=${config.id}`
  });
};

// 创建新配置
const createConfig = () => {
  uni.navigateTo({
    url: '/pages/admin/recruitment/edit'
  });
};

// 切换配置状态
const toggleStatus = async (config) => {
  try {
    const data = {
      id: config.id,
      status: config.status === 1 ? 0 : 1
    };
    
    uni.showLoading({ title: '处理中...' });
    const response = await apiModule.admin.recruitment.updateConfig(data);
    
    if (response.code === 200) {
      uni.showToast({
        title: config.status === 1 ? '已禁用' : '已启用',
        icon: 'success'
      });
      
      // 更新本地状态
      const index = configList.value.findIndex(item => item.id === config.id);
      if (index !== -1) {
        configList.value[index].status = data.status;
      }
    } else {
      uni.showToast({
        title: response.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('切换状态失败:', error);
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 确认删除
const confirmDelete = (config) => {
  selectedConfig.value = config;
  deletePopup.value.open();
};

// 取消删除
const cancelDelete = () => {
  selectedConfig.value = null;
  if (deletePopup.value) deletePopup.value.close();
};

// 执行删除
const handleDelete = async () => {
  if (!selectedConfig.value) return;
  
  try {
    uni.showLoading({ title: '删除中...' });
    const response = await apiModule.admin.recruitment.deleteConfig(selectedConfig.value.id);
    
    if (response.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 从列表中移除
      configList.value = configList.value.filter(item => item.id !== selectedConfig.value.id);
    } else {
      uni.showToast({
        title: response.message || '删除失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('删除失败:', error);
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
    selectedConfig.value = null;
	deletePopup.value.close();
  }
};

onMounted(() => {
  loadConfigList(true);
});

onShow(() => {
  loadConfigList(true);
});
</script>

<style lang="scss" scoped>
.admin-recruitment-configs {
  min-height: 100vh;
  .search-box {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx 0 32rpx;
    .search-input {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f5f6fa;
      border-radius: 32rpx;
      padding: 0 24rpx;
      height: 64rpx;
      margin-right: 20rpx;
      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 28rpx;
        color: #333;
        outline: none;
      }
    }
    .search-btn {
      background: #2979ff;
      color: #fff;
      border-radius: 32rpx;
      padding: 0 32rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      font-size: 28rpx;
    }
  }
  .config-list {
    margin: 24rpx 0 0 0;
    padding: 0 32rpx;
    .config-item {
      display: flex;
      align-items: flex-start;
      background: #fff;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 16rpx rgba(41,121,255,0.06);
      margin-bottom: 24rpx;
      padding: 32rpx 24rpx;
      .config-info {
        flex: 1;
        .config-title-row {
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;
          .config-title {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
            margin-right: 20rpx;
          }
          .config-status {
            font-size: 24rpx;
            padding: 2rpx 12rpx;
            border-radius: 20rpx;
            &.normal {
              color: #07c160;
              background-color: rgba(7, 193, 96, 0.1);
            }
            &.disabled {
              color: #ff9800;
              background-color: rgba(255, 152, 0, 0.1);
            }
          }
        }
        .config-semester, .config-time, .config-desc, .config-date {
          font-size: 28rpx;
          color: #666;
          margin-bottom: 8rpx;
        }
        .config-date {
          font-size: 24rpx;
          color: #999;
        }
      }
      .action-buttons-horizontal {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 16rpx;
        gap: 20rpx;
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          padding: 0 32rpx;
          height: 56rpx;
          min-width: 96rpx;
          border-radius: 28rpx;
          font-weight: 500;
          border: none;
          background: #f5f6fa;
          color: #2979ff;
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
          box-shadow: 0 2rpx 8rpx rgba(41,121,255,0.04);
          line-height: normal;
          &:active {
            background: #e3f0ff;
          }
          &.edit-btn {
            background: #2979ff;
            color: #fff;
            box-shadow: 0 2rpx 8rpx rgba(41,121,255,0.10);
          }
          &.disable-btn {
            color: #ff9800;
            border: 1rpx solid #ff9800;
            background: #fff;
          }
          &.enable-btn {
            color: #07c160;
            border: 1rpx solid #07c160;
            background: #fff;
          }
          &.delete-btn {
            color: #e74c3c;
            border: 1rpx solid #e74c3c;
            background: #fff;
          }
          &::after {
            border: none;
          }
        }
      }
    }
    .empty-tip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      color: #999;
      font-size: 28rpx;
    }
    .loading-more, .no-more {
      text-align: center;
      padding: 20rpx 0;
      color: #999;
      font-size: 24rpx;
    }
  }
  .floating-add-btn {
    position: fixed;
    right: 40rpx;
    bottom: 40rpx;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: #2979ff;
    box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    &:active {
      transform: scale(0.95);
    }
  }
}
</style> 