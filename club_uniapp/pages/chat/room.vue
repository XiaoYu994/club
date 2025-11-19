	<template>
	  <view class="chat-room-container pageBg" :class="{'panel-open': showMorePanel}">
		<!-- 顶部导航 -->
		<!-- #ifndef MP-TOUTIAO -->
		<custom-nav-bar :title="roomInfo.name || '聊天室'" :showBack="true">
			<template v-slot:left>
				<view class="nav-left-btns">
					<view class="nav-btn" @tap="toggleMemberDrawer">
						<uni-icons type="contact-filled" size="22" color="#333" />
						<text class="member-count-badge" v-if="roomInfo.memberCount">{{ roomInfo.memberCount }}</text>
					</view>
					<view class="nav-btn" @tap="goToSettings">
						<uni-icons type="gear-filled" size="22" color="#333" />
					</view>
				</view>
			</template>
		</custom-nav-bar>
		<!-- #endif -->
		
		<!-- 消息列表 -->
		<scroll-view 
		  class="chat-list" 
		  scroll-y 
		  @scrolltoupper="loadMoreMessages" 
		  upper-threshold="50" 
		  scroll-with-animation 
		  show-scrollbar="false" 
		  :scroll-into-view="scrollIntoViewId"
		>
		  <!-- 上拉加载提示区 -->
		  <view class="load-more" v-if="loading">
		    <view class="loading-icon"></view>
		    <text>正在加载更多...</text>
		  </view>
		  <view class="load-more" v-else-if="!hasMore">
		    <text>没有更多消息了</text>
		  </view>
		  
		  <!-- 消息容器 -->
		  <view class="messages-container">
		    <view v-for="(msg, idx) in messages" :key="msg.id" :id="'msg-'+msg.id" class="message-item">
			<!-- 时间分割线 -->
			<view class="time-divider" v-if="shouldShowDivider(idx)">
			  <text>{{ formatDividerTime(msg.createTime) }}</text>
			</view>
			
			<!-- 消息行 -->
			<view :class="['message-row', msg.senderId === userId ? 'self' : 'other']">
			  <!-- 他人消息 -->
			  <template v-if="msg.senderId !== userId">
				<view class="avatar-container">
				  <image class="avatar" :src="msg.senderAvatar || '/static/images/avatar-default.png'" mode="aspectFill" />
				</view>
				<view class="message-content">
				  <view class="sender-name">{{ msg.senderName || '未知用户' }}</view>
				  <view class="bubble">
					<template v-if="msg.contentType === 0">
					  <text class="text">{{ msg.content }}</text>
					</template>
					<template v-else-if="msg.contentType === 1">
					  <image class="image" :src="msg.mediaUrl" @tap="previewImage(msg.mediaUrl)" mode="widthFix" />
					</template>
					<template v-else-if="msg.contentType === 2">
					  <view class="file-box" @tap="openFile(msg.mediaUrl)">
						<uni-icons type="download" size="30" color="#2979ff" />
						<text class="file-name">{{ extractFileName(msg.mediaUrl) }}</text>
					  </view>
					</template>
					<template v-else-if="msg.contentType === 3">
					  <view class="location-box" @tap="openLocation(msg.content)">
						<uni-icons type="location" size="24" color="#ff9800" />
						<text class="location-name">{{ msg.content ? parseLocation(msg.content).name : '位置信息' }}</text>
					  </view>
					</template>
					<template v-else-if="msg.contentType === 4">
					  <view class="custom-box">
						<uni-icons type="info" size="24" color="#2979ff" />
						<text class="custom-text">自定义消息</text>
					  </view>
					</template>
				  </view>
				  <view class="time">{{ formatMessageTime(msg.createTime) }}</view>
				</view>
			  </template>
			  
			  <!-- 自己的消息 -->
			  <template v-else>
				<view class="message-content self">
				  <view class="bubble">
					<template v-if="msg.contentType === 0">
					  <text class="text">{{ msg.content }}</text>
					</template>
					<template v-else-if="msg.contentType === 1">
					  <image class="image" :src="msg.mediaUrl" @tap="previewImage(msg.mediaUrl)" mode="widthFix" />
					</template>
					<template v-else-if="msg.contentType === 2">
					  <view class="file-box" @tap="openFile(msg.mediaUrl)">
						<uni-icons  type="download" size="30" color="#2979ff" />
						<text class="file-name">{{ extractFileName(msg.mediaUrl) }}</text>
					  </view>
					</template>
					<template v-else-if="msg.contentType === 3">
					  <view class="location-box" @tap="openLocation(msg.content)">
						<uni-icons type="location" size="24" color="#ff9800" />
						<text class="location-name">{{ msg.content ? parseLocation(msg.content).name : '位置信息' }}</text>
					  </view>
					</template>
					<template v-else-if="msg.contentType === 4">
					  <view class="custom-box">
						<uni-icons type="info" size="24" color="#2979ff" />
						<text class="custom-text">自定义消息</text>
					  </view>
					</template>
				  </view>
				  <view class="time">{{ formatMessageTime(msg.createTime) }}</view>
				</view>
				<view class="avatar-container">
				  <image class="avatar" :src="userAvatar || '/static/images/avatar-default.png'" mode="aspectFill" />
				</view>
			  </template>
			</view>
		  </view>
		  </view>
		</scroll-view>
		
		<!-- 底部输入框 - 使用固定定位 -->
		<view class="input-area" :class="{'with-panel': showMorePanel}">
		  <!-- 扩展功能按钮 -->
		  <view class="more-btn" @tap="toggleMorePanel">
			<uni-icons type="plusempty" size="28" color="#666"></uni-icons>
		  </view>
		  
		  <!-- 文本输入 -->
		  <view class="input-wrapper">
			<textarea
			  class="message-input"
			  v-model="messageText"
			  auto-height
			  :maxlength="500"
			  :cursor-spacing="20"
			  :show-confirm-bar="false"
			  @input="handleInput"
			  @focus="inputFocus"
			  @blur="inputBlur"
			  placeholder="请输入消息..."
			></textarea>
		  </view>
		  
		  <!-- 发送按钮 -->
		  <view class="send-btn" @tap="sendMessage" :class="{'active': messageText.trim()}">
			<uni-icons type="paperplane-filled" size="24" color="#fff"></uni-icons>
		  </view>
		</view>
		
		<!-- 扩展功能面板 -->
		<view class="more-panel" v-if="showMorePanel">
		  <view class="panel-item" @tap="chooseImage">
			<view class="panel-icon">
			  <uni-icons type="image" size="28" color="#07c160"></uni-icons>
			</view>
			<text>图片</text>
		  </view>
		  <view class="panel-item" @tap="chooseLocation">
			<view class="panel-icon">
			  <uni-icons type="location" size="28" color="#ff9800"></uni-icons>
			</view>
			<text>位置</text>
		  </view>
		  <view class="panel-item" @tap="chooseFile">
			<view class="panel-icon">
			  <uni-icons type="folder-add" size="28" color="#2979ff"></uni-icons>
			  
			</view>
			<text>文件</text>
		  </view>
		</view>
	  </view>

	  <!-- 成员列表侧边栏（抽屉） -->
	  <view class="drawer-mask" v-if="showMemberDrawer" @tap="closeMemberDrawer" :class="{'show': showMemberDrawer}"></view>
	  <view class="member-drawer" :class="{'show': showMemberDrawer}">
		<!-- 侧边栏头部 -->
		<view class="drawer-header">
		  <view class="drawer-title">
			<text class="title-text">群成员</text>
			<text class="title-count">({{ memberList.length }})</text>
		  </view>
		  <view class="close-btn" @tap="closeMemberDrawer">
			<uni-icons type="closeempty" size="24" color="#666" />
		  </view>
		</view>

		<!-- 搜索栏 -->
		<view class="drawer-search">
		  <view class="search-input-wrapper">
			<uni-icons type="search" size="18" color="#999" />
			<input
			  class="search-input"
			  v-model="searchKeyword"
			  placeholder="搜索成员昵称或学号"
			  @input="handleSearchInput"
			/>
			<view class="clear-btn" v-if="searchKeyword" @tap="clearSearch">
			  <uni-icons type="clear" size="16" color="#999" />
			</view>
		  </view>
		</view>

		<!-- 成员列表 -->
		<scroll-view class="drawer-content" scroll-y>
		  <view class="member-list">
			<view
			  v-for="member in filteredMembers"
			  :key="member.userId"
			  class="member-item"
			>
			  <view class="avatar-wrapper">
				<image
				  class="avatar"
				  :src="member.avatar || '/static/images/avatar-default.png'"
				  mode="aspectFill"
				/>
				<view
				  class="online-dot"
				  :class="member.isOnline ? 'online' : 'offline'"
				></view>
			  </view>

			  <view class="member-info">
				<view class="nickname">
				  {{ member.nickname || member.username || '未知用户' }}
				  <text class="role-badge" v-if="member.role === 2">🎖️</text>
				  <text class="role-badge" v-else-if="member.role === 1">🛡️</text>
				</view>
				<view class="member-meta" v-if="member.studentId">
				  <text class="student-id">{{ member.studentId }}</text>
				</view>
			  </view>

			  <view class="member-status">
				<text class="status-text" :class="member.isOnline ? 'online' : 'offline'">
				  {{ member.isOnline ? '在线' : '离线' }}
				</text>
			  </view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="filteredMembers.length === 0 && !isLoadingMembers">
			  <uni-icons type="info" size="60" color="#ddd" />
			  <text class="empty-text">{{ searchKeyword ? '未找到相关成员' : '暂无群成员' }}</text>
			</view>

			<!-- 加载中 -->
			<view class="loading-state" v-if="isLoadingMembers">
			  <uni-icons type="spinner-cycle" size="30" color="#999" />
			  <text class="loading-text">加载中...</text>
			</view>
		  </view>
		</scroll-view>
	  </view>
	</template>

	<script setup>
	import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
	import { onLoad, onUnload, onBackPress, onHide } from '@dcloudio/uni-app';
	import apiModule, { chatAPI } from '@/api/api.js';
	import wsClient from '@/utils/websocket.js';
	import { getToken, getUser, setUser } from '@/utils/auth.js';
	import request from '@/utils/request.js';
	import { formatTime, formatDate, formatOnlyTime } from '@/utils/common.js';
	
	// 防抖函数，避免频繁操作
	const debounce = (fn, delay) => {
	  let timer = null;
	  return function(...args) {
	    if (timer) clearTimeout(timer);
	    timer = setTimeout(() => {
	      fn.apply(this, args);
	    }, delay);
	  };
	};
	
	// 页面栈计数器（用于判断是否完全退出聊天模块）
	let chatPageCount = 0;
	
	// 获取路由参数
	const groupId = ref(null);
	const roomInfo = reactive({
	  name: '',
	  avatar: '',
	  memberCount: 0,
	  clubId: null // 添加clubId字段
	});
	
	// 用户信息
	const userInfo = getUser();
	console.log('当前用户信息:', userInfo);
	
	// 用户ID
	const userIdValue = ref(null);
	if (userInfo && userInfo.id) {
	  userIdValue.value = Number(userInfo.id);
	  console.log('转换后的用户ID:', userIdValue.value);
	}
	
	const userId = computed(() => {
	  if (userIdValue.value !== null) {
	    return userIdValue.value;
	  }
	  const currentUser = getUser();
	  if (currentUser && currentUser.id) {
	    userIdValue.value = Number(currentUser.id);
	    console.log('重新获取用户ID:', userIdValue.value);
	    return userIdValue.value;
	  }
	  return null;
	});
	const userAvatar = ref(userInfo && userInfo.avatar ? userInfo.avatar : '/static/images/avatar-default.png');
	const userName = ref(userInfo && userInfo.name ? userInfo.name : '我');
	
	// 消息状态
	const messages = ref([]);
	const messageText = ref('');
	const loading = ref(false);
	const page = ref(1);
	const pageSize = ref(10);
	const hasMore = ref(true);
	const showMorePanel = ref(false);
	const scrollIntoViewId = ref('');

	// 成员列表相关状态
	const showMemberDrawer = ref(false); // 侧边栏显示状态
	const memberList = ref([]); // 成员列表数据
	const searchKeyword = ref(''); // 搜索关键词
	const isLoadingMembers = ref(false); // 加载状态
	const isOwner = ref(false); // 当前用户是否是群主
	const onlineUserIds = ref(new Set()); // 在线用户ID集合

	// 成员排序和过滤（计算属性）
	const sortedMembers = computed(() => {
	  // 复制数组避免直接修改原数组
	  const members = [...memberList.value];

	  // 排序规则：群主(2) > 管理员(1) > 普通成员(0)，同级别在线>离线，同状态按加入时间
	  return members.sort((a, b) => {
		// 1. 按角色排序（群主 > 管理员 > 成员）
		if (a.role !== b.role) {
		  return (b.role || 0) - (a.role || 0);
		}

		// 2. 按在线状态排序（在线 > 离线）
		if (a.isOnline !== b.isOnline) {
		  return b.isOnline ? 1 : -1;
		}

		// 3. 按加入时间排序（早 > 晚）
		return (a.joinTime || 0) - (b.joinTime || 0);
	  });
	});

	const filteredMembers = computed(() => {
	  if (!searchKeyword.value || !searchKeyword.value.trim()) {
		return sortedMembers.value;
	  }

	  const keyword = searchKeyword.value.trim().toLowerCase();
	  return sortedMembers.value.filter(member => {
		const nickname = (member.nickname || member.username || '').toLowerCase();
		const studentId = (member.studentId || '').toLowerCase();
		return nickname.includes(keyword) || studentId.includes(keyword);
	  });
	});

	// 初始化从后端获取用户信息
	async function initUserInfo() {
	  if (!getUser()) {
	    try {
	      const res = await apiModule.user.getUserInfo();
	      if (res.code === 200 && res.data) {
	        setUser(res.data);
	        userAvatar.value = res.data.avatar || userAvatar.value;
	        userName.value = res.data.name || userName.value;
	        userIdValue.value = Number(res.data.id);
	        console.log('从后端拉取并更新用户信息:', res.data);
	      }
	    } catch (e) {
	      console.error('获取用户信息失败:', e);
	    }
	  }
	}
	
	/**
	 * @description 更新消息处理函数（群组切换时调用）
	 */
	function updateMessageHandler() {
	  // 注册聊天室消息处理器（不清除全局处理器，避免影响通知功能）
	  wsClient.onMessageType('group_message', handleReceivedMessage);
	  wsClient.onMessageType('error', handleError);
	  console.log('【聊天室】消息处理器已注册');
	}
	
	/**
	 * @description 确保WebSocket连接，不会重复建立连接
	 */
	const connectWebSocket = async () => {
	  // 获取后端服务器地址，从api.js中引入baseURL
	  const serverUrl = apiModule.baseURL || 'localhost:8081';

	  if (wsClient.isConnected) {
	    console.log('【聊天室】WebSocket已连接，直接使用现有连接');
	    updateMessageHandler();
	    return;
	  }

	  console.log('【聊天室】WebSocket未连接，尝试连接...');
	  try {
	    // 传入 false 表示不强制重连，如果已连接则复用
	    await wsClient.connect(serverUrl, false);
	    console.log('【聊天室】WebSocket连接成功');
	    updateMessageHandler();
	  } catch (error) {
	    console.warn('【聊天室】WebSocket初次连接失败，正在重试...', error);
	    // 不主动提示用户，等待自动重连
	  }
	};
	
	/**
	 * @description 加载群组详情信息
	 */
	const loadGroupDetail = async () => {
	  try {
	    const response = await chatAPI.getGroupDetail(groupId.value);
	    if (response.code === 200) {
	      Object.assign(roomInfo, response.data);
	    } else {
	      uni.showToast({
	        title: response.msg || '获取群组信息失败',
	        icon: 'none'
	      });
	    }
	  } catch (error) {
	    console.error('获取群组详情失败:', error);
	  }
	};
	
	/**
	 * @description 格式化消息时间，用于显示时间分割线
	 */
	function formatDividerTime(timestamp) {
	  if (!timestamp) return '';
	  
	  let dateObj;
	  // 处理时间戳
	  if (typeof timestamp === 'number') {
	    dateObj = new Date(timestamp);
	  } 
	  // 处理ISO格式字符串
	  else if (typeof timestamp === 'string') {
	    if (timestamp.includes('T') || timestamp.includes('-')) {
	      dateObj = new Date(timestamp);
	    } else {
	      // 处理纯数字字符串
	      dateObj = new Date(parseInt(timestamp));
	    }
	  } 
	  // 处理Date对象
	  else if (timestamp instanceof Date) {
	    dateObj = timestamp;
	  }
	  
	  // 检查日期是否有效
	  if (isNaN(dateObj.getTime())) {
	    console.error('无效的时间格式:', timestamp);
	    return '未知时间';
	  }
	  
	  const now = new Date();
	  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	  const yesterday = new Date(today);
	  yesterday.setDate(yesterday.getDate() - 1);
	  
	  const msgDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
	  
	  // 今天的消息显示时间
	  if (msgDate.getTime() === today.getTime()) {
	    return `今天 ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
	  }
	  // 昨天的消息
	  else if (msgDate.getTime() === yesterday.getTime()) {
	    return `昨天 ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
	  }
	  // 今年的其他日期
	  else if (msgDate.getFullYear() === now.getFullYear()) {
	    return `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
	  }
	  // 其他年份
	  else {
	    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
	  }
	}
	
	/**
	 * @description 格式化消息时间，用于显示消息时间
	 */
	function formatMessageTime(timestamp) {
	  if (!timestamp) return '';
	  
	  let dateObj;
	  // 处理时间戳
	  if (typeof timestamp === 'number') {
	    dateObj = new Date(timestamp);
	  } 
	  // 处理ISO格式字符串
	  else if (typeof timestamp === 'string') {
	    if (timestamp.includes('T') || timestamp.includes('-')) {
	      dateObj = new Date(timestamp);
	    } else {
	      // 处理纯数字字符串
	      dateObj = new Date(parseInt(timestamp));
	    }
	  } 
	  // 处理Date对象
	  else if (timestamp instanceof Date) {
	    dateObj = timestamp;
	  }
	  
	  // 检查日期是否有效
	  if (isNaN(dateObj.getTime())) {
	    console.error('无效的时间格式:', timestamp);
	    return '未知时间';
	  }
	  
	  return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
	}
	
	/**
	 * @description 判断是否需要显示时间分割线
	 */
	const shouldShowDivider = (index) => {
	  // 仅在非首条消息显示，并且格式化时间非空
	  if (index <= 0) return false;
	  const dividerTime = formatDividerTime(messages.value[index].createTime);
	  if (!dividerTime) return false;
	  // 比较当前消息和前一条消息时间差
	  const currentMsg = messages.value[index];
	  const prevMsg = messages.value[index - 1];
	  if (!currentMsg || !prevMsg || !currentMsg.createTime || !prevMsg.createTime) return false;
	  let currentTime, prevTime;
	  try {
	    currentTime = typeof currentMsg.createTime === 'number'
	      ? currentMsg.createTime
	      : new Date(currentMsg.createTime).getTime();
	    prevTime = typeof prevMsg.createTime === 'number'
	      ? prevMsg.createTime
	      : new Date(prevMsg.createTime).getTime();
	    return Math.abs(prevTime - currentTime) > 5 * 60 * 1000;
	  } catch (e) {
	    console.error('比较消息时间出错:', e);
	    return false;
	  }
	};
	
	/**
	 * @description 加载初始消息
	 */
	async function loadInitialMessages() {
	  if (loading.value) return;
	  
	  loading.value = true;
	  try {
	    const response = await chatAPI.getGroupMessages(groupId.value, 1, pageSize.value);
	    if (response.code === 200) {
	            // 后端返回的数据是按时间降序排序的，需要反转为升序（最老的消息在前）
	      const pageMsgs = (response.data.list || []);
	      
	      // 预先处理消息数据
	      const processedMsgs = pageMsgs.map(msg => {
	        if (msg.createTime === undefined && msg.create_time) {
	          msg.createTime = msg.create_time;
	        }
	        msg.senderId = Number(msg.senderId);
	        if (userId.value) {
	          msg.isSelf = msg.senderId === userId.value;
	        } else {
	          msg.isSelf = false;
	        }
	        return msg;
	      });
	      
      // 反转消息顺序，使最老的消息在前，最新的消息在后
      messages.value = processedMsgs.reverse();
	      nextTick(() => {
        // 滚动到最新的消息（数组末尾）
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg) {
          scrollIntoViewId.value = 'msg-' + lastMsg.id;
        }
	      });
	      page.value = 2;
	      hasMore.value = processedMsgs.length >= pageSize.value;
	    } else {
	      uni.showToast({ title: response.msg || '获取消息失败', icon: 'none' });
	    }
	  } catch (error) {
	    console.error('获取消息历史失败:', error);
	  } finally {
	    loading.value = false;
	  }
	}
	
	// 节流版本的loadMoreMessages，避免频繁触发
	const loadMoreMessages = debounce(async () => {
	  if (loading.value || !hasMore.value) return;
	  
	  loading.value = true;
	  
	  try {
	    const response = await chatAPI.getGroupMessages(groupId.value, page.value, pageSize.value);
	    if (response.code === 200) {
	      const pageMsgs = (response.data.list || []);
	      // 预先处理消息数据，避免循环内多次处理
	      const processedMsgs = pageMsgs.map(msg => {
	        if (msg.createTime === undefined && msg.create_time) {
	          msg.createTime = msg.create_time;
	        }
	        msg.senderId = Number(msg.senderId);
	        if (userId.value) {
	          msg.isSelf = msg.senderId === userId.value;
	        } else {
	          msg.isSelf = false;
	        }
	        return msg;
	      });
	      
	      // 历史消息（更旧的）需要反转后添加到数组前面
	      if (processedMsgs.length > 0) {
	        // 反转历史消息顺序，然后添加到数组前面
	        const reversedMsgs = processedMsgs.reverse();
	        messages.value = [...reversedMsgs, ...messages.value];
	      }
	      page.value++;
	      hasMore.value = processedMsgs.length >= pageSize.value;
	    } else {
	      uni.showToast({ title: response.msg || '获取消息失败', icon: 'none' });
	    }
	  } catch (error) {
	    console.error('获取消息历史失败:', error);
	  } finally {
	    loading.value = false;
	  }
	}, 300);
	
	/**
	 * @description 处理接收到的WebSocket消息
	 */
	const handleReceivedMessage = (message) => {
	  if (message.groupId === groupId.value) {
	    message.senderId = Number(message.senderId);
	    
	    console.log('收到WebSocket消息:', message);
	    
	    if (message.contentType === 3) {
	      try {
	        if (typeof message.content === 'string') {
	          const locationData = JSON.parse(message.content);
	          if (!locationData.name) {
	            locationData.name = locationData.address || '位置信息';
	          }
	          message.content = JSON.stringify(locationData);
	        }
	      } catch (e) {
	        console.error('解析位置消息失败:', e);
	      }
	    }
	    
	    if (userId.value && message.senderId === userId.value) {
	      if (message.localMsgId) {
	        const localMsgIndex = messages.value.findIndex(msg => 
	          msg.isLocalMessage && msg.id === message.localMsgId);
	          
	        if (localMsgIndex !== -1) {
	          messages.value.splice(localMsgIndex, 1, message);
	          return;
	        }
	      }
	    }
	    
	    // 新消息添加到数组末尾（保持时间顺序）
	    messages.value.push(message);
	    nextTick(() => {
	      scrollIntoViewId.value = 'msg-' + message.id;
	    });
	    
	  }
	};
	
	/**
	 * @description 处理WebSocket错误消息
	 */
	const handleError = (message) => {
	  uni.showToast({
	    title: message.content || '发生错误',
	    icon: 'none'
	  });
	};
	
	/**
	 * @description 发送消息
	 */
	const sendMessage = () => {
	  const content = messageText.value.trim();
	  if (!content) return;
	
	  if (!userId.value) {
	    const currentUser = getUser();
	    if (currentUser && currentUser.id) {
	      userIdValue.value = Number(currentUser.id);
	    } else {
	      uni.showToast({ title: '用户信息获取失败', icon: 'none' });
	      return;
	    }
	  }
	
	  const timestamp = Date.now();
	  const avatar = userAvatar.value || '/static/images/avatar-default.png';
	  const localMsg = {
	    id: `local-${timestamp}`,
	    groupId: groupId.value,
	    senderId: userId.value,
	    senderName: userName.value,
	    senderAvatar: avatar,
	    createTime: timestamp,
	    content: content,
	    contentType: 0,
	    isLocalMessage: true
	  };
	  
	  // 添加到消息列表末尾（保持时间顺序）
	  messages.value.push(localMsg);
	  nextTick(() => {
	    scrollIntoViewId.value = 'msg-' + localMsg.id;
	  });
	
	  if (!wsClient.isConnected) {
	    uni.showToast({ title: '聊天服务未连接', icon: 'none' });
	    return;
	  }
	
	  const message = {
	    type: 'group_message',
	    groupId: groupId.value,
	    content: content,
	    contentType: 0,
	    localMsgId: localMsg.id
	  };
	
	  wsClient.sendMessage(message);
	
	  messageText.value = '';
	  showMorePanel.value = false;
	};
	
	// 输入处理
	const handleInput = (e) => {
	  messageText.value = e.detail.value;
	};
	
	const inputFocus = () => {
	  showMorePanel.value = false;
	};
	
	const inputBlur = () => {
	  // 可以在这里处理失去焦点的逻辑
	};
	
	// 切换更多面板
	const toggleMorePanel = () => {
	  showMorePanel.value = !showMorePanel.value;
	};
	
	/**
	 * 提取文件名
	 */
	const extractFileName = (url) => {
	  if (!url) return '未知文件';
	  const parts = url.split('/');
	  return parts[parts.length - 1];
	};
	
	/**
	 * 解析位置信息
	 */
	const parseLocation = (content) => {
	  try {
	    if (typeof content === 'string') {
	      return JSON.parse(content);
	    }
	    return content;
	  } catch (e) {
	    console.error('解析位置信息失败:', e);
	    return { name: '位置信息', address: '' };
	  }
	};
	
	/**
	 * 预览图片
	 */
	const previewImage = (url) => {
	  if (!url) return;
	  uni.previewImage({
	    urls: [url],
	    current: url
	  });
	};
	
	/**
	 * 打开文件
	 */
	const openFile = (url) => {
	  if (!url) {
	    uni.showToast({ title: '文件链接无效', icon: 'none' });
	    return;
	  }
	  
	  uni.showLoading({
	    title: '正在加载文件...',
	    mask: true
	  });
	  
	  // #ifdef H5
	  // H5平台可以直接在新窗口打开文件链接
	  window.open(url, '_blank');
	  uni.hideLoading();
	  // #endif
	  
	  // #ifdef APP-PLUS || MP-WEIXIN
	  uni.downloadFile({
	    url: url,
	    success: (res) => {
	      uni.hideLoading();
	      if (res.statusCode === 200) {
	        // #ifdef APP-PLUS
	        uni.openDocument({
	          filePath: res.tempFilePath,
	          success: function() {
	            console.log('打开文件成功');
	          },
	          fail: function(err) {
	            console.error('打开文件失败:', err);
	            uni.showToast({ title: '无法打开此类型文件', icon: 'none' });
	          }
	        });
	        // #endif
	        
	        // #ifdef MP-WEIXIN
	        // 微信小程序环境
	        wx.openDocument({
	          filePath: res.tempFilePath,
	          showMenu: true, // 显示右上角菜单，可以转发、收藏等操作
	          fileType: getFileType(url), // 尝试获取文件类型
	          success: function() {
	            console.log('打开文件成功');
	          },
	          fail: function(err) {
	            console.error('微信小程序打开文件失败:', err);
	            // 如果打开失败，提示用户复制链接
	            uni.showModal({
	              title: '打开失败',
	              content: '无法打开此类型文件，是否复制链接后手动打开？',
	              confirmText: '复制链接',
	              success: (res) => {
	                if (res.confirm) {
	                  uni.setClipboardData({
	                    data: url,
	                    success: () => {
	                      uni.showToast({ title: '链接已复制', icon: 'success' });
	                    }
	                  });
	                }
	              }
	            });
	          }
	        });
	        // #endif
	      } else {
	        uni.showToast({ title: '下载文件失败', icon: 'none' });
	      }
	    },
	    fail: (err) => {
	      uni.hideLoading();
	      console.error('下载文件失败:', err);
	      uni.showToast({ title: '下载文件失败', icon: 'none' });
	    }
	  });
	  // #endif
	  
	  // #ifdef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
	  // 其他小程序平台，提供复制链接选项
	  uni.hideLoading();
	  uni.showModal({
	    title: '查看文件',
	    content: '当前平台不支持直接查看文件，是否复制链接？',
	    confirmText: '复制链接',
	    success: (res) => {
	      if (res.confirm) {
	        uni.setClipboardData({
	          data: url,
	          success: () => {
	            uni.showToast({ title: '链接已复制', icon: 'success' });
	          }
	        });
	      }
	    }
	  });
	  // #endif
	};

	/**
	 * 根据URL获取文件类型
	 */
	const getFileType = (url) => {
	  if (!url) return '';
	  
	  const extension = url.split('.').pop().toLowerCase();
	  
	  // 映射常见文件扩展名到微信文档类型
	  const typeMap = {
	    'doc': 'doc',
	    'docx': 'doc',
	    'xls': 'xls',
	    'xlsx': 'xls',
	    'ppt': 'ppt',
	    'pptx': 'ppt',
	    'pdf': 'pdf',
	    'txt': 'txt'
	  };
	  
	  return typeMap[extension] || '';
	};
	
	/**
	 * 打开位置
	 */
	const openLocation = (content) => {
	  try {
	    const locationData = typeof content === 'string' ? JSON.parse(content) : content;
	    uni.openLocation({
	      latitude: Number(locationData.latitude),
	      longitude: Number(locationData.longitude),
	      name: locationData.name || '位置信息',
	      address: locationData.address || '',
	      success: () => {
	        console.log('打开位置成功');
	      },
	      fail: (err) => {
	        console.error('打开位置失败:', err);
	        uni.showToast({ title: '打开位置失败', icon: 'none' });
	      }
	    });
	  } catch (e) {
	    console.error('解析位置信息失败:', e);
	    uni.showToast({ title: '位置信息无效', icon: 'none' });
	  }
	};
	
	/**
	 * 选择图片并发送
	 */
	const chooseImage = () => {
	  uni.chooseImage({
	    count: 1,
	    sizeType: ['compressed'],
	    sourceType: ['album', 'camera'],
	    success: async (res) => {
	      const tempFilePath = res.tempFilePaths[0];
	      
	      // 检查WebSocket连接状态
	      if (!wsClient.isConnected) {
	        // 尝试重新连接
	        try {
	          uni.showLoading({ title: '正在连接聊天服务...' });
	          // 使用api.js中的baseURL，传入false避免断开现有连接
	          await wsClient.connect(apiModule.baseURL || 'localhost:8081', false);
	          uni.hideLoading();
	        } catch (error) {
	          uni.hideLoading();
	          uni.showToast({
	            title: '聊天服务连接失败，请稍后重试',
	            icon: 'none'
	          });
	          console.error('聊天服务连接失败:', error);
	          return;
	        }
	      }
	      
	      try {
	        // 显示上传中提示
	        uni.showLoading({
	          title: '正在上传图片...',
	          mask: true
	        });
	        
	        // 上传文件
	        const uploadRes = await apiModule.common.upload(tempFilePath);
	        uni.hideLoading();
	        
	        if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
	          const mediaUrl = uploadRes.data.url;
	          
	          // 创建本地消息
	          const timestamp = Date.now();
	          const localMsg = {
	            id: `local-${timestamp}`,
	            groupId: groupId.value,
	            senderId: userId.value,
	            senderName: userName.value,
	            senderAvatar: userAvatar.value || '/static/images/avatar-default.png',
	            createTime: timestamp,
	            content: '[图片]',
	            contentType: 1, // 图片类型
	            mediaUrl: mediaUrl,
	            isLocalMessage: true
	          };
	          
	          // 添加到消息列表末尾
	          messages.value.push(localMsg);
	          nextTick(() => {
	            scrollIntoViewId.value = 'msg-' + localMsg.id;
	          });
	          
	          // 发送消息到WebSocket
	          if (wsClient.isConnected) {
	            const message = {
	              type: 'group_message',
	              groupId: groupId.value,
	              content: '[图片]',
	              contentType: 1, // 图片类型
	              mediaUrl: mediaUrl,
	              localMsgId: localMsg.id
	            };
	            wsClient.sendMessage(message);
	          } else {
	            uni.showToast({ title: '聊天服务未连接，消息将在重连后发送', icon: 'none' });
	          }
	        } else {
	          uni.showToast({ 
	            title: uploadRes.message || '上传失败', 
	            icon: 'none' 
	          });
	          console.error('图片上传响应异常:', uploadRes);
	        }
	      } catch (error) {
	        uni.hideLoading();
	        console.error('上传图片失败', error);
	        uni.showToast({ 
	          title: '图片上传失败，请重试', 
	          icon: 'none' 
	        });
	      }
	    }
	  });
	  
	  showMorePanel.value = false;
	};
	
	/**
	 * 选择位置并发送
	 */
	const chooseLocation = () => {
	  uni.chooseLocation({
	    success: (res) => {
	      if (!res.name || !res.address || !res.latitude || !res.longitude) {
	        uni.showToast({ title: '未选择有效位置', icon: 'none' });
	        return;
	      }
	      
	      // 位置数据格式化
	      const locationData = {
	        name: res.name,
	        address: res.address,
	        latitude: res.latitude,
	        longitude: res.longitude
	      };
	      
	      // 创建本地消息
	      const timestamp = Date.now();
	      const localMsg = {
	        id: `local-${timestamp}`,
	        groupId: groupId.value,
	        senderId: userId.value,
	        senderName: userName.value,
	        senderAvatar: userAvatar.value || '/static/images/avatar-default.png',
	        createTime: timestamp,
	        content: JSON.stringify(locationData),
	        contentType: 3, // 位置类型
	        isLocalMessage: true
	      };
	      
	      // 添加到消息列表末尾（保持时间顺序）
	      messages.value.push(localMsg);
	      nextTick(() => {
	        scrollIntoViewId.value = 'msg-' + localMsg.id;
	      });
	      
	      // 发送消息到WebSocket
	      if (wsClient.isConnected) {
	        const message = {
	          type: 'group_message',
	          groupId: groupId.value,
	          content: JSON.stringify(locationData),
	          contentType: 3, // 位置类型
	          localMsgId: localMsg.id
	        };
	        wsClient.sendMessage(message);
	      } else {
	        uni.showToast({ title: '聊天服务未连接', icon: 'none' });
	      }
	    },
	    fail: (err) => {
	      console.error('选择位置失败:', err);
	    }
	  });
	  
	  showMorePanel.value = false;
	};
	
	/**
	 * 选择文件并发送
	 */
	const chooseFile = () => {
	  // 由于H5和小程序平台API不同，需要做兼容处理
	  // #ifdef APP-PLUS || H5
	  uni.chooseFile({
	    count: 1,
	    extension: ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
	    success: async (res) => {
	      handleFileUpload(res.tempFiles[0].path);
	    }
	  });
	  // #endif
	  
	  // #ifdef MP-WEIXIN
	  wx.chooseMessageFile({
	    count: 1,
	    type: 'file',
	    extension: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
	    success: async (res) => {
	      if (res.tempFiles && res.tempFiles.length > 0) {
	        const file = res.tempFiles[0];
	        console.log('选择的文件:', file);
	        handleFileUpload(file.path, file.name);
	      }
	    },
	    fail: (err) => {
	      console.error('选择文件失败:', err);
	  uni.showToast({
	        title: '选择文件失败',
	        icon: 'none'
	      });
	    }
	  });
	  // #endif
	  
	  // #ifdef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
	  uni.showToast({
	    title: '当前平台暂不支持文件发送',
	    icon: 'none'
	  });
	  // #endif
	  
	  showMorePanel.value = false;
	};
	
	/**
	 * 处理文件上传和发送
	 */
	const handleFileUpload = async (filePath, fileName = '') => {
	  try {
	    // 检查WebSocket连接状态
	    if (!wsClient.isConnected) {
	      // 尝试重新连接
	      try {
	        uni.showLoading({ title: '正在连接聊天服务...' });
	        // 使用api.js中的baseURL，传入false避免断开现有连接
	        await wsClient.connect(apiModule.baseURL || 'localhost:8081', false);
	        uni.hideLoading();
	      } catch (error) {
	        uni.hideLoading();
	        uni.showToast({
	          title: '聊天服务连接失败，请稍后重试',
	          icon: 'none'
	        });
	        console.error('聊天服务连接失败:', error);
	        return;
	      }
	    }
	    
	    // 显示上传中提示
	    uni.showLoading({
	      title: '正在上传文件...',
	      mask: true
	    });
	    
	    // 上传文件
	    const uploadRes = await apiModule.common.upload(filePath);
	    uni.hideLoading();
	    
	    if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
	      const mediaUrl = uploadRes.data.url;
	      const displayFileName = fileName || uploadRes.data.newFileName || extractFileName(filePath);
	      
	      // 创建本地消息
	      const timestamp = Date.now();
	      const localMsg = {
	        id: `local-${timestamp}`,
	        groupId: groupId.value,
	        senderId: userId.value,
	        senderName: userName.value,
	        senderAvatar: userAvatar.value || '/static/images/avatar-default.png',
	        createTime: timestamp,
	        content: displayFileName, // 将文件名作为消息内容，方便显示
	        contentType: 2, // 文件类型
	        mediaUrl: mediaUrl,
	        isLocalMessage: true
	      };
	      
	            // 添加到消息列表末尾（保持时间顺序）
      messages.value.push(localMsg);
	      nextTick(() => {
	        scrollIntoViewId.value = 'msg-' + localMsg.id;
	      });
	      
	      // 发送消息到WebSocket
	      if (wsClient.isConnected) {
	        const message = {
	          type: 'group_message',
	          groupId: groupId.value,
	          content: displayFileName, // 将文件名作为消息内容
	          contentType: 2, // 文件类型
	          mediaUrl: mediaUrl,
	          localMsgId: localMsg.id
	        };
	        wsClient.sendMessage(message);
	      } else {
	        uni.showToast({ title: '聊天服务未连接，消息将在重连后发送', icon: 'none' });
	      }
	    } else {
	      uni.showToast({ 
	        title: uploadRes.message || '上传失败', 
	        icon: 'none' 
	      });
	      console.error('文件上传响应异常:', uploadRes);
	    }
	  } catch (error) {
	    uni.hideLoading();
	    console.error('上传文件失败', error);
	    uni.showToast({ 
	      title: '文件上传失败，请重试', 
	      icon: 'none' 
	    });
	  }
	};

	/**
	 * 跳转到群组设置页面
	 */
	const goToSettings = () => {
	  console.log('[导航] 跳转到设置页面, groupId:', groupId.value);
	  if (!groupId.value) {
		uni.showToast({
		  title: '群组ID无效',
		  icon: 'none'
		});
		return;
	  }
	  uni.navigateTo({
		url: `/pages/chat/settings?id=${groupId.value}`,
		success: () => {
		  console.log('[导航] 成功跳转到设置页面');
		},
		fail: (err) => {
		  console.error('[导航] 跳转失败:', err);
		  uni.showToast({
			title: '打开设置页面失败',
			icon: 'none'
		  });
		}
	  });
	};

	/**
	 * 切换成员侧边栏显示状态
	 */
	const toggleMemberDrawer = () => {
	  if (!showMemberDrawer.value) {
		// 打开侧边栏时加载成员列表
		loadMembers();
	  }
	  showMemberDrawer.value = !showMemberDrawer.value;
	};

	/**
	 * 关闭成员侧边栏
	 */
	const closeMemberDrawer = () => {
	  showMemberDrawer.value = false;
	  // 关闭时清空搜索关键词
	  searchKeyword.value = '';
	};

	/**
	 * 加载群成员列表
	 */
	const loadMembers = async () => {
	  if (!groupId.value) {
		console.error('[成员列表] 群组ID为空');
		return;
	  }

	  isLoadingMembers.value = true;

	  try {
		console.log('[成员列表] 开始加载群成员, groupId:', groupId.value);

		// 先获取在线用户列表
		await fetchOnlineUsers();

		// 使用groupId调用群组成员接口
		console.log('[成员列表] 使用groupId获取群组成员列表:', groupId.value);
		const res = await chatAPI.getGroupMembers(groupId.value);
		console.log('[成员列表] API响应:', res);

		if (res.code === 200 && res.data) {
		  // 处理返回的成员数据
		  const members = res.data || [];
		  memberList.value = members.map(member => ({
			userId: member.userId,
			username: member.username || member.nickname,
			nickname: member.nickname || member.username,
			avatar: member.avatar,
			studentId: member.studentId,
			role: member.role || 0, // 0=普通成员, 1=管理员, 2=群主
			joinTime: member.joinTime || Date.now(),
			isOnline: member.isOnline || false // 后端已经返回在线状态
		  }));

		  console.log('[成员列表] 成员数据处理完成，共', memberList.value.length, '人');

		  // 检查当前用户是否是群主
		  const currentUserMember = memberList.value.find(m => m.userId === userId.value);
		  if (currentUserMember) {
			isOwner.value = currentUserMember.role === 2;
			console.log('[成员列表] 当前用户角色:', isOwner.value ? '群主' : currentUserMember.role === 1 ? '管理员' : '普通成员');
		  }
		} else {
		  console.error('[成员列表] API返回错误:', res.msg || '未知错误');
		  uni.showToast({
			title: res.msg || '加载成员列表失败',
			icon: 'none'
		  });
		}
	  } catch (error) {
		console.error('[成员列表] 加载失败:', error);
		uni.showToast({
		  title: '加载成员列表失败',
		  icon: 'none'
		});
	  } finally {
		isLoadingMembers.value = false;
	  }
	};

	/**
	 * 获取在线用户列表
	 */
	const fetchOnlineUsers = async () => {
	  try {
		const res = await chatAPI.getOnlineUsers();
		if (res.code === 200 && res.data && res.data.onlineUserIds) {
		  // 将数组转换为Set以便快速查找
		  onlineUserIds.value = new Set(res.data.onlineUserIds.map(id => Number(id)));
		  console.log('[在线用户] 获取在线用户列表成功，在线人数:', res.data.onlineCount);
		  return true;
		}
	  } catch (error) {
		console.error('[在线用户] 获取在线用户列表失败:', error);
		return false;
	  }
	};

	/**
	 * 检查成员在线状态（基于WebSocket连接）
	 */
	const checkMemberOnlineStatus = (userId) => {
	  // 使用从后端获取的在线用户列表
	  return onlineUserIds.value.has(Number(userId));
	};

	/**
	 * 处理搜索输入
	 */
	const handleSearchInput = debounce((e) => {
	  console.log('[成员搜索] 搜索关键词:', searchKeyword.value);
	}, 300);

	/**
	 * 清空搜索
	 */
	const clearSearch = () => {
	  searchKeyword.value = '';
	};

	// 页面加载
	onLoad(async (option) => {
	  chatPageCount++; // 页面栈增加
	  await initUserInfo();
	  
	  if (option.id) {
	    groupId.value = parseInt(option.id);
	    if (option.name) {
	      roomInfo.name = decodeURIComponent(option.name);
	    }
	    
	    console.log(`进入聊天室，群组ID: ${groupId.value}, 名称: ${roomInfo.name}`);
	    
	    // 连接WebSocket（如果未连接）并更新消息处理器
	    connectWebSocket();
	    
	    await loadGroupDetail();
	    await loadInitialMessages();
	  }
	});
	
	// 页面卸载
	onUnload(() => {
	  chatPageCount--;
	  if (chatPageCount === 0) {
	    // 当所有聊天页面都关闭时，才断开WebSocket
	    if (wsClient.isConnected) {
	      wsClient.disconnect();
	      console.log('所有聊天页面已关闭，断开WebSocket连接');
	    }
	  }
	});
	
	// 页面隐藏（保持连接）
	onHide(() => {
	  console.log('页面隐藏，保持WebSocket连接');
	});
	</script>

	<style lang="scss" scoped>
	.nav-right-btn {
	  padding: 0 20rpx;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}

	.chat-room-container {
	  display: flex;
	  flex-direction: column;
	  height: 100vh;
	  position: relative;
	  box-sizing: border-box;
	  padding-bottom: 120rpx; /* 为底部输入区域留出空间 */
	}

	/* 面板展开时，为消息列表额外预留空间（输入区+面板高度） */
	.chat-room-container.panel-open {
    padding-bottom: 420rpx; /* 120rpx 输入区 + 300rpx 面板 */
	}

	.chat-list {
	  flex: 1;
	  padding: 20rpx;
	  box-sizing: border-box;
	  background-color: #F6F6F6;
	  height: calc(100vh - 120rpx - var(--status-bar-height) - 44px);
	  /* 优化滚动性能 */
	  -webkit-overflow-scrolling: touch;
  /* 确保滚动视图从顶部开始 */
  display: flex;
  flex-direction: column;
	  
	  .load-more {
	    padding: 20rpx 0;
	    text-align: center;
	    
	    text {
	      font-size: 24rpx;
	      color: #999;
	    }
	    
	    .loading-icon {
	      display: inline-block;
	      width: 30rpx;
	      height: 30rpx;
	      border: 2rpx solid #999;
	      border-radius: 50%;
	      border-top-color: transparent;
	      animation: loading 0.8s linear infinite;
	      margin-right: 10rpx;
	      vertical-align: middle;
	    }
	    
	    @keyframes loading {
	      from { transform: rotate(0deg); }
	      to { transform: rotate(360deg); }
	    }
	  }
	  
	  .messages-container {
    /* 使用flex布局，消息从上到下正常排列 */
	    display: flex;
    flex-direction: column;
    /* 让容器根据内容自适应高度，不强制占满 */
    flex: 1;
    justify-content: flex-start;
	    
	    .message-item {
	      /* 每个消息项 */
	      width: 100%;
	      margin-bottom: 10rpx;
	    }
	  }
	  
	  .time-divider {
		text-align: center;
		padding: 10rpx 0;
		margin: 20rpx 0;
		
		text {
		  font-size: 24rpx;
		  color: #999;
		  background-color: rgba(0,0,0,0.1);
		  border-radius: 10rpx;
		  padding: 4rpx 16rpx;
		}
	  }
	  
	  .message-row {
		display: flex;
		margin-bottom: 30rpx;
		align-items: flex-start;
		will-change: transform; /* 提示浏览器这个元素会变化，优化渲染 */
		
		.avatar-container {
		  width: 80rpx;
		  height: 80rpx;
		  flex-shrink: 0;
		}
		
		.avatar {
		  width: 80rpx;
		  height: 80rpx;
		  border-radius: 8rpx;
		}
		
		.message-content {
		  max-width: 70%;
		  padding: 0 20rpx;
		  
		  .sender-name {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 6rpx;
		  }
		  
		  .bubble {
			padding: 20rpx;
			background: #FFFFFF;
			border-radius: 4rpx 16rpx 16rpx 16rpx;
			/* 支持中英文自动换行 */
			word-break: break-all;
			overflow-wrap: anywhere;
			word-wrap: break-word;
			display: inline-block;
			min-width: 40rpx;
			max-width: 100%;
			box-sizing: border-box;
			will-change: transform; /* 优化渲染性能 */
		  }
		  
		  .time {
			font-size: 24rpx;
			color: #999;
			margin-top: 8rpx;
			text-align: left;
		  }
		  
		  &.self {
			text-align: right;
			
			.bubble {
			  background: #95EC69;
			  border-radius: 16rpx 4rpx 16rpx 16rpx;
			}
			
			.time {
			  text-align: right;
			}
		  }
		}
		
		&.self {
		  justify-content: flex-end;
		}
		
		.text {
		  font-size: 28rpx;
		  line-height: 40rpx;
		  color: #333;
		  /* 文本支持中英文折行 */
		  word-break: break-all;
		  overflow-wrap: anywhere;
		  word-wrap: break-word;
		  white-space: pre-line;
		  max-width: 100%;
		  display: inline-block;
		}
		
		.image {
		  max-width: 400rpx;
		  border-radius: 8rpx;
		}
		
		.file-box, .location-box {
		  display: flex;
		  align-items: center;
		}
		
		.file-name, .location-name {
		  font-size: 28rpx;
		  color: #333;
		  margin-left: 10rpx;
		}
	  }
	}

	.input-area {
	  display: flex;
	  align-items: center;
	  padding: 20rpx;
	  background: #fff;
	  border-top: 1px solid #eee;
	  position: fixed;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  z-index: 100;
	  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
	  
	  .more-btn, .send-btn {
		width: 70rpx;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	  }
	  
	  .input-wrapper {
		flex: 1;
		margin: 0 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 16rpx;
		
		.message-input {
		  width: 100%;
		  min-height: 40rpx;
		  max-height: 180rpx;
		  font-size: 28rpx;
		  line-height: 1.5;
		}
	  }
	  
	  .send-btn {
		background: #ddd;
		border-radius: 35rpx;
		
		&.active {
		  background: #2979ff;
		}
	  }
	}

	/* 面板展开時，輸入區上移到面板上方 */
	.input-area.with-panel {
    bottom: 300rpx; /* 與面板高度一致 */
	}

	.more-panel {
	  display: flex;
	  flex-wrap: wrap;
	  padding: 30rpx 20rpx;
	  background: #fff;
	  border-top: 1px solid #eee;
	  position: fixed;
	  left: 0;
	  right: 0;
	  bottom: 0; /* 固定在最底部，位於輸入區下方 */
    height: 300rpx; /* 固定面板高度 */
    overflow: auto;
	  z-index: 99;
	  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
	  
	  .panel-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
		
		.panel-icon {
		  width: 100rpx;
		  height: 100rpx;
		  background: #f5f5f5;
		  border-radius: 20rpx;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  margin-bottom: 10rpx;
		}
		
		text {
		  font-size: 24rpx;
		  color: #666;
		}
	  }
	}

	/* ==================== 成员侧边栏样式 ==================== */

	// 导航栏左侧和右侧按钮容器
	.nav-left-btns,
	.nav-right-btns {
	  display: flex;
	  align-items: center;
	  gap: 20rpx;
	  flex-shrink: 0; // 防止按钮被压缩
	  white-space: nowrap; // 防止换行
	}

	// 导航栏单个按钮
	.nav-btn {
	  position: relative;
	  padding: 8rpx;
	  cursor: pointer;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-shrink: 0; // 防止按钮被压缩
	  min-width: 60rpx; // 确保按钮有最小宽度
	  min-height: 60rpx; // 确保按钮有最小高度
	  background: rgba(255, 255, 255, 0.8); // 添加半透明背景确保可见
	  border-radius: 50%; // 圆形按钮

	  .member-count-badge {
		position: absolute;
		top: 0;
		right: 0;
		min-width: 32rpx;
		height: 32rpx;
		line-height: 32rpx;
		padding: 0 8rpx;
		background: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		border-radius: 16rpx;
		text-align: center;
		transform: translate(30%, -30%);
	  }
	}

	// 兼容旧的单独按钮样式（保留以防万一）
	.nav-left-btn,
	.nav-right-btn {
	  position: relative;
	  padding: 8rpx;
	  cursor: pointer;

	  .member-count-badge {
		position: absolute;
		top: 0;
		right: 0;
		min-width: 32rpx;
		height: 32rpx;
		line-height: 32rpx;
		padding: 0 8rpx;
		background: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		border-radius: 16rpx;
		text-align: center;
		transform: translate(30%, -30%);
	  }
	}

	// 遮罩层
	.drawer-mask {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100vh;
	  background: rgba(0, 0, 0, 0.5);
	  opacity: 0;
	  transition: opacity 0.3s ease;
	  z-index: 998;
	  pointer-events: none;

	  &.show {
		opacity: 1;
		pointer-events: auto;
	  }
	}

	// 侧边栏容器
	.member-drawer {
	  position: fixed;
	  top: 0;
	  right: 0;
	  width: 80%;
	  max-width: 600rpx;
	  height: 100vh;
	  background: #fff;
	  transform: translateX(100%);
	  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	  z-index: 999;
	  display: flex;
	  flex-direction: column;
	  box-shadow: -4rpx 0 16rpx rgba(0, 0, 0, 0.1);

	  &.show {
		transform: translateX(0);
	  }
	}

	// 侧边栏头部
	.drawer-header {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  padding: 30rpx;
	  border-bottom: 1rpx solid #f0f0f0;
	  background: #fff;
	  // 添加顶部margin，为导航栏留出空间
	  margin-top: calc(var(--status-bar-height, 40px) + 88rpx);

	  .drawer-title {
		display: flex;
		align-items: baseline;

		.title-text {
		  font-size: 34rpx;
		  font-weight: 600;
		  color: #333;
		}

		.title-count {
		  margin-left: 8rpx;
		  font-size: 26rpx;
		  color: #999;
		}
	  }

	  .close-btn {
		padding: 8rpx;
		cursor: pointer;
	  }
	}

	// 搜索栏
	.drawer-search {
	  padding: 20rpx 30rpx;
	  background: #fff;
	  border-bottom: 1rpx solid #f0f0f0;

	  .search-input-wrapper {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		background: #f5f5f5;
		border-radius: 40rpx;
		height: 72rpx;

		.search-input {
		  flex: 1;
		  margin: 0 12rpx;
		  font-size: 28rpx;
		  background: transparent;
		  border: none;
		}

		.clear-btn {
		  padding: 8rpx;
		  cursor: pointer;
		}
	  }
	}

	// 侧边栏内容区
	.drawer-content {
	  flex: 1;
	  overflow-y: auto;
	}

	// 成员列表
	.member-list {
	  padding: 0;
	}

	.member-item {
	  display: flex;
	  align-items: center;
	  padding: 24rpx 30rpx;
	  border-bottom: 1rpx solid #f5f5f5;
	  transition: background 0.2s;

	  &:active {
		background: #f9f9f9;
	  }

	  // 头像容器
	  .avatar-wrapper {
		position: relative;
		margin-right: 20rpx;

		.avatar {
		  width: 80rpx;
		  height: 80rpx;
		  border-radius: 50%;
		  background: #f0f0f0;
		}

		// 在线状态小圆点
		.online-dot {
		  position: absolute;
		  bottom: 2rpx;
		  right: 2rpx;
		  width: 20rpx;
		  height: 20rpx;
		  border-radius: 50%;
		  border: 3rpx solid #fff;
		  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.1);

		  &.online {
			background: #52c41a;
		  }

		  &.offline {
			background: #bfbfbf;
		  }
		}
	  }

	  // 成员信息
	  .member-info {
		flex: 1;
		min-width: 0; // 防止flex子元素溢出

		.nickname {
		  font-size: 30rpx;
		  font-weight: 600;
		  color: #333;
		  line-height: 42rpx;
		  overflow: hidden;
		  text-overflow: ellipsis;
		  white-space: nowrap;

		  .role-badge {
			margin-left: 6rpx;
			font-size: 28rpx;
		  }
		}

		.member-meta {
		  margin-top: 6rpx;

		  .student-id {
			font-size: 24rpx;
			color: #999;
		  }
		}
	  }

	  // 状态文本
	  .member-status {
		.status-text {
		  font-size: 24rpx;
		  padding: 4rpx 12rpx;
		  border-radius: 12rpx;

		  &.online {
			color: #52c41a;
			background: #f6ffed;
		  }

		  &.offline {
			color: #999;
			background: #f5f5f5;
		  }
		}
	  }
	}

	// 空状态
	.empty-state {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  padding: 120rpx 60rpx;

	  .empty-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #999;
	  }
	}

	// 加载中状态
	.loading-state {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  padding: 80rpx 60rpx;

	  .loading-text {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
	  }
	}
	</style> 