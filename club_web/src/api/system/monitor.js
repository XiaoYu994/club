import { get, post } from '@/utils/request'

// 获取在线用户列表
export const getOnlineUsers = () => get('/admin/websocket/online-users')

// 检查指定用户是否在线
export const checkUserOnline = (userId) => get(`/admin/websocket/check-online/${userId}`)

// 测试发送通知给指定用户
export const sendTestNotification = (data) => post('/admin/websocket/test-notification', data)

// 向所有在线用户广播通知
export const broadcastNotification = (data) => post('/admin/websocket/broadcast-notification', data)

// 发送简单测试消息给指定用户
export const sendTestPush = (userId) => post(`/admin/websocket/test-push/${userId}`)
