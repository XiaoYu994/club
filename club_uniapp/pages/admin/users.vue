<template>
  <view class="admin-users pageBg">
    <custom-nav-bar title="用户管理" />    
    <!-- 搜索区 -->
    <view class="search-box">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchParams.keyword" 
          placeholder="搜索用户名/手机号" 
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
      <view class="search-btn" @tap="handleSearch">搜索</view>
      <view class="export-btn" @tap="exportAllUsers">导出用户</view>
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
    
    <!-- 用户列表 -->
    <scroll-view 
      class="user-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-triggered="refresherTriggered"
      refresher-enabledx
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading && page === 1" class="loading-box">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      
      <template v-else>
        <view class="user-item" v-for="item in userList" :key="item.id">
          <view class="user-info" >
            <image class="avatar" :src="item.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
            <view class="user-detail">
              <view class="name-row">
                <text class="name">{{ item.username || '未设置昵称' }}</text>
                <text class="status" :class="item.status ? 'normal' : 'disabled'">
                  {{ item.status ? '正常' : '已禁用' }}
                </text>
              </view>
              <view class="phone">手机号：{{ item.mobile || '未绑定手机' }}</view>
              <view class="student-id">学号：{{ item.studentId || '暂无学号' }}</view>
              <view class="class-name">班级：{{ item.className || '暂无班级' }}</view>
			  <view class="class-name">专业：{{ item.major || '暂无专业' }}</view>
              <view class="date">注册时间：{{ formatDate(item.createTime) }}</view>
            </view>
          </view>
          
          <view class="action-buttons">
            <button 
              class="action-btn" 
              :class="item.status ? 'disable-btn' : 'enable-btn'"
              @tap="toggleUserStatus(item)"
            >
              {{ item.status ? '禁用' : '启用' }}
            </button>
          </view>
        </view>
        
        <view v-if="userList.length === 0" class="empty-tip">
          <uni-icons type="info" size="40" color="#999"></uni-icons>
          <text>暂无用户数据</text>
        </view>
        
        <view v-if="loading && page > 1" class="loading-more">
          <text>加载更多数据...</text>
        </view>
        
        <view v-if="!loading && !hasMore && userList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiModule from '@/api/api.js';
import { formatDate } from '@/utils/common.js';

// 搜索参数
const searchParams = reactive({
  keyword: '',
  status: '',
  page: 1,
  pageSize: 10
});

// 列表数据
const userList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const refresherTriggered = ref(false);

/**
 * @description 返回上一页
 */
const goBack = () => {
  uni.navigateBack();
};

/**
 * @description 处理搜索
 */
const handleSearch = () => {
  page.value = 1;
  userList.value = [];
  hasMore.value = true;
  loadUserList();
};

/**
 * @description 设置状态筛选
 */
const setStatusFilter = (status) => {
  searchParams.status = status;
  handleSearch();
};

/**
 * @description 加载用户列表
 */
const loadUserList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      ...searchParams,
      page: page.value
    };
    
    const response = await apiModule.admin.user.getUsers(params);
    
    if (response.code === 200) {
      const { list, total, pageNum, pageSize } = response.data;
      
      if (page.value === 1) {
        userList.value = list || [];
      } else {
        userList.value = [...userList.value, ...(list || [])];
      }
      
      hasMore.value = userList.value.length < total;
    } else {
      uni.showToast({
        title: response.message || '获取用户列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    uni.showToast({
      title: '获取用户列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refresherTriggered.value = false;
  }
};

/**
 * @description 加载更多
 */
const loadMore = () => {
  if (loading.value || !hasMore.value) return;
  page.value++;
  loadUserList();
};

/**
 * 下拉刷新
 */
const onRefresh = () => {
  refresherTriggered.value = true;
  page.value = 1;
  userList.value = [];
  hasMore.value = true;
  loadUserList();
};


/**
 * @description 切换用户状态（禁用/启用）
 */
const toggleUserStatus = (user) => {
  const newStatus = user.status ? 0 : 1;
  const action = newStatus ? '启用' : '禁用';
  
  uni.showModal({
    title: '提示',
    content: `确定要${action}该用户吗？`,
    success: async function(res) {
      if (res.confirm) {
        try {
          const response = await apiModule.admin.user.updateUserStatus(user.id, {
            status: newStatus
          });
          
          if (response.code === 200) {
            uni.showToast({
              title: `${action}成功`,
              icon: 'success'
            });
            
            // 更新列表中的用户状态
            const index = userList.value.findIndex(item => item.id === user.id);
            if (index !== -1) {
              userList.value[index].status = newStatus;
            }
          } else {
            uni.showToast({
              title: response.message || `${action}失败`,
              icon: 'none'
            });
          }
        } catch (error) {
          console.error(`${action}用户失败:`, error);
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
 * 导出所有用户
 */
const exportAllUsers = async () => {
  if (loading.value) return;

  try {
    uni.showLoading({ title: '正在导出...' })

    // 使用当前筛选条件导出
    const params = { ...searchParams, page: 1 }
    const response = await apiModule.admin.user.exportUsers(params)

    console.log('【导出】后端返回结果:', response)

    if (response.code === 200) {
      const { url, fileName } = response.data

      console.log('【导出】文件URL:', url)
      console.log('【导出】文件名:', fileName)

      // 小程序 / App
      // #ifdef MP-WEIXIN || APP-PLUS
      uni.downloadFile({
        url,
        success: downloadRes => {
          console.log('【导出】downloadFile success:', downloadRes)

          if (downloadRes.statusCode === 200) {
            const tempFilePath = downloadRes.tempFilePath
            console.log('【导出】临时文件路径:', tempFilePath)

            uni.hideLoading()

            // 直接使用临时文件打开，不保存到永久存储
            uni.openDocument({
              filePath: tempFilePath,
              showMenu: true,
              fileType: 'xlsx',
              success: () => {
                console.log('【导出】打开文档成功')
                uni.showToast({ title: '导出成功', icon: 'success' })
              },
              fail: err => {
                console.error('【导出】打开文档失败:', err)
                uni.showModal({
                  title: '提示',
                  content: '文件下载成功，但无法直接打开。错误: ' + (err.errMsg || '未知错误'),
                  showCancel: true,
                  cancelText: '取消',
                  confirmText: '复制链接',
                  success: modalRes => {
                    if (modalRes.confirm) {
                      uni.setClipboardData({
                        data: url,
                        success: () => {
                          uni.showToast({ title: '链接已复制，可在浏览器中下载', icon: 'none', duration: 2000 })
                        }
                      })
                    }
                  }
                })
              }
            })
          } else {
            console.error('【导出】下载失败，状态码:', downloadRes.statusCode)
            uni.hideLoading()
            uni.showToast({ title: '下载文件失败', icon: 'none' })
          }
        },
        fail: err => {
          console.error('【导出】downloadFile失败:', err)
          uni.hideLoading()

          // 判断是否是域名配置问题
          const isDomainError = err.errMsg && (
            err.errMsg.includes('downloadFile:fail') ||
            err.errMsg.includes('domain') ||
            err.errMsg.includes('not in domain list')
          )

          uni.showModal({
            title: '导出提示',
            content: isDomainError
              ? '下载失败，可能是域名未配置。请在微信公众平台配置downloadFile合法域名，或复制链接在浏览器中下载。'
              : '下载失败: ' + (err.errMsg || '未知错误') + '。是否复制链接？',
            confirmText: '复制链接',
            success: modalRes => {
              if (modalRes.confirm) {
                uni.setClipboardData({
                  data: url,
                  success: () => {
                    uni.showToast({ title: '链接已复制', icon: 'none' })
                  }
                })
              }
            }
          })
        }
      })
      // #endif

      // H5
      // #ifdef H5
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      uni.hideLoading()
      uni.showToast({ title: '导出成功', icon: 'success' })
      // #endif
    } else {
      console.error('【导出】接口返回错误:', response)
      uni.hideLoading()
      uni.showToast({ title: response.message || '导出失败', icon: 'none' })
    }
  } catch (error) {
    console.error('【导出】导出用户失败:', error)
    uni.hideLoading()
    uni.showToast({ title: '导出失败: ' + (error.message || '未知错误'), icon: 'none' })
  }
}

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
  
  loadUserList();
});
</script>

<style lang="scss" scoped>
.user-admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .placeholder {
    width: 60rpx;
  }
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
  }
  .export-btn {
    margin-left: 20rpx;
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

.user-list {
  flex: 1;
  
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
  
  .user-item {
    margin: 20rpx;
    background-color: #fff;
    border-radius: 8rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .user-info {
      display: flex;
      margin-bottom: 20rpx;
    }
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-right: 20rpx;
    }
    
    .user-detail {
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
      
      .phone {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
      }

      .student-id {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
      }
      .class-name {
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
</style> 