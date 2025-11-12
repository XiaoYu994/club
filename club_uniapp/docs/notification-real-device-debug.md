# 真机通知弹窗问题诊断指南

## 问题现象

**关键发现**：
- ✅ 扫码签到通知：在真机上**正常工作**
- ❌ 其他通知（审核通过/拒绝、活动取消、活动提醒）：在真机上**不显示**
- ⚠️ 控制台没有错误代码

## 核心差异分析

### 工作的通知（签到）

**位置**：`pages/activity/activityDeatil.vue:533-537`

```javascript
uni.showToast({
  title: '签到成功',
  icon: 'success',
  duration: 2000
})
```

**特点**：
- 直接调用 `uni.showToast`
- 在**页面内**注册 WebSocket 消息处理器
- 不依赖外部函数

### 不工作的通知（其他通知）

**位置**：`App.vue:63-92`（以活动取消为例）

```javascript
showNotification({
  type: 'activity_cancel',
  title: '活动取消通知',
  message: message.message || `您报名的活动"${message.activityTitle}"已被取消`,
  extraInfo: '如有疑问，请联系社团管理员'
})
```

**特点**：
- 调用 `showNotification()` 函数（从 `utils/notification.js` 导入）
- 在 **App.vue** 中全局注册消息处理器
- showNotification 内部调用 `uni.showModal`

## 可能的问题原因

### 假设 1：showNotification 函数导入失败

**症状**：真机上模块解析有问题，导致 showNotification 是 undefined

**验证方法**：查看控制台日志
```
【全局】showNotification 函数类型: function  ← 正常
【全局】showNotification 函数类型: undefined  ← 有问题！
```

### 假设 2：uni.showModal 在真机上失败

**症状**：uni.showModal 调用后没有任何效果，也没有错误

**验证方法**：查看控制台日志
```
【全局】尝试直接调用 uni.showModal
【全局】uni.showModal 成功回调  ← 正常
【全局】uni.showModal 失败回调: {...}  ← 有错误
【全局】uni.showModal 抛出异常: {...}  ← 抛出异常
```

### 假设 3：WebSocket 消息处理器未触发

**症状**：消息到达了，但处理器没有执行

**验证方法**：查看控制台日志
```
【WebSocket】收到原始消息: {...}  ← 消息已到达
【WebSocket】处理消息，类型: activity_cancel_notification
【WebSocket】找到消息处理器，准备执行
【全局】收到活动取消通知: {...}  ← 处理器已执行
```

如果看不到"收到活动取消通知"，说明处理器没有被触发。

### 假设 4：时序问题

**症状**：处理器注册晚于 WebSocket 连接建立，导致初期消息丢失

**验证方法**：
1. 检查 App.vue onLaunch 的执行顺序
2. 确认 registerGlobalNotificationHandlers() 在 connect() 之前调用

```javascript
// App.vue:25-38
wsClient.connect(...)  // 异步，不会立即完成
this.registerGlobalNotificationHandlers()  // 同步，立即执行

// 结论：注册应该在连接建立之前完成，时序正常
```

## 当前诊断版本的修改

我已经在 **App.vue** 的所有通知处理器中添加了详细的诊断代码：

### 活动取消通知（lines 59-96）
```javascript
wsClient.onMessageType('activity_cancel_notification', (message) => {
  console.log('【全局】收到活动取消通知:', message)
  console.log('【全局】showNotification 函数类型:', typeof showNotification)

  // 方法1：直接调用 uni.showModal（绕过 showNotification）
  try {
    console.log('【全局】尝试直接调用 uni.showModal')
    uni.showModal({
      title: '活动取消通知',
      content: message.message || `您报名的活动"${message.activityTitle}"已被取消...`,
      showCancel: false,
      confirmText: '知道了',
      success: (res) => {
        console.log('【全局】uni.showModal 成功回调')
      },
      fail: (err) => {
        console.error('【全局】uni.showModal 失败回调:', err)
      }
    })
  } catch (error) {
    console.error('【全局】uni.showModal 抛出异常:', error)
  }

  // 方法2：调用 showNotification（原方法）
  try {
    console.log('【全局】调用 showNotification')
    showNotification({ /* ... */ })
    console.log('【全局】showNotification 调用完成')
  } catch (error) {
    console.error('【全局】showNotification 抛出异常:', error)
  }
})
```

### 其他通知类型
- **审核通过通知** (lines 105-131)
- **审核拒绝通知** (lines 142-168)
- **活动提醒通知** (lines 179-205)

所有通知都采用相同的双重测试策略：
1. 直接调用 uni.showModal
2. 同时调用 showNotification

## 测试步骤

### 第一步：清除缓存并重新编译

1. **微信开发者工具**：
   ```
   工具 → 清除缓存 → 清除所有缓存
   ```

2. **手机端**：
   - 删除小程序
   - 重新扫码进入

3. **重新编译**：
   ```
   点击"编译" → 点击"预览" → 扫码进入
   ```

### 第二步：启用真机调试

1. 微信开发者工具：`工具 → 真机调试 → 选择你的手机`
2. 确保能看到控制台日志

### 第三步：触发通知

#### 测试活动取消通知

**操作**：
1. 用户 A 在手机上报名某个活动
2. 管理员在模拟器/另一台设备上取消该活动

**期望日志**（按顺序出现）：
```
【WebSocket】收到原始消息: {"type":"activity_cancel_notification",...}
【WebSocket】解析后的消息: {...}
【WebSocket】处理消息，类型: activity_cancel_notification
【WebSocket】找到消息处理器，准备执行
【全局】收到活动取消通知: {...}
【全局】showNotification 函数类型: function
【全局】准备调用 showNotification
【全局】尝试直接调用 uni.showModal
【全局】uni.showModal 成功回调
【全局】调用 showNotification
【通知】showNotification 被调用，参数: {...}
【通知】准备显示消息，标题: 活动取消通知 内容: ...
【通知】当前队列长度: 1 是否正在显示: false
【通知】开始显示消息: 活动取消通知
【通知】用户点击了确认按钮
【全局】showNotification 调用完成
```

**观察结果**：
- 如果看到 `【全局】uni.showModal 成功回调`，说明**方法1成功**
- 如果看到 `【通知】用户点击了确认按钮`，说明**方法2成功**
- 观察手机屏幕上是否真的显示了弹窗

#### 测试审核通过通知

**操作**：
1. 用户 A 在手机上报名某个活动（状态变为待审核）
2. 管理员在模拟器/另一台设备上审核通过

**期望日志**：
```
【WebSocket】处理消息，类型: apply_approved_notification
【全局】收到报名审核通过通知: {...}
【全局】审核通过 - 直接调用 uni.showModal
【全局】审核通过 - uni.showModal 成功回调  ← 关键
```

#### 测试审核拒绝通知

**操作**：
1. 用户 A 在手机上报名某个活动（状态变为待审核）
2. 管理员在模拟器/另一台设备上审核拒绝

**期望日志**：
```
【WebSocket】处理消息，类型: apply_rejected_notification
【全局】收到报名审核拒绝通知: {...}
【全局】审核拒绝 - 直接调用 uni.showModal
【全局】审核拒绝 - uni.showModal 成功回调  ← 关键
```

### 第四步：分析结果

根据日志判断问题所在：

#### 情况 1：完全没有日志

**可能原因**：
- WebSocket 连接断开
- 手机不在线（后端认为用户离线）
- 消息没有发送到正确的用户ID

**排查方法**：
1. 检查聊天室是否显示"已连接"
2. 调用后端接口查看在线用户：
   ```
   GET /admin/websocket/online-users
   ```
3. 检查用户ID是否匹配

#### 情况 2：有消息到达日志，但没有处理器执行日志

**日志示例**：
```
【WebSocket】收到原始消息: {...}
【WebSocket】处理消息，类型: activity_cancel_notification
【WebSocket】未找到消息处理器，已注册的处理器: [...]
```

**可能原因**：
- 消息处理器注册失败
- 消息类型名称不匹配

**排查方法**：
1. 检查 `已注册的处理器` 列表中是否包含对应的消息类型
2. 检查后端发送的消息类型名称是否正确

#### 情况 3：处理器执行了，但 showNotification 是 undefined

**日志示例**：
```
【全局】收到活动取消通知: {...}
【全局】showNotification 函数类型: undefined  ← 问题！
```

**可能原因**：
- 真机上模块导入失败
- 路径解析问题

**解决方案**：
- 方案1：将 showNotification 函数直接写在 App.vue 中，不使用外部导入
- 方案2：使用 uni.$showNotification 全局方法
- 方案3：直接使用 uni.showModal，不使用 showNotification

#### 情况 4：uni.showModal 调用了，但没有成功回调

**日志示例**：
```
【全局】尝试直接调用 uni.showModal
【全局】uni.showModal 失败回调: {errMsg: "..."}  ← 错误信息
```

**可能原因**：
- 真机上 uni.showModal 有特殊限制
- 微信小程序权限问题
- 内容格式不符合要求

**排查方法**：
- 查看 fail 回调中的具体错误信息
- 尝试使用最简单的 uni.showModal 测试

#### 情况 5：uni.showModal 成功回调了，但屏幕上没有弹窗

**日志示例**：
```
【全局】uni.showModal 成功回调
```

**但是屏幕上看不到弹窗**

**可能原因**：
- 弹窗被其他元素遮挡
- z-index 层级问题
- 真机渲染延迟

**排查方法**：
- 等待几秒看是否延迟显示
- 尝试使用 uni.showToast 代替
- 检查页面是否有全屏覆盖的元素

#### 情况 6：直接调用 uni.showModal 成功，但 showNotification 失败

**日志示例**：
```
【全局】uni.showModal 成功回调  ← 方法1成功
【全局】调用 showNotification
【通知】showNotification 被调用，参数: {...}
（之后没有更多日志）
```

**可能原因**：
- showNotification 函数内部有错误
- notification.js 中的某些逻辑在真机上不兼容

**解决方案**：
- 直接使用 uni.showModal，放弃 showNotification 函数

## 推荐解决方案（基于诊断结果）

### 方案 1：使用 uni.showModal 替代 showNotification

如果测试发现 **直接调用 uni.showModal 成功，但 showNotification 失败**：

```javascript
// App.vue - 活动取消通知
wsClient.onMessageType('activity_cancel_notification', (message) => {
  console.log('【全局】收到活动取消通知:', message)

  uni.showModal({
    title: '活动取消通知',
    content: message.message || `您报名的活动"${message.activityTitle}"已被取消\n\n如有疑问，请联系社团管理员`,
    showCancel: false,
    confirmText: '知道了'
  })

  uni.$emit('activityCancelled', {
    activityId: message.activityId,
    activityTitle: message.activityTitle
  })
})
```

**优点**：
- 简单直接，不依赖外部函数
- 与签到通知的实现方式一致
- 真机兼容性更好

**缺点**：
- 失去了消息队列管理
- 失去了类型化配置
- 多个通知同时到达会互相覆盖

### 方案 2：使用 uni.showToast 替代 uni.showModal

如果测试发现 **uni.showModal 也失败**：

```javascript
wsClient.onMessageType('activity_cancel_notification', (message) => {
  console.log('【全局】收到活动取消通知:', message)

  uni.showToast({
    title: message.message || `活动"${message.activityTitle}"已被取消`,
    icon: 'none',
    duration: 3000
  })

  uni.$emit('activityCancelled', {
    activityId: message.activityId,
    activityTitle: message.activityTitle
  })
})
```

**优点**：
- 真机兼容性最好
- 不会阻塞用户操作
- 实现最简单

**缺点**：
- 只能显示单行文本
- 没有确认按钮
- 用户可能错过通知

### 方案 3：将 showNotification 函数内联到 App.vue

如果测试发现 **showNotification 导入失败**：

```javascript
// 直接在 App.vue 的 <script> 标签内定义
function showNotificationLocal(options) {
  const { title, message, extraInfo } = options
  let content = message || ''
  if (extraInfo) {
    content += '\n\n' + extraInfo
  }

  uni.showModal({
    title: title || '系统通知',
    content,
    showCancel: false,
    confirmText: '知道了'
  })
}

export default {
  onLaunch: function() {
    // 使用本地定义的函数
    wsClient.onMessageType('activity_cancel_notification', (message) => {
      showNotificationLocal({
        title: '活动取消通知',
        message: message.message || `您报名的活动"${message.activityTitle}"已被取消`,
        extraInfo: '如有疑问，请联系社团管理员'
      })
    })
  }
}
```

## 测试检查清单

在真机上完成以下测试：

- [ ] WebSocket 连接状态：查看控制台日志确认连接成功
- [ ] 在线用户列表：调用后端接口确认用户在线
- [ ] 触发活动取消通知：观察日志和屏幕
- [ ] 触发审核通过通知：观察日志和屏幕
- [ ] 触发审核拒绝通知：观察日志和屏幕
- [ ] 对比签到通知：确认签到通知仍然正常工作
- [ ] 记录所有日志：完整复制控制台输出
- [ ] 截图：记录屏幕显示情况

## 提供调试信息

如果问题仍未解决，请提供以下信息：

1. **完整的控制台日志**（从触发通知开始到结束）
2. **手机型号和系统版本**
3. **微信版本和基础库版本**
4. **网络环境**（WiFi/移动网络）
5. **是否使用 ngrok**
6. **观察到的现象**：
   - 是否看到弹窗？
   - 是否有任何视觉反馈？
   - 是否有声音/震动？

## 常见问题

### Q1: 为什么签到通知正常，其他通知不正常？

A: 因为签到通知使用 `uni.showToast`，其他通知使用 `uni.showModal` + 外部函数。真机上可能对后者有特殊限制。

### Q2: 可以统一使用 uni.showToast 吗？

A: 可以，但 showToast 只能显示简短文本，无法显示详细信息和额外提示。如果通知内容简单，推荐使用 showToast。

### Q3: 是否需要在 manifest.json 中配置特殊权限？

A: 不需要。uni.showModal 和 uni.showToast 是 uni-app 的基础 API，不需要额外权限。

### Q4: 如果日志显示成功但屏幕无反应怎么办？

A: 可能是渲染问题。尝试：
1. 添加延迟：`setTimeout(() => uni.showModal(...), 500)`
2. 切换到 uni.showToast
3. 检查是否有全屏遮罩层
