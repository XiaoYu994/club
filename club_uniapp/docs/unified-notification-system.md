# 统一通知系统设计文档

## 设计原则

### 核心理念
- **后端控制内容**：所有通知的标题、内容、额外信息由后端完全控制
- **前端只负责显示**：前端不做任何内容加工、模板处理、硬编码
- **统一数据格式**：所有类型的通知使用相同的数据结构
- **易于扩展**：增加新的通知类型无需修改前端代码

### 为什么重构

**重构前的问题**：
```javascript
// ❌ 硬编码标题
title: '活动取消通知',

// ❌ 硬编码消息模板
message: message.message || `您报名的活动"${message.activityTitle}"已被取消`,

// ❌ 硬编码额外信息
extraInfo: '如有疑问，请联系社团管理员'
```

**存在的问题**：
1. 通知内容写死在前端代码中，不灵活
2. 修改通知文案需要改前端代码、重新编译、重新发布
3. 每种通知类型有重复的处理逻辑
4. 不符合前后端分离的设计原则

**重构后的优势**：
```javascript
// ✅ 直接使用后端数据，无任何加工
title: message.title,
message: message.message,
extraInfo: message.extraInfo || message.feedback || null
```

**优势**：
1. 所有内容由后端控制，灵活性高
2. 修改通知文案只需修改后端代码，前端无感知
3. 前端代码简洁，一个通用处理函数处理所有通知
4. 符合项目规范和架构设计

## 统一数据格式

### 必需字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `type` | String | 通知类型（带 _notification 后缀） | `"activity_cancel_notification"` |
| `title` | String | 通知标题（显示在弹窗顶部） | `"活动取消通知"` |
| `message` | String | 通知主要内容 | `"您报名的活动 \"春游活动\" 已被取消"` |
| `timestamp` | Long | 消息时间戳（毫秒） | `1738234567890` |

### 可选字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `extraInfo` | String | 额外信息（显示在内容下方） | `"如有疑问，请联系社团管理员"` |
| `activityId` | Long | 活动ID（用于事件触发） | `123` |
| `activityTitle` | String | 活动标题（用于事件触发） | `"春游活动"` |
| `applyId` | Long | 报名ID（审核通知用） | `456` |
| `activityTime` | String | 活动时间（提醒通知用） | `"2025-01-20 14:00"` |

### 完整示例

```json
{
  "type": "activity_cancel_notification",
  "title": "活动取消通知",
  "message": "您报名的活动 \"春游活动\" 已被取消",
  "extraInfo": "如有疑问，请联系社团管理员",
  "activityId": 123,
  "activityTitle": "春游活动",
  "timestamp": 1738234567890
}
```

## 前端实现

### 统一处理函数

**位置**：`App.vue:57-96`

```javascript
registerGlobalNotificationHandlers() {
  // 统一的通知处理函数
  const handleNotification = (message) => {
    console.log('【通知】收到通知消息:', message)

    // 验证必需字段
    if (!message.type || !message.title || !message.message) {
      console.error('【通知】消息格式不正确，缺少必需字段:', message)
      return
    }

    // 直接使用后端传来的数据显示通知
    showNotification({
      type: message.type.replace('_notification', ''),
      title: message.title,        // ← 直接使用
      message: message.message,    // ← 直接使用
      extraInfo: message.extraInfo || message.feedback || null // ← 直接使用
    })

    // 触发对应的全局事件
    this.emitNotificationEvent(message)
  }

  // 注册所有通知类型到统一处理函数
  const notificationTypes = [
    'activity_cancel_notification',
    'apply_approved_notification',
    'apply_rejected_notification',
    'activity_reminder_notification'
  ]

  notificationTypes.forEach(type => {
    wsClient.onMessageType(type, handleNotification)
  })
}
```

### 特点

1. **一个处理函数处理所有通知类型**
2. **不做任何内容加工**：直接使用 `message.title`, `message.message`, `message.extraInfo`
3. **易于扩展**：添加新通知类型只需在 `notificationTypes` 数组中加一行
4. **数据验证**：检查必需字段是否存在

## 后端实现

### 通知发送方法

**位置**：`ChatWebSocketHandler.java`

#### 活动取消通知

```java
public void sendActivityCancelNotification(Long userId, Long activityId, String activityTitle) {
    JSONObject notification = new JSONObject();
    notification.put("type", "activity_cancel_notification");
    notification.put("title", "活动取消通知");
    notification.put("message", "您报名的活动 \"" + activityTitle + "\" 已被取消");
    notification.put("extraInfo", "如有疑问，请联系社团管理员");
    notification.put("activityId", activityId);
    notification.put("activityTitle", activityTitle);
    notification.put("timestamp", System.currentTimeMillis());

    sendMessageToUser(userId, notification.toJSONString());
}
```

#### 审核通过通知

```java
public void sendApplyApprovedNotification(Long userId, Long activityId, String activityTitle, Long applyId, String feedback) {
    JSONObject notification = new JSONObject();
    notification.put("type", "apply_approved_notification");
    notification.put("title", "报名审核通过");
    notification.put("message", "您的活动 \"" + activityTitle + "\" 报名申请已通过");
    notification.put("extraInfo", feedback != null && !feedback.isEmpty() ? feedback : "请按时参加活动");
    notification.put("activityId", activityId);
    notification.put("activityTitle", activityTitle);
    notification.put("applyId", applyId);
    notification.put("timestamp", System.currentTimeMillis());

    sendMessageToUser(userId, notification.toJSONString());
}
```

#### 审核拒绝通知

```java
public void sendApplyRejectedNotification(Long userId, Long activityId, String activityTitle, Long applyId, String feedback) {
    JSONObject notification = new JSONObject();
    notification.put("type", "apply_rejected_notification");
    notification.put("title", "报名审核未通过");
    notification.put("message", "您的活动 \"" + activityTitle + "\" 报名申请未通过");
    notification.put("extraInfo", feedback != null && !feedback.isEmpty() ? feedback : "如有疑问，请联系社团管理员");
    notification.put("activityId", activityId);
    notification.put("activityTitle", activityTitle);
    notification.put("applyId", applyId);
    notification.put("timestamp", System.currentTimeMillis());

    sendMessageToUser(userId, notification.toJSONString());
}
```

#### 活动提醒通知

```java
public void sendActivityReminderNotification(Long userId, Long activityId, String activityTitle, String activityTime) {
    JSONObject notification = new JSONObject();
    notification.put("type", "activity_reminder_notification");
    notification.put("title", "活动提醒");
    notification.put("message", "您报名的活动 \"" + activityTitle + "\" 即将在明天开始");
    notification.put("extraInfo", "活动时间：" + activityTime);
    notification.put("activityId", activityId);
    notification.put("activityTitle", activityTitle);
    notification.put("activityTime", activityTime);
    notification.put("timestamp", System.currentTimeMillis());

    sendMessageToUser(userId, notification.toJSONString());
}
```

### 字段说明

所有通知方法都遵循统一格式：

**固定字段顺序**：
1. `type` - 通知类型
2. `title` - 标题
3. `message` - 主要内容
4. `extraInfo` - 额外信息
5. 业务相关字段（activityId, applyId等）
6. `timestamp` - 时间戳

**extraInfo 处理规则**：
- 活动取消：固定提示文案
- 审核通过：优先使用 feedback，否则使用默认文案
- 审核拒绝：优先使用 feedback，否则使用默认文案
- 活动提醒：格式化显示活动时间

## 扩展新通知类型

### 步骤

假设要添加一个"社团解散通知"：

#### 1. 后端添加发送方法

**ChatWebSocketHandler.java**：

```java
/**
 * 发送社团解散通知
 * @param userId 用户ID
 * @param clubId 社团ID
 * @param clubName 社团名称
 */
public void sendClubDisbandNotification(Long userId, Long clubId, String clubName) {
    JSONObject notification = new JSONObject();
    notification.put("type", "club_disband_notification");
    notification.put("title", "社团解散通知");
    notification.put("message", "您加入的社团 \"" + clubName + "\" 已解散");
    notification.put("extraInfo", "感谢您的参与和支持");
    notification.put("clubId", clubId);
    notification.put("clubName", clubName);
    notification.put("timestamp", System.currentTimeMillis());

    sendMessageToUser(userId, notification.toJSONString());
    log.info("发送社团解散通知给用户{}，社团ID: {}", userId, clubId);
}
```

#### 2. 前端注册通知类型

**App.vue:83-88**：

```javascript
const notificationTypes = [
  'activity_cancel_notification',
  'apply_approved_notification',
  'apply_rejected_notification',
  'activity_reminder_notification',
  'club_disband_notification'  // ← 新增一行即可
]
```

#### 3. （可选）添加事件触发

如果需要触发全局事件供其他页面监听，在 `emitNotificationEvent` 中添加：

```javascript
emitNotificationEvent(message) {
  const type = message.type

  if (type === 'club_disband_notification') {
    uni.$emit('clubDisbanded', {
      clubId: message.clubId,
      clubName: message.clubName
    })
  }
  // ... 其他类型
}
```

### 完成

✅ 前端无需修改通知显示逻辑
✅ 通知内容完全由后端控制
✅ 扩展只需 3 步，简单快速

## 测试接口

### 广播通知

```bash
POST /admin/websocket/broadcast-notification
参数：
- type: activity_cancel（不带 _notification 后缀）
- title: 自定义标题
- message: 自定义内容
```

**示例**：
```
type=activity_cancel&title=系统维护通知&message=系统将于今晚22:00进行维护
```

**效果**：
- 标题显示：系统维护通知
- 内容显示：系统将于今晚22:00进行维护
- 无额外信息

### 单用户通知

```bash
POST /admin/websocket/test-notification
参数：
- userId: 3
- type: activity_cancel
- title: 测试通知
- message: 这是测试消息
```

## 通知内容管理

### 建议

为了更好地管理通知内容，建议创建通知模板常量类：

```java
public class NotificationTemplates {
    // 标题
    public static final String TITLE_ACTIVITY_CANCEL = "活动取消通知";
    public static final String TITLE_APPLY_APPROVED = "报名审核通过";
    public static final String TITLE_APPLY_REJECTED = "报名审核未通过";
    public static final String TITLE_ACTIVITY_REMINDER = "活动提醒";

    // 消息模板
    public static String activityCancelMessage(String activityTitle) {
        return "您报名的活动 \"" + activityTitle + "\" 已被取消";
    }

    public static String applyApprovedMessage(String activityTitle) {
        return "您的活动 \"" + activityTitle + "\" 报名申请已通过";
    }

    // 额外信息
    public static final String EXTRA_CONTACT_ADMIN = "如有疑问，请联系社团管理员";
    public static final String EXTRA_ATTEND_ON_TIME = "请按时参加活动";
}
```

**使用**：
```java
notification.put("title", NotificationTemplates.TITLE_ACTIVITY_CANCEL);
notification.put("message", NotificationTemplates.activityCancelMessage(activityTitle));
notification.put("extraInfo", NotificationTemplates.EXTRA_CONTACT_ADMIN);
```

**优点**：
- 所有文案集中管理
- 便于统一修改
- 支持国际化扩展
- 避免硬编码

## 前后端数据流

```
后端业务逻辑
    ↓
ChatWebSocketHandler.sendXxxNotification()
    ↓
构造 JSON 数据（type, title, message, extraInfo...）
    ↓
WebSocket 发送
    ↓
前端 App.vue 接收
    ↓
handleNotification() 统一处理
    ↓
showNotification() 显示弹窗
    ↓
用户看到通知
```

## 总结

### 重构成果

1. **前端代码量大幅减少**
   - 重构前：4个处理函数，每个20+行，共80+行
   - 重构后：1个统一处理函数，15行

2. **消除硬编码**
   - 重构前：标题、消息模板、额外信息全部硬编码
   - 重构后：完全由后端控制

3. **易于维护和扩展**
   - 重构前：新增通知类型需要修改前端代码
   - 重构后：只需在数组中添加一行

4. **符合项目规范**
   - ✅ 前后端分离
   - ✅ 后端控制内容
   - ✅ 前端只负责展示
   - ✅ 统一数据格式
   - ✅ 代码简洁清晰

### 对比

| 维度 | 重构前 | 重构后 |
|------|--------|--------|
| 代码行数 | 80+ 行 | 15 行 |
| 硬编码 | 多处硬编码 | 无硬编码 |
| 扩展性 | 需修改前端 | 只需后端 |
| 维护性 | 困难 | 简单 |
| 规范性 | 不符合 | 符合 |
