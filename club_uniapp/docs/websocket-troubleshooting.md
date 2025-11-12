# WebSocket 推送问题排查指南

## 问题描述

从真机执行操作时，模拟器能收到通知弹窗；但从模拟器执行操作时，真机收不到通知弹窗。

## 问题原因分析

### 1. WebSocket 连接问题

WebSocket 只能向**在线用户**推送消息。如果真机没有成功建立 WebSocket 连接，就收不到实时推送。

### 2. 用户ID不一致

如果真机和模拟器登录的是不同的账号，它们的用户ID不同，不会互相收到对方的通知。

### 3. 网络环境问题

真机和模拟器可能处于不同的网络环境，真机连接服务器可能存在问题。

## 排查步骤

### 步骤1: 检查真机的 WebSocket 连接状态

1. 在真机上打开小程序
2. 查看控制台日志（使用微信开发者工具的真机调试功能）
3. 查找以下日志：

```
【App】检测到用户已登录，建立WebSocket连接
连接WebSocket: ws://xxx.xxx.xxx.xxx:8081/ws/chat?token=...
```

4. 如果没有看到连接日志，说明：
   - 用户未登录
   - WebSocket 连接失败
   - App.vue 的 onLaunch 没有执行

### 步骤2: 使用调试接口检查在线状态

#### 接口1: 获取所有在线用户

```bash
GET http://localhost:8081/admin/websocket/online-users
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "onlineUserIds": [1, 2, 3],
    "onlineCount": 3
  }
}
```

#### 接口2: 检查指定用户是否在线

```bash
GET http://localhost:8081/admin/websocket/check-online/{userId}
```

**示例**:
```bash
GET http://localhost:8081/admin/websocket/check-online/1
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "userId": 1,
    "isOnline": true
  }
}
```

#### 接口3: 测试发送通知

```bash
POST http://localhost:8081/admin/websocket/test-notification?userId=1&type=activity_cancel&title=测试&message=这是测试消息
```

#### 接口4: 向所有在线用户广播通知

```bash
POST http://localhost:8081/admin/websocket/broadcast-notification?type=activity_cancel&title=系统通知&message=这是广播消息
```

**参数说明**:
- `type`: 通知类型（默认: activity_cancel）
- `title`: 通知标题（默认: 系统广播通知）
- `message`: 通知内容（默认: 这是一条系统广播消息）

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "totalOnlineUsers": 3,
    "successCount": 3,
    "failCount": 0,
    "onlineUserIds": [1, 2, 3],
    "broadcastMessage": "这是广播消息"
  }
}
```

**使用场景**:
- 测试所有在线用户是否都能正常接收通知
- 系统维护通知
- 紧急公告

### 步骤3: 查看后端日志

启动后端服务后，查看以下关键日志：

#### WebSocket 连接建立时：
```
【WebSocket】用户 1 建立连接，SessionId: xxx，当前在线用户数：2
【WebSocket】当前在线用户列表: [1, 2]
```

#### 发送消息时：
```
【WebSocket】尝试向用户 1 发送消息，当前在线用户数: 2
【WebSocket】在线用户列表: [1, 2]
【WebSocket】成功发送消息给用户 1
```

或者：
```
【WebSocket】尝试向用户 3 发送消息，当前在线用户数: 2
【WebSocket】用户 3 不在线（session为null），无法发送消息
```

#### 断开连接时：
```
【WebSocket】用户 1 断开连接，SessionId: xxx，原因: CloseStatus[code=1000, reason=null]，当前在线用户数：1
```

### 步骤4: 前端日志检查

在收到通知时，前端应该有以下日志：

```
【全局】收到活动取消通知: {activityId: 123, activityTitle: "测试活动", ...}
【通知】showNotification 被调用，参数: {...}
【通知】准备显示消息，标题: 活动取消通知 内容: ...
【通知】开始显示消息: 活动取消通知
```

## 常见问题及解决方案

### 问题1: 真机显示"未登录，无法连接WebSocket服务"

**原因**: Token 未正确保存或已过期

**解决方案**:
1. 重新登录小程序
2. 检查 `uni.getStorageSync('token')` 是否有值
3. 确认后端 Token 验证逻辑

### 问题2: 真机显示 WebSocket 连接失败

**原因**: 网络问题或服务器地址配置错误

**解决方案**:
1. 检查 `api.js` 中的 `baseURL` 配置
2. 确保真机能够访问服务器地址
3. 检查防火墙和安全组设置
4. 在 `manifest.json` 中配置合法域名（生产环境）

### 问题3: 连接成功但收不到消息

**原因**:
- 用户ID不匹配
- WebSocket 会话被覆盖或断开

**解决方案**:
1. 使用调试接口检查用户是否在线
2. 查看后端日志确认发送状态
3. 检查是否有多个设备使用同一账号登录（会覆盖旧连接）

### 问题4: 模拟器正常，真机不正常

**原因**: 真机和模拟器的网络环境不同

**解决方案**:
1. 确保真机和服务器在同一局域网（开发环境）
2. 使用内网穿透工具（如 ngrok）
3. 部署到公网服务器

## 测试流程

### 测试1: 双设备在线测试

1. 在模拟器上登录用户A
2. 在真机上登录用户B
3. 使用调试接口检查两个用户都在线
4. 在模拟器上操作（如审核用户B的报名）
5. 观察真机是否收到通知

### 测试2: 单设备测试

1. 在真机上登录
2. 使用调试接口发送测试通知
3. 观察真机是否收到弹窗

## 日志收集清单

排查问题时，请收集以下信息：

### 后端日志
- [ ] WebSocket 连接日志（包含用户ID和SessionId）
- [ ] 在线用户列表
- [ ] 发送消息的日志
- [ ] 任何错误或警告信息

### 前端日志
- [ ] App 启动日志
- [ ] WebSocket 连接日志
- [ ] 接收到的消息日志
- [ ] showNotification 调用日志

### 环境信息
- [ ] 服务器地址和端口
- [ ] 真机型号和系统版本
- [ ] 网络环境（WiFi/4G/5G）
- [ ] 是否使用 VPN 或代理

## 调试技巧

### 1. 强制刷新前端

样式修改不生效时：
- 微信开发者工具：右键项目 → 删除缓存 → 重新编译
- 真机：停止小程序 → 删除小程序 → 重新扫码进入

### 2. 实时查看 WebSocket 消息

在浏览器的开发者工具中：
- Network → WS → 选择 WebSocket 连接
- 可以看到所有发送和接收的消息

### 3. 使用 Postman/Apifox 测试接口

直接调用调试接口，快速验证后端逻辑：
```
GET http://your-server:8081/admin/websocket/online-users
POST http://your-server:8081/admin/websocket/test-notification?userId=1&message=测试
```

## 最终检查清单

- [ ] 后端日志显示真机用户已连接
- [ ] 调试接口显示真机用户在线
- [ ] 后端发送消息的日志显示成功
- [ ] 前端日志显示收到 WebSocket 消息
- [ ] 前端日志显示调用了 showNotification
- [ ] 真机屏幕上显示了弹窗

如果以上所有步骤都检查过，仍然无法解决问题，请提供完整的日志信息以便进一步排查。
