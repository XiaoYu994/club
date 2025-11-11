import { getToken } from './auth.js';

// 单例实例
let instance = null;

/**
 * 增强型WebSocket客户端
 */
class WebSocketClient {
  constructor() {
    if (instance) return instance;
    instance = this;
    
    this.ws = null;
    this.baseURL = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // 增加最大重试次数
    this.reconnectInterval = 3000;
    this.reconnectTimer = null;
    this.messageHandlers = new Map();
    this.messageBuffer = [];
    this.connectionStateListeners = new Set();
    
    // 监听网络变化
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    uni.onNetworkStatusChange((res) => {
      if (res.isConnected && !this.isConnected) {
        console.log('网络恢复，尝试重新连接');
        this.attemptReconnect();
      }
    });
  }

  notifyStateChange() {
    this.connectionStateListeners.forEach(listener => {
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
      // 清除现有连接
      if (this.ws) {
        this.disconnect();
      }
      
      const token = getToken();
      if (!token) {
        reject(new Error('未登录，无法连接WebSocket服务'));
        return;
      }
      
      // 保存基础URL用于重连
      this.baseUrl = serverUrl;
      
      // 构建完整URL
      let fullUrl;
      if (serverUrl.startsWith('ws://') || serverUrl.startsWith('wss://')) {
        fullUrl = `${serverUrl}/ws/chat?token=${encodeURIComponent(token)}`;
      } else if (serverUrl.startsWith('http://')) {
        fullUrl = `ws://${serverUrl.substring(7)}/ws/chat?token=${encodeURIComponent(token)}`;
      } else if (serverUrl.startsWith('https://')) {
        fullUrl = `wss://${serverUrl.substring(8)}/ws/chat?token=${encodeURIComponent(token)}`;
      } else {
        fullUrl = `ws://${serverUrl}/ws/chat?token=${encodeURIComponent(token)}`;
      }
      
      console.log('连接WebSocket:', fullUrl);
      
      try {
        this.ws = uni.connectSocket({
          url: fullUrl,
          complete: () => {}
        });
        
        // 监听WebSocket事件
        this.setupSocketHandlers(resolve, reject);
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  setupSocketHandlers(resolve, reject) {
    this.ws.onOpen(() => {
      console.log('WebSocket连接已建立');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyStateChange();
      
      // 发送缓存的消息
      this.flushMessageBuffer();
      
      resolve();
    });
    
    this.ws.onError((error) => {
      console.error('WebSocket连接错误:', error);
      this.handleConnectionLoss();
      reject(error);
    });
    
    this.ws.onClose((event) => {
      console.log('WebSocket连接已关闭:', event);
      this.handleConnectionLoss();
    });
    
    this.ws.onMessage((res) => {
      try {
        console.log('【WebSocket】收到原始消息:', res.data);
        const message = JSON.parse(res.data);
        console.log('【WebSocket】解析后的消息:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('解析WebSocket消息失败:', error, '原始数据:', res.data);
      }
    });
  }

  handleConnectionLoss() {
    this.isConnected = false;
    this.notifyStateChange();
    
    // 检查token是否仍然有效
    if (getToken()) {
      this.attemptReconnect();
    } else {
      console.log('用户已登出，取消重连');
    }
  }

  flushMessageBuffer() {
    if (this.messageBuffer.length > 0) {
      console.log(`发送${this.messageBuffer.length}条缓冲消息`);
      
      // 使用节流发送缓冲消息
      const sendNext = () => {
        if (this.messageBuffer.length === 0) return;
        
        const msg = this.messageBuffer.shift();
        this.sendMessage(msg);
        
        // 添加延迟避免消息风暴
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
      console.log('已达到最大重连次数，不再尝试重连');
      return;
    }

    this.clearReconnectTimer();
    
    // 指数退避策略
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // 最大延迟30秒
    );
    
    this.reconnectAttempts++;
    
    console.log(`${Math.round(delay/1000)}秒后尝试第${this.reconnectAttempts}次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log('尝试重新连接WebSocket...');
      this.connect(this.baseUrl)
        .catch(error => {
          console.error('重新连接失败:', error);
        });
    }, delay);
  }

  /**
   * 发送消息
   * @param {object} message - 要发送的消息对象
   */
  sendMessage(message) {
    // 限制缓冲区大小
    if (this.messageBuffer.length > 50) {
      console.warn('消息缓冲区已满，丢弃旧消息');
      this.messageBuffer.shift();
    }
    
    if (!this.isConnected) {
      console.log('WebSocket未连接，消息将加入缓冲区');
      this.messageBuffer.push(message);
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send({
        data: messageStr,
        fail: (error) => {
          console.error('发送消息失败:', error);
          // 加入缓冲区等待重连
          this.messageBuffer.push(message);
          
          // 如果连接已断开，尝试重连
          if (!this.isConnected) {
            this.attemptReconnect();
          }
        }
      });
    } catch (error) {
      console.error('序列化消息失败:', error);
    }
  }

  /**
   * 处理接收到的消息
   * @param {object} message - 收到的消息对象
   */
  handleMessage(message) {
    if (!message || !message.type) {
      console.warn('收到无效消息:', message);
      return;
    }

    console.log('【WebSocket】处理消息，类型:', message.type);

    // 根据消息类型调用对应的处理函数
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      console.log('【WebSocket】找到消息处理器，准备执行');
      try {
        handler(message);
      } catch (error) {
        console.error(`处理消息类型 ${message.type} 时出错:`, error);
      }
    } else {
      console.log('【WebSocket】未找到消息处理器，已注册的处理器:', Array.from(this.messageHandlers.keys()));
      console.log('【WebSocket】未处理的消息类型:', message.type, message);
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

// 导出单例
const wsClient = new WebSocketClient();
export default wsClient;