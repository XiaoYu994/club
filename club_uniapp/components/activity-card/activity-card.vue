<template>
  <view class="activity-card" @tap="goToActivityDetail">
    <image class="activity-image" :src="activity.poster || '/static/images/default-club.png'" mode="aspectFill"></image>
    <view class="activity-info">
      <view class="activity-title">{{ activity.title }}</view>
      <view class="activity-meta">
        <view class="meta-item">
          <uni-icons type="calendar" size="14" color="#666"></uni-icons>
          <text>{{ formatDate(activity.startTime) }}</text>
        </view>
        <view class="meta-item">
          <uni-icons type="location" size="14" color="#666"></uni-icons>
          <text>{{ activity.address || '未设置地点' }}</text>
        </view>
      </view>
      <view class="activity-stats">
        <view :class="['activity-status', getStatusClass]">
          {{ statusText }}
        </view>
        <view class="activity-count">
          <text>{{ activity.joinCount || 0 }}人报名</text>
        </view>
      </view>
    </view>
    
    <!-- 管理員操作按鈕 -->
    <view v-if="isAdmin" class="action-buttons">
      <!-- 取消活动按钮，计划中和报名中状态显示 -->
      <view v-if="canCancel" class="action-btn cancel" @tap.stop="cancelActivity">
        <uni-icons type="close" size="16" color="#ff9800"></uni-icons>
      </view>
      <view class="action-btn edit" @tap.stop="editActivity">
        <uni-icons type="compose" size="16" color="#2979ff"></uni-icons>
      </view>
      <view class="action-btn delete" @tap.stop="deleteActivity">
        <uni-icons type="trash" size="16" color="#f44336"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/common.js'

// 定義組件的屬性
const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

// 定義組件的事件
const emit = defineEmits(['detail', 'edit', 'delete', 'cancel'])

// 計算活動狀態文本
const statusText = computed(() => {
  const status = props.activity.status

  // status=0: 已取消
  if (status === 0) {
    return '已取消'
  }

  // status=1: 计划中（待审核）
  if (status === 1) {
    return '计划中'
  }

  // status=3: 已结束
  if (status === 3) {
    return '已结束'
  }

  // status=2: 根据时间判断
  const now = Date.now()
  const startTime = Number(props.activity.startTime || 0)
  const endTime = Number(props.activity.endTime || 0)

  if (now > endTime) {
    return '已结束'
  } else if (now >= startTime && now <= endTime) {
    return '进行中'
  } else {
    return '报名中'
  }
})

// 計算活動狀態樣式類
const getStatusClass = computed(() => {
  const status = props.activity.status

  // status=0: 已取消
  if (status === 0) {
    return 'cancelled'
  }

  // status=1: 计划中
  if (status === 1) {
    return 'planned'
  }

  // status=3: 已结束
  if (status === 3) {
    return 'ended'
  }

  // status=2: 根据时间判断
  const now = Date.now()
  const startTime = Number(props.activity.startTime || 0)
  const endTime = Number(props.activity.endTime || 0)

  if (now > endTime) {
    return 'ended'
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing'
  } else {
    return 'signup'
  }
})

// 計算是否可以取消活動（计划中和报名中状态）
const canCancel = computed(() => {
  const status = props.activity.status

  // status=1: 计划中状态可以取消
  if (status === 1) {
    return true
  }

  // status=2: 只有当前时间<开始时间才能取消（即报名中状态）
  if (status === 2) {
    const now = Date.now()
    const startTime = Number(props.activity.startTime || 0)
    return now < startTime
  }

  // 其他状态不能取消
  return false
})

// 跳轉到活動詳情
const goToActivityDetail = () => {
  emit('detail', props.activity)
}

// 編輯活動
const editActivity = () => {
  emit('edit', props.activity)
}

// 刪除活動
const deleteActivity = () => {
  emit('delete', props.activity)
}

// 取消活动
const cancelActivity = () => {
  emit('cancel', props.activity)
}
</script>

<style lang="scss" scoped>
.activity-card {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  display: flex;
  padding: 24rpx;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  .activity-image {
    width: 180rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    margin-right: 24rpx;
    object-fit: cover;
  }
  
  .activity-info {
    max-width: calc(100% - 204rpx);
    overflow: hidden;
    
    .activity-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .activity-meta {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16rpx;
      
      .meta-item {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #666;
        margin-right: 30rpx;
        margin-bottom: 8rpx;
        
        text {
          margin-left: 8rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    
    .activity-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .activity-status {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;

        &.signup {
          color: #2979ff;
          background: rgba(41, 121, 255, 0.1);
        }

        &.ongoing {
          color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }

        &.ended {
          color: #999;
          background: rgba(153, 153, 153, 0.1);
        }

        &.planned {
          color: #ff9800;
          background: rgba(255, 152, 0, 0.1);
        }

        &.cancelled {
          color: #f44336;
          background: rgba(244, 67, 54, 0.1);
        }
      }
      
      .activity-count {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
  
  .action-buttons {
    position: absolute;
    right: 24rpx;
    top: 24rpx;
    display: flex;
    
    .action-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 30rpx;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);

      &.cancel {
        border: 1rpx solid rgba(255, 152, 0, 0.3);
      }

      &.edit {
        border: 1rpx solid rgba(41, 121, 255, 0.3);
      }

      &.delete {
        border: 1rpx solid rgba(244, 67, 54, 0.3);
      }
    }
  }
}
</style> 