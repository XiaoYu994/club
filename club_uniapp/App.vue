<script>
import wsClient from '@/utils/websocket'
import apiModule from '@/api/api.js'
import { showNotification } from '@/utils/notification.js'

export default {
  onLaunch: function() {
    console.warn('当前组件仅支持 uni_modules 目录结构 ,请升级 HBuilderX 到 3.1.0 版本以上！')
    console.log('【App】应用启动')

    // 检查是否已登录，如果已登录则建立WebSocket连接
    const token = uni.getStorageSync('token')
    if (token) {
      console.log('【App】检测到用户已登录，Token:', token.substring(0, 20) + '...')
      console.log('【App】服务器地址:', apiModule.baseURL)
      console.log('【App】开始建立WebSocket连接')

      wsClient.connect(apiModule.baseURL || 'http://localhost:8081')
        .then(() => {
          console.log('【App】WebSocket连接成功')
        })
        .catch((error) => {
          console.error('【App】WebSocket连接失败:', error)
          console.error('【App】错误详情:', JSON.stringify(error))
        })
    } else {
      console.log('【App】用户未登录，跳过WebSocket连接')
    }

    // 注册全局消息通知处理器
    this.registerGlobalNotificationHandlers()
  },
  onShow: function() {
    console.log('【App】应用显示')

    // 检查是否已登录，确保全局通知处理器始终注册
    const token = uni.getStorageSync('token')
    if (token && wsClient.isConnected) {
      // 重新注册全局处理器（防御性措施，避免被其他页面清除）
      this.registerGlobalNotificationHandlers()
    }
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    /**
     * 注册全局消息通知处理器
     */
    registerGlobalNotificationHandlers() {
      console.log('【App】开始注册全局通知处理器')

      // 统一的通知处理函数
      const handleNotification = (message) => {
        console.log('【通知】收到通知消息:', message)

        // 验证必需字段
        if (!message.type || !message.title || !message.message) {
          console.error('【通知】消息格式不正确，缺少必需字段:', message)
          return
        }

        // 直接使用后端传来的数据显示通知
        showNotification({
          type: message.type.replace('_notification', ''), // 移除后缀得到纯类型
          title: message.title,
          message: message.message,
          extraInfo: message.extraInfo || message.feedback || null
        })

        // 触发对应的全局事件（供其他页面监听）
        this.emitNotificationEvent(message)
      }

      // 注册所有通知类型到统一处理函数
      const notificationTypes = [
        'activity_cancel_notification',        // 活动取消通知
        'apply_approved_notification',         // 活动报名审核通过
        'apply_rejected_notification',         // 活动报名审核拒绝
        'activity_reminder_notification',      // 活动提醒
        'check_in_notification',               // 签到成功通知
        'club_apply_approved_notification',    // 社团申请审核通过
        'club_apply_rejected_notification',    // 社团申请审核拒绝
        'club_member_removed_notification',    // 社团成员被移除
        'club_quit_apply_notification',        // 退社申请（通知管理员）
        'club_quit_approved_notification',     // 退社申请通过（通知用户）
        'club_quit_rejected_notification',     // 退社申请拒绝（通知用户）
        'system_broadcast_notification',       // 系统广播通知
        'admin_notification_notification'      // 管理员通知
      ]

      notificationTypes.forEach(type => {
        wsClient.onMessageType(type, handleNotification)
        console.log(`【App】已注册通知类型: ${type}`)
      })

      console.log('【App】全局通知处理器注册完成')
    },

    // 触发全局事件（供其他页面监听状态变化）
    emitNotificationEvent(message) {
      const type = message.type

      if (type === 'activity_cancel_notification') {
        uni.$emit('activityCancelled', {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        })
      } else if (type === 'apply_approved_notification' || type === 'apply_rejected_notification') {
        uni.$emit('applyStatusChanged', {
          activityId: message.activityId,
          applyId: message.applyId,
          status: type === 'apply_approved_notification' ? 'approved' : 'rejected'
        })
      } else if (type === 'club_apply_approved_notification' || type === 'club_apply_rejected_notification') {
        // 社团申请审核结果事件
        uni.$emit('clubApplyStatusChanged', {
          clubId: message.clubId,
          clubName: message.clubName,
          applyId: message.applyId,
          status: type === 'club_apply_approved_notification' ? 'approved' : 'rejected'
        })
      } else if (type === 'club_member_removed_notification') {
        // 社团成员被移除事件
        uni.$emit('clubMemberRemoved', {
          clubId: message.clubId,
          clubName: message.clubName
        })
      } else if (type === 'club_quit_apply_notification') {
        // 退社申请事件（管理员收到）
        uni.$emit('clubQuitApply', {
          clubId: message.clubId,
          clubName: message.clubName,
          applicantUserId: message.applicantUserId,
          applicantName: message.applicantName
        })
      } else if (type === 'club_quit_approved_notification') {
        // 退社申请通过事件
        uni.$emit('clubQuitApproved', {
          clubId: message.clubId,
          clubName: message.clubName
        })
      } else if (type === 'club_quit_rejected_notification') {
        // 退社申请拒绝事件
        uni.$emit('clubQuitRejected', {
          clubId: message.clubId,
          clubName: message.clubName
        })
      } else if (type === 'activity_reminder_notification') {
        uni.$emit('activityReminder', {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        })
      } else if (type === 'check_in_notification') {
        // 签到成功事件
        uni.$emit('checkInSuccess', {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        })
      } else if (type === 'system_broadcast_notification') {
        // 系统广播事件
        uni.$emit('systemBroadcast', {
          title: message.title,
          message: message.message
        })
      } else if (type === 'admin_notification_notification') {
        // 管理员通知事件
        uni.$emit('adminNotification', {
          title: message.title,
          message: message.message
        })
      }
    }
  }
}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	@import '@/common/style/common-style.scss';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
