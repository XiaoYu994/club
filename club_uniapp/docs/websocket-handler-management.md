# WebSocket 消息处理器管理机制

## 问题背景

### 问题现象
用户反馈：进入聊天室后再退出，就收不到通知弹窗了。

### 问题日志
```
【WebSocket】处理消息，类型: activity_cancel_notification
【WebSocket】未找到消息处理器，已注册的处理器: [ "group_message", "error" ]
【WebSocket】未处理的消息类型: activity_cancel_notification
```

### 根本原因
在 `pages/chat/room.vue:256-262` 中的 `updateMessageHandler()` 函数：

```javascript
function updateMessageHandler() {
  // 清除旧的消息处理器
  wsClient.clearHandlers();  // ← 问题所在！
  // 注册新的消息处理器
  wsClient.onMessageType('group_message', handleReceivedMessage);
  wsClient.onMessageType('error', handleError);
}
```

**问题链**：
1. App.vue 在启动时注册全局通知处理器（activity_cancel_notification, apply_approved_notification 等）
2. 用户进入聊天室，room.vue 调用 `updateMessageHandler()`
3. `wsClient.clearHandlers()` **清空了所有消息处理器**，包括全局通知处理器
4. 只重新注册了 `group_message` 和 `error` 两个聊天相关的处理器
5. 用户退出聊天室后，全局通知处理器已经丢失
6. 后端发送的通知消息无法被处理，弹窗不显示

## 架构设计

### WebSocket 单例设计
整个应用共享**一个 WebSocket 连接**（单例模式），位于 `utils/websocket.js`：

```javascript
class WebSocketClient {
  constructor() {
    if (instance) return instance;  // 单例
    instance = this;

    this.ws = null;
    this.messageHandlers = new Map();  // 消息处理器映射表
    // ...
  }

  onMessageType(messageType, handler) {
    this.messageHandlers.set(messageType, handler);  // 覆盖式注册
  }

  clearHandlers() {
    this.messageHandlers.clear();  // 清空所有处理器
  }
}
```

### 处理器分类

#### 全局处理器（App.vue）
在应用启动时注册，全局生效：
- `activity_cancel_notification` - 活动取消通知
- `apply_approved_notification` - 报名审核通过
- `apply_rejected_notification` - 报名审核拒绝
- `activity_reminder_notification` - 活动提醒

#### 页面级处理器（pages/chat/room.vue）
进入聊天室时注册，仅在聊天室页面使用：
- `group_message` - 群组消息
- `error` - 错误消息

### 处理器注册机制

**Map.set() 特性**：
- 覆盖式注册：同一个 messageType 多次注册会覆盖旧的处理器
- 不会累加：不需要先删除再注册

```javascript
// 第一次注册
wsClient.onMessageType('group_message', handler1);

// 第二次注册（会覆盖 handler1）
wsClient.onMessageType('group_message', handler2);

// 结果：只有 handler2 生效
```

## 解决方案

### 修复1：删除 clearHandlers() 调用

**修改文件**：`pages/chat/room.vue:256-261`

**修改前**：
```javascript
function updateMessageHandler() {
  // 清除旧的消息处理器
  wsClient.clearHandlers();  // ❌ 会清空全局处理器
  // 注册新的消息处理器
  wsClient.onMessageType('group_message', handleReceivedMessage);
  wsClient.onMessageType('error', handleError);
}
```

**修改后**：
```javascript
function updateMessageHandler() {
  // 注册聊天室消息处理器（不清除全局处理器，避免影响通知功能）
  wsClient.onMessageType('group_message', handleReceivedMessage);
  wsClient.onMessageType('error', handleError);
  console.log('【聊天室】消息处理器已注册');
}
```

**为什么可以删除**：
- `onMessageType` 使用 `Map.set()`，本身就是覆盖式的
- 不需要先清空再注册
- 删除后，全局处理器不会被清除，通知功能正常

### 修复2：App.vue 防御性重注册

**修改文件**：`App.vue:40-49`

**添加逻辑**：
```javascript
onShow: function() {
  console.log('【App】应用显示')

  // 检查是否已登录，确保全局通知处理器始终注册
  const token = uni.getStorageSync('token')
  if (token && wsClient.isConnected) {
    // 重新注册全局处理器（防御性措施，避免被其他页面清除）
    this.registerGlobalNotificationHandlers()
  }
},
```

**防御性设计**：
- 每次应用从后台恢复到前台时（onShow）
- 重新注册全局通知处理器
- 确保即使被意外清除也能恢复
- 对用户体验无影响（Map.set 覆盖式注册，不会重复）

## 最佳实践

### 1. 不要使用 clearHandlers()

除非你确定要**清空所有处理器**，否则不要调用此方法。

**错误示例**：
```javascript
// ❌ 错误：会清空全局处理器
wsClient.clearHandlers();
wsClient.onMessageType('my_message', handler);
```

**正确示例**：
```javascript
// ✅ 正确：直接注册，会覆盖旧的处理器
wsClient.onMessageType('my_message', handler);
```

### 2. 页面级处理器只注册自己需要的

**错误示例**：
```javascript
// ❌ 错误：先清空再注册，影响其他页面
onMounted(() => {
  wsClient.clearHandlers();
  wsClient.onMessageType('page_message', handler);
});
```

**正确示例**：
```javascript
// ✅ 正确：只注册自己需要的，不影响其他
onMounted(() => {
  wsClient.onMessageType('page_message', handler);
});
```

### 3. 离开页面时不需要取消注册

由于使用单例 WebSocket，不建议在页面卸载时取消注册：

**不推荐**：
```javascript
onUnmounted(() => {
  // ❌ 不推荐：可能影响其他页面或全局处理器
  wsClient.clearHandlers();
});
```

**推荐**：
```javascript
onUnmounted(() => {
  // ✅ 什么都不做，让其他页面接管
  // 如果下次进入本页面，会自动覆盖旧的处理器
});
```

### 4. 全局处理器在 App.vue 中集中管理

**位置**：`App.vue`

**时机**：
- `onLaunch`：初次注册
- `onShow`：防御性重注册（可选但推荐）

**示例**：
```javascript
export default {
  onLaunch: function() {
    // 建立 WebSocket 连接
    wsClient.connect(apiModule.baseURL)

    // 注册全局通知处理器
    this.registerGlobalNotificationHandlers()
  },

  onShow: function() {
    // 防御性重注册
    if (wsClient.isConnected) {
      this.registerGlobalNotificationHandlers()
    }
  },

  methods: {
    registerGlobalNotificationHandlers() {
      wsClient.onMessageType('activity_cancel_notification', handler1)
      wsClient.onMessageType('apply_approved_notification', handler2)
      // ...
    }
  }
}
```

## 测试验证

### 测试场景1：进入聊天室后收到通知

**操作步骤**：
1. 启动应用，确保 WebSocket 连接成功
2. 进入聊天室页面
3. 在后台通过接口发送测试通知：
   ```
   POST /admin/websocket/test-notification?userId=3&type=activity_cancel
   ```
4. 观察是否显示通知弹窗

**期望结果**：
- ✅ 显示通知弹窗
- ✅ 控制台日志：
  ```
  【WebSocket】收到原始消息: {"type":"activity_cancel_notification",...}
  【WebSocket】处理消息，类型: activity_cancel_notification
  【WebSocket】找到消息处理器，准备执行
  【通知】收到活动取消通知: {...}
  ```

### 测试场景2：退出聊天室后收到通知

**操作步骤**：
1. 进入聊天室
2. 返回上一页（退出聊天室）
3. 发送测试通知
4. 观察是否显示通知弹窗

**期望结果**：
- ✅ 显示通知弹窗
- ✅ 全局通知处理器正常工作

### 测试场景3：应用后台恢复后收到通知

**操作步骤**：
1. 启动应用
2. 将应用切换到后台
3. 切换回应用（触发 onShow）
4. 发送测试通知

**期望结果**：
- ✅ 显示通知弹窗
- ✅ onShow 重新注册了全局处理器

## 调试技巧

### 查看当前注册的处理器

在任何页面的控制台运行：

```javascript
// 方法1：通过 websocket.js 实例
console.log('已注册的处理器:', Array.from(wsClient.messageHandlers.keys()))

// 方法2：在 websocket.js 的 handleMessage 中打印
// 已经有日志：【WebSocket】未找到消息处理器，已注册的处理器: [...]
```

**正常情况**：
- 应用启动后：`["activity_cancel_notification", "apply_approved_notification", "apply_rejected_notification", "activity_reminder_notification"]`
- 进入聊天室后：`["activity_cancel_notification", ..., "group_message", "error"]`（全局处理器 + 聊天处理器）

**异常情况**：
- 进入聊天室后只有：`["group_message", "error"]`（说明全局处理器丢失）

### 模拟通知发送

使用后端测试接口：

```bash
# 发送活动取消通知
curl -X POST "https://your-domain.com/admin/websocket/test-notification?userId=3&type=activity_cancel&title=测试&message=测试消息"

# 广播通知给所有在线用户
curl -X POST "https://your-domain.com/admin/websocket/broadcast-notification?type=activity_cancel&title=系统通知&message=测试"
```

## 总结

### 问题
- 聊天室页面调用 `clearHandlers()` 清空了全局通知处理器

### 解决
1. 删除 `clearHandlers()` 调用
2. 利用 `Map.set()` 的覆盖特性
3. App.vue onShow 防御性重注册

### 原则
- ✅ 单例 WebSocket 连接
- ✅ 覆盖式注册处理器
- ✅ 全局处理器集中管理
- ❌ 不要随意调用 `clearHandlers()`
- ❌ 离开页面不需要取消注册

### 效果
- ✅ 进入聊天室后通知正常显示
- ✅ 退出聊天室后通知正常显示
- ✅ 应用后台恢复后通知正常显示
- ✅ 单个弹窗，不重复显示
