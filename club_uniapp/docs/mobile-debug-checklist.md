# 手机真机调试问题诊断清单

## 📱 问题现象

编译到手机上进行真机调试时出现问题，使用 ngrok 内网穿透后仍然有问题。

---

## ✅ 逐步诊断清单

### 第一步：确认 ngrok 状态

#### 1.1 检查 ngrok 是否正在运行

在电脑命令行窗口确认：
```
ngrok http 8081

Forwarding  https://cecille-insertional-keva.ngrok-free.dev -> http://localhost:8081
```

**期望结果**：
- ✅ 看到 `Forwarding` 字样
- ✅ 显示你的 ngrok URL
- ✅ 显示 `online` 状态

**如果没有运行**：
```bash
# 重新启动 ngrok
ngrok http 8081
```

#### 1.2 检查后端服务是否运行

```bash
# Windows - 检查端口占用
netstat -ano | findstr 8081

# 应该看到类似输出：
# TCP    0.0.0.0:8081    0.0.0.0:0    LISTENING    12345
```

**如果没有运行**：
```bash
# 启动 Spring Boot 后端
cd club_java
mvn spring-boot:run
# 或
java -jar target/club_java-1.0.0.jar
```

#### 1.3 浏览器测试 ngrok 地址

在浏览器访问：
```
https://cecille-insertional-keva.ngrok-free.dev/user/info
```

**期望结果**：
- ✅ 显示 ngrok 确认页面（点击 "Visit Site" 后应该能看到 JSON）
- ✅ 或者直接返回 401 未授权错误（说明后端正常）

**如果打不开**：
- ❌ ngrok 没有正确转发
- ❌ 后端服务没有启动
- ❌ ngrok URL 过期（免费版每次重启会变）

---

### 第二步：检查小程序配置

#### 2.1 确认 baseURL 配置

**文件1**: `utils/request.js`
```javascript
// 第6-7行应该是：
// this.baseURL = 'http://localhost:8081'
this.baseURL = 'https://cecille-insertional-keva.ngrok-free.dev'  // ✅ 正确
```

**文件2**: `api/api.js`
```javascript
// 第7-8行应该是：
// const baseURL = 'http://192.168.234.200:8081';
const baseURL = 'https://cecille-insertional-keva.ngrok-free.dev';  // ✅ 正确
```

**检查点**：
- [ ] 两个文件的 URL 是否一致？
- [ ] 是否是 `https://`（不是 `http://`）？
- [ ] 域名是否正确？
- [ ] 结尾没有多余的斜杠 `/`？

#### 2.2 确认请求头配置

**文件**: `utils/request.js`
```javascript
// 第9-12行应该包含：
this.header = {
  'content-type': 'application/json',
  'ngrok-skip-browser-warning': 'true'  // ✅ 必须有这个
}
```

**检查点**：
- [ ] 是否有 `ngrok-skip-browser-warning` 这个请求头？
- [ ] 值是否为字符串 `'true'`？

---

### 第三步：清除缓存并重新编译

#### 3.1 微信开发者工具

1. **清除缓存**：
   ```
   工具 → 清除缓存 → 清除所有缓存
   ```

2. **删除编译文件**：
   ```
   在项目目录删除：
   - unpackage/dist/
   - node_modules/.cache/（如果有）
   ```

3. **重新编译**：
   ```
   点击"编译" → 等待编译完成
   ```

#### 3.2 手机端

1. **删除小程序**：
   - 长按小程序图标
   - 选择"删除"
   - 确认删除

2. **重新扫码进入**：
   - 使用微信开发者工具生成预览二维码
   - 用手机微信扫码
   - 进入小程序

#### 3.3 确认是真机预览而不是真机调试

**真机调试**（通过USB）：
```
工具 → 真机调试 → 选择设备
```
- ❌ 这种方式可能走的还是PC的网络
- ❌ 不适合测试 ngrok

**真机预览**（扫码）：
```
点击"预览" → 生成二维码 → 手机扫码
```
- ✅ 这种方式手机直接访问服务器
- ✅ 适合测试 ngrok

---

### 第四步：查看控制台日志

#### 4.1 启用真机调试日志

```
微信开发者工具 → 真机调试 → 选择你的手机设备
```

#### 4.2 关键日志检查

**启动日志**：
```
【App】应用启动
【App】运行平台: android / ios
【App】服务器地址: https://cecille-insertional-keva.ngrok-free.dev
【App】开始建立WebSocket连接
```

**请求日志**：
```
【请求】URL: https://cecille-insertional-keva.ngrok-free.dev/user/info
【请求】Method: GET
【请求】Headers: { 'content-type': 'application/json', 'ngrok-skip-browser-warning': 'true', ... }
【响应】Status: 200
【响应】Data类型: object  ← 应该是 object 而不是 string
```

**如果看到错误**：
```
【错误】收到 HTML 响应，可能是 ngrok 确认页面
【错误】响应内容: <!DOCTYPE html>...
```
说明请求头没有生效！

**WebSocket 日志**：
```
连接WebSocket: wss://cecille-insertional-keva.ngrok-free.dev/ws/chat?token=...
【WebSocket】连接已建立  ← 成功
```

---

### 第五步：网络环境检查

#### 5.1 手机网络状态

**WiFi 模式**：
- ✅ 推荐：速度快，稳定
- ⚠️ 注意：可能有企业/学校防火墙限制

**移动数据模式**：
- ✅ 可以使用 ngrok
- ⚠️ 注意：流量消耗

#### 5.2 手机浏览器测试

在手机自带浏览器（Safari/Chrome）访问：
```
https://cecille-insertional-keva.ngrok-free.dev/user/info
```

**期望结果**：
1. 首次访问：显示 ngrok 确认页面
2. 点击 "Visit Site"
3. 显示 JSON 数据或 401 错误

**如果打不开**：
- ❌ 网络有问题
- ❌ ngrok 转发失败
- ❌ 防火墙拦截

---

### 第六步：常见问题排查

#### 问题1：返回 HTML 而不是 JSON

**症状**：
```
【错误】收到 HTML 响应，可能是 ngrok 确认页面
```

**原因**：
- `ngrok-skip-browser-warning` 请求头没有生效
- 或者小程序使用了缓存的旧代码

**解决方案**：
1. 确认 `request.js` 中有这个请求头
2. 完全删除小程序，重新扫码进入
3. 检查 Network 面板，看请求头是否真的带上了

#### 问题2：WebSocket 连接失败

**症状**：
```
【WebSocket】连接错误: {errCode: 600002, errMsg: "连接超时"}
```

**原因**：
- WebSocket 使用了 `ws://` 而不是 `wss://`
- ngrok 没有正确转发 WebSocket

**解决方案**：
1. 检查日志，确认是 `wss://` 开头
2. ngrok 默认支持 WebSocket，无需额外配置
3. 检查后端 WebSocket 配置

#### 问题3：登录后立即退出

**症状**：
```
登录成功 → 跳转首页 → 又跳回登录页
```

**原因**：
- Token 保存失败
- 或者后端验证 Token 失败

**解决方案**：
1. 检查 Storage 中是否有 token
2. 检查请求头是否正确携带 Token
3. 查看后端日志的 Token 验证情况

#### 问题4：某些接口正常，某些接口失败

**症状**：
```
登录接口正常 → 其他接口返回 HTML
```

**原因**：
- 可能某些请求没有携带 `ngrok-skip-browser-warning` 头
- 或者有拦截器覆盖了请求头

**解决方案**：
1. 检查是否所有请求都经过 `request.js`
2. 是否有其他地方直接调用 `uni.request`

---

## 🔧 终极解决方案

如果以上所有步骤都正常，但仍然有问题，尝试以下操作：

### 方案1：使用 ngrok Agent 参数

```bash
# 添加 agent 参数，强制绕过确认页面
ngrok http 8081 --region=us
```

### 方案2：注册 ngrok 账号

免费账号可以获得：
- ✅ 更高的请求限额
- ✅ 更稳定的连接
- ✅ 固定域名（需付费）

```bash
# 1. 注册账号: https://dashboard.ngrok.com/signup
# 2. 获取 authtoken
# 3. 配置
ngrok config add-authtoken YOUR_AUTH_TOKEN
# 4. 启动
ngrok http 8081
```

### 方案3：使用其他内网穿透工具

**frp** (推荐，无确认页面)：
- 需要有一台公网服务器
- 配置稍复杂但更稳定
- 无请求限制

**花生壳**：
- 国内服务，速度快
- 免费版有流量限制
- 提供固定域名

**cpolar**：
- 国内 ngrok 替代品
- 提供免费固定域名
- 无确认页面问题

---

## 📊 问题诊断表格

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ngrok 运行状态 | ☐ | 命令行显示 Forwarding |
| 后端服务运行 | ☐ | 端口8081被占用 |
| 浏览器访问 ngrok | ☐ | 能看到确认页面或JSON |
| request.js 配置 | ☐ | baseURL 和请求头正确 |
| api.js 配置 | ☐ | baseURL 正确 |
| 缓存已清除 | ☐ | 工具+小程序都清除 |
| 使用真机预览 | ☐ | 扫码进入而非USB调试 |
| 控制台无错误 | ☐ | 没有 HTML 响应错误 |
| WebSocket 连接 | ☐ | 显示"连接已建立" |
| 手机浏览器能访问 | ☐ | 排除网络问题 |

---

## 🎯 快速修复步骤（按顺序执行）

1. **确认 ngrok 运行**
   ```bash
   ngrok http 8081
   ```

2. **确认后端运行**
   ```bash
   netstat -ano | findstr 8081
   ```

3. **修改配置文件**
   - `request.js`: 添加 `ngrok-skip-browser-warning` 头
   - `api.js`: 修改 baseURL 为 ngrok 地址

4. **清除所有缓存**
   - 微信开发者工具：工具 → 清除缓存
   - 手机：删除小程序

5. **重新编译**
   - 点击"编译"
   - 点击"预览"生成二维码
   - 手机扫码进入

6. **查看控制台**
   - 启用真机调试
   - 查找错误日志
   - 确认请求头和响应类型

7. **如果还有问题**
   - 查看本文档的"第六步：常见问题排查"
   - 或联系技术支持，提供完整日志

---

## 📞 需要提供的调试信息

如果问题仍然无法解决，请提供以下信息：

1. **ngrok 信息**：
   - ngrok 命令行的完整输出
   - ngrok URL

2. **控制台日志**：
   - 应用启动日志
   - 请求日志（包含 URL、Headers、响应）
   - WebSocket 连接日志
   - 错误日志

3. **配置文件**：
   - `request.js` 的 baseURL 和 header 配置
   - `api.js` 的 baseURL 配置

4. **测试结果**：
   - 浏览器能否访问 ngrok 地址？
   - 手机浏览器能否访问？
   - 是使用真机调试还是真机预览？

5. **网络环境**：
   - 手机使用 WiFi 还是移动数据？
   - 是否有防火墙/代理？
