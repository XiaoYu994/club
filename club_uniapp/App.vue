<script>
import wsClient from '@/utils/websocket'
import apiModule from '@/api/api.js'

export default {
  onLaunch: function() {
    console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
    console.log('App Launch')

    // 检查是否已登录，如果已登录则建立WebSocket连接
    const token = uni.getStorageSync('token')
    if (token) {
      console.log('【App】检测到用户已登录，建立WebSocket连接')
      wsClient.connect(apiModule.baseURL || 'http://localhost:8081')
    } else {
      console.log('【App】用户未登录，跳过WebSocket连接')
    }

    // 注册全局活动取消通知处理器
    wsClient.onMessageType('activity_cancel_notification', (message) => {
      console.log('【全局】收到活动取消通知:', message)

      // 显示通知提示
      uni.showModal({
        title: '活动取消通知',
        content: message.message || `您报名的活动"${message.activityTitle}"已被取消`,
        showCancel: false,
        confirmText: '知道了'
      })

      // 触发全局事件，让活动详情页可以监听并更新
      uni.$emit('activityCancelled', {
        activityId: message.activityId,
        activityTitle: message.activityTitle
      })
    })
  },
  onShow: function() {
    // const token = uni.getStorageSync('token')
    // const pages = getCurrentPages()
    // const currentPage = pages.length ? pages[pages.length - 1] : null
    // // 请根据你的实际登录页路径调整
    // if (!token && (!currentPage || currentPage.route !== 'pages/user/login')) {
    //   uni.reLaunch({ url: '/pages/user/login' })
    // }

  },
  onHide: function() {
    console.log('App Hide')
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
