"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const utils_websocket = require("../../utils/websocket.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "room",
  setup(__props) {
    const debounce = (fn, delay) => {
      let timer = null;
      return function(...args) {
        if (timer)
          clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    };
    let chatPageCount = 0;
    const groupId = common_vendor.ref(null);
    const roomInfo = common_vendor.reactive({
      name: "",
      avatar: "",
      memberCount: 0
    });
    const userInfo = utils_auth.getUser();
    common_vendor.index.__f__("log", "at pages/chat/room.vue:201", "当前用户信息:", userInfo);
    const userIdValue = common_vendor.ref(null);
    if (userInfo && userInfo.id) {
      userIdValue.value = Number(userInfo.id);
      common_vendor.index.__f__("log", "at pages/chat/room.vue:207", "转换后的用户ID:", userIdValue.value);
    }
    const userId = common_vendor.computed(() => {
      if (userIdValue.value !== null) {
        return userIdValue.value;
      }
      const currentUser = utils_auth.getUser();
      if (currentUser && currentUser.id) {
        userIdValue.value = Number(currentUser.id);
        common_vendor.index.__f__("log", "at pages/chat/room.vue:217", "重新获取用户ID:", userIdValue.value);
        return userIdValue.value;
      }
      return null;
    });
    const userAvatar = common_vendor.ref(userInfo && userInfo.avatar ? userInfo.avatar : "/static/images/avatar-default.png");
    const userName = common_vendor.ref(userInfo && userInfo.name ? userInfo.name : "我");
    const messages = common_vendor.ref([]);
    const messageText = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const showMorePanel = common_vendor.ref(false);
    const scrollIntoViewId = common_vendor.ref("");
    async function initUserInfo() {
      if (!utils_auth.getUser()) {
        try {
          const res = await api_api.apiModule.user.getUserInfo();
          if (res.code === 200 && res.data) {
            utils_auth.setUser(res.data);
            userAvatar.value = res.data.avatar || userAvatar.value;
            userName.value = res.data.name || userName.value;
            userIdValue.value = Number(res.data.id);
            common_vendor.index.__f__("log", "at pages/chat/room.vue:245", "从后端拉取并更新用户信息:", res.data);
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/chat/room.vue:248", "获取用户信息失败:", e);
        }
      }
    }
    function updateMessageHandler() {
      utils_websocket.wsClient.onMessageType("group_message", handleReceivedMessage);
      utils_websocket.wsClient.onMessageType("error", handleError);
      common_vendor.index.__f__("log", "at pages/chat/room.vue:260", "【聊天室】消息处理器已注册");
    }
    const connectWebSocket = async () => {
      const serverUrl = api_api.apiModule.baseURL || "localhost:8081";
      if (utils_websocket.wsClient.isConnected) {
        common_vendor.index.__f__("log", "at pages/chat/room.vue:271", "【聊天室】WebSocket已连接，直接使用现有连接");
        updateMessageHandler();
        return;
      }
      common_vendor.index.__f__("log", "at pages/chat/room.vue:276", "【聊天室】WebSocket未连接，尝试连接...");
      try {
        await utils_websocket.wsClient.connect(serverUrl, false);
        common_vendor.index.__f__("log", "at pages/chat/room.vue:280", "【聊天室】WebSocket连接成功");
        updateMessageHandler();
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/chat/room.vue:283", "【聊天室】WebSocket初次连接失败，正在重试...", error);
      }
    };
    const loadGroupDetail = async () => {
      try {
        const response = await api_api.chatAPI.getGroupDetail(groupId.value);
        if (response.code === 200) {
          Object.assign(roomInfo, response.data);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "获取群组信息失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:303", "获取群组详情失败:", error);
      }
    };
    function formatDividerTime(timestamp) {
      if (!timestamp)
        return "";
      let dateObj;
      if (typeof timestamp === "number") {
        dateObj = new Date(timestamp);
      } else if (typeof timestamp === "string") {
        if (timestamp.includes("T") || timestamp.includes("-")) {
          dateObj = new Date(timestamp);
        } else {
          dateObj = new Date(parseInt(timestamp));
        }
      } else if (timestamp instanceof Date) {
        dateObj = timestamp;
      }
      if (isNaN(dateObj.getTime())) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:334", "无效的时间格式:", timestamp);
        return "未知时间";
      }
      const now = /* @__PURE__ */ new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const msgDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      if (msgDate.getTime() === today.getTime()) {
        return `今天 ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      } else if (msgDate.getTime() === yesterday.getTime()) {
        return `昨天 ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      } else if (msgDate.getFullYear() === now.getFullYear()) {
        return `${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      } else {
        return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
      }
    }
    function formatMessageTime(timestamp) {
      if (!timestamp)
        return "";
      let dateObj;
      if (typeof timestamp === "number") {
        dateObj = new Date(timestamp);
      } else if (typeof timestamp === "string") {
        if (timestamp.includes("T") || timestamp.includes("-")) {
          dateObj = new Date(timestamp);
        } else {
          dateObj = new Date(parseInt(timestamp));
        }
      } else if (timestamp instanceof Date) {
        dateObj = timestamp;
      }
      if (isNaN(dateObj.getTime())) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:390", "无效的时间格式:", timestamp);
        return "未知时间";
      }
      return `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;
    }
    const shouldShowDivider = (index) => {
      if (index <= 0)
        return false;
      const dividerTime = formatDividerTime(messages.value[index].createTime);
      if (!dividerTime)
        return false;
      const currentMsg = messages.value[index];
      const prevMsg = messages.value[index - 1];
      if (!currentMsg || !prevMsg || !currentMsg.createTime || !prevMsg.createTime)
        return false;
      let currentTime, prevTime;
      try {
        currentTime = typeof currentMsg.createTime === "number" ? currentMsg.createTime : new Date(currentMsg.createTime).getTime();
        prevTime = typeof prevMsg.createTime === "number" ? prevMsg.createTime : new Date(prevMsg.createTime).getTime();
        return Math.abs(prevTime - currentTime) > 5 * 60 * 1e3;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:419", "比较消息时间出错:", e);
        return false;
      }
    };
    async function loadInitialMessages() {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const response = await api_api.chatAPI.getGroupMessages(groupId.value, 1, pageSize.value);
        if (response.code === 200) {
          const pageMsgs = response.data.list || [];
          const processedMsgs = pageMsgs.map((msg) => {
            if (msg.createTime === void 0 && msg.create_time) {
              msg.createTime = msg.create_time;
            }
            msg.senderId = Number(msg.senderId);
            if (userId.value) {
              msg.isSelf = msg.senderId === userId.value;
            } else {
              msg.isSelf = false;
            }
            return msg;
          });
          messages.value = processedMsgs.reverse();
          common_vendor.nextTick$1(() => {
            const lastMsg = messages.value[messages.value.length - 1];
            if (lastMsg) {
              scrollIntoViewId.value = "msg-" + lastMsg.id;
            }
          });
          page.value = 2;
          hasMore.value = processedMsgs.length >= pageSize.value;
        } else {
          common_vendor.index.showToast({ title: response.msg || "获取消息失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:466", "获取消息历史失败:", error);
      } finally {
        loading.value = false;
      }
    }
    const loadMoreMessages = debounce(async () => {
      if (loading.value || !hasMore.value)
        return;
      loading.value = true;
      try {
        const response = await api_api.chatAPI.getGroupMessages(groupId.value, page.value, pageSize.value);
        if (response.code === 200) {
          const pageMsgs = response.data.list || [];
          const processedMsgs = pageMsgs.map((msg) => {
            if (msg.createTime === void 0 && msg.create_time) {
              msg.createTime = msg.create_time;
            }
            msg.senderId = Number(msg.senderId);
            if (userId.value) {
              msg.isSelf = msg.senderId === userId.value;
            } else {
              msg.isSelf = false;
            }
            return msg;
          });
          if (processedMsgs.length > 0) {
            const reversedMsgs = processedMsgs.reverse();
            messages.value = [...reversedMsgs, ...messages.value];
          }
          page.value++;
          hasMore.value = processedMsgs.length >= pageSize.value;
        } else {
          common_vendor.index.showToast({ title: response.msg || "获取消息失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:508", "获取消息历史失败:", error);
      } finally {
        loading.value = false;
      }
    }, 300);
    const handleReceivedMessage = (message) => {
      if (message.groupId === groupId.value) {
        message.senderId = Number(message.senderId);
        common_vendor.index.__f__("log", "at pages/chat/room.vue:521", "收到WebSocket消息:", message);
        if (message.contentType === 3) {
          try {
            if (typeof message.content === "string") {
              const locationData = JSON.parse(message.content);
              if (!locationData.name) {
                locationData.name = locationData.address || "位置信息";
              }
              message.content = JSON.stringify(locationData);
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/chat/room.vue:533", "解析位置消息失败:", e);
          }
        }
        if (userId.value && message.senderId === userId.value) {
          if (message.localMsgId) {
            const localMsgIndex = messages.value.findIndex((msg) => msg.isLocalMessage && msg.id === message.localMsgId);
            if (localMsgIndex !== -1) {
              messages.value.splice(localMsgIndex, 1, message);
              return;
            }
          }
        }
        messages.value.push(message);
        common_vendor.nextTick$1(() => {
          scrollIntoViewId.value = "msg-" + message.id;
        });
      }
    };
    const handleError = (message) => {
      common_vendor.index.showToast({
        title: message.content || "发生错误",
        icon: "none"
      });
    };
    const sendMessage = () => {
      const content = messageText.value.trim();
      if (!content)
        return;
      if (!userId.value) {
        const currentUser = utils_auth.getUser();
        if (currentUser && currentUser.id) {
          userIdValue.value = Number(currentUser.id);
        } else {
          common_vendor.index.showToast({ title: "用户信息获取失败", icon: "none" });
          return;
        }
      }
      const timestamp = Date.now();
      const avatar = userAvatar.value || "/static/images/avatar-default.png";
      const localMsg = {
        id: `local-${timestamp}`,
        groupId: groupId.value,
        senderId: userId.value,
        senderName: userName.value,
        senderAvatar: avatar,
        createTime: timestamp,
        content,
        contentType: 0,
        isLocalMessage: true
      };
      messages.value.push(localMsg);
      common_vendor.nextTick$1(() => {
        scrollIntoViewId.value = "msg-" + localMsg.id;
      });
      if (!utils_websocket.wsClient.isConnected) {
        common_vendor.index.showToast({ title: "聊天服务未连接", icon: "none" });
        return;
      }
      const message = {
        type: "group_message",
        groupId: groupId.value,
        content,
        contentType: 0,
        localMsgId: localMsg.id
      };
      utils_websocket.wsClient.sendMessage(message);
      messageText.value = "";
      showMorePanel.value = false;
    };
    const handleInput = (e) => {
      messageText.value = e.detail.value;
    };
    const inputFocus = () => {
      showMorePanel.value = false;
    };
    const inputBlur = () => {
    };
    const toggleMorePanel = () => {
      showMorePanel.value = !showMorePanel.value;
    };
    const extractFileName = (url) => {
      if (!url)
        return "未知文件";
      const parts = url.split("/");
      return parts[parts.length - 1];
    };
    const parseLocation = (content) => {
      try {
        if (typeof content === "string") {
          return JSON.parse(content);
        }
        return content;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:661", "解析位置信息失败:", e);
        return { name: "位置信息", address: "" };
      }
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const openFile = (url) => {
      if (!url) {
        common_vendor.index.showToast({ title: "文件链接无效", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在加载文件...",
        mask: true
      });
      common_vendor.index.downloadFile({
        url,
        success: (res) => {
          common_vendor.index.hideLoading();
          if (res.statusCode === 200) {
            common_vendor.wx$1.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              // 显示右上角菜单，可以转发、收藏等操作
              fileType: getFileType(url),
              // 尝试获取文件类型
              success: function() {
                common_vendor.index.__f__("log", "at pages/chat/room.vue:723", "打开文件成功");
              },
              fail: function(err) {
                common_vendor.index.__f__("error", "at pages/chat/room.vue:726", "微信小程序打开文件失败:", err);
                common_vendor.index.showModal({
                  title: "打开失败",
                  content: "无法打开此类型文件，是否复制链接后手动打开？",
                  confirmText: "复制链接",
                  success: (res2) => {
                    if (res2.confirm) {
                      common_vendor.index.setClipboardData({
                        data: url,
                        success: () => {
                          common_vendor.index.showToast({ title: "链接已复制", icon: "success" });
                        }
                      });
                    }
                  }
                });
              }
            });
          } else {
            common_vendor.index.showToast({ title: "下载文件失败", icon: "none" });
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/chat/room.vue:752", "下载文件失败:", err);
          common_vendor.index.showToast({ title: "下载文件失败", icon: "none" });
        }
      });
    };
    const getFileType = (url) => {
      if (!url)
        return "";
      const extension = url.split(".").pop().toLowerCase();
      const typeMap = {
        "doc": "doc",
        "docx": "doc",
        "xls": "xls",
        "xlsx": "xls",
        "ppt": "ppt",
        "pptx": "ppt",
        "pdf": "pdf",
        "txt": "txt"
      };
      return typeMap[extension] || "";
    };
    const openLocation = (content) => {
      try {
        const locationData = typeof content === "string" ? JSON.parse(content) : content;
        common_vendor.index.openLocation({
          latitude: Number(locationData.latitude),
          longitude: Number(locationData.longitude),
          name: locationData.name || "位置信息",
          address: locationData.address || "",
          success: () => {
            common_vendor.index.__f__("log", "at pages/chat/room.vue:814", "打开位置成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/chat/room.vue:817", "打开位置失败:", err);
            common_vendor.index.showToast({ title: "打开位置失败", icon: "none" });
          }
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/room.vue:822", "解析位置信息失败:", e);
        common_vendor.index.showToast({ title: "位置信息无效", icon: "none" });
      }
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          if (!utils_websocket.wsClient.isConnected) {
            try {
              common_vendor.index.showLoading({ title: "正在连接聊天服务..." });
              await utils_websocket.wsClient.connect(api_api.apiModule.baseURL || "localhost:8081", false);
              common_vendor.index.hideLoading();
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "聊天服务连接失败，请稍后重试",
                icon: "none"
              });
              common_vendor.index.__f__("error", "at pages/chat/room.vue:852", "聊天服务连接失败:", error);
              return;
            }
          }
          try {
            common_vendor.index.showLoading({
              title: "正在上传图片...",
              mask: true
            });
            const uploadRes = await api_api.apiModule.common.upload(tempFilePath);
            common_vendor.index.hideLoading();
            if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
              const mediaUrl = uploadRes.data.url;
              const timestamp = Date.now();
              const localMsg = {
                id: `local-${timestamp}`,
                groupId: groupId.value,
                senderId: userId.value,
                senderName: userName.value,
                senderAvatar: userAvatar.value || "/static/images/avatar-default.png",
                createTime: timestamp,
                content: "[图片]",
                contentType: 1,
                // 图片类型
                mediaUrl,
                isLocalMessage: true
              };
              messages.value.push(localMsg);
              common_vendor.nextTick$1(() => {
                scrollIntoViewId.value = "msg-" + localMsg.id;
              });
              if (utils_websocket.wsClient.isConnected) {
                const message = {
                  type: "group_message",
                  groupId: groupId.value,
                  content: "[图片]",
                  contentType: 1,
                  // 图片类型
                  mediaUrl,
                  localMsgId: localMsg.id
                };
                utils_websocket.wsClient.sendMessage(message);
              } else {
                common_vendor.index.showToast({ title: "聊天服务未连接，消息将在重连后发送", icon: "none" });
              }
            } else {
              common_vendor.index.showToast({
                title: uploadRes.message || "上传失败",
                icon: "none"
              });
              common_vendor.index.__f__("error", "at pages/chat/room.vue:911", "图片上传响应异常:", uploadRes);
            }
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at pages/chat/room.vue:915", "上传图片失败", error);
            common_vendor.index.showToast({
              title: "图片上传失败，请重试",
              icon: "none"
            });
          }
        }
      });
      showMorePanel.value = false;
    };
    const chooseLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          if (!res.name || !res.address || !res.latitude || !res.longitude) {
            common_vendor.index.showToast({ title: "未选择有效位置", icon: "none" });
            return;
          }
          const locationData = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          };
          const timestamp = Date.now();
          const localMsg = {
            id: `local-${timestamp}`,
            groupId: groupId.value,
            senderId: userId.value,
            senderName: userName.value,
            senderAvatar: userAvatar.value || "/static/images/avatar-default.png",
            createTime: timestamp,
            content: JSON.stringify(locationData),
            contentType: 3,
            // 位置类型
            isLocalMessage: true
          };
          messages.value.push(localMsg);
          common_vendor.nextTick$1(() => {
            scrollIntoViewId.value = "msg-" + localMsg.id;
          });
          if (utils_websocket.wsClient.isConnected) {
            const message = {
              type: "group_message",
              groupId: groupId.value,
              content: JSON.stringify(locationData),
              contentType: 3,
              // 位置类型
              localMsgId: localMsg.id
            };
            utils_websocket.wsClient.sendMessage(message);
          } else {
            common_vendor.index.showToast({ title: "聊天服务未连接", icon: "none" });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/chat/room.vue:981", "选择位置失败:", err);
        }
      });
      showMorePanel.value = false;
    };
    const chooseFile = () => {
      common_vendor.wx$1.chooseMessageFile({
        count: 1,
        type: "file",
        extension: ["doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "txt"],
        success: async (res) => {
          if (res.tempFiles && res.tempFiles.length > 0) {
            const file = res.tempFiles[0];
            common_vendor.index.__f__("log", "at pages/chat/room.vue:1011", "选择的文件:", file);
            handleFileUpload(file.path, file.name);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/chat/room.vue:1016", "选择文件失败:", err);
          common_vendor.index.showToast({
            title: "选择文件失败",
            icon: "none"
          });
        }
      });
      showMorePanel.value = false;
    };
    const handleFileUpload = async (filePath, fileName = "") => {
      try {
        if (!utils_websocket.wsClient.isConnected) {
          try {
            common_vendor.index.showLoading({ title: "正在连接聊天服务..." });
            await utils_websocket.wsClient.connect(api_api.apiModule.baseURL || "localhost:8081", false);
            common_vendor.index.hideLoading();
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "聊天服务连接失败，请稍后重试",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/chat/room.vue:1054", "聊天服务连接失败:", error);
            return;
          }
        }
        common_vendor.index.showLoading({
          title: "正在上传文件...",
          mask: true
        });
        const uploadRes = await api_api.apiModule.common.upload(filePath);
        common_vendor.index.hideLoading();
        if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
          const mediaUrl = uploadRes.data.url;
          const displayFileName = fileName || uploadRes.data.newFileName || extractFileName(filePath);
          const timestamp = Date.now();
          const localMsg = {
            id: `local-${timestamp}`,
            groupId: groupId.value,
            senderId: userId.value,
            senderName: userName.value,
            senderAvatar: userAvatar.value || "/static/images/avatar-default.png",
            createTime: timestamp,
            content: displayFileName,
            // 将文件名作为消息内容，方便显示
            contentType: 2,
            // 文件类型
            mediaUrl,
            isLocalMessage: true
          };
          messages.value.push(localMsg);
          common_vendor.nextTick$1(() => {
            scrollIntoViewId.value = "msg-" + localMsg.id;
          });
          if (utils_websocket.wsClient.isConnected) {
            const message = {
              type: "group_message",
              groupId: groupId.value,
              content: displayFileName,
              // 将文件名作为消息内容
              contentType: 2,
              // 文件类型
              mediaUrl,
              localMsgId: localMsg.id
            };
            utils_websocket.wsClient.sendMessage(message);
          } else {
            common_vendor.index.showToast({ title: "聊天服务未连接，消息将在重连后发送", icon: "none" });
          }
        } else {
          common_vendor.index.showToast({
            title: uploadRes.message || "上传失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/chat/room.vue:1113", "文件上传响应异常:", uploadRes);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/chat/room.vue:1117", "上传文件失败", error);
        common_vendor.index.showToast({
          title: "文件上传失败，请重试",
          icon: "none"
        });
      }
    };
    common_vendor.onLoad(async (option) => {
      chatPageCount++;
      await initUserInfo();
      if (option.id) {
        groupId.value = parseInt(option.id);
        if (option.name) {
          roomInfo.name = decodeURIComponent(option.name);
        }
        common_vendor.index.__f__("log", "at pages/chat/room.vue:1136", `进入聊天室，群组ID: ${groupId.value}, 名称: ${roomInfo.name}`);
        connectWebSocket();
        await loadGroupDetail();
        await loadInitialMessages();
      }
    });
    common_vendor.onUnload(() => {
      chatPageCount--;
      if (chatPageCount === 0) {
        if (utils_websocket.wsClient.isConnected) {
          utils_websocket.wsClient.disconnect();
          common_vendor.index.__f__("log", "at pages/chat/room.vue:1153", "所有聊天页面已关闭，断开WebSocket连接");
        }
      }
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/chat/room.vue:1160", "页面隐藏，保持WebSocket连接");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: roomInfo.name || "聊天室",
          showBack: true
        }),
        b: loading.value
      }, loading.value ? {} : !hasMore.value ? {} : {}, {
        c: !hasMore.value,
        d: common_vendor.f(messages.value, (msg, idx, i0) => {
          return common_vendor.e({
            a: shouldShowDivider(idx)
          }, shouldShowDivider(idx) ? {
            b: common_vendor.t(formatDividerTime(msg.createTime))
          } : {}, {
            c: msg.senderId !== userId.value
          }, msg.senderId !== userId.value ? common_vendor.e({
            d: msg.senderAvatar || "/static/images/avatar-default.png",
            e: common_vendor.t(msg.senderName || "未知用户"),
            f: msg.contentType === 0
          }, msg.contentType === 0 ? {
            g: common_vendor.t(msg.content)
          } : msg.contentType === 1 ? {
            i: msg.mediaUrl,
            j: common_vendor.o(($event) => previewImage(msg.mediaUrl), msg.id)
          } : msg.contentType === 2 ? {
            l: "bc4afd2d-1-" + i0,
            m: common_vendor.p({
              type: "download",
              size: "30",
              color: "#2979ff"
            }),
            n: common_vendor.t(extractFileName(msg.mediaUrl)),
            o: common_vendor.o(($event) => openFile(msg.mediaUrl), msg.id)
          } : msg.contentType === 3 ? {
            q: "bc4afd2d-2-" + i0,
            r: common_vendor.p({
              type: "location",
              size: "24",
              color: "#ff9800"
            }),
            s: common_vendor.t(msg.content ? parseLocation(msg.content).name : "位置信息"),
            t: common_vendor.o(($event) => openLocation(msg.content), msg.id)
          } : msg.contentType === 4 ? {
            w: "bc4afd2d-3-" + i0,
            x: common_vendor.p({
              type: "info",
              size: "24",
              color: "#2979ff"
            })
          } : {}, {
            h: msg.contentType === 1,
            k: msg.contentType === 2,
            p: msg.contentType === 3,
            v: msg.contentType === 4,
            y: common_vendor.t(formatMessageTime(msg.createTime))
          }) : common_vendor.e({
            z: msg.contentType === 0
          }, msg.contentType === 0 ? {
            A: common_vendor.t(msg.content)
          } : msg.contentType === 1 ? {
            C: msg.mediaUrl,
            D: common_vendor.o(($event) => previewImage(msg.mediaUrl), msg.id)
          } : msg.contentType === 2 ? {
            F: "bc4afd2d-4-" + i0,
            G: common_vendor.p({
              type: "download",
              size: "30",
              color: "#2979ff"
            }),
            H: common_vendor.t(extractFileName(msg.mediaUrl)),
            I: common_vendor.o(($event) => openFile(msg.mediaUrl), msg.id)
          } : msg.contentType === 3 ? {
            K: "bc4afd2d-5-" + i0,
            L: common_vendor.p({
              type: "location",
              size: "24",
              color: "#ff9800"
            }),
            M: common_vendor.t(msg.content ? parseLocation(msg.content).name : "位置信息"),
            N: common_vendor.o(($event) => openLocation(msg.content), msg.id)
          } : msg.contentType === 4 ? {
            P: "bc4afd2d-6-" + i0,
            Q: common_vendor.p({
              type: "info",
              size: "24",
              color: "#2979ff"
            })
          } : {}, {
            B: msg.contentType === 1,
            E: msg.contentType === 2,
            J: msg.contentType === 3,
            O: msg.contentType === 4,
            R: common_vendor.t(formatMessageTime(msg.createTime)),
            S: userAvatar.value || "/static/images/avatar-default.png"
          }), {
            T: common_vendor.n(msg.senderId === userId.value ? "self" : "other"),
            U: msg.id,
            V: "msg-" + msg.id
          });
        }),
        e: common_vendor.o((...args) => common_vendor.unref(loadMoreMessages) && common_vendor.unref(loadMoreMessages)(...args)),
        f: scrollIntoViewId.value,
        g: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#666"
        }),
        h: common_vendor.o(toggleMorePanel),
        i: common_vendor.o([($event) => messageText.value = $event.detail.value, handleInput]),
        j: common_vendor.o(inputFocus),
        k: common_vendor.o(inputBlur),
        l: messageText.value,
        m: common_vendor.p({
          type: "paperplane-filled",
          size: "24",
          color: "#fff"
        }),
        n: common_vendor.o(sendMessage),
        o: messageText.value.trim() ? 1 : "",
        p: showMorePanel.value ? 1 : "",
        q: showMorePanel.value
      }, showMorePanel.value ? {
        r: common_vendor.p({
          type: "image",
          size: "28",
          color: "#07c160"
        }),
        s: common_vendor.o(chooseImage),
        t: common_vendor.p({
          type: "location",
          size: "28",
          color: "#ff9800"
        }),
        v: common_vendor.o(chooseLocation),
        w: common_vendor.p({
          type: "folder-add",
          size: "28",
          color: "#2979ff"
        }),
        x: common_vendor.o(chooseFile)
      } : {}, {
        y: showMorePanel.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bc4afd2d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/room.js.map
