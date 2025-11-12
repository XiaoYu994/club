/**
 * 全局消息通知工具
 * 提供统一的消息弹窗显示方法
 */

let notificationQueue = [] // 消息队列
let isShowing = false // 是否正在显示消息

/**
 * 显示通知弹窗
 * @param {Object} options - 配置项
 * @param {String} options.type - 消息类型 activity_cancel/check_in/apply_approved/apply_rejected/activity_reminder
 * @param {String} options.title - 标题（可选，不传则使用默认标题）
 * @param {String} options.message - 消息内容
 * @param {String} options.extraInfo - 额外信息（可选）
 * @param {Function} options.onConfirm - 确认回调（可选）
 * @param {Function} options.onCancel - 取消回调（可选）
 */
export function showNotification(options = {}) {
  console.log('【通知】showNotification 被调用，参数:', options)

  const {
    type = 'default',
    title,
    message,
    extraInfo,
    onConfirm,
    onCancel
  } = options

  // 消息类型配置
  const notificationConfig = {
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

  const config = notificationConfig[type] || notificationConfig.default
  const finalTitle = title || config.defaultTitle

  // 构建消息内容
  let content = message || ''
  if (extraInfo) {
    content += '\n\n' + extraInfo
  }

  console.log('【通知】准备显示消息，标题:', finalTitle, '内容:', content)

  // 添加到队列
  notificationQueue.push({
    title: finalTitle,
    content,
    onConfirm,
    onCancel
  })

  console.log('【通知】当前队列长度:', notificationQueue.length, '是否正在显示:', isShowing)

  // 如果当前没有正在显示的消息，则显示
  if (!isShowing) {
    showNextNotification()
  }
}

/**
 * 显示队列中的下一条消息
 */
function showNextNotification() {
  if (notificationQueue.length === 0) {
    console.log('【通知】队列为空，停止显示')
    isShowing = false
    return
  }

  isShowing = true
  const notification = notificationQueue.shift()

  console.log('【通知】开始显示消息:', notification.title)

  try {
    uni.showModal({
      title: notification.title,
      content: notification.content,
      showCancel: false,
      confirmText: '知道了',
      success: (res) => {
        console.log('【通知】用户点击了确认按钮')
        if (res.confirm && notification.onConfirm) {
          notification.onConfirm()
        }
        // 显示下一条消息
        setTimeout(() => {
          showNextNotification()
        }, 300)
      },
      fail: (err) => {
        console.error('【通知】显示失败:', err)
        // 失败也要继续显示下一条
        setTimeout(() => {
          showNextNotification()
        }, 300)
      }
    })
  } catch (error) {
    console.error('【通知】showModal 异常:', error)
    // 出现异常也要继续显示下一条
    setTimeout(() => {
      showNextNotification()
    }, 300)
  }
}

/**
 * 安装全局通知方法
 * 用于在Vue实例中注册
 */
export function install(app) {
  console.log('【通知】正在安装通知插件...')

  // Vue3
  if (app.config && app.config.globalProperties) {
    app.config.globalProperties.$showNotification = showNotification
    console.log('【通知】已注册到 Vue3 globalProperties')
  }
  // Vue2
  else if (app.prototype) {
    app.prototype.$showNotification = showNotification
    console.log('【通知】已注册到 Vue2 prototype')
  }

  // uni全局方法
  if (typeof uni !== 'undefined') {
    uni.$showNotification = showNotification
    console.log('【通知】已注册到 uni 全局对象')
  }
}

export default {
  install,
  showNotification
}
