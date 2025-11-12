<template>
  <view 
    class="detail-container pageBg"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 添加左侧边缘滑动区域 -->
    <view 
      class="edge-swipe-area"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    ></view>
    
    <!-- 状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 顶部导航 -->
	<!-- #ifndef MP-TOUTIAO -->
	<custom-nav-bar title="活动详情" :showBack="true" @backClick="goBack"></custom-nav-bar>
	<!-- #endif -->
    
    <!-- 活动内容 -->
    <scroll-view scroll-y class="detail-content">
      <!-- 活动海报 -->
      <view class="poster-container">
        <image 
          class="activity-poster" 
	        :src="getPosterUrl(activityDetail.poster)" 
          mode="aspectFill"
        ></image>
        <view class="poster-overlay">
	        <view class="status-tag" :class="getStatusClass(activityDetail)">
	          {{ getStatusText(activityDetail) }}
          </view>
        </view>
      </view>
      
      <!-- 活动标题 -->
      <view class="activity-title">
        <text>{{ activityDetail.title || '加载中...' }}</text>
      </view>
      
      <!-- 活动信息 -->
      <view class="info-section">
        <view class="info-item">
          <uni-icons type="calendar" size="18" color="#b13b7a"></uni-icons>
          <text>{{ formatFullDate(activityDetail.startTime) }} 至 {{ formatFullDate(activityDetail.endTime) }}</text>
        </view>
        <view class="info-item">
          <uni-icons type="location" size="18" color="#b13b7a"></uni-icons>
          <text>{{ activityDetail.address || '未设置地点' }}</text>
        </view>
        <view class="info-item">
          <uni-icons type="person" size="18" color="#b13b7a"></uni-icons>
          <text>{{ activityDetail.joinCount || 0 }}人已报名</text>
        </view>
        <view class="info-item">
          <uni-icons type="eye" size="18" color="#b13b7a"></uni-icons>
          <text>{{ activityDetail.viewCount || 0 }}次浏览</text>
        </view>
      </view>
      
      <!-- 社团信息 -->
      <view class="club-card" @tap="goToClub" v-if="clubInfo.id">
        <image class="club-logo" :src="clubInfo.logo || '/static/images/default-club.png'" mode="aspectFill"></image>
        <view class="club-info">
          <view class="club-name">{{ clubInfo.name || '加载中...' }}</view>
          <view class="club-desc">{{ clubInfo.description || '暂无简介' }}</view>
        </view>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
      
      <!-- 活动详情 -->
      <view class="detail-section">
        <view class="section-title">活动详情</view>
        <rich-text :nodes="activityDetail.description || '暂无详情'"></rich-text>
      </view>
      
      <!-- 已报名信息 -->
      <view v-if="hasApplied" class="applied-section">
        <view class="section-title">报名状态</view>
        <view :class="['apply-status', getApplyStatusClass(applyInfo.status)]">
          {{ getApplyStatusText(applyInfo.status) }}
        </view>
        
        <!-- 签到二维码 -->
        <view v-if="applyInfo.status === 1" class="check-in-section">
          <view class="check-in-tip">
          <uni-icons type="info" size="16" color="#ff9800"></uni-icons>
            <text>请出示二维码给管理员扫描完成签到</text>
          </view>
        </view>
        
        <view v-if="applyInfo.feedback" class="feedback-info">
          <view class="feedback-title">反馈信息：</view>
          <view class="feedback-content">{{ applyInfo.feedback }}</view>
        </view>
        
        <!-- 显示用户个人信息 -->
        <view class="apply-info">
          <view class="info-title">个人信息：</view>
          <view class="info-item">
            <text class="info-label">姓名：</text>
            <text class="info-value">{{ userInfo.username }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">学号：</text>
            <text class="info-value">{{ userInfo.studentId }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">手机号：</text>
            <text class="info-value">{{ userInfo.mobile }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">学院：</text>
            <text class="info-value">{{ userInfo.college }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">班级：</text>
            <text class="info-value">{{ userInfo.className }}</text>
          </view>
        </view>
      </view>
      
      <!-- 底部区域占位 -->
      <view style="height: 150rpx;"></view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="action-bar" v-if="!isPopupOpen">
      <view v-if="isAdmin" class="admin-actions">
        <button class="edit-btn" @tap="editActivity">编辑活动</button>
        <button class="manage-btn" @tap="manageApplies">管理报名</button>
      </view>
      
      <view v-else class="user-actions">
        <!-- 未报名且可以报名且按钮应该显示 -->
        <button v-if="!hasApplied && showApplyBtn" class="apply-btn" @tap="showApplyForm">立即报名</button>
        
        <!-- 已报名且报名已通过 -->
        <button v-else-if="hasApplied && applyInfo && applyInfo.status === 1" class="checkin-btn" @tap="showQRCode">
          {{ applyInfo && applyInfo.checkInStatus === 1 ? '已签到' : '签到' }}
        </button>
        
        <!-- 已报名但审核中，可以取消报名 -->
        <button v-else-if="hasApplied && applyInfo && applyInfo.status === 0" class="cancel-btn" @tap="cancelApply">取消报名</button>
        
        <!-- 不可报名状态 -->
        <button v-else class="disabled-btn" disabled>{{ getDisabledReason() }}</button>
      </view>
    </view>
    
    <!-- 报名表单弹窗 -->
    <uni-popup ref="applyPopup" type="bottom" @change="handlePopupChange">
      <view class="apply-popup-content">
        <view class="popup-header">
          <text class="popup-title">活动报名</text>
          <view class="close-btn" @tap="closeApplyForm">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <scroll-view scroll-y class="popup-content">
          <view v-if="formFields && formFields.length > 0" class="form-content">
            <view v-for="(field, idx) in formFields" :key="idx" class="form-item">
              <text class="form-label">{{ field.label }}{{ field.required ? ' *' : '' }}</text>
              
              <!-- 文本输入 -->
              <input 
                v-if="field.type === 'text'" 
                type="text" 
                v-model="field.value" 
                :placeholder="'请输入' + field.label"
                class="form-input"
              />
              
              <!-- 数字输入 -->
              <input 
                v-if="field.type === 'number'" 
                type="number" 
                v-model="field.value" 
                :placeholder="'请输入' + field.label"
                class="form-input"
              />
              
              <!-- 长文本 -->
              <textarea 
                v-if="field.type === 'textarea'" 
                v-model="field.value" 
                :placeholder="'请输入' + field.label"
                class="form-textarea"
              />
              
              <!-- 单选 -->
              <picker 
                v-if="field.type === 'select' || field.type === 'radio'" 
                mode="selector" 
                :range="field.options" 
                @change="(e) => onOptionChange(idx, e)"
              >
                <view class="form-picker">
                  {{ field.value || '请选择' + field.label }}
                </view>
              </picker>
              
              <!-- 多选 (checkbox) -->
              <view v-if="field.type === 'checkbox'" class="checkbox-group">
                <checkbox-group @change="(e) => onCheckboxChange(idx, e)">
                  <label v-for="(option, optIdx) in field.options" :key="optIdx" class="checkbox-item">
                    <checkbox :value="option" :checked="isOptionChecked(field.value, option)" />
                    <text class="checkbox-label">{{ option }}</text>
                  </label>
                </checkbox-group>
              </view>
              
              <!-- 日期选择 -->
              <picker 
                v-if="field.type === 'date'" 
                mode="date" 
                :value="field.value" 
                @change="(e) => onDateChange(idx, e)"
              >
                <view class="form-picker">
                  {{ field.value || '请选择日期' }}
                </view>
              </picker>
            </view>
          </view>
          
          <view v-else class="empty-form">
            <text>该活动无需填写报名信息</text>
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <view class="footer-buttons">
          <button class="cancel-btn" @tap="closeApplyForm">取消</button>
          <button class="confirm-btn" @tap="submitApply">确认报名</button>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 操作菜单 -->
    <uni-popup ref="actionSheet" type="bottom">
      <view class="action-sheet-content">
        <view class="action-item" @tap="shareActivity">
          <uni-icons type="redo" size="20" color="#333"></uni-icons>
          <text>分享活动</text>
        </view>
        <view v-if="isAdmin" class="action-item" @tap="cancelActivity">
          <uni-icons type="trash" size="20" color="#333"></uni-icons>
          <text>取消活动</text>
        </view>
        <view class="action-item cancel" @tap="hideActionSheet">取消</view>
      </view>
    </uni-popup>
    
    <!-- 二维码弹窗 -->
    <uni-popup ref="qrcodePopup" type="center">
      <view class="qrcode-popup">
        <view class="popup-header">
          <text class="popup-title">签到二维码</text>
          <view class="close-btn" @tap="closeQRCode">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="qrcode-content">
          <!-- 简化二维码显示方式 -->
          <image 
            class="qrcode-img" 
            :src="applyInfo.qrCodeUrl" 
            mode="aspectFit" 
            v-if="applyInfo && applyInfo.qrCodeUrl"
            @error="handleImageError"
            @load="handleImageLoad"
          ></image>
          
          <text v-if="!applyInfo || !applyInfo.qrCodeUrl" class="qrcode-tips">请向活动管理员出示此二维码完成签到</text>
          <text v-if="applyInfo && applyInfo.qrCodeUrl" class="qrcode-tips">请向活动管理员出示此二维码完成签到</text>
          <text class="qrcode-name">{{ userInfo.username || '未知用户' }}</text>
          <text class="qrcode-activity">{{ activityDetail.title }}</text>
          <view class="qrcode-status" :class="{ 'checked-in': applyInfo && applyInfo.checkInStatus === 1 }">
            {{ applyInfo && applyInfo.checkInStatus === 1 ? '已签到' : '未签到' }}
          </view>
          <view v-if="applyInfo && applyInfo.expireTime" class="qrcode-expire-time">
            签到码有效期: {{ formatExpireTime(applyInfo.expireTime) }}
          </view>
          <button v-if="applyInfo && applyInfo.qrCodeUrl" class="qrcode-refresh-btn" @tap="refreshCheckInCode">刷新签到码</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, watch, onBeforeUnmount, nextTick } from 'vue'
import { formatDate, getImageUrl } from '@/utils/common.js'
import wsClient from '@/utils/websocket'
import apiModule from '@/api/api.js'
import {
  getActualStatus,
  getStatusText,
  getStatusClass,
  getApplyStatusText,
  getApplyStatusClass,
  checkUserInfoComplete,
  getFieldDisplayName,
  parseFormFields,
  parseFormData,
  fillUserInfoToForm,
  validateFormData,
  buildFormData,
  notifyActivityDataChanged
} from '@/utils/activity.js'

const { proxy } = getCurrentInstance()

// 状态栏高度
const statusBarHeight = ref(20)
// 活动ID
const id = ref(null)
// 用户角色
const isAdmin = ref(false)
// 活动详情
const activityDetail = ref({})
// 社团信息
const clubInfo = ref({})
// 表单字段
const formFields = ref([])
// 报名信息
const applyInfo = ref(null)
// 是否已报名
const hasApplied = ref(false)
// 解析后的表单数据
const parsedForms = ref({})
// 用户信息
const userInfo = ref({
  name: '',
  studentId: ''
})

// 弹窗引用
const applyPopup = ref(null)
const qrcodePopup = ref(null)
const actionSheet = ref(null)

// 控制底部按钮区域的显示
const isPopupOpen = ref(false);

// 改进的触摸处理
const touchStartX = ref(0)
const touchStartY = ref(0) // 添加Y坐标检测
const touchEndX = ref(0)
const minSwipeDistance = 100
const edgeWidth = 30 // 边缘检测宽度，单位px

// 在script setup部分添加一个新的ref变量
const showApplyBtn = ref(false); // 默认隐藏，等确认不是管理员后再显示

// 弹窗状态变化处理
const handlePopupChange = (e) => {
  // 弹窗打开时，隐藏底部按钮区域
  isPopupOpen.value = e.show;
}

// 触摸开始事件处理
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].clientX
  touchStartY.value = e.changedTouches[0].clientY
}

// 触摸结束事件处理
const handleTouchEnd = (e) => {
  // 只有在屏幕左侧边缘开始的滑动才处理
  if (touchStartX.value > edgeWidth) {
    return
  }
  
  // 获取结束位置
  touchEndX.value = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  
  // 计算水平和垂直滑动距离
  const swipeDistanceX = touchEndX.value - touchStartX.value
  const swipeDistanceY = Math.abs(touchEndY - touchStartY.value)
  
  // 确保是水平滑动(X方向位移大于Y方向)且向右滑动距离超过阈值
  if (swipeDistanceX > minSwipeDistance && swipeDistanceX > swipeDistanceY * 1.5) {
    // 执行返回操作，不再判断页面栈
    goBack();
  }
}

// 初始化
onMounted(() => {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
    
  // 初始化applyInfo为空对象而不是null，避免属性访问错误
  applyInfo.value = {}
  
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage && currentPage.options) {
    id.value = currentPage.options.id
    
    // 检查是否有时间戳参数，表示需要强制刷新
    const timestamp = currentPage.options.t
    const forceRefresh = !!timestamp
    
    // 如果有时间戳参数或者没有传递活动数据，直接通过API加载最新数据
    if (forceRefresh || !currentPage.options.itemData) {
      loadActivityDetail()
    } else {
      // 尝试从参数中获取活动数据
      try {
        const itemData = JSON.parse(decodeURIComponent(currentPage.options.itemData))
        
        // 确保时间戳是数字类型
        activityDetail.value = {
          ...itemData,
          startTime: Number(itemData.startTime),
          endTime: Number(itemData.endTime)
        }
        
        // 获取社团信息
        if (activityDetail.value.clubId) {
          loadClubInfo(activityDetail.value.clubId)
        }
        
        // 解析表单字段
        parseFormFieldsFromData()
    
        // 判断是否可以报名
        checkCanApply()
        
        // 立即获取最新数据
        refreshActivityData()
      } catch (e) {
        console.error('解析活动数据失败:', e)
        // 解析失败时，回退到API请求
        loadActivityDetail()
      }
    }
    
    // 获取用户信息
    getUserInfo()

    // 检查是否已报名
    checkApplyStatus()

    // 监听签到成功事件，实现自动刷新
    uni.$on('activityCheckInSuccess', handleCheckInSuccess)

    // 设置WebSocket签到通知监听
    setupWebSocketListener()
  } else {
    console.error('获取页面参数失败')
    uni.showToast({
      title: '页面参数错误',
      icon: 'none'
    })
  }
})

// 组件销毁前清除事件监听
onBeforeUnmount(() => {
  // 移除签到成功事件监听
  uni.$off('activityCheckInSuccess', handleCheckInSuccess)

  // 移除WebSocket签到通知监听
  wsClient.messageHandlers.delete('check_in_notification')
})

// 处理签到成功事件
const handleCheckInSuccess = async (data) => {
  // 检查是否是当前活动的签到事件
  if (data && data.activityId && data.activityId.toString() === id.value.toString()) {
    console.log('收到签到成功事件，开始刷新活动详情')

    // 刷新用户的报名状态（包括签到状态），不显示加载框
    await checkApplyStatus(false)

    // 刷新活动数据
    await refreshActivityData()

    // 使用 nextTick 确保视图更新
    await nextTick()

    console.log('活动详情刷新完成，当前签到状态:', applyInfo.value.checkInStatus)
  }
}

// 设置WebSocket签到通知监听
const setupWebSocketListener = async () => {
  try {
    // 获取后端服务器地址
    const serverUrl = apiModule.baseURL || 'localhost:8081'

    // 检查WebSocket是否已连接
    if (!wsClient.isConnected) {
      console.log('【活动详情】WebSocket未连接，尝试连接...')
      try {
        // 传入 false 避免断开现有连接
        await wsClient.connect(serverUrl, false)
        console.log('【活动详情】WebSocket连接成功')
      } catch (error) {
        console.warn('【活动详情】WebSocket连接失败，将在重连后自动注册监听器:', error)
        // 不影响页面加载，WebSocket会自动重连
      }
    } else {
      console.log('【活动详情】WebSocket已连接，直接注册监听器')
    }

    // 注册签到通知消息处理器
    wsClient.onMessageType('check_in_notification', (message) => {
      console.log('【WebSocket】收到签到通知:', message)

      // 检查是否是当前活动的签到通知
      if (message.activityId && message.activityId.toString() === id.value.toString()) {
        console.log('【WebSocket】签到通知匹配当前活动，开始刷新')

        // 刷新活动数据和报名状态
        handleCheckInSuccess({
          activityId: message.activityId,
          checkInStatus: message.checkInStatus
        })

        // 显示签到成功提示
        uni.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        console.log('【WebSocket】签到通知不匹配当前活动', {
          messageActivityId: message.activityId,
          currentActivityId: id.value
        })
      }
    })

    console.log('WebSocket签到通知监听已设置，当前连接状态:', wsClient.isConnected)
  } catch (error) {
    console.error('设置WebSocket监听器失败:', error)
  }
}

// 刷新活动数据
const refreshActivityData = async () => {
  try {
    if (!id.value) return
    
    const res = await proxy.$api.activity.getActivityDetail(id.value)
    if (res.code === 200 && res.data) {
      // 更新活动详情数据，确保所有字段都更新
      const newData = res.data
      
      // 保存当前值以便比较
      const oldPoster = activityDetail.value.poster
      const oldJoinCount = activityDetail.value.joinCount
      const oldViewCount = activityDetail.value.viewCount
      
      // 更新整个对象
      Object.keys(newData).forEach(key => {
        activityDetail.value[key] = newData[key]
      })
      
      // 如果海报URL发生变化，记录日志
      if (oldPoster !== activityDetail.value.poster) {
        console.log('海报已更新:', activityDetail.value.poster)
      }
      
      // 记录报名人数和浏览量变化
      if (oldJoinCount !== activityDetail.value.joinCount || oldViewCount !== activityDetail.value.viewCount) {
        console.log('数据已更新:', {
          joinCount: activityDetail.value.joinCount,
          viewCount: activityDetail.value.viewCount
        })
      }
      
      // 重新检查是否可以报名
      checkCanApply()
    }
  } catch (error) {
    console.error('刷新活动数据失败:', error)
  }
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await proxy.$api.user.getUserInfo()
    if (res.code === 200) {
      userInfo.value = res.data
      
      // 检查用户是否是管理员
      checkAdmin()
    }
  } catch (error) {
    // 错误已处理
  }
}

// 加载活动详情
const loadActivityDetail = async () => {
  if (!id.value) {
    console.error('活动ID不存在')
    uni.showToast({
      title: '活动ID不存在',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({ title: '加载中...' })
    
    // 不再添加时间戳防止缓存
    const res = await proxy.$api.activity.getActivityDetail(id.value)
    
    if (res.code === 200 && res.data) {
      // 完全替换活动详情数据
      activityDetail.value = res.data
      
      // 获取社团信息
      if (activityDetail.value.clubId) {
        loadClubInfo(activityDetail.value.clubId)
      }
      
      // 解析表单字段
      parseFormFieldsFromData()
        
        // 判断是否可以报名
      checkCanApply()
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载活动详情失败:', error)
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 解析活动详情中的表单字段
const parseFormFieldsFromData = () => {
  try {
    console.log('解析表单字段，活动详情:', JSON.stringify(activityDetail.value));
    
    if (activityDetail.value && activityDetail.value.forms) {
      formFields.value = parseFormFields(activityDetail.value.forms);
    } else {
      console.log('活动没有自定义表单，使用默认表单');
      // 使用默认表单
      formFields.value = parseFormFields(null);
    }
  } catch (e) {
    console.error('解析表单字段失败:', e);
    // 解析失败时使用默认表单
    formFields.value = parseFormFields(null);
  }
}

// 加载社团信息
const loadClubInfo = async (clubId) => {
  try {
    const res = await proxy.$api.club.getClubDetail(clubId)
    if (res.code === 200) {
      clubInfo.value = res.data
    }
  } catch (error) {
    // 错误已处理
  }
}
    
    // 检查用户是否是管理员
const checkAdmin = async () => {
  try {
    // 确保有clubId再发送请求
    const clubId = activityDetail.value.clubId || (clubInfo.value ? clubInfo.value.id : null);
    if (!clubId) {
      isAdmin.value = false;
      console.log('没有clubId，设置为非管理员');
      checkCanApply(); // 确认不是管理员后，更新按钮状态
      return;
    }

    // 通过社团Id发送api查询
    const res = await proxy.$api.club.getUserRole(clubId);

    console.log('getUserRole 返回结果:', res);

    // 判断用户是否是管理员
    if (res.code === 200 && res.data && res.data.type > 0 && res.data.status == 1) {
      isAdmin.value = true;
      console.log('确认用户是管理员');
    } else {
      isAdmin.value = false;
      console.log('确认用户不是管理员');
    }

    // 管理员身份确认后，重新检查是否可以报名（更新按钮显示状态）
    checkCanApply();

    // 查询完管理员状态后，刷新活动数据以获取最新的浏览量和报名人数
    refreshActivityData();
  } catch (error) {
    console.error('检查管理员身份失败:', error);
    isAdmin.value = false;
    checkCanApply(); // 出错时也要更新按钮状态
  }
}


// 检查是否已报名
const checkApplyStatus = async (showLoading = true) => {
  try {
    if (!id.value) return

    if (showLoading) {
      uni.showLoading({ title: '加载中...' })
    }
    
    // 调用API检查用户是否已报名该活动
    const res = await proxy.$api.activity.checkApplyStatus(id.value)

    console.log('checkApplyStatus API 返回结果:', res)

    if (res.code === 200) {
      if (res.data) {
        // 有报名数据，表示已报名
        hasApplied.value = true
        // 直接替换整个对象以确保响应式更新
        applyInfo.value = { ...res.data }

        console.log('applyInfo 已更新:', JSON.stringify(applyInfo.value))
          
          // 解析已提交的表单数据
          try {
          if (applyInfo.value.forms) {
            // 使用工具函数解析表单数据
            parsedForms.value = parseFormData(applyInfo.value.forms)
            
            // 如果解析后是空对象，添加默认字段
            if (Object.keys(parsedForms.value).length === 0) {
              parsedForms.value = { reason: '用户未填写参加原因' }
            }
          } else {
            parsedForms.value = { reason: '用户未填写参加原因' }
          }
          } catch (e) {
          console.error('解析表单数据失败:', e)
          parsedForms.value = { reason: '表单数据解析失败' }
          }
        } else {
        // data为null，表示未报名
        hasApplied.value = false
        applyInfo.value = {} // 使用空对象而不是null
        parsedForms.value = {}
      }

      // 在获取报名状态后，不在这里更新按钮显示状态
      // 按钮状态由 checkAdmin() -> checkCanApply() 统一控制

      // 打印签到状态用于调试
      console.log('报名信息已更新:', {
        hasApplied: hasApplied.value,
        checkInStatus: applyInfo.value.checkInStatus,
        applyId: applyInfo.value.id
      })
    } else {
      uni.showToast({
        title: res.message || '获取报名状态失败',
        icon: 'none'
      })
      // 确保applyInfo是一个空对象而不是null
      applyInfo.value = {}
    }
  } catch (error) {
    console.error('检查报名状态失败:', error)
    hasApplied.value = false // 出错时默认为未报名
    applyInfo.value = {} // 使用空对象而不是null
    parsedForms.value = {}
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}
    
    // 判断是否可以报名
const checkCanApply = () => {
  // 获取活动实际状态
  const actualStatus = getActualStatus(activityDetail.value)

  console.log('checkCanApply 执行:', {
    isAdmin: isAdmin.value,
    actualStatus: actualStatus,
    hasApplied: hasApplied.value
  })

  // 如果用户是管理员，不显示报名按钮
  if (isAdmin.value) {
    showApplyBtn.value = false
    console.log('用户是管理员，隐藏报名按钮')
    return
  }

  // 只有在实际状态为"报名中"(2)时且未报名才可以报名
  showApplyBtn.value = actualStatus === 2 && !hasApplied.value
  console.log('用户不是管理员，showApplyBtn =', showApplyBtn.value)
}

// 获取无法报名的原因
const getDisabledReason = () => {
  // 如果用户已报名但不符合上面的条件
  if (hasApplied.value) {
    return '您已报名此活动';
  }

  const actualStatus = getActualStatus(activityDetail.value);

  if (actualStatus === 0) {
    return '活动已取消';
  }

  if (actualStatus === 1) {
    return '计划中';
  }

  if (actualStatus === 3) {
    return '活动进行中';
  }

  if (actualStatus === 4) {
    return '活动已结束';
  }

  return '报名已截止';
}
    
    // 格式化完整日期
const formatFullDate = (timestamp) => {
      if (!timestamp) return '未设置'
  timestamp = Number(timestamp)
      const date = new Date(timestamp)
  return formatDate(date)
}

// 获取字段标签
const getFieldLabel = (key) => {
  const field = formFields.value.find(f => f.key === key)
  return field ? field.label : getFieldDisplayName(key) || key
}

// 返回上一页
const goBack = () => {
  // 获取当前页面栈
  const pages = getCurrentPages()
  
  // 先发送数据变化事件，确保列表刷新
  notifyActivityDataChanged()
  
  // 添加短暂延迟，确保通知事件被处理
  setTimeout(() => {
    // 如果页面栈中有多个页面，说明可以返回
    if (pages.length > 1) {
    // 返回上一页
      uni.navigateBack()
    } else {
      // 如果没有上一页，跳转到活动列表页
      uni.switchTab({
        url: '/pages/activity/activity'
      })
    }
  }, 100) // 添加100ms延迟
}
    
    // 前往社团详情
const goToClub = () => {
  if (clubInfo.value.id) {
      uni.navigateTo({
      url: `/pages/club/detail?id=${clubInfo.value.id}`
      })
  }
}

// 显示报名表单
const showApplyForm = () => {
  // 立即隐藏报名按钮
  showApplyBtn.value = false;
  
  // 检查用户信息是否完善
  const result = checkUserInfoComplete(userInfo.value);
  if (!result.isComplete) {
    uni.showModal({
      title: '信息不完整',
      content: `您的个人信息不完整，缺少: ${result.missingFields.join('、')}，请先完善个人信息后再报名活动`,
      confirmText: '去完善',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({
            url: '/pages/user/user'
          });
        } else {
          // 如果用户取消，恢复报名按钮
          showApplyBtn.value = true;
        }
      }
    });
    return;
  }
  
  // 如果表单字段为空，尝试重新解析
  if (!formFields.value || formFields.value.length === 0) {
    parseFormFieldsFromData();
  }
  
  // 确保表单字段存在
  if (formFields.value && formFields.value.length > 0) {
    console.log('填充前的表单字段:', JSON.stringify(formFields.value));
    
    // 自动填充用户信息到表单
    formFields.value = fillUserInfoToForm(formFields.value, userInfo.value);
    
    console.log('填充后的表单字段:', JSON.stringify(formFields.value));
  } else {
    console.error('表单字段为空，无法显示报名表单');
      uni.showToast({
      title: '表单加载失败，请重试',
        icon: 'none'
    });
    // 恢复报名按钮
    showApplyBtn.value = true;
    return;
  }
  
  applyPopup.value.open();
}

// 关闭报名表单
const closeApplyForm = () => {
  applyPopup.value.close();
  
  // 恢复报名按钮状态，如果活动仍在报名中
  if (getActualStatus(activityDetail.value) === 1 && !hasApplied.value) {
    showApplyBtn.value = true;
  }
}
    
    // 选项变更
const onOptionChange = (index, e) => {
      const selectedIndex = e.detail.value
  formFields.value[index].value = formFields.value[index].options[selectedIndex]
}
    
    // 日期变更
const onDateChange = (index, e) => {
  formFields.value[index].value = e.detail.value
}
    
    // 提交报名
const submitApply = async () => {
  // 验证表单数据
  const validation = validateFormData(formFields.value)
  if (!validation.isValid) {
        uni.showToast({
      title: validation.errorMessage,
          icon: 'none'
        })
        return
      }
      
  // 构建表单数据
  const formData = buildFormData(formFields.value)
      
  try {
    uni.showLoading({ title: '提交中...' })
      
    // 调用API提交报名
    const res = await proxy.$api.activity.applyActivity(id.value, formData)
    
    // 确保无论成功与否都隐藏加载提示
        uni.hideLoading()
        
    if (res.code === 200) {
      // 先关闭表单弹窗
      closeApplyForm()
      
      // 更新本地状态
      hasApplied.value = true
      // 初始化为空对象，然后添加属性
      applyInfo.value = {
        id: res.data.applyId,
        activityId: id.value,
        userId: userInfo.value.id,
        status: res.data.status || 0,
          forms: JSON.stringify(formData),
          feedback: '',
        checkInStatus: 0,
        checkInTime: 0,
        createTime: Date.now(),
        qrCodeUrl: '', // 确保qrCodeUrl属性存在
        expireTime: 0  // 确保expireTime属性存在
        }
        
      // 保存解析后的表单数据，直接使用对象
      parsedForms.value = formData
        
      // 显示成功提示
        uni.showToast({
        title: res.data.needApproval ? '报名成功，等待审核' : '报名成功',
          icon: 'success'
        })
        
      // 报名成功后确保按钮不会再显示
      showApplyBtn.value = false
      
      // 重新检查报名状态和是否可以报名
      checkCanApply()
      
      // 立即刷新活动数据
      refreshActivityData()
    } else {
      // 显示错误提示
      uni.showToast({
        title: res.message || '报名失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('提交报名失败:', error)
    uni.hideLoading()
    
    // 尝试检查是否已经报名成功
    await checkApplyStatus()
    
    // 如果检查后发现已报名，不显示错误
    if (hasApplied.value) {
      // 如果已经报名成功，关闭表单
      closeApplyForm()
      // 确保按钮不会再显示
      showApplyBtn.value = false
    } else {
      uni.showToast({
        title: '提交请求失败，请稍后重试',
        icon: 'none'
      })
    }
  }
}
    
    // 取消报名
const cancelApply = () => {
  // 确保applyInfo存在且有id属性
  if (!applyInfo.value || !applyInfo.value.id) {
    uni.showToast({
      title: '报名信息不存在',
      icon: 'none'
    })
    return
  }
  
      uni.showModal({
        title: '取消报名',
        content: '确定要取消报名吗？',
    success: async (res) => {
          if (res.confirm) {
        try {
            uni.showLoading({
              title: '取消中...'
            })
            
          // 调用API取消报名
          const result = await proxy.$api.activity.cancelApply(applyInfo.value.id)
          
          if (result.code === 200) {
            hasApplied.value = false
            applyInfo.value = {} // 使用空对象而不是null
            parsedForms.value = {}
              
              // 清空表单
            formFields.value.forEach(field => {
                field.value = ''
              })
            
            // 重新显示报名按钮
            showApplyBtn.value = true
            
            // 重新检查是否可以报名
            checkCanApply()
            
            // 立即刷新活动数据
            refreshActivityData();
              
              uni.showToast({
                title: '已取消报名',
                icon: 'success'
              })
          } else {
            uni.showToast({
              title: result.message || '取消失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
          }
        }
      })
}

// 显示二维码按钮的点击处理函数
const showQRCode = async () => {
  try {
    // 确保applyInfo存在
    if (!applyInfo.value) {
        uni.showToast({
        title: '报名信息不存在',
          icon: 'none'
        })
        return
      }
	  if(applyInfo.value.checkInStatus === 1) {
		  uni.showToast({
		  title: '已签到',
		    icon: 'none'
		  })
		  return
	  }

    // 检查活动是否已开始
    const currentTime = Date.now()
    const startTime = Number(activityDetail.value.startTime)

    if (currentTime < startTime) {
      uni.showToast({
        title: '活动未开始，未到签到时间',
        icon: 'none',
        duration: 2000
      })
      return
    }


    // 显示加载中
    uni.showLoading({ title: '生成签到码中...' })
    
    // 调用后端接口生成签到码
    const res = await proxy.$api.activity.generateCheckInCode({
      activityId: id.value,
      applyId: applyInfo.value.id,
      expireMinutes: 1  // 1分钟有效期
    })
    
    if (res.code === 200 && res.data) {
      // 更新签到码信息
      if (res.data.checkInCode) {
        applyInfo.value.checkInCode = res.data.checkInCode
      }
      
      if (res.data.qrCodeUrl) {
        applyInfo.value.qrCodeUrl = res.data.qrCodeUrl
      } else {
        uni.showToast({
          title: '二维码生成失败',
          icon: 'none'
        })
        return
      }
      
      if (res.data.expireTime) {
        applyInfo.value.expireTime = res.data.expireTime
      }
      
      // 打开二维码弹窗
      qrcodePopup.value.open()
      
      // 设置定时器，在签到码过期前10秒提醒用户
      const now = Date.now()
      const expireTime = res.data.expireTime
      const timeToExpire = expireTime - now
      
      if (timeToExpire > 1000) {  // 如果还有超过10秒过期
            setTimeout(() => {
          if (qrcodePopup.value && qrcodePopup.value.isOpen) {  // 确保弹窗对象存在且在打开状态
            uni.showToast({
              title: '签到码即将过期，请点击刷新',
              icon: 'none',
              duration: 3000
            })
          }
        }, timeToExpire - 5 * 60 * 1000)
      }
    } else {
      uni.showToast({
        title: res.message || '生成签到码失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('生成签到码错误:', error)
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
              uni.hideLoading()
  }
}

// 格式化过期时间
const formatExpireTime = (timestamp) => {
  if (!timestamp) return '未设置'
  try {
    const date = new Date(Number(timestamp))
    return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
  } catch (error) {
    console.error('格式化时间错误:', error)
    return '时间格式错误'
  }
}

// 关闭二维码弹窗
const closeQRCode = () => {
  qrcodePopup.value.close()
}

// 刷新签到码
const refreshCheckInCode = async () => {
  await showQRCode()  // 重新调用showQRCode生成新的签到码
}

// 显示操作菜单
const showActionSheet = () => {
  actionSheet.value.open()
}

// 隐藏操作菜单
const hideActionSheet = () => {
  actionSheet.value.close()
}

// 分享活动
const shareActivity = () => {
              uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
  hideActionSheet()
}

// 取消活动
const cancelActivity = () => {
  uni.showModal({
    title: '取消活动',
    content: '确定要取消该活动吗？取消后无法恢复，已报名的用户将收到通知。',
    success: (res) => {
      if (res.confirm) {
        activityDetail.value.status = 0
        uni.showToast({
          title: '活动已取消',
                icon: 'success'
              })
      }
    }
  })
  hideActionSheet()
}

// 编辑活动
const editActivity = () => {
  // 在跳转到编辑页面前，先记录当前状态
  const currentTime = Date.now();
  
  // 使用redirectTo而不是navigateTo，避免页面栈堆积
  uni.redirectTo({
    url: `/pages/activity/edit?id=${id.value}&clubId=${activityDetail.value.clubId}`
  });
};

// 管理报名
const manageApplies = () => {
  uni.navigateTo({
    url: `/pages/activity/applies?id=${id.value}`
  });
};

// 处理多选框变更
const onCheckboxChange = (index, e) => {
  // 确保值是数组，然后转为逗号分隔的字符串
  const selectedValues = e.detail.value;
  if (Array.isArray(selectedValues) && selectedValues.length > 0) {
    formFields.value[index].value = selectedValues.join(',');
  } else {
    // 如果没有选择任何项，设置为空字符串
    formFields.value[index].value = '';
  }
  
  console.log(`选项变更 - 字段: ${formFields.value[index].label}, 值: ${formFields.value[index].value}`);
}

// 检查选项是否被选中
const isOptionChecked = (value, option) => {
  if (!value) return false;
  const values = value.split(',');
  return values.includes(option);
}

// 获取海报URL（不添加时间戳，保留缓存）
const getPosterUrl = (url) => {
  return getImageUrl(url, '/static/images/default-poster.png', false);
}

// 处理图片加载错误
const handleImageError = (e) => {
  console.error('二维码图片加载失败:', e)
  // 启用备用显示方式
  showBackupQRCode.value = true
  
  // 检查二维码URL的有效性
  if (applyInfo.value && applyInfo.value.qrCodeUrl) {
    console.log('尝试使用备用方式显示二维码:', applyInfo.value.qrCodeUrl.substring(0, 50) + '...')
          }
        }

// 图片加载成功
const handleImageLoad = () => {
  console.log('二维码图片加载成功')
  // 关闭备用显示方式
  showBackupQRCode.value = false
}

// 是否使用备用显示方式
const showBackupQRCode = ref(false)

// 检测用户授权相机权限
const checkCameraPermission = () => {
  // #ifdef APP-PLUS || MP-WEIXIN
  uni.getSetting({
    success: (res) => {
      if (!res.authSetting['scope.camera']) {
        uni.authorize({
          scope: 'scope.camera',
          success: () => {
            console.log('用户已授权相机权限')
          },
          fail: () => {
            uni.showModal({
              title: '提示',
              content: '需要相机权限才能扫描二维码，是否前往设置？',
              success: (res) => {
                if (res.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        })
      }
    }
  })
  // #endif
}
</script>

<style lang="scss" scoped>
.detail-container {
  position: relative;
}

.status-bar {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
}

.nav-header {
  background: rgba(255, 255, 255, 0.9);
  padding: 0 30rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .more-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.detail-content {
  height: calc(100vh - 180rpx);
}

.poster-container {
  position: relative;
  width: 100%;
  height: 420rpx;
}

.activity-poster {
  width: 100%;
  height: 100%;
}

.poster-overlay {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
}

.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
}

.status-tag.planned {
  background: rgba(255, 152, 0, 0.9);
}

.status-tag.signup {
  background: rgba(41, 121, 255, 0.9);
}

.status-tag.ongoing {
  background: rgba(76, 175, 80, 0.9);
}

.status-tag.ended {
  background: rgba(153, 153, 153, 0.9);
}

.status-tag.cancelled {
  background: rgba(244, 67, 54, 0.9);
}

.activity-title {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.activity-title text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.info-section {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item text {
  font-size: 28rpx;
  color: #666;
  margin-left: 16rpx;
}

.club-card {
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
}

.club-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.club-info {
  flex: 1;
  overflow: hidden;
}

.club-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.club-desc {
  font-size: 24rpx;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  line-height: 1.3;
}

.detail-section, .applied-section {
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.section-title {
  font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .form-content {
    margin-top: 30rpx;
  }
  
  .form-item {
    margin-bottom: 30rpx;
  }
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .form-input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  
  .form-textarea {
    width: 100%;
    height: 180rpx;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  
  .form-picker {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  
  .empty-form {
    text-align: center;
    padding: 40rpx 0;
  }
  
  .empty-form text {
    font-size: 28rpx;
    color: #999;
  }
  
  .apply-status {
    padding: 16rpx 30rpx;
    border-radius: 8rpx;
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 20rpx;
  }
  
  .apply-status.pending {
    color: #ff9800;
    background: #fff9e6;
  }
  
  .apply-status.approved {
    color: #4caf50;
    background: #e8f5e9;
  }
  
  .apply-status.rejected {
    color: #f44336;
    background: #ffebee;
  }
  
  .check-in-tip {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: #fff9e6;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
  }
  
  .check-in-tip text {
    font-size: 26rpx;
    color: #ff9800;
    margin-left: 10rpx;
  }
  
  .feedback-info {
    padding: 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
  }
  
  .feedback-title {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 10rpx;
  }
  
  .feedback-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
  }
  
  .action-bar {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
  }
  
  .admin-actions, .user-actions {
    display: flex;
    flex: 1;
    width: 100%; /* 确保占据整个宽度 */
  
    button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    margin: 0 10rpx;
    font-size: 28rpx;
    }
  }
  
  .edit-btn {
    background: #f0f0f0;
    color: #666;
  }
  
  .manage-btn, .apply-btn {
    background: #2979ff;
    color: #fff;
  }
  
  .checkin-btn {
    background: #4caf50;
    color: #fff;
  }
  
  .cancel-btn {
    background: #ff9800;
    color: #fff;
  }
  
  .disabled-btn {
    background: #f5f5f5;
    color: #999;
  }
  
  /* 操作菜单样式 */
  .action-sheet-content {
    background: #fff;
    border-radius: 20rpx 20rpx 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .action-item {
    height: 110rpx;
    line-height: 110rpx;
    text-align: center;
    font-size: 30rpx;
    color: #333;
    border-bottom: 1rpx solid #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-item text {
    margin-left: 10rpx;
  }
  
  .action-item.cancel {
    color: #999;
    margin-top: 16rpx;
    border-top: 16rpx solid #f5f5f5;
    border-bottom: none;
  }
  
  /* 报名弹窗样式 */
  .apply-popup-content {
    background: #fff;
    border-radius: 20rpx 20rpx 0 0;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .popup-header {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .popup-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }
  
  .close-btn {
    padding: 10rpx;
  }
  
  .popup-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
  }
  
  .popup-footer {
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    box-sizing: border-box;
  }
  
  .footer-buttons {
    display: flex;
    width: 100%;
  }
  
  .footer-buttons button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    margin: 0 10rpx;
    font-size: 28rpx;
  }
  
  .footer-buttons .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }
  
  .footer-buttons .confirm-btn {
    background: #b13b7a;
    color: #fff;
  }
  
  /* 已报名信息样式 */
  .apply-info {
    margin-top: 20rpx;
    padding: 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
  }
  
  .info-title {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
  
  .apply-info .info-item {
    margin-bottom: 12rpx;
    display: flex;
    align-items: flex-start;
  }
  
  .info-label {
    font-size: 26rpx;
    color: #666;
    min-width: 140rpx;
    flex-shrink: 0;
  }
  
  .info-value {
    font-size: 26rpx;
    color: #333;
    flex: 1;
    word-break: break-all;
    line-height: 1.4;
  }
  
  /* 新增样式 */
  .action-bar {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    
    .admin-actions, .user-actions {
      display: flex;
      flex: 1;
      
      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;
        margin: 0 10rpx;
        font-size: 28rpx;
      }
    }
    
    .manage-btn, .apply-btn {
      background: #b13b7a;
      color: #fff;
    }
  }
  
  .check-in-section {
    margin-top: 20rpx;
    
    .qrcode-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background: #b13b7a;
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
      margin-bottom: 20rpx;
    }
  }
  
  /* 二维码弹窗样式 */
  .qrcode-popup {
    background: #fff;
    border-radius: 16rpx;
    width: 600rpx;
    padding: 30rpx;
    position: relative;
    overflow: hidden;
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #f5f5f5;
      margin-bottom: 30rpx;
      
      .popup-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        padding: 10rpx;
      }
    }
    
    .qrcode-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 0;
      
      .qrcode-img {
        width: 400rpx;
        height: 400rpx;
        margin-bottom: 30rpx;
        border: 1px solid #eee;
        box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
        padding: 10rpx;
        background-color: #fff;
      }
      
      .qrcode-tips {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
        text-align: center;
      }
      
      .qrcode-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .qrcode-activity {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
        text-align: center;
      }
      
      .qrcode-status {
        padding: 8rpx 30rpx;
        border-radius: 30rpx;
        background: #f8f8f8;
        color: #ff8400;
        font-size: 28rpx;
        margin-bottom: 20rpx;
        
        &.checked-in {
          background: #e6f7ec;
          color: #07c160;
        }
      }
    
      .qrcode-expire-time {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 30rpx;
      }
    
      .qrcode-refresh-btn {
        padding: 10rpx 30rpx;
        background: #f0f0f0;
        color: #333;
        font-size: 28rpx;
        border-radius: 30rpx;
        border: none;
        
        &:active {
          background: #e0e0e0;
        }
      }
    }
  }

  /* 备用二维码显示方式 */
  .backup-qrcode {
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    background: #f8f8f8;
    border-radius: 8rpx;
    padding: 10rpx 20rpx;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    margin: 10rpx 0;
  }

  .checkbox-label {
    font-size: 28rpx;
    margin-left: 10rpx;
  }

  /* 添加边缘滑动区域样式 */
  .edge-swipe-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 30rpx; /* 与edgeWidth对应 */
    height: 100%;
    z-index: 999;
    /* 不设置背景色，保持透明 */
  }

  .qrcode-img {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: 20rpx;
    background: #f5f5f5;
  }

  .backup-qrcode {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  </style>