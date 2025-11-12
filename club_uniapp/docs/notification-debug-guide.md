# 消息通知调试指南

## 问题排查步骤

### 1. 检查控制台日志

在真机调试时，通过微信开发者工具或者真机调试模式查看控制台日志，确认以下信息：

#### App.vue 启动日志
```
【通知】正在安装通知插件...
【App】检测到用户已登录，建立WebSocket连接
```

#### WebSocket 连接日志
```
【WebSocket】连接成功
```

#### 收到通知消息时的日志
```
【全局】收到活动取消通知: {activityId: xxx, activityTitle: "测试活动", ...}
【通知】showNotification 被调用，参数: {...}
【通知】准备显示消息，标题: 活动取消通知 内容: ...
【通知】当前队列长度: 1 是否正在显示: false
【通知】开始显示消息: 活动取消通知
【通知】用户点击了确认按钮
```

### 2. 测试通知功能

#### 方法1：使用控制台手动触发（开发环境）

在任意页面的控制台中执行：

```javascript
// 测试活动取消通知
uni.$showNotification({
  type: 'activity_cancel',
  message: '测试消息：您报名的活动已被取消'
})

// 测试报名审核通过
uni.$showNotification({
  type: 'apply_approved',
  message: '测试消息：您的报名申请已通过'
})
```

如果控制台报错 `uni.$showNotification is not a function`，说明全局方法未正确注册。

#### 方法2：通过后端真实触发

1. 登录小程序
2. 报名一个活动
3. 让管理员审核该报名（通过或拒绝）
4. 或者让管理员取消该活动
5. 观察是否收到通知弹窗

### 3. 常见问题及解决方案

#### 问题1: 真机上不显示通知

**可能原因**:
- WebSocket 未连接成功
- 用户未登录
- 后端未发送 WebSocket 消息

**解决方案**:
1. 检查 `uni.getStorageSync('token')` 是否有值
2. 检查 WebSocket 连接状态
3. 查看后端日志，确认是否发送了通知

#### 问题2: 通知显示但没有内容

**可能原因**:
- WebSocket 消息格式不正确
- message 字段为空

**解决方案**:
1. 检查后端发送的消息格式：
```json
{
  "type": "activity_cancel_notification",
  "activityId": 123,
  "activityTitle": "测试活动",
  "message": "您报名的活动已被取消",
  "timestamp": 1234567890
}
```

#### 问题3: 收到多条重复通知

**可能原因**:
- WebSocket 重复连接
- 消息队列处理异常

**解决方案**:
1. 检查是否多次调用了 `wsClient.connect()`
2. 查看控制台日志中的队列长度

### 4. 微信小程序特殊配置

确保 `manifest.json` 中已配置 WebSocket 域名白名单：

```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false  // 开发环境可以关闭，生产环境需要配置合法域名
    }
  }
}
```

### 5. 代码调用示例

在其他页面中使用通知功能：

```javascript
// Vue3 Composition API
import { getCurrentInstance } from 'vue'
import { showNotification } from '@/utils/notification.js'

// 方式1: 直接导入使用（推荐）
showNotification({
  type: 'apply_approved',
  title: '自定义标题',
  message: '这是消息内容',
  extraInfo: '这是额外信息'
})

// 方式2: 使用全局方法
const { proxy } = getCurrentInstance()
proxy.$showNotification({
  type: 'activity_cancel',
  message: '消息内容'
})

// 方式3: uni全局方法
uni.$showNotification({
  type: 'activity_reminder',
  message: '消息内容'
})
```

## 支持的通知类型

| 类型 | 说明 | 默认标题 |
|------|------|---------|
| `activity_cancel` | 活动取消 | 活动取消通知 |
| `apply_approved` | 报名审核通过 | 报名审核通过 |
| `apply_rejected` | 报名审核未通过 | 报名审核未通过 |
| `activity_reminder` | 活动提醒 | 活动提醒 |
| `club_apply_approved` | 社团申请通过 | 社团申请通过 |
| `club_apply_rejected` | 社团申请未通过 | 社团申请未通过 |
| `check_in` | 签到成功 | 签到成功 |
| `default` | 默认通知 | 系统通知 |

## 关键文件位置

- **通知工具**: `club_uniapp/utils/notification.js`
- **全局处理器**: `club_uniapp/App.vue`
- **WebSocket客户端**: `club_uniapp/utils/websocket.js`
- **后端WebSocket**: `club_java/src/main/java/com/hngy/websocket/ChatWebSocketHandler.java`
- **后端服务**: `club_java/src/main/java/com/hngy/service/impl/ClubApplyServiceImpl.java`

## 修改记录

- 2025-01-28: 修复真机调试时通知不显示的问题，在 App.vue 中直接导入 showNotification 方法
- 2025-01-28: 优化拒绝原因输入框样式，添加边框和焦点效果
- 2025-01-28: 添加详细的日志输出，便于调试
