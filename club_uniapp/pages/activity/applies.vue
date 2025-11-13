<!-- pages/activity/applies.vue -->
<template>
  <view 
    class="applies-container pageBg"
  >
    <!-- 顶部导航 -->
	<!-- #ifndef MP-TOUTIAO -->
	<custom-nav-bar title="报名管理" :showBack="true" @backClick="goBack"></custom-nav-bar>
	<!-- #endif -->
    
    <!-- 操作按钮区域 -->
    <view v-if="isAdmin" class="action-buttons">
      <button class="scan-btn" @tap="scanCheckIn">
        <uni-icons type="scan" size="16" color="#fff"></uni-icons>
        <text>扫码签到</text>
      </button>
      <button class="export-btn" @tap="exportApplyList">
        <uni-icons type="download" size="16" color="#fff"></uni-icons>
        <text>导出报名表</text>
      </button>
    </view>
    
    <!-- 活动信息 -->
    <view class="activity-info">
      <view class="activity-title-wrap">
        <text class="activity-title">{{ activityInfo.title || '活动详情' }}</text>
      </view>
      <view class="activity-meta">
        <text class="meta-item">报名人数: {{ totalApply || 0 }}</text>
        <text class="meta-item">状态: {{ getStatusText(activityInfo) }}</text>
      </view>
    </view>
    
    <!-- 筛选选项 -->
    <view class="filter-tabs">
      <view 
        v-for="(tab, index) in filterTabs" 
        :key="index"
        :class="['filter-tab', { active: currentTab === index }]"
        @tap="switchTab(index)"
      >
        <text class="tab-name">{{ tab.name }}</text>
        <view class="tab-indicator" v-if="currentTab === index"></view>
      </view>
    </view>
    
    <!-- 报名列表 -->
    <scroll-view 
      scroll-y 
      class="apply-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="loading-box">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      
      <view v-else-if="filteredApplyList.length === 0" class="empty-box">
        <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无报名记录</text>
      </view>
      
      <view v-else class="apply-items">
        <view 
          v-for="(item, index) in filteredApplyList" 
          :key="index"
          class="apply-item"
        >
          <view class="user-info">
            <image class="avatar" :src="item.user.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
            <view class="user-detail">
              <text class="user-name">{{ item.user.username || '未知用户' }}</text>
              <view class="user-extra">
                <text class="user-id">学号: {{ item.user.studentId || '未知' }}</text>
                <text class="user-class">班级: {{ item.user.className || '未知' }}</text>
              </view>
            </view>
            <view :class="['apply-status', getApplyStatusClass(item.status)]">
              {{ getApplyStatusText(item.status) }}
            </view>
          </view>
          
          <!-- 表单信息 -->
          <view class="form-info" v-if="Object.keys(safeParseFormData(item.forms)).length > 0">
            <view 
              v-for="(value, key) in safeParseFormData(item.forms)" 
              :key="key"
              class="form-item"
            >
              <text class="form-label">{{ getFieldDisplayName(key) }}:</text>
              <text class="form-value">{{ value }}</text>
            </view>
          </view>
          
          <!-- 签到状态 -->
          <view class="checkin-status" v-if="item.status === 1">
            <text :class="['status-text', item.checkInStatus === 1 ? 'checked' : '']">
              {{ item.checkInStatus === 1 ? '已签到' : '未签到' }}
            </text>
            <text class="checkin-time" v-if="item.checkInStatus === 1">
              签到时间: {{ formatDate(item.checkInTime, 'MM-dd hh:mm') }}
            </text>
          </view>
          
          <!-- 操作按钮 -->
          <view v-if="isAdmin && item.status === 0" class="apply-actions">
            <button class="action-btn reject-btn" @tap="rejectApply(item.id)">拒绝</button>
            <button class="action-btn approve-btn" @tap="approveApply(item.id)">通过</button>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <uni-load-more v-if="filteredApplyList.length > 0" :status="loadMoreStatus"></uni-load-more>
      
      <!-- 底部占位，防止内容被扫码按钮遮挡 -->
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 拒绝原因弹窗 -->
    <uni-popup ref="rejectPopup" type="center">
      <view class="custom-popup">
        <view class="popup-title">拒绝原因</view>
        <view class="popup-content">
          <textarea
            class="reject-textarea"
            v-model="rejectReason"
            placeholder="请输入拒绝原因（选填）"
            maxlength="50"
            auto-height
          />
          <view class="count-container">
            <text class="count-text">{{rejectReason.length}}/50</text>
          </view>
        </view>
        <view class="popup-buttons">
          <view class="popup-button cancel" @tap="cancelReject">取消</view>
          <view class="popup-button confirm" @tap="confirmReject">确认</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { 
  getStatusText, 
  getApplyStatusText, 
  getApplyStatusClass,
  getFieldDisplayName,
  parseFormData
} from '@/utils/activity.js';
import { formatDate } from '@/utils/common.js';

// 获取组件实例
const { proxy } = getCurrentInstance();
// 是否为社团管理员且未被禁用
const isAdmin = ref(false);

// 状态栏高度
const statusBarHeight = ref(20);
// 活动ID
const id = ref('');
// 活动信息
const activityInfo = ref({});
// 报名列表
const applyList = ref([]);
// 总报名人数
const totalApply = ref(0);
// 加载状态
const loading = ref(true);
const refreshing = ref(false);
const loadMoreStatus = ref('more');
// 分页参数
const page = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
// 筛选选项
const filterTabs = [
  { name: '全部', status: null },
  { name: '待审核', status: 0 },
  { name: '已通过', status: 1 },
  { name: '已拒绝', status: 2 }
];
const currentTab = ref(0);

// 拒绝报名相关变量
const rejectPopup = ref(null);
const rejectReason = ref('');
const currentRejectId = ref(null);

// 筛选后的报名列表
const filteredApplyList = computed(() => {
  const status = filterTabs[currentTab.value].status;
  
  if (status === null) {
    return applyList.value;
  }
  
  return applyList.value.filter(item => item.status === status);
});

// 初始化
onMounted(() => {
  // 获取状态栏高度
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
  
  // 获取活动ID
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  id.value = currentPage.options.id;
  
  // 加载活动信息和报名列表
  loadActivityInfo();
  loadApplyList();
});

// 检查用户角色和状态
const checkUserRole = async (clubId) => {
  try {
    const res = await proxy.$api.club.getUserRole(clubId);
    if (res.code === 200 && res.data) {
      isAdmin.value = res.data.type > 0 && res.data.status === 1;
    }
  } catch (e) {
    isAdmin.value = false;
  }
};

// 加载活动信息
const loadActivityInfo = () => {
  uni.showLoading({ title: '加载中...' });
  
  proxy.$api.activity.getActivityDetail(id.value)
    .then(res => {
      if (res.code === 200) {
        activityInfo.value = res.data;
        // 加载完活动详情后检查用户角色
        if (activityInfo.value.clubId) {
          checkUserRole(activityInfo.value.clubId);
        }
        // 获取活动总报名人数
        if (res.data.applyCount !== undefined) {
          totalApply.value = res.data.applyCount;
        } else {
          // 如果API没有返回报名总数，则请求报名列表总数
          proxy.$api.activity.getApplyList(id.value, { page: 1, pageSize: 1 })
            .then(applyRes => {
              if (applyRes.code === 200 && applyRes.data.total !== undefined) {
                totalApply.value = applyRes.data.total;
              }
            });
        }
      } else {
        uni.showToast({
          title: res.message || '加载活动信息失败',
          icon: 'none'
        });
      }
    })
    .catch(error => {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

// 加载报名列表
const loadApplyList = (reset = true) => {
  if (reset) {
    page.value = 1;
    hasMore.value = true;
  }
  
  if (!hasMore.value && !reset) return;
  
  loading.value = true;
  
  // 构建查询参数
  const params = {
    page: page.value,
    pageSize: pageSize.value
  };
  
  // 如果有状态筛选，添加状态参数
  const status = filterTabs[currentTab.value].status;
  if (status !== null) {
    params.status = status;
  }
  
  proxy.$api.activity.getApplyList(id.value, params)
    .then(res => {
      if (res.code === 200) {
        if (reset) {
          applyList.value = res.data.list || [];
        } else {
          applyList.value = [...applyList.value, ...(res.data.list || [])];
        }
        
        hasMore.value = res.data.hasMore || false;
        loadMoreStatus.value = hasMore.value ? 'more' : 'noMore';
        
        // 更新页码
        if (hasMore.value) {
          page.value++;
        }
      } else {
        uni.showToast({
          title: res.message || '加载报名列表失败',
          icon: 'none'
        });
      }
    })
    .catch(error => {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    })
    .finally(() => {
      loading.value = false;
      refreshing.value = false;
    });
};

// 切换标签
const switchTab = (index) => {
  if (currentTab.value === index) return;
  
  currentTab.value = index;
  loadApplyList(true);
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  loadApplyList(true);
};

// 加载更多
const loadMore = () => {
  if (!hasMore.value) return;
  loadApplyList(false);
};

// 审核通过报名
const approveApply = (applyId) => {
  uni.showModal({
    title: '审核确认',
    content: '确定通过此报名申请吗？',
    success: (res) => {
      if (res.confirm) {
        // 显示加载中
        uni.showLoading({ title: '处理中...' });
        
        // 调用API审核报名
        proxy.$api.activity.reviewApply(applyId, {
          status: 1,  // 1表示通过
          feedback: '管理员已通过申请'
        })
        .then(res => {
          if (res.code === 200) {
            uni.showToast({
              title: '已通过',
              icon: 'success'
            });
            
            // 更新本地数据
            const index = applyList.value.findIndex(item => item.id === applyId);
            if (index !== -1) {
              applyList.value[index].status = 1;
            }
            
            // 刷新报名列表
            loadApplyList(true);
          } else {
            uni.showToast({
              title: res.message || '操作失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          console.error('审核报名失败:', error);
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          });
        })
        .finally(() => {
          uni.hideLoading();
        });
      }
    }
  });
};

// 拒绝报名 - 打开拒绝弹窗
const rejectApply = (applyId) => {
  // 设置当前操作的申请ID
  currentRejectId.value = applyId;
  // 显示弹窗
  proxy.$refs.rejectPopup.open('center');
};

// 确认拒绝报名
const confirmReject = () => {
  // 显示加载中
  uni.showLoading({ title: '处理中...' });
  
  // 调用API拒绝报名
  proxy.$api.activity.reviewApply(currentRejectId.value, {
    status: 2,  // 2表示拒绝
    feedback: rejectReason.value.trim() || '管理员已拒绝申请'
  })
  .then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '已拒绝',
        icon: 'success'
      });
      
      // 更新本地数据
      const index = applyList.value.findIndex(item => item.id === currentRejectId.value);
      if (index !== -1) {
        applyList.value[index].status = 2;
      }
      
      // 刷新报名列表
      loadApplyList(true);
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      });
    }
  })
  .catch(error => {
    console.error('拒绝报名失败:', error);
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    });
  })
  .finally(() => {
    uni.hideLoading();
    // 关闭弹窗
    proxy.$refs.rejectPopup.close();
  });
};

// 取消拒绝报名
const cancelReject = () => {
  proxy.$refs.rejectPopup.close();
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 扫码签到
const scanCheckIn = () => {
  // 确保活动ID存在
  if (!id.value) {
    uni.showToast({
      title: '活动ID不存在',
      icon: 'none'
    })
    return
  }
  
  // 调用扫码API
  uni.scanCode({
    scanType: ['qrCode'], // 只扫描二维码
    onlyFromCamera: true, // 只允许从相机扫码
    success: async (res) => {
      try {
        // 显示加载中
        uni.showLoading({ title: '验证签到码...' })
        
        // 获取扫描到的签到码
        const checkInCode = res.result
        
        // 检查签到码格式
        if (!checkInCode || checkInCode.trim() === '') {
          uni.showToast({
            title: '无效的签到码',
            icon: 'none'
          })
          return
        }
        
        console.log('扫描到签到码:', checkInCode)
        
        // 调用后端接口验证签到码
        const result = await proxy.$api.activity.verifyCheckInCode({
          activityId: id.value,
          checkInCode: checkInCode
        })
        
        if (result.code === 200) {
          // 签到成功
          uni.showToast({
            title: '签到成功',
            icon: 'success'
          })

          // 获取签到的用户信息用于提示
          const applyId = result.data.applyId
          const userId = result.data.userId
          let username = '用户'

          // 查找用户名以显示在提示中
          const index = applyList.value.findIndex(item =>
            item.id === applyId || item._id === applyId || item.applyId === applyId
          )

          if (index !== -1) {
            username = applyList.value[index].user?.username || '用户'
          }

          // 立即重新加载报名列表，以获取最新的签到状态和时间
          await loadApplyList(true)

          // 发送事件通知活动详情页面刷新
          uni.$emit('activityCheckInSuccess', {
            activityId: id.value,
            applyId: applyId
          })

          // 显示签到成功的用户名
          setTimeout(() => {
            uni.showToast({
              title: `${username} 签到成功`,
              icon: 'none',
              duration: 2000
            })
          }, 1000)
        } else {
          // 签到失败
          uni.showToast({
            title: result.message || '签到失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('扫码签到错误:', error)
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    fail: (err) => {
      console.error('扫码失败:', err)
      
      // 用户取消不提示
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return
      }
      
      uni.showToast({
        title: '扫码失败，请重试',
        icon: 'none'
      })
    }
  })
}

// 添加导出报名表功能
const exportApplyList = async() => {
  try {
    uni.showLoading({ title: '导出中...' })

    const res = await proxy.$api.activity.exportApplyList(id.value)

    console.log('【导出】后端返回结果:', res)

    if (res.code === 200 && res.data) {
      const { url, fileName } = res.data

      console.log('【导出】文件URL:', url)
      console.log('【导出】文件名:', fileName)

      uni.downloadFile({
        url: url,
        success: (downloadRes) => {
          console.log('【导出】downloadFile success:', downloadRes)

          if (downloadRes.statusCode === 200) {
            const tempFilePath = downloadRes.tempFilePath
            console.log('【导出】临时文件路径:', tempFilePath)

            uni.hideLoading()

            // 直接使用临时文件打开，不保存到永久存储
            // 临时文件在小程序关闭时会自动清理，避免占用存储空间
            uni.openDocument({
              filePath: tempFilePath,
              showMenu: true,
              fileType: 'xlsx',
              success: () => {
                console.log('【导出】打开文档成功')
                uni.showToast({ title: '导出成功', icon: 'success' })
              },
              fail: (err) => {
                console.error('【导出】打开文档失败:', err)
                uni.showModal({
                  title: '提示',
                  content: '文件下载成功，但无法直接打开。错误: ' + (err.errMsg || '未知错误'),
                  showCancel: true,
                  cancelText: '取消',
                  confirmText: '复制链接',
                  success: (modalRes) => {
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
            uni.showModal({
              title: '下载失败',
              content: `状态码: ${downloadRes.statusCode}，是否复制链接？`,
              confirmText: '复制链接',
              success: (modalRes) => {
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
        },
        fail: (err) => {
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
            success: (modalRes) => {
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
    } else {
      console.error('【导出】接口返回错误:', res)
      uni.hideLoading()
      uni.showToast({ title: res.message || '导出失败', icon: 'none' })
    }
  } catch (error) {
    console.error('【导出】导出报名表失败:', error)
    uni.hideLoading()
    uni.showToast({ title: '导出失败: ' + (error.message || '未知错误'), icon: 'none' })
  }
}

// 安全解析表单数据，防止JSON.parse错误
const safeParseFormData = (formData) => {
  if (!formData) return {};
  
  // 如果已经是对象，直接返回
  if (typeof formData === 'object' && !Array.isArray(formData)) {
    return formData;
  }
  
  try {
    // 尝试标准JSON解析
    return JSON.parse(formData);
  } catch (e) {
    console.error('解析表单数据失败:', e);
    
    // 尝试处理可能的非标准JSON格式
    try {
      // 检查是否是类似 "参加原因: 我想参加" 这样的格式
      if (typeof formData === 'string') {
        // 检查是否是直接的表单文本，如"参加原因:xxx"
        if (formData.startsWith('参加')) {
          return { "参加原因": formData.includes(':') ? formData.split(':')[1].trim() : formData };
        }
        
        // 尝试处理键值对格式
        if (formData.includes(':')) {
          const result = {};
          // 简单分割键值对
          const pairs = formData.split(',');
          
          pairs.forEach(pair => {
            const colonIndex = pair.indexOf(':');
            if (colonIndex > 0) {
              const key = pair.substring(0, colonIndex).trim();
              const value = pair.substring(colonIndex + 1).trim();
              result[key] = value;
            }
          });
          
          if (Object.keys(result).length > 0) {
            return result;
          }
        }
        
        // 如果是单行文本，可能是参加原因
        if (!formData.includes('{') && !formData.includes('}')) {
          return { "参加原因": formData.trim() };
        }
      }
    } catch (e2) {
      console.error('尝试替代解析方法失败:', e2);
    }
    
    // 所有解析方法都失败，返回带有错误信息的对象
    return { "表单数据": "解析失败，原始数据: " + (formData.substring(0, 30) + (formData.length > 30 ? '...' : '')) };
  }
};
</script>

<style lang="scss" scoped>
.applies-container {
  position: relative;
  min-height: 100vh;
  padding-top: v-bind(statusBarHeight + 90 + 'px'); /* 状态栏 + 导航栏高度 */
  box-sizing: border-box;
  background-color: #f8f8f8;
}

.status-bar {
  width: 100%;
  background: #b13b7a;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 997;
}

.custom-navbar {
  position: fixed;
  top: v-bind(statusBarHeight + 'px');
  left: 0;
  width: 100%;
  height: 90rpx;
  background: #b13b7a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-sizing: border-box;
  z-index: 997;
  
  .navbar-left {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .navbar-title {
    font-size: 34rpx;
    color: #fff;
    font-weight: 500;
  }
  
  .navbar-right {
    width: 60rpx;
  }
}

.action-buttons {
  position: fixed;
  bottom: 30rpx;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.scan-btn {
  background: #b13b7a;
  color: #fff;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 16rpx rgba(177, 59, 122, 0.3);
  width: auto;
  margin: 0 auto;
  line-height: normal;
  max-width: 300rpx;
}

.export-btn {
  background: #b13b7a;
  color: #fff;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 16rpx rgba(177, 59, 122, 0.3);
  width: auto;
  line-height: normal;
  max-width: 300rpx;
  margin-left: 20rpx;
}

.activity-info {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  margin-top: 30rpx;
  
  .activity-title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .activity-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .activity-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .meta-item {
      font-size: 24rpx;
      color: #666;
      background: #f5f5f5;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
  }
}

/* 筛选选项Tab栏 */
.filter-tabs {
  display: flex;
  background: #fff;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 996;
  width: 100%;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  margin-bottom: 20rpx;
  
  .filter-tab {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    padding: 24rpx 0;
    
    .tab-name {
      position: relative;
      z-index: 2;
    }
    
    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #b13b7a;
      border-radius: 3rpx;
    }
    
    &.active {
      color: #b13b7a;
      font-weight: 500;
    }
  }
}

/* 报名列表滚动区域 */
.apply-list {
  height: calc(100vh - 200rpx); /* 减去导航栏和Tab栏的高度 */
  padding: 0 20rpx;
}

.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

/* 报名列表项样式 */
.apply-items {
  padding-bottom: 150rpx; /* 为底部浮动按钮留出空间 */
}

.apply-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      border: 1px solid #f0f0f0;
    }
    
    .user-detail {
      flex: 1;
      
      .user-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 6rpx;
        display: block;
      }
      
      .user-extra {
        display: flex;
        flex-wrap: wrap;
      }
      
      .user-id, .user-class {
        font-size: 24rpx;
        color: #999;
        margin-right: 20rpx;
      }
    }
    
    .apply-status {
      padding: 6rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      
      &.status-0 {
        background: #fff8e6;
        color: #ff9500;
      }
      
      &.status-1 {
        background: #e6f7ec;
        color: #07c160;
      }
      
      &.status-2 {
        background: #ffebee;
        color: #f44336;
      }
    }
  }
  
  .form-info {
    background: #f9f9f9;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .form-item {
      margin-bottom: 10rpx;
      font-size: 26rpx;
      display: flex;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .form-label {
        color: #666;
        width: 180rpx;
        flex-shrink: 0;
      }
      
      .form-value {
        color: #333;
        flex: 1;
        word-break: break-all;
      }
    }
  }
  
  .checkin-status {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .status-text {
      padding: 6rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      background: #f5f5f5;
      color: #999;
      margin-right: 20rpx;
      
      &.checked {
        background: #e6f7ec;
        color: #07c160;
      }
    }
    
    .checkin-time {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .apply-actions {
    display: flex;
    justify-content: flex-end;
    
    .action-btn {
      margin-left: 20rpx;
      padding: 10rpx 30rpx;
      border-radius: 30rpx;
      font-size: 26rpx;
      line-height: 1.5;
      margin-right: 0;
    }
    
    .reject-btn {
      background: #f5f5f5;
      color: #666;
    }
    
    .approve-btn {
      background: #b13b7a;
      color: #fff;
    }
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.loading-box {
  padding: 40rpx 0;
}

// 底部占位，防止内容被扫码按钮遮挡
.bottom-space {
  height: 120rpx;
  width: 100%;
}

// 拒绝原因弹窗样式
.custom-popup {
  width: 580rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 40rpx 0 30rpx;
}

.popup-content {
  padding: 0 40rpx;
}

.reject-textarea {
  width: 100% !important;
  min-height: 140rpx !important;
  padding: 24rpx !important;
  background-color: #ffffff !important;
  border: 1rpx solid #e5e5e5 !important;
  border-radius: 8rpx !important;
  font-size: 28rpx !important;
  line-height: 1.6 !important;
  color: #333 !important;
  box-sizing: border-box !important;
  outline: none !important;
}

.reject-textarea:focus {
  border-color: #e5e5e5 !important;
  background-color: #ffffff !important;
}

.reject-textarea::placeholder {
  color: #999 !important;
  font-size: 28rpx !important;
}

.count-container {
  text-align: center;
  padding: 20rpx 0;
}

.count-text {
  font-size: 26rpx;
  color: #999;
}

.popup-buttons {
  display: flex;
  border-top: 1px solid #eee;
}

.popup-button {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 30rpx;
}

.cancel {
  color: #666;
  border-right: 1px solid #eee;
}

.confirm {
  color: #007AFF;
  font-weight: 500;
}
</style> 