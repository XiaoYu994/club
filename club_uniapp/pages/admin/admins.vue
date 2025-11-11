<template>
  <view class="admin-users pageBg">
    <custom-nav-bar title="管理员管理" />

    <!-- 搜索区 -->
    <view class="search-box">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchParams.keyword" 
          placeholder="搜索管理员账号" 
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
      <view class="search-btn" @tap="handleSearch">搜索</view>
      <view class="add-btn" @tap="showAddAdminModal">添加</view>
    </view>
    
    <!-- 筛选选项 -->
    <view class="filter-options">
      <view 
        class="filter-item" 
        :class="{'active': searchParams.status === ''}"
        @tap="setStatusFilter('')"
      >全部</view>
      <view 
        class="filter-item" 
        :class="{'active': searchParams.status === 1}"
        @tap="setStatusFilter(1)"
      >正常</view>
      <view 
        class="filter-item" 
        :class="{'active': searchParams.status === 0}"
        @tap="setStatusFilter(0)"
      >已禁用</view>
    </view>
    
    <!-- 管理员列表 -->
    <scroll-view 
      class="admin-list" 
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
        <view class="admin-item" v-for="item in adminList" :key="item.id">
          <view class="admin-info" @tap="viewAdminDetail(item.id)">
            <view class="avatar">
              <uni-icons type="staff" size="30" color="#2979ff"></uni-icons>
            </view>
            <view class="admin-detail">
              <view class="name-row">
                <text class="name">{{ item.username }}</text>
                <text class="status" :class="item.status ? 'normal' : 'disabled'">
                  {{ item.status ? '正常' : '已禁用' }}
                </text>
                <text class="type-badge" v-if="item.type === 1">超级管理员</text>
              </view>
              <view class="phone">手机号：{{ item.phone || '未绑定手机' }}</view>
              <view class="date">创建时间：{{ formatDate(item.createTime) }}</view>
            </view>
          </view>
          
          <view class="action-buttons">
            <button 
              class="action-btn" 
              :class="item.status ? 'disable-btn' : 'enable-btn'"
              @tap="toggleAdminStatus(item)"
              v-if="item.id !== currentAdminId && item.type !== 1" 
            >
              {{ item.status ? '禁用' : '启用' }}
            </button>
            <button 
              class="action-btn reset-btn" 
              @tap="resetPassword(item)"
              v-if="item.id !== currentAdminId && item.type !== 1" 
            >
              重置密码
            </button>
            <button 
              class="action-btn delete-btn" 
              @tap="confirmDeleteAdmin(item)"
              v-if="item.id !== currentAdminId && item.type !== 1" 
            >
              删除
            </button>
          </view>
        </view>
        
        <view v-if="adminList.length === 0" class="empty-tip">
          <uni-icons type="info" size="40" color="#999"></uni-icons>
          <text>暂无管理员数据</text>
        </view>
        
        <view v-if="loading && page > 1" class="loading-more">
          <text>加载更多数据...</text>
        </view>
        
        <view v-if="!loading && !hasMore && adminList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </template>
    </scroll-view>

    <!-- 添加管理员弹窗 -->
    <uni-popup ref="addAdminPopup" type="center">
      <view class="popup-container">
        <view class="popup-title">添加管理员</view>
        <view class="form-item">
          <text class="label">账号:</text>
          <input type="text" v-model="newAdmin.username" placeholder="请输入账号" class="input" />
        </view>
        <view class="form-item">
          <text class="label">密码:</text>
          <input type="password" password v-model="newAdmin.password" placeholder="请输入密码" class="input" />
        </view>
        <view class="form-item">
          <text class="label">手机:</text>
          <input type="text" v-model="newAdmin.phone" placeholder="请输入手机号" class="input" />
        </view>
		<view class="form-item">
		  <text class="label">描述:</text>
		  <input type="text" v-model="newAdmin.description" placeholder="请输入描述" class="input" />
		</view>
        <view class="form-item">
          <text class="label">类型:</text>
          <radio-group @change="adminTypeChange">
            <label class="radio-label">
              <radio value="0" :checked="newAdmin.type === 0" />普通管理员
            </label>
            <label class="radio-label">
              <radio value="1" :checked="newAdmin.type === 1" />超级管理员
            </label>
          </radio-group>
        </view>
        <view class="popup-buttons">
          <button @tap="closeAddAdminPopup" class="cancel-btn">取消</button>
          <button @tap="addAdmin" class="confirm-btn">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { formatDate } from '@/utils/common.js';
import api from '@/api/api.js';

// 当前管理员信息
const currentAdminId = ref(null);

// 搜索参数
const searchParams = reactive({
  keyword: '',
  status: '',
  pageNo: 1,
  pageSize: 10
});

// 列表数据
const adminList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const refresherTriggered = ref(false);

// 新增管理员表单
const addAdminPopup = ref(null);
const newAdmin = reactive({
  username: '',
  password: '',
  phone: '',
  description: '',
  type: 0 // 默认普通管理员
});

/**
 * 处理搜索
 */
const handleSearch = () => {
  page.value = 1;
  adminList.value = [];
  hasMore.value = true;
  loadAdminList();
};

/**
 * 设置状态筛选
 */
const setStatusFilter = (status) => {
  searchParams.status = status;
  handleSearch();
};

/**
 * 加载管理员列表
 */
const loadAdminList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      ...searchParams,
      page: page.value
    };
    
    const response = await api.admin.admin.getAdmins(params);
    
    if (response.code === 200) {
      const { list, total } = response.data;
      
      if (page.value === 1) {
        adminList.value = list || [];
      } else {
        adminList.value = [...adminList.value, ...(list || [])];
      }
      
      hasMore.value = adminList.value.length < total;
    } else {
      uni.showToast({
        title: response.message || '获取管理员列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    uni.showToast({
      title: '获取管理员列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refresherTriggered.value = false;
  }
};

/**
 * 加载更多
 */
const loadMore = () => {
  if (loading.value || !hasMore.value) return;
  page.value++;
  loadAdminList();
};

/**
 * 下拉刷新
 */
const onRefresh = () => {
  refresherTriggered.value = true;
  page.value = 1;
  adminList.value = [];
  hasMore.value = true;
  loadAdminList();
};

/**
 * 查看管理员详情
 */
const viewAdminDetail = (id) => {
  // 可以实现查看详情页面
};

/**
 * 切换管理员状态（禁用/启用）
 */
const toggleAdminStatus = (admin) => {
  const newStatus = admin.status ? 0 : 1;
  const action = newStatus ? '启用' : '禁用';
  
  uni.showModal({
    title: '提示',
    content: `确定要${action}该管理员吗？`,
    success: async function(res) {
      if (res.confirm) {
        try {
          const response = await api.admin.admin.updateAdminStatus({
			adminId: admin.id,
            status: newStatus
          });
          
          if (response.code === 200) {
            uni.showToast({
              title: `${action}成功`,
              icon: 'success'
            });
            
            // 更新列表中的用户状态
            const index = adminList.value.findIndex(item => item.id === admin.id);
            if (index !== -1) {
              adminList.value[index].status = newStatus;
            }
          } else {
            uni.showToast({
              title: response.message || `${action}失败`,
              icon: 'none'
            });
          }
        } catch (error) {
          console.error(`${action}管理员失败:`, error);
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
 * 重置管理员密码
 */
const resetPassword = (admin) => {
  uni.showModal({
    title: '提示',
    content: `确定要重置${admin.username}的密码吗？`,
    success: async function(res) {
      if (res.confirm) {
        try {
          const response = await api.admin.admin.resetAdminPassword(admin.id);
          
          if (response.code === 200) {
            uni.showToast({
              title: '重置密码成功',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: response.message || '重置密码失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('重置密码失败:', error);
          uni.showToast({
            title: '重置密码失败，请重试',
            icon: 'none'
          });
        }
      }
    }
  });
};

/**
 * 显示添加管理员弹窗
 */
const showAddAdminModal = () => {
  // 重置表单
  Object.assign(newAdmin, {
    username: '',
    password: '',
    phone: '',
	description: '',
    type: 0
  });
  addAdminPopup.value.open();
};

/**
 * 关闭添加管理员弹窗
 */
const closeAddAdminPopup = () => {
  addAdminPopup.value.close();
};

/**
 * 添加管理员
 */
const addAdmin = async () => {
  if (!newAdmin.username || !newAdmin.password) {
    uni.showToast({
      title: '账号和密码不能为空',
      icon: 'none'
    });
    return;
  }
  
  try {
    const response = await api.admin.admin.createAdmin(newAdmin);
    
    if (response.code === 200) {
      uni.showToast({
        title: '添加管理员成功',
        icon: 'success'
      });
      closeAddAdminPopup();
      handleSearch(); // 刷新列表
    } else {
      uni.showToast({
        title: response.message || '添加管理员失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('添加管理员失败:', error);
    uni.showToast({
      title: '添加管理员失败，请重试',
      icon: 'none'
    });
  }
};

/**
 * 管理员类型变更
 */
const adminTypeChange = (e) => {
  newAdmin.type = parseInt(e.detail.value);
};

/**
 * 确认删除管理员
 */
const confirmDeleteAdmin = (admin) => {
  uni.showModal({
    title: '删除确认',
    content: `确定要删除管理员 ${admin.username} 吗？此操作不可恢复！`,
    success: async (res) => {
      if (res.confirm) {
        deleteAdmin(admin);
      }
    }
  });
};

/**
 * 删除管理员
 */
const deleteAdmin = async (admin) => {
  try {
    uni.showLoading({ title: '删除中...' });
    const response = await api.admin.admin.deleteAdmin(admin.id);
    
    if (response.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      // 从列表中移除已删除的管理员
      const index = adminList.value.findIndex(item => item.id === admin.id);
      if (index !== -1) {
        adminList.value.splice(index, 1);
      }
    } else {
      uni.showToast({
        title: response.message || '删除失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('删除管理员失败:', error);
    uni.showToast({
      title: '删除失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};


// 页面加载
onMounted(() => {
  // 验证管理员登录状态
  const token = uni.getStorageSync('adminToken');
  if (!token) {
    uni.reLaunch({ url: '/pages/admin/login' });
    return;
  }
  
  // 验证是否为超级管理员
  const adminInfo = uni.getStorageSync('adminInfo');
  if (!adminInfo || adminInfo.type !== 1) {
    uni.showToast({
      title: '无权限访问',
      icon: 'none'
    });
    uni.navigateBack();
    return;
  }
  
  // 保存当前管理员ID
  currentAdminId.value = adminInfo.id;
  
  // 加载数据
  loadAdminList();
});
</script>

<style lang="scss" scoped>
.admin-users {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.search-box {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  
  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 30rpx;
    padding: 10rpx 20rpx;
    margin-right: 20rpx;
    
    uni-icons {
      margin-right: 10rpx;
    }
    
    input {
      flex: 1;
      height: 60rpx;
      font-size: 28rpx;
    }
  }
  
  .search-btn {
    width: 120rpx;
    height: 80rpx;
    background-color: #2979ff;
    color: #fff;
    font-size: 28rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
  }
  
  .add-btn {
    width: 120rpx;
    height: 80rpx;
    background-color: #4caf50;
    color: #fff;
    font-size: 28rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.filter-options {
  display: flex;
  padding: 10rpx 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  
  .filter-item {
    padding: 10rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #2979ff;
      
      &:after {
        content: '';
        position: absolute;
        left: 30rpx;
        right: 30rpx;
        bottom: 0;
        height: 4rpx;
        background-color: #2979ff;
        border-radius: 2rpx;
      }
    }
  }
}

.admin-list {
  height: calc(100vh - 280rpx);
  
  .loading-box, .empty-tip {
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    
    text {
      margin-top: 20rpx;
      font-size: 28rpx;
    }
  }
  
  .admin-item {
    margin: 20rpx;
    background-color: #fff;
    border-radius: 8rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .admin-info {
      display: flex;
      margin-bottom: 20rpx;
    }
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: #e3f2fd;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20rpx;
    }
    
    .admin-detail {
      flex: 1;
      
      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
      }
      
      .name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-right: 20rpx;
      }
      
      .status {
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
      
      .type-badge {
        font-size: 24rpx;
        padding: 2rpx 12rpx;
        border-radius: 20rpx;
        margin-left: 10rpx;
        background-color: #ff9800;
        color: #fff;
      }
      
      .phone {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
      }
      
      .date {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      
      .action-btn {
        margin-left: 20rpx;
        font-size: 24rpx;
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        line-height: 1.5;
        
        &.disable-btn {
          color: #ff9800;
          border: 1rpx solid #ff9800;
          background-color: #fff;
        }
        
        &.enable-btn {
          color: #07c160;
          border: 1rpx solid #07c160;
          background-color: #fff;
        }
        
        &.reset-btn {
          color: #2979ff;
          border: 1rpx solid #2979ff;
          background-color: #fff;
        }
        
        &.delete-btn {
          color: #f44336;
          border: 1rpx solid #f44336;
          background-color: #fff;
        }
        
        &::after {
          border: none;
        }
      }
    }
  }
  
  .loading-more, .no-more {
    text-align: center;
    padding: 20rpx 0;
    color: #999;
    font-size: 24rpx;
  }
}

.popup-container {
  width: 600rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .form-item {
    margin-bottom: 20rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 1rpx solid #eee;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
    }
    
    .radio-label {
      margin-right: 30rpx;
      font-size: 28rpx;
    }
  }
  
  .popup-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    
    button {
      width: 45%;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 8rpx;
      
      &.cancel-btn {
        background-color: #f5f5f5;
        color: #666;
      }
      
      &.confirm-btn {
        background-color: #2979ff;
        color: #fff;
      }
    }
  }
}
</style> 