"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("./auth.js");
let instance = null;
class WebSocketClient {
  constructor() {
    if (instance)
      return instance;
    instance = this;
    this.ws = null;
    this.baseURL = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 3e3;
    this.reconnectTimer = null;
    this.messageHandlers = /* @__PURE__ */ new Map();
    this.messageBuffer = [];
    this.connectionStateListeners = /* @__PURE__ */ new Set();
    this.setupNetworkListener();
  }
  setupNetworkListener() {
    common_vendor.index.onNetworkStatusChange((res) => {
      if (res.isConnected && !this.isConnected) {
        common_vendor.index.__f__("log", "at utils/websocket.js:32", "网络恢复，尝试重新连接");
        this.attemptReconnect();
      }
    });
  }
  notifyStateChange() {
    this.connectionStateListeners.forEach((listener) => {
      listener(this.isConnected);
    });
  }
  /**
   * 添加连接状态监听器
   * @param {function} listener - 状态变化回调函数
   */
  addStateListener(listener) {
    this.connectionStateListeners.add(listener);
  }
  /**
   * 移除连接状态监听器
   * @param {function} listener - 要移除的回调函数
   */
  removeStateListener(listener) {
    this.connectionStateListeners.delete(listener);
  }
  /**
   * 连接WebSocket服务器
   * @param {string} serverUrl - 服务器地址
   * @returns {Promise} 连接成功或失败的Promise
   */
  connect(serverUrl) {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.disconnect();
      }
      const token = utils_auth.getToken();
      if (!token) {
        reject(new Error("未登录，无法连接WebSocket服务"));
        return;
      }
      this.baseUrl = serverUrl;
      let fullUrl;
      if (serverUrl.startsWith("ws://") || serverUrl.startsWith("wss://")) {
        fullUrl = `${serverUrl}/ws/chat?token=${encodeURIComponent(token)}`;
      } else if (serverUrl.startsWith("http://")) {
        fullUrl = `ws://${serverUrl.substring(7)}/ws/chat?token=${encodeURIComponent(token)}`;
      } else if (serverUrl.startsWith("https://")) {
        fullUrl = `wss://${serverUrl.substring(8)}/ws/chat?token=${encodeURIComponent(token)}`;
      } else {
        fullUrl = `ws://${serverUrl}/ws/chat?token=${encodeURIComponent(token)}`;
      }
      common_vendor.index.__f__("log", "at utils/websocket.js:93", "连接WebSocket:", fullUrl);
      try {
        this.ws = common_vendor.index.connectSocket({
          url: fullUrl,
          complete: () => {
          }
        });
        this.setupSocketHandlers(resolve, reject);
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/websocket.js:105", "创建WebSocket连接失败:", error);
        reject(error);
      }
    });
  }
  setupSocketHandlers(resolve, reject) {
    this.ws.onOpen(() => {
      common_vendor.index.__f__("log", "at utils/websocket.js:113", "WebSocket连接已建立");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyStateChange();
      this.flushMessageBuffer();
      resolve();
    });
    this.ws.onError((error) => {
      common_vendor.index.__f__("error", "at utils/websocket.js:125", "WebSocket连接错误:", error);
      this.handleConnectionLoss();
      reject(error);
    });
    this.ws.onClose((event) => {
      common_vendor.index.__f__("log", "at utils/websocket.js:131", "WebSocket连接已关闭:", event);
      this.handleConnectionLoss();
    });
    this.ws.onMessage((res) => {
      try {
        common_vendor.index.__f__("log", "at utils/websocket.js:137", "【WebSocket】收到原始消息:", res.data);
        const message = JSON.parse(res.data);
        common_vendor.index.__f__("log", "at utils/websocket.js:139", "【WebSocket】解析后的消息:", message);
        this.handleMessage(message);
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/websocket.js:142", "解析WebSocket消息失败:", error, "原始数据:", res.data);
      }
    });
  }
  handleConnectionLoss() {
    this.isConnected = false;
    this.notifyStateChange();
    if (utils_auth.getToken()) {
      this.attemptReconnect();
    } else {
      common_vendor.index.__f__("log", "at utils/websocket.js:155", "用户已登出，取消重连");
    }
  }
  flushMessageBuffer() {
    if (this.messageBuffer.length > 0) {
      common_vendor.index.__f__("log", "at utils/websocket.js:161", `发送${this.messageBuffer.length}条缓冲消息`);
      const sendNext = () => {
        if (this.messageBuffer.length === 0)
          return;
        const msg = this.messageBuffer.shift();
        this.sendMessage(msg);
        if (this.messageBuffer.length > 0) {
          setTimeout(sendNext, 100);
        }
      };
      sendNext();
    }
  }
  /**
   * 断开WebSocket连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
      this.notifyStateChange();
      this.clearReconnectTimer();
    }
  }
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  /**
   * 尝试重新连接
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      common_vendor.index.__f__("log", "at utils/websocket.js:204", "已达到最大重连次数，不再尝试重连");
      return;
    }
    this.clearReconnectTimer();
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      3e4
      // 最大延迟30秒
    );
    this.reconnectAttempts++;
    common_vendor.index.__f__("log", "at utils/websocket.js:218", `${Math.round(delay / 1e3)}秒后尝试第${this.reconnectAttempts}次重连...`);
    this.reconnectTimer = setTimeout(() => {
      common_vendor.index.__f__("log", "at utils/websocket.js:221", "尝试重新连接WebSocket...");
      this.connect(this.baseUrl).catch((error) => {
        common_vendor.index.__f__("error", "at utils/websocket.js:224", "重新连接失败:", error);
      });
    }, delay);
  }
  /**
   * 发送消息
   * @param {object} message - 要发送的消息对象
   */
  sendMessage(message) {
    if (this.messageBuffer.length > 50) {
      common_vendor.index.__f__("warn", "at utils/websocket.js:236", "消息缓冲区已满，丢弃旧消息");
      this.messageBuffer.shift();
    }
    if (!this.isConnected) {
      common_vendor.index.__f__("log", "at utils/websocket.js:241", "WebSocket未连接，消息将加入缓冲区");
      this.messageBuffer.push(message);
      return;
    }
    try {
      const messageStr = JSON.stringify(message);
      this.ws.send({
        data: messageStr,
        fail: (error) => {
          common_vendor.index.__f__("error", "at utils/websocket.js:251", "发送消息失败:", error);
          this.messageBuffer.push(message);
          if (!this.isConnected) {
            this.attemptReconnect();
          }
        }
      });
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/websocket.js:262", "序列化消息失败:", error);
    }
  }
  /**
   * 处理接收到的消息
   * @param {object} message - 收到的消息对象
   */
  handleMessage(message) {
    if (!message || !message.type) {
      common_vendor.index.__f__("warn", "at utils/websocket.js:272", "收到无效消息:", message);
      return;
    }
    common_vendor.index.__f__("log", "at utils/websocket.js:276", "【WebSocket】处理消息，类型:", message.type);
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      common_vendor.index.__f__("log", "at utils/websocket.js:281", "【WebSocket】找到消息处理器，准备执行");
      try {
        handler(message);
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/websocket.js:285", `处理消息类型 ${message.type} 时出错:`, error);
      }
    } else {
      common_vendor.index.__f__("log", "at utils/websocket.js:288", "【WebSocket】未找到消息处理器，已注册的处理器:", Array.from(this.messageHandlers.keys()));
      common_vendor.index.__f__("log", "at utils/websocket.js:289", "【WebSocket】未处理的消息类型:", message.type, message);
    }
  }
  /**
   * 注册消息处理函数
   * @param {string} messageType - 消息类型
   * @param {function} handler - 处理函数
   */
  onMessageType(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }
  /**
   * 清除所有消息处理函数
   */
  clearHandlers() {
    this.messageHandlers.clear();
  }
}
const wsClient = new WebSocketClient();
exports.wsClient = wsClient;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/websocket.js.map
