# 手机端通知和聊天服务不可用 - 完整诊断分析

## 问题现象

根据您提供的日志和描述：

1. **WebSocket 连接状态**：
   ```
   13:57:42.958 【WebSocket】连接已关闭 at utils/websocket.js:155
   13:57:42.958 【WebSocket】关闭代码: [number] 1006
   13:57:42.958 【WebSocket】关闭原因: abnormal closure
   13:57:45.982 尝试重新连接WebSocket...
   13:57:47.051 【WebSocket】连接已建立 at utils/websocket.js:134
   ```
   ✅ 重连成功

2. **问题表现**：
   - ❌ 通知弹窗不显示
   - ❌ 聊天室显示"未连接"
   - ❌ 发送消息报错
   - ✅ 其他功能（HTTP请求）正常

3. **关键发现**：
   - 扫码签到通知**正常工作**
   - 其他通知**不工作**
   - 没有看到"【WebSocket】收到原始消息"的日志

## 核心问题分析

### 关键矛盾点

**矛盾1：连接显示成功，但功能不可用**

日志显示：
```
【WebSocket】连接已建立  ← onOpen 触发了
```

但是：
- 聊天室显示"聊天服务未连接"（`wsClient.isConnected` 是 false？）
- 发送消息报错
- 收不到通知

**矛盾2：HTTP 请求正常，WebSocket 不正常**

- HTTP 请求通过 ngrok 正常工作（其他功能正常）
- WebSocket 连接建立（onOpen 触发）
- 但 WebSocket 消息收发异常

### 问题根源推断

#### 根源1：ngrok 免费版 WebSocket 限制 ⭐⭐⭐⭐⭐（最可能）

**证据**：
1. WebSocket 连接频繁断开（code 1006 - 异常关闭）
2. 重连成功但消息不能正常收发
3. 没有"【WebSocket】收到原始消息"的日志
4. HTTP 功能正常，只有 WebSocket 有问题

**ngrok 免费版对 WebSocket 的限制**：
- ⚠️ 连接时长限制（通常几分钟后自动断开）
- ⚠️ 消息大小限制
- ⚠️ 并发连接限制
- ⚠️ 可能会注入额外的头部或修改WebSocket帧
- ⚠️ 不稳定的双向通信

**ngrok WebSocket URL 转换问题**：
```
HTTP:  https://cecille-insertional-keva.ngrok-free.dev
WS:    wss://cecille-insertional-keva.ngrok-free.dev/ws/chat
```

ngrok 在转发 WebSocket 时可能存在：
- 头部丢失
- 消息缓冲
- 帧分片问题

#### 根源2：微信小程序 WebSocket 安全限制 ⭐⭐⭐

**微信小程序 WebSocket 要求**：
1. 必须使用 `wss://` 协议（不能是 `ws://`）✅ 已满足
2. 域名必须在白名单中（开发模式可绕过）✅ 已设置 urlCheck: false
3. 同一时间只能有一个 WebSocket 连接 ⚠️ 可能的问题
4. 真机调试时的网络策略更严格

**可能的限制场景**：
- 真机上 WebSocket 连接建立后立即被系统关闭
- 消息大小超过限制
- 证书验证问题（ngrok 的证书可能不被信任）

#### 根源3：WebSocket 状态同步问题 ⭐⭐

**问题分析**：
从代码来看（websocket.js:137）：
```javascript
this.ws.onOpen(() => {
  console.log('【WebSocket】连接已建立');
  this.isConnected = true;  // 设置为 true
  ...
});
```

但聊天室检查时（room.vue:606）：
```javascript
if (!wsClient.isConnected) {
  uni.showToast({ title: '聊天服务未连接', icon: 'none' });
  return;
}
```

如果显示"聊天服务未连接"，说明 `wsClient.isConnected` 是 false。

**可能的原因**：
1. 页面缓存了旧的 isConnected 状态
2. 重连后状态监听器没有触发
3. 聊天室页面加载时 WebSocket 还未重连

#### 根源4：消息处理器注册时机问题 ⭐

**代码执行顺序**（App.vue:25-38）：
```javascript
// 1. 异步连接 WebSocket
wsClient.connect(apiModule.baseURL || 'http://localhost:8081')
  .then(() => {
    console.log('【App】WebSocket连接成功')
  })

// 2. 同步注册消息处理器
this.registerGlobalNotificationHandlers()
```

**重连场景**：
当 WebSocket 断开后，`attemptReconnect()` 会调用 `this.connect(this.baseUrl)`。
但是 `registerGlobalNotificationHandlers()` 不会再次调用。

**messageHandlers 是否保留**：
```javascript
// websocket.js:21
this.messageHandlers = new Map();
```
由于使用单例模式，messageHandlers 应该保留。

但是如果 WebSocket 实例被意外重新创建，messageHandlers 会丢失。

## 诊断方案

### 测试1：验证 WebSocket 消息收发

在后端添加测试接口主动推送消息：

```java
// WebSocketDebugController.java
@PostMapping("/test-push/{userId}")
public R<String> testPush(@PathVariable Long userId) {
    String testMessage = "{\"type\":\"test_message\",\"content\":\"测试消息\",\"timestamp\":" + System.currentTimeMillis() + "}";
    chatWebSocketHandler.sendMessageToUser(userId, testMessage);
    return R.success("测试消息已发送");
}
```

**操作步骤**：
1. 确保手机端 WebSocket 已连接（查看日志）
2. 调用后端接口 `/admin/websocket/test-push/3`（替换为真实用户ID）
3. 观察手机端是否收到消息

**期望日志**：
```
【WebSocket】收到原始消息: {"type":"test_message",...}
【WebSocket】解析后的消息: {...}
【WebSocket】处理消息，类型: test_message
【WebSocket】未找到消息处理器
```

**结果判断**：
- ✅ 看到"收到原始消息" → WebSocket 双向通信正常
- ❌ 没有任何日志 → WebSocket 接收消息失败（ngrok 问题）

### 测试2：验证消息发送

在聊天室发送消息，观察日志：

**期望日志（正常情况）**：
```
【聊天室】发送消息...
【WebSocket】发送消息: {"type":"group_message",...}
【WebSocket】收到原始消息: {"type":"group_message_ack",...}
```

**异常情况**：
```
【聊天室】发送消息...
【WebSocket】未连接，消息将加入缓冲区
```
或者
```
【WebSocket】发送消息失败: {...}
```

### 测试3：验证连接稳定性

**操作**：
1. 打开真机调试控制台
2. 等待5分钟不操作
3. 观察 WebSocket 是否自动断开

**期望**：
- ngrok 免费版可能在几分钟后断开连接
- 观察是否出现 code 1006 异常关闭

## 解决方案

### 方案1：切换到其他内网穿透工具 ⭐⭐⭐⭐⭐（强烈推荐）

ngrok 免费版对 WebSocket 支持不佳，建议切换到：

#### 选项A：cpolar（国内版ngrok）

**优点**：
- ✅ 国内服务，速度快
- ✅ WebSocket 支持更好
- ✅ 免费版提供固定域名（需实名认证）
- ✅ 中文文档和客服

**安装步骤**：
1. 访问 https://www.cpolar.com/
2. 注册并下载客户端
3. 启动：
   ```bash
   cpolar http 8081
   ```
4. 获得公网地址（如 `https://abc.cpolar.cn`）
5. 修改 `api.js` 中的 baseURL

#### 选项B：frp（自建内网穿透）

**优点**：
- ✅ 完全控制，无限制
- ✅ WebSocket 完美支持
- ✅ 免费

**缺点**：
- ❌ 需要有公网服务器
- ❌ 配置相对复杂

**配置示例**：
```ini
# frpc.ini
[common]
server_addr = your-server-ip
server_port = 7000

[club-backend]
type = tcp
local_ip = 127.0.0.1
local_port = 8081
remote_port = 8081
```

#### 选项C：localtunnel

**快速测试**：
```bash
npm install -g localtunnel
lt --port 8081 --subdomain club-backend
```

**优点**：
- ✅ 命令行一键启动
- ✅ WebSocket 支持较好

**缺点**：
- ❌ 不稳定，经常断开
- ❌ 域名随机（除非付费）

### 方案2：修改代码适配 ngrok 的 WebSocket 限制 ⭐⭐⭐

如果必须使用 ngrok，可以尝试以下优化：

#### 2.1 增加 WebSocket 重连机制的健壮性

**问题**：ngrok 会频繁断开 WebSocket，需要更积极的重连策略。

**修改 websocket.js**：

```javascript
// 减少重连间隔，增加心跳频率
this.reconnectInterval = 2000;  // 改为2秒
this.heartbeatInterval = 15000; // 改为15秒
this.maxReconnectAttempts = 20; // 增加到20次
```

#### 2.2 添加 WebSocket 健康检查

**修改 websocket.js**：

```javascript
startHeartbeat() {
  this.stopHeartbeat();

  this.heartbeatTimer = setInterval(() => {
    if (this.isConnected && this.ws) {
      // 发送心跳
      this.sendMessage({ type: 'heartbeat' });

      // 设置心跳超时检测
      this.heartbeatTimeout = setTimeout(() => {
        console.warn('【WebSocket】心跳超时，主动断开重连');
        this.disconnect();
        this.attemptReconnect();
      }, 5000);  // 5秒内未收到响应则断开
    }
  }, this.heartbeatInterval);
}

// 在 onMessage 中取消超时
this.ws.onMessage((res) => {
  // 取消心跳超时
  if (this.heartbeatTimeout) {
    clearTimeout(this.heartbeatTimeout);
    this.heartbeatTimeout = null;
  }

  // 处理消息...
});
```

#### 2.3 添加连接质量监控

```javascript
// 在 onOpen 后测试消息收发
this.ws.onOpen(() => {
  console.log('【WebSocket】连接已建立');
  this.isConnected = true;

  // 发送测试消息验证连接
  this.sendMessage({ type: 'connection_test' });

  // 5秒内如果没有收到任何消息，认为连接有问题
  this.connectionTestTimer = setTimeout(() => {
    console.warn('【WebSocket】连接测试超时，可能无法正常通信');
    uni.showToast({
      title: '网络连接不稳定',
      icon: 'none'
    });
  }, 5000);

  resolve();
});

this.ws.onMessage((res) => {
  // 清除连接测试定时器
  if (this.connectionTestTimer) {
    clearTimeout(this.connectionTestTimer);
    this.connectionTestTimer = null;
  }

  // 处理消息...
});
```

### 方案3：使用 HTTP 轮询作为降级方案 ⭐⭐

如果 WebSocket 完全不可用，可以使用 HTTP 轮询：

#### 3.1 后端添加轮询接口

```java
@RestController
@RequestMapping("/api/messages")
public class MessagePollingController {

    @GetMapping("/poll")
    public R<List<MessageDTO>> pollMessages(
            @RequestParam Long lastMessageId,
            @RequestParam Long userId) {
        // 获取用户未读消息
        List<MessageDTO> messages = messageService.getMessagesAfter(userId, lastMessageId);
        return R.success(messages);
    }

    @GetMapping("/notifications/poll")
    public R<List<NotificationDTO>> pollNotifications(
            @RequestParam Long lastNotificationId,
            @RequestParam Long userId) {
        // 获取用户未读通知
        List<NotificationDTO> notifications = notificationService.getNotificationsAfter(userId, lastNotificationId);
        return R.success(notifications);
    }
}
```

#### 3.2 前端添加轮询逻辑

```javascript
// utils/polling.js
class PollingService {
  constructor() {
    this.pollingInterval = 3000; // 3秒轮询一次
    this.pollingTimer = null;
    this.lastMessageId = 0;
    this.lastNotificationId = 0;
  }

  startPolling() {
    this.stopPolling();

    this.pollingTimer = setInterval(() => {
      // 轮询消息
      this.pollMessages();
      // 轮询通知
      this.pollNotifications();
    }, this.pollingInterval);
  }

  async pollMessages() {
    try {
      const res = await request.get('/api/messages/poll', {
        lastMessageId: this.lastMessageId,
        userId: getUserId()
      });

      if (res.code === 200 && res.data.length > 0) {
        // 处理新消息
        res.data.forEach(msg => {
          // 触发消息处理
          uni.$emit('newMessage', msg);
        });

        // 更新最后消息ID
        this.lastMessageId = res.data[res.data.length - 1].id;
      }
    } catch (error) {
      console.error('轮询消息失败:', error);
    }
  }

  async pollNotifications() {
    try {
      const res = await request.get('/api/notifications/poll', {
        lastNotificationId: this.lastNotificationId,
        userId: getUserId()
      });

      if (res.code === 200 && res.data.length > 0) {
        // 处理新通知
        res.data.forEach(notification => {
          // 显示通知
          uni.showModal({
            title: notification.title,
            content: notification.content,
            showCancel: false
          });
        });

        // 更新最后通知ID
        this.lastNotificationId = res.data[res.data.length - 1].id;
      }
    } catch (error) {
      console.error('轮询通知失败:', error);
    }
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}

export default new PollingService();
```

#### 3.3 在 App.vue 中启用轮询降级

```javascript
// App.vue
import pollingService from '@/utils/polling.js'

export default {
  onLaunch: function() {
    const token = uni.getStorageSync('token')
    if (token) {
      // 尝试 WebSocket 连接
      wsClient.connect(apiModule.baseURL)
        .then(() => {
          console.log('【App】WebSocket连接成功')
        })
        .catch((error) => {
          console.error('【App】WebSocket连接失败，启用轮询降级', error)
          // WebSocket 失败，启用轮询
          pollingService.startPolling()
        })

      // 监听 WebSocket 断开，自动切换到轮询
      wsClient.addStateListener((isConnected) => {
        if (!isConnected) {
          console.log('【App】WebSocket断开，启用轮询')
          pollingService.startPolling()
        } else {
          console.log('【App】WebSocket已连接，停止轮询')
          pollingService.stopPolling()
        }
      })
    }
  }
}
```

**轮询方案优缺点**：
- ✅ 可靠性高，不受 WebSocket 限制
- ✅ 兼容性好，所有环境都支持
- ❌ 实时性差（3秒延迟）
- ❌ 耗电量大
- ❌ 服务器压力大

### 方案4：使用手机热点共享网络 ⭐⭐（临时方案）

**操作步骤**：
1. 手机开启热点
2. 电脑连接手机热点
3. 后端服务器监听在 `0.0.0.0:8081`
4. 前端使用电脑在热点网络中的IP（如 `192.168.43.xxx`）

**修改 api.js**：
```javascript
// 查看电脑在手机热点中的IP
// Windows: ipconfig
// Mac/Linux: ifconfig

const baseURL = 'http://192.168.43.123:8081'; // 替换为实际IP
```

**优点**：
- ✅ 不需要内网穿透
- ✅ WebSocket 完美支持
- ✅ 速度快，延迟低

**缺点**：
- ❌ 只能在同一网络下调试
- ❌ IP 可能变化
- ❌ 手机需要开热点（耗电）

## 推荐的实施步骤

### 第一步：快速诊断（5分钟）

1. **测试 WebSocket 消息接收**：
   - 调用后端测试接口向手机推送消息
   - 查看手机控制台是否有"【WebSocket】收到原始消息"

2. **结果判断**：
   - ✅ 收到消息 → 问题在前端处理逻辑，跳到第三步
   - ❌ 没收到消息 → 问题在 ngrok 或网络层，跳到第二步

### 第二步：切换内网穿透工具（30分钟）

**推荐顺序**：
1. **cpolar**（最推荐，15分钟）
2. **手机热点**（最简单，5分钟，用于快速验证）
3. **frp**（需要服务器，60分钟）
4. **轮询降级**（保底方案，60分钟）

**验证**：
- 切换后重新测试聊天和通知功能
- 如果正常，说明确实是 ngrok 的问题

### 第三步：修复前端处理逻辑（如果不是 ngrok 问题）

1. **检查消息处理器**：
   - 在 App.vue 中添加日志
   - 确认 registerGlobalNotificationHandlers 被调用
   - 确认 messageHandlers 中有注册的处理器

2. **检查通知显示逻辑**：
   - 验证 showNotification 函数是否正确导入
   - 测试 uni.showModal 是否正常工作

3. **检查连接状态同步**：
   - 在聊天室中添加连接状态监听
   - 确保页面能感知 WebSocket 状态变化

## 预防措施

为了避免将来再次出现此类问题：

### 1. 添加完整的监控和日志

```javascript
// utils/monitoring.js
class ConnectionMonitor {
  constructor() {
    this.connectionHistory = [];
    this.messageHistory = [];
    this.errorHistory = [];
  }

  recordConnection(event) {
    this.connectionHistory.push({
      time: new Date().toISOString(),
      event: event,
      isConnected: wsClient.isConnected
    });

    // 保留最近100条记录
    if (this.connectionHistory.length > 100) {
      this.connectionHistory.shift();
    }
  }

  recordMessage(type, direction) {
    this.messageHistory.push({
      time: new Date().toISOString(),
      type: type,
      direction: direction // 'send' or 'receive'
    });

    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }
  }

  recordError(error) {
    this.errorHistory.push({
      time: new Date().toISOString(),
      error: JSON.stringify(error)
    });

    if (this.errorHistory.length > 50) {
      this.errorHistory.shift();
    }
  }

  getReport() {
    return {
      connection: this.connectionHistory,
      messages: this.messageHistory,
      errors: this.errorHistory,
      currentStatus: {
        isConnected: wsClient.isConnected,
        reconnectAttempts: wsClient.reconnectAttempts
      }
    };
  }

  exportReport() {
    const report = this.getReport();
    console.log('=== 连接诊断报告 ===');
    console.log(JSON.stringify(report, null, 2));
    return report;
  }
}

export default new ConnectionMonitor();
```

### 2. 添加用户友好的错误提示

```javascript
// 在 App.vue 中
wsClient.addStateListener((isConnected) => {
  if (!isConnected) {
    uni.showToast({
      title: '连接已断开，正在重连...',
      icon: 'none',
      duration: 2000
    });
  } else {
    uni.showToast({
      title: '连接已恢复',
      icon: 'success',
      duration: 1500
    });
  }
});
```

### 3. 生产环境使用稳定的公网服务器

- 不要在生产环境使用内网穿透
- 部署到云服务器（阿里云、腾讯云等）
- 使用 nginx 反向代理 WebSocket
- 配置 SSL 证书（Let's Encrypt 免费）

## 总结

**问题根源（按可能性排序）**：

1. **ngrok 免费版 WebSocket 限制**（90%可能性）⭐⭐⭐⭐⭐
   - 连接建立但消息收发异常
   - 频繁断开（code 1006）
   - HTTP 正常但 WebSocket 不正常

2. **微信小程序真机环境限制**（5%可能性）⭐
   - 真机的网络策略更严格
   - 证书验证问题

3. **前端代码逻辑问题**（5%可能性）⭐
   - 消息处理器丢失
   - 状态同步问题

**推荐解决方案**：

1. **立即行动**：切换到 cpolar 或使用手机热点（30分钟解决）
2. **长期方案**：部署到云服务器（生产环境必须）
3. **保底方案**：实现HTTP轮询降级（确保功能可用）

**下一步**：
请告诉我您想先尝试哪个方案，我可以提供详细的操作步骤。
