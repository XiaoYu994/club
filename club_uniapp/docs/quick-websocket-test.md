# WebSocket 问题快速诊断测试（5分钟）

## 测试目的

通过一个简单的测试快速确定问题是否出在 ngrok 的 WebSocket 支持上。

## 测试步骤

### 步骤 1：确保手机端 WebSocket 已连接

1. **打开微信开发者工具的真机调试**
2. **在手机上登录小程序**
3. **查看控制台日志**，确认看到：
   ```
   【WebSocket】连接已建立
   ```

4. **记录用户ID**（从日志或登录信息中获取，例如 userId=3）

### 步骤 2：检查用户是否在线

**使用任何 HTTP 客户端工具调用**（Postman、浏览器、curl 等）：

```
GET https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/online-users
```

**期望响应**：
```json
{
  "code": 200,
  "data": {
    "onlineUserIds": [3, 5, 7],  // 应该包含你的userId
    "onlineCount": 3
  }
}
```

**结果判断**：
- ✅ **如果列表中有你的userId** → WebSocket 连接到后端了，继续步骤3
- ❌ **如果列表中没有你的userId** → WebSocket 没有成功连接到后端

**如果没有你的userId**，问题在连接建立阶段：
- 检查后端日志，看是否有连接建立的日志
- 检查 ngrok 是否正常运行
- 尝试方案：**切换到 cpolar 或手机热点**

### 步骤 3：发送测试消息

**调用测试接口**（替换 `{userId}` 为你的实际用户ID）：

```
POST https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/test-push/3
```

或使用 curl：
```bash
curl -X POST "https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/test-push/3"
```

### 步骤 4：观察手机端日志

**期望看到**（按顺序）：
```
【WebSocket】收到原始消息: {"type":"test_message","content":"这是一条测试消息，时间戳: 1738234567890","timestamp":1738234567890}
【WebSocket】解析后的消息: {...}
【WebSocket】处理消息，类型: test_message
【WebSocket】未找到消息处理器，已注册的处理器: ["activity_cancel_notification", "apply_approved_notification", ...]
```

**关键是第一行** `【WebSocket】收到原始消息`！

### 步骤 5：判断结果

#### 情况 A：看到"收到原始消息" ✅

**说明**：
- ✅ WebSocket 双向通信**正常**
- ✅ ngrok 的 WebSocket 支持**可用**
- 问题在前端的消息处理逻辑

**下一步行动**：
1. 检查为什么没有看到我添加的诊断日志（【全局】收到活动取消通知等）
2. 可能需要检查 App.vue 的 registerGlobalNotificationHandlers 是否执行
3. 可能需要清除缓存重新编译

**快速修复方案**：
直接使用 uni.showModal 替代 showNotification 函数（见文档中的方案2）

#### 情况 B：没有任何日志 ❌

**说明**：
- ❌ WebSocket 消息接收**失败**
- ❌ ngrok 的 WebSocket 支持**有问题**
- 虽然连接建立了（onOpen 触发），但数据无法传输

**这是 ngrok 免费版的典型问题！**

**下一步行动**（按优先级）：

##### 方案1：切换到 cpolar（15分钟，推荐）

1. **下载安装 cpolar**：https://www.cpolar.com/

2. **注册账号**（需要手机号）

3. **启动 cpolar**：
   ```bash
   # Windows
   cpolar.exe http 8081

   # Mac/Linux
   ./cpolar http 8081
   ```

4. **获取公网地址**（如 `https://abc.cpolar.cn`）

5. **修改前端配置**：
   ```javascript
   // club_uniapp/api/api.js
   const baseURL = 'https://abc.cpolar.cn';  // 改为 cpolar 地址
   ```

6. **重新编译和测试**

##### 方案2：使用手机热点（5分钟，最简单）

1. **手机开启热点**

2. **电脑连接手机热点**

3. **查看电脑在热点网络中的IP**：
   ```bash
   # Windows
   ipconfig
   # 找到 "无线局域网适配器 WLAN" 下的 IPv4 地址
   # 例如：192.168.43.123

   # Mac
   ifconfig | grep "inet "
   # 找到类似 192.168.43.xxx 的地址

   # Linux
   ip addr show
   ```

4. **修改前端配置**：
   ```javascript
   // club_uniapp/api/api.js
   const baseURL = 'http://192.168.43.123:8081';  // 改为你的电脑IP
   ```

5. **确保后端监听在 0.0.0.0**（默认应该是）

6. **重新编译和测试**

##### 方案3：HTTP 轮询降级（60分钟，保底方案）

如果以上方案都不可行，参考完整诊断文档中的"方案3"实现 HTTP 轮询。

## 测试脚本（可选）

为了更方便测试，您可以在浏览器控制台或 Postman 中使用以下脚本：

### Postman Collection

```json
{
  "info": {
    "name": "WebSocket 诊断测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. 查看在线用户",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/online-users",
          "protocol": "https",
          "host": ["cecille-insertional-keva", "ngrok-free", "dev"],
          "path": ["admin", "websocket", "online-users"]
        }
      }
    },
    {
      "name": "2. 检查用户在线状态",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/check-online/3",
          "protocol": "https",
          "host": ["cecille-insertional-keva", "ngrok-free", "dev"],
          "path": ["admin", "websocket", "check-online", "3"]
        }
      }
    },
    {
      "name": "3. 发送测试消息",
      "request": {
        "method": "POST",
        "header": [],
        "url": {
          "raw": "https://cecille-insertional-keva.ngrok-free.dev/admin/websocket/test-push/3",
          "protocol": "https",
          "host": ["cecille-insertional-keva", "ngrok-free", "dev"],
          "path": ["admin", "websocket", "test-push", "3"]
        }
      }
    }
  ]
}
```

### JavaScript 测试脚本

```javascript
// 在浏览器控制台中运行
const baseURL = 'https://cecille-insertional-keva.ngrok-free.dev';
const userId = 3; // 替换为你的用户ID

// 测试函数
async function testWebSocket() {
  console.log('=== WebSocket 诊断测试开始 ===\n');

  // 1. 查看在线用户
  console.log('1. 查看在线用户...');
  let response = await fetch(`${baseURL}/admin/websocket/online-users`);
  let data = await response.json();
  console.log('在线用户列表:', data.data.onlineUserIds);
  console.log('在线用户数:', data.data.onlineCount);

  const isOnline = data.data.onlineUserIds.includes(userId);
  console.log(`\n用户 ${userId} 是否在线: ${isOnline ? '✅ 是' : '❌ 否'}\n`);

  if (!isOnline) {
    console.error('❌ 用户不在线，测试终止');
    console.log('请检查：');
    console.log('1. 手机是否已登录小程序');
    console.log('2. 控制台是否显示【WebSocket】连接已建立');
    console.log('3. 后端日志是否有连接记录');
    return;
  }

  // 2. 发送测试消息
  console.log('2. 发送测试消息...');
  response = await fetch(`${baseURL}/admin/websocket/test-push/${userId}`, {
    method: 'POST'
  });
  data = await response.json();
  console.log('发送结果:', data);

  console.log('\n=== 测试完成 ===');
  console.log('请在手机端真机调试控制台查看是否收到消息');
  console.log('期望看到: 【WebSocket】收到原始消息: {...}');
}

// 运行测试
testWebSocket();
```

## 快速决策树

```
开始测试
  │
  ├─ 1. 用户是否在线？
  │   ├─ 是 → 继续步骤2
  │   └─ 否 → 检查 WebSocket 连接建立过程
  │
  ├─ 2. 发送测试消息
  │
  └─ 3. 手机端是否收到消息？
      ├─ 是 → 问题在前端处理逻辑
      │         → 检查消息处理器注册
      │         → 使用 uni.showModal 替代 showNotification
      │
      └─ 否 → ngrok WebSocket 支持有问题
                → 推荐：切换到 cpolar（15分钟）
                → 或：使用手机热点（5分钟）
                → 或：实现 HTTP 轮询降级（60分钟）
```

## 预计时间

- **诊断测试**：5 分钟
- **切换到 cpolar**：15 分钟
- **使用手机热点**：5 分钟
- **修复前端逻辑**：30 分钟（如果问题在前端）

## 需要帮助？

完成测试后，请告诉我：
1. **用户是否在线**（步骤2的结果）
2. **是否收到测试消息**（步骤4的日志）
3. **您想尝试哪个解决方案**

我会提供详细的操作指导。

## 常见问题

### Q: 调用接口时提示 "ngrok-skip-browser-warning" 相关错误

A: 在请求头中添加：
```
ngrok-skip-browser-warning: true
```

### Q: 看到 HTML 响应而不是 JSON

A: 这是 ngrok 的确认页面，说明请求头配置有问题。使用 Postman 或 curl 测试更可靠。

### Q: 用户在线，但发送消息后手机无反应

A: 这确认了问题出在 ngrok 的 WebSocket 转发上。请立即切换到 cpolar 或手机热点。

### Q: 用户显示在线，但后端日志说用户不在线

A: 可能存在会话缓存问题。重启后端服务，重新连接 WebSocket。
