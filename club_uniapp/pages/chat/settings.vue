<template>
  <view class="settings-container pageBg">
	<!-- 状态栏 -->
	<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

	<!-- 顶部导航 -->
	<!-- #ifndef MP-TOUTIAO -->
	<custom-nav-bar title="群聊设置" :showBack="true"></custom-nav-bar>
	<!-- #endif -->

	<!-- 设置内容 -->
	<scroll-view scroll-y class="settings-content">
	  <!-- 群组头像 -->
	  <view class="avatar-container">
		<view class="avatar-wrapper" @tap="changeAvatar">
		  <image
			class="group-avatar"
			:src="groupInfo.avatar || '/static/images/default-group.png'"
			mode="aspectFill"
		  />
		  <view class="avatar-mask" v-if="isOwner">
			<uni-icons type="camera-filled" size="24" color="#fff" />
		  </view>
		</view>
		<text class="avatar-hint" v-if="isOwner">点击修改群头像</text>
		<text class="avatar-hint disabled" v-else>仅群主可修改</text>
	  </view>

	  <!-- 群组名称 -->
	  <view class="group-name">{{ groupInfo.name || '加载中...' }}</view>

	  <!-- 群组信息 -->
	  <view class="info-section">
		<view class="info-item">
		  <uni-icons type="person-filled" size="18" color="#b13b7a"></uni-icons>
		  <text>{{ groupInfo.memberCount || 0 }}名成员</text>
		</view>
		<view class="info-item" v-if="groupInfo.createTime">
		  <uni-icons type="calendar-filled" size="18" color="#b13b7a"></uni-icons>
		  <text>创建于 {{ formatDate(groupInfo.createTime) }}</text>
		</view>
	  </view>

	  <!-- 群简介 -->
	  <view class="detail-section" v-if="groupInfo.description">
		<view class="section-title">群简介</view>
		<view class="section-content">{{ groupInfo.description }}</view>
	  </view>

	  <!-- 操作按钮 -->
	  <view class="action-section">
		<view class="action-btn danger" @tap="quitGroup" v-if="!isOwner">
		  <uni-icons type="loop" size="20" color="#ff4d4f"></uni-icons>
		  <text>退出群聊</text>
		</view>
		<view class="action-btn danger" @tap="dismissGroup" v-if="isOwner">
		  <uni-icons type="trash-filled" size="20" color="#ff4d4f"></uni-icons>
		  <text>解散群聊</text>
		</view>
	  </view>
	</scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { chatAPI } from '@/api/api.js';
import apiModule from '@/api/api.js';
import { getUser } from '@/utils/auth.js';
import { getStatusBarHeight } from '@/utils/system.js';

const statusBarHeight = getStatusBarHeight();

// 群组ID
const groupId = ref(null);

// 群组信息
const groupInfo = reactive({
  name: '',
  avatar: '',
  description: '',
  memberCount: 0,
  ownerId: null,
  clubId: null,
  createTime: null
});

// 当前用户信息
const userInfo = getUser();
const currentUserId = ref(userInfo?.id ? Number(userInfo.id) : null);
const userRole = ref(0); // 0-普通成员 1-管理员 2-群主

// 计算属性
const isOwner = computed(() => {
  console.log('[权限检查] currentUserId:', currentUserId.value, 'ownerId:', groupInfo.ownerId);
  return currentUserId.value && groupInfo.ownerId && currentUserId.value === groupInfo.ownerId;
});
const isAdmin = computed(() => userRole.value === 1 || userRole.value === 2);

// 页面加载
onLoad(async (options) => {
  console.log('[群聊设置] 页面加载，参数:', options);
  if (options.id) {
	groupId.value = parseInt(options.id);
	await loadGroupInfo();
	await loadUserRole();
  }
});

// 加载群组信息
const loadGroupInfo = async () => {
  try {
	console.log('[群聊设置] 开始加载群组信息, groupId:', groupId.value);
	const res = await chatAPI.getGroupDetail(groupId.value);
	console.log('[群聊设置] 群组详情响应:', res);

	if (res.code === 200 && res.data) {
	  Object.assign(groupInfo, res.data);
	  console.log('[群聊设置] 群组信息加载成功:', groupInfo);
	  console.log('[群聊设置] ownerId:', groupInfo.ownerId, 'type:', typeof groupInfo.ownerId);
	  console.log('[群聊设置] createTime:', groupInfo.createTime, 'type:', typeof groupInfo.createTime);
	  console.log('[群聊设置] 格式化后的时间:', formatDate(groupInfo.createTime));
	} else {
	  uni.showToast({
		title: res.msg || '加载群组信息失败',
		icon: 'none'
	  });
	}
  } catch (error) {
	console.error('[群聊设置] 加载群组信息失败:', error);
	uni.showToast({
	  title: '加载群组信息失败',
	  icon: 'none'
	});
  }
};

// 加载用户在群中的角色
const loadUserRole = async () => {
  try {
	// 通过clubId获取用户角色
	if (!groupInfo.clubId) {
	  console.log('[群聊设置] clubId为空，无法获取角色');
	  return;
	}

	const res = await apiModule.club.getUserRole(groupInfo.clubId);
	console.log('[群聊设置] 用户角色响应:', res);

	if (res.code === 200 && res.data) {
	  userRole.value = res.data.type || 0;
	  console.log('[群聊设置] 用户角色:', userRole.value);
	}
  } catch (error) {
	console.error('[群聊设置] 加载用户角色失败:', error);
  }
};

// 修改群头像
const changeAvatar = () => {
  console.log('[修改头像] isOwner:', isOwner.value, 'currentUserId:', currentUserId.value, 'ownerId:', groupInfo.ownerId);

  if (!isOwner.value) {
	uni.showToast({
	  title: '仅群主可修改头像',
	  icon: 'none'
	});
	return;
  }

  uni.chooseImage({
	count: 1,
	sizeType: ['compressed'],
	sourceType: ['album', 'camera'],
	success: async (res) => {
	  const tempFilePath = res.tempFilePaths[0];

	  try {
		uni.showLoading({ title: '上传中...' });

		// 上传图片
		const uploadRes = await apiModule.common.upload(tempFilePath);
		console.log('[修改头像] 上传响应:', uploadRes);

		if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
		  // 更新群头像
		  const updateRes = await chatAPI.updateGroupInfo(groupId.value, {
			avatar: uploadRes.data.url
		  });
		  console.log('[修改头像] 更新响应:', updateRes);

		  if (updateRes.code === 200) {
			groupInfo.avatar = uploadRes.data.url;
			uni.showToast({
			  title: '头像修改成功',
			  icon: 'success'
			});
		  } else {
			uni.showToast({
			  title: updateRes.msg || '修改失败',
			  icon: 'none'
			});
		  }
		} else {
		  uni.showToast({
			title: uploadRes.msg || '上传失败',
			icon: 'none'
		  });
		}
	  } catch (error) {
		console.error('[修改头像] 失败:', error);
		uni.showToast({
		  title: '修改失败',
		  icon: 'none'
		});
	  } finally {
		uni.hideLoading();
	  }
	}
  });
};

// 退出群聊
const quitGroup = () => {
  uni.showModal({
	title: '退出群聊',
	content: '确定要退出该群聊吗？',
	confirmColor: '#ff4d4f',
	success: async (res) => {
	  if (res.confirm) {
		try {
		  uni.showLoading({ title: '退出中...' });

		  const response = await chatAPI.quitGroup(groupId.value);

		  if (response.code === 200) {
			uni.showToast({
			  title: '已退出群聊',
			  icon: 'success'
			});

			setTimeout(() => {
			  uni.navigateBack({ delta: 2 });
			}, 1500);
		  } else {
			uni.showToast({
			  title: response.msg || '退出失败',
			  icon: 'none'
			});
		  }
		} catch (error) {
		  console.error('[退出群聊] 失败:', error);
		  uni.showToast({
			title: '退出失败',
			icon: 'none'
		  });
		} finally {
		  uni.hideLoading();
		}
	  }
	}
  });
};

// 解散群聊
const dismissGroup = () => {
  uni.showModal({
	title: '解散群聊',
	content: '解散后，所有成员将被移出群聊。确定要解散该群聊吗？',
	confirmText: '确定解散',
	confirmColor: '#ff4d4f',
	success: async (res) => {
	  if (res.confirm) {
		try {
		  uni.showLoading({ title: '解散中...' });

		  const response = await chatAPI.dismissGroup(groupId.value);

		  if (response.code === 200) {
			uni.showToast({
			  title: '群聊已解散',
			  icon: 'success'
			});

			setTimeout(() => {
			  uni.navigateBack({ delta: 2 });
			}, 1500);
		  } else {
			uni.showToast({
			  title: response.msg || '解散失败',
			  icon: 'none'
			});
		  }
		} catch (error) {
		  console.error('[解散群聊] 失败:', error);
		  uni.showToast({
			title: '解散失败',
			icon: 'none'
		  });
		} finally {
		  uni.hideLoading();
		}
	  }
	}
  });
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) {
	console.log('[formatDate] timestamp为空');
	return '';
  }

  try {
	// 确保timestamp是数字类型
	const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

	if (isNaN(time)) {
	  console.error('[formatDate] 无效的时间戳:', timestamp);
	  return '';
	}

	const date = new Date(time);

	// 检查日期是否有效
	if (isNaN(date.getTime())) {
	  console.error('[formatDate] 无效的日期对象:', timestamp);
	  return '';
	}

	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	const formattedDate = `${year}-${month}-${day}`;
	console.log('[formatDate] 输入:', timestamp, '输出:', formattedDate);
	return formattedDate;
  } catch (error) {
	console.error('[formatDate] 格式化失败:', error, 'timestamp:', timestamp);
	return '';
  }
};
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
}

.status-bar {
  background: linear-gradient(to bottom, transparent, #fff 400rpx),
			  linear-gradient(to right, #beecd8 20%, #F4E2D8);
}

.settings-content {
  height: calc(100vh - 88rpx);
  padding: 40rpx 30rpx;
}

// 头像区域
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;

  .avatar-wrapper {
	position: relative;
	margin-bottom: 20rpx;

	.group-avatar {
	  width: 160rpx;
	  height: 160rpx;
	  border-radius: 20rpx;
	  background: #f0f0f0;
	}

	.avatar-mask {
	  position: absolute;
	  bottom: 0;
	  left: 0;
	  right: 0;
	  height: 50rpx;
	  background: rgba(0, 0, 0, 0.5);
	  border-bottom-left-radius: 20rpx;
	  border-bottom-right-radius: 20rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
  }

  .avatar-hint {
	font-size: 24rpx;
	color: #b13b7a;

	&.disabled {
	  color: #999;
	}
  }
}

// 群名称
.group-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

// 群信息
.info-section {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;

  .info-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 26rpx;
	color: #666;
  }
}

// 详情区域
.detail-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;

	&::before {
	  content: '';
	  display: inline-block;
	  width: 6rpx;
	  height: 28rpx;
	  background: #b13b7a;
	  margin-right: 12rpx;
	  border-radius: 3rpx;
	}
  }

  .section-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
  }
}

// 操作按钮
.action-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 60rpx;

  .action-btn {
	background: #fff;
	border-radius: 20rpx;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	font-size: 30rpx;
	color: #333;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

	&.danger {
	  color: #ff4d4f;

	  &:active {
		background: #fff1f0;
	  }
	}

	&:active {
	  background: #f5f5f5;
	}
  }
}
</style>
