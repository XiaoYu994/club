# 真机调试与PC端差异问题排查指南

## 问题描述

**现象**：
- ✅ PC端微信开发者工具真机调试：WebSocket连接正常，聊天室可用，通知弹窗正常
- ❌ 手机真机调试：显示"服务未连接"，聊天群组界面无效果，通知弹窗不显示

## 根本原因分析

### 1. 网络环境差异

| 环境 | PC端 | 真机 |
|------|------|------|
| 网络类型 | 通常连接WiFi | 可能是4G/5G移动网络 |
| 访问服务器 | 与服务器在同一局域网 | 需要跨网络访问 |
| IP访问 | 可以直接访问内网IP | 无法访问内网IP (192.168.x.x) |
| WebSocket | 可以建立ws://连接 | 可能被运营商拦截 |

**当前配置问题**：
```javascript
// api.js:7
const baseURL = 'http://192.168.234.200:8081';
```

这个**内网IP地址**只有在同一局域网内的设备才能访问！

### 2. 真机无法访问内网IP的原因

#### 问题1：手机使用移动网络
```
手机 (移动网络)
  ↓ 尝试访问
192.168.234.200  ← 这是你电脑的局域网IP
  ↑
  × 访问失败！移动网络无法访问局域网IP
```

#### 问题2：手机虽然连WiFi但不在同一网络
```
你的电脑: 192.168.234.200 (家里WiFi)
你的手机: 192.168.1.50    (办公室WiFi)
  ↓
  × 不同的局域网，无法互相访问
```

### 3. PC端真机调试为何正常？

PC端运行微信开发者工具时：
```
PC (192.168.234.X) ← 同一局域网 → 服务器 (192.168.234.200)
  ↓ 通过USB/WiFi连接
真机 ← 真机调试实际走的是PC的网络
```

**关键**：PC端真机调试时，手机是通过PC转发访问服务器的，所以能访问内网IP！

直接在手机上运行时：
```
真机 (移动网络/其他WiFi) × 无法访问 → 192.168.234.200
```

## 解决方案

### 方案1：确保手机和服务器在同一WiFi (推荐用于开发测试)

#### 步骤1：确认电脑IP
```bash
# Windows
ipconfig
# 找到你的 IPv4 地址，例如: 192.168.1.100

# Mac/Linux
ifconfig
# 找到 inet 地址
```

#### 步骤2：确认手机连接相同WiFi
- 手机连接与电脑相同的WiFi网络
- 不要使用移动数据

#### 步骤3：测试连通性
1. 在手机浏览器输入：`http://192.168.234.200:8081`
2. 如果能访问，说明网络连通
3. 如果不能访问，检查：
   - 防火墙是否允许8081端口
   - 两设备是否真的在同一WiFi

### 方案2：使用内网穿透工具 (适合移动网络测试)

使用工具如 ngrok、frp、花生壳等将内网服务暴露到公网：

#### 使用 ngrok (推荐)
```bash
# 1. 下载安装 ngrok
# 2. 运行
ngrok http 8081

# 3. 你会得到一个公网地址，如:
# https://abc123.ngrok.io
```

#### 修改 api.js
```javascript
// 开发环境使用 ngrok 地址
const baseURL = 'https://abc123.ngrok.io';
```

**注意**：每次重启 ngrok 地址会变化！

### 方案3：部署到公网服务器 (适合正式测试/生产)

将后端服务部署到有公网IP的服务器（如阿里云、腾讯云）：

```javascript
// api.js
const baseURL = 'https://your-domain.com';
// 或
const baseURL = 'http://你的公网IP:8081';
```

**必须配置**：
```json
// manifest.json - mp-weixin 配置
"mp-weixin": {
  "setting": {
    "urlCheck": true  // 生产环境开启校验
  }
}
```

并在微信小程序管理后台配置：
- 服务器域名
- WebSocket域名（wss://）
- 业务域名

## 调试步骤

### 第一步：查看控制台日志

在真机上打开小程序，使用**真机调试**功能查看日志：

**期望看到的日志**：
```
【App】应用启动
【App】运行平台: devtools / android / ios
【App】设备型号: iPhone 12
【App】微信版本: 8.0.x
【App】基础库版本: 2.x.x
【App】检测到用户已登录，Token: eyJhbGciOiJIUzI1NiIsIn...
【App】服务器地址: http://192.168.234.200:8081
【App】开始建立WebSocket连接
连接WebSocket: ws://192.168.234.200:8081/ws/chat?token=...
【WebSocket】连接已建立  ← 成功！
```

**如果看到错误日志**：
```
【WebSocket】连接错误: {errCode: 600001, errMsg: "xxx"}
【WebSocket】错误代码: 600001
【WebSocket】错误信息: request:fail url not in domain list
```

### 第二步：常见错误码解释

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 600001 | URL不在域名白名单 | 1. 检查manifest.json的urlCheck设置<br>2. 或配置合法域名 |
| 600002 | 连接超时 | 1. 检查网络连通性<br>2. 检查服务器是否启动 |
| 600003 | 连接被拒绝 | 1. 检查防火墙<br>2. 检查端口是否开放 |
| 600004 | 网络错误 | 1. 检查手机网络<br>2. 尝试切换WiFi |

### 第三步：使用调试接口测试

#### 1. 检查在线用户
```bash
GET http://192.168.234.200:8081/admin/websocket/online-users
```

期望响应：
```json
{
  "code": 200,
  "data": {
    "onlineUserIds": [1, 2],  ← 应该包含你的用户ID
    "onlineCount": 2
  }
}
```

#### 2. 检查特定用户是否在线
```bash
GET http://192.168.234.200:8081/admin/websocket/check-online/1
```

#### 3. 发送测试通知
```bash
POST http://192.168.234.200:8081/admin/websocket/test-notification?userId=1&message=测试消息
```

### 第四步：对比测试

| 测试项 | PC端真机调试 | 手机直接运行 | 结果 |
|--------|------------|------------|------|
| 能否访问HTTP API | ✓ | ? | 如果都不行，网络有问题 |
| WebSocket连接 | ✓ | ? | 如果HTTP行但WS不行，可能是协议被拦截 |
| 在线用户列表 | ✓ | ? | 通过后端接口确认 |
| 收到通知 | ✓ | ? | 检查是否真的在线 |

## 快速诊断清单

### ☐ 网络检查
- [ ] 手机和服务器在同一WiFi？
- [ ] 手机能ping通服务器IP？
- [ ] 手机浏览器能访问 `http://服务器IP:8081`？
- [ ] 防火墙允许8081端口？

### ☐ 配置检查
- [ ] `api.js` 中的 baseURL 是否正确？
- [ ] `manifest.json` 中 `urlCheck` 是否为 `false`（开发环境）？
- [ ] Token是否存在且有效？

### ☐ 代码检查
- [ ] App.vue 是否调用了 wsClient.connect？
- [ ] 是否有重复建立连接导致旧连接断开？
- [ ] 消息处理器是否正确注册？

### ☐ 后端检查
- [ ] 后端服务是否正常运行？
- [ ] 查看后端日志，是否有用户连接记录？
- [ ] 调用调试接口，用户是否真的在线？

## 最佳实践建议

### 1. 开发环境配置

创建环境配置文件：

```javascript
// config/env.js
const ENV = {
  // 开发环境：使用内网IP
  development: {
    baseURL: 'http://192.168.234.200:8081'
  },
  // 测试环境：使用ngrok或内网穿透
  testing: {
    baseURL: 'https://abc123.ngrok.io'
  },
  // 生产环境：使用公网域名
  production: {
    baseURL: 'https://api.yourdomain.com'
  }
}

// 根据需要切换
export const currentEnv = ENV.development; // 或 testing, production
```

在 `api.js` 中使用：
```javascript
import { currentEnv } from '@/config/env.js';
const baseURL = currentEnv.baseURL;
```

### 2. 自动环境检测

```javascript
// utils/env.js
export function getBaseURL() {
  const systemInfo = uni.getSystemInfoSync();

  // 如果是开发者工具
  if (systemInfo.platform === 'devtools') {
    return 'http://localhost:8081';
  }

  // 如果是真机，使用公网地址
  return 'https://api.yourdomain.com';
}
```

### 3. 网络状态监听

```javascript
// App.vue - onLaunch
uni.onNetworkStatusChange((res) => {
  console.log('网络状态变化:', res);
  if (res.isConnected) {
    // 网络恢复，尝试重连
    if (!wsClient.isConnected) {
      wsClient.connect(apiModule.baseURL);
    }
  } else {
    console.warn('网络已断开');
  }
});
```

## 常见问题FAQ

### Q1: 为什么PC端真机调试正常，但手机扫码进入就不行？

**A**: PC端真机调试时，手机是通过PC网络访问服务器的。扫码进入是手机直接访问，如果手机不在同一WiFi，就无法访问内网IP。

**解决**：
1. 确保手机连接相同WiFi
2. 或使用ngrok等工具暴露服务到公网

### Q2: 使用了ngrok，但每次重启地址都变怎么办？

**A**: 有几个方案：
1. 注册ngrok账号，使用固定域名
2. 使用其他内网穿透工具（如frp、花生壳）
3. 部署到真实的公网服务器

### Q3: WebSocket连接总是断开怎么办？

**A**: 检查：
1. 是否有多处建立连接导致互相覆盖
2. 网络是否稳定
3. 是否有心跳保活机制
4. 后端是否有连接超时设置

### Q4: 能连上WebSocket但收不到消息？

**A**: 检查：
1. 后端是否真的发送了消息（查看后端日志）
2. 用户ID是否匹配
3. 消息处理器是否正确注册
4. 是否被其他地方的连接覆盖

### Q5: manifest.json 的 urlCheck 设置有什么影响？

**A**:
- `urlCheck: false`: 不检查域名白名单，适用开发环境
- `urlCheck: true`: 严格检查，只能访问配置的合法域名，适用生产环境

开发时设为 `false`，上线前必须设为 `true` 并配置合法域名。

## 修复记录

### 2025-01-28
1. ✅ 修复聊天室页面重复建立WebSocket连接的问题
2. ✅ 修复活动详情页面重复建立连接的问题
3. ✅ 修复图片/文件上传时重复建立连接的问题
4. ✅ 增加 `forceReconnect` 参数，避免不必要的断开重连
5. ✅ 增强日志输出，便于排查真机问题
6. ✅ 创建真机调试排查指南

## 总结

真机调试问题的核心在于**网络环境差异**：

- PC端真机调试 = 手机借用PC的网络
- 手机直接运行 = 手机使用自己的网络

如果服务器使用内网IP，手机必须：
1. 连接同一WiFi
2. 或通过内网穿透访问
3. 或服务器部署到公网

重复建立连接会导致：
1. 后端session被覆盖
2. 旧设备收不到消息
3. 真机调试更容易出问题

**最佳实践**：
- 全局只建立一次连接（App.vue）
- 其他地方只注册消息处理器
- 开发使用内网IP + 同一WiFi
- 测试使用内网穿透
- 生产使用公网域名
