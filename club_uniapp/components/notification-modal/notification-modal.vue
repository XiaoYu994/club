<template>
  <uni-popup ref="popup" type="center" :safe-area="false" :mask-click="true">
    <view class="notification-modal">
      <view class="modal-header">
        <uni-icons :type="notificationConfig.icon" :color="notificationConfig.color" size="40"></uni-icons>
      </view>
      <view class="modal-body">
        <text class="modal-title">{{ title }}</text>
        <text class="modal-message">{{ message }}</text>
        <view class="modal-extra" v-if="extraInfo">
          <text class="extra-text">{{ extraInfo }}</text>
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-btn confirm-btn" @tap="handleConfirm">{{ confirmText }}</button>
        <button class="modal-btn cancel-btn" v-if="showCancel" @tap="handleCancel">{{ cancelText }}</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed } from 'vue'

// 消息类型配置
const notificationTypes = {
  activity_cancel: {
    icon: 'info-filled',
    color: '#ff6b6b',
    defaultTitle: '活动取消通知',
  },
  check_in: {
    icon: 'checkmarkempty',
    color: '#51cf66',
    defaultTitle: '签到成功',
  },
  apply_approved: {
    icon: 'checkmarkempty',
    color: '#51cf66',
    defaultTitle: '报名审核通过',
  },
  apply_rejected: {
    icon: 'closeempty',
    color: '#ff6b6b',
    defaultTitle: '报名审核未通过',
  },
  club_apply_approved: {
    icon: 'checkmarkempty',
    color: '#51cf66',
    defaultTitle: '社团申请通过',
  },
  club_apply_rejected: {
    icon: 'closeempty',
    color: '#ff6b6b',
    defaultTitle: '社团申请未通过',
  },
  activity_reminder: {
    icon: 'calendar-filled',
    color: '#ff9800',
    defaultTitle: '活动提醒',
  },
  default: {
    icon: 'notification-filled',
    color: '#3b82f6',
    defaultTitle: '系统通知',
  }
}

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: false
  }
})

// Emit
const emit = defineEmits(['confirm', 'cancel'])

// Data
const popup = ref(null)
const title = ref('')
const message = ref('')
const extraInfo = ref('')
const currentType = ref(props.type)

// Computed
const notificationConfig = computed(() => {
  return notificationTypes[currentType.value] || notificationTypes.default
})

// Methods
/**
 * 打开弹窗
 * @param {Object} options - 配置项 {type, title, message, extraInfo}
 */
function open(options = {}) {
  currentType.value = options.type || props.type || 'default'
  title.value = options.title || notificationConfig.value.defaultTitle
  message.value = options.message || ''
  extraInfo.value = options.extraInfo || ''
  popup.value.open()
}

/**
 * 关闭弹窗
 */
function close() {
  popup.value.close()
}

/**
 * 确认按钮点击
 */
function handleConfirm() {
  emit('confirm')
  close()
}

/**
 * 取消按钮点击
 */
function handleCancel() {
  emit('cancel')
  close()
}

// 暴露方法
defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.notification-modal {
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 60rpx 40rpx 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-body {
  padding: 0 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
}

.modal-message {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  line-height: 1.6;
}

.modal-extra {
  width: 100%;
  margin-top: 10rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.extra-text {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  line-height: 1.5;
}

.modal-footer {
  padding: 30rpx 40rpx 40rpx;
  display: flex;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.confirm-btn::after {
  border: none;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666666;
}

.cancel-btn::after {
  border: none;
}
</style>
