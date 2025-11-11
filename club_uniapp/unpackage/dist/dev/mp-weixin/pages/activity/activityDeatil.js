"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
const utils_websocket = require("../../utils/websocket.js");
const api_api = require("../../api/api.js");
const utils_activity = require("../../utils/activity.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const minSwipeDistance = 100;
const edgeWidth = 30;
const _sfc_main = {
  __name: "activityDeatil",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(20);
    const id = common_vendor.ref(null);
    const isAdmin = common_vendor.ref(false);
    const activityDetail = common_vendor.ref({});
    const clubInfo = common_vendor.ref({});
    const formFields = common_vendor.ref([]);
    const applyInfo = common_vendor.ref(null);
    const hasApplied = common_vendor.ref(false);
    const parsedForms = common_vendor.ref({});
    const userInfo = common_vendor.ref({
      name: "",
      studentId: ""
    });
    const applyPopup = common_vendor.ref(null);
    const qrcodePopup = common_vendor.ref(null);
    const actionSheet = common_vendor.ref(null);
    const isPopupOpen = common_vendor.ref(false);
    const touchStartX = common_vendor.ref(0);
    const touchStartY = common_vendor.ref(0);
    const touchEndX = common_vendor.ref(0);
    const showApplyBtn = common_vendor.ref(false);
    const handlePopupChange = (e) => {
      isPopupOpen.value = e.show;
    };
    const handleTouchStart = (e) => {
      touchStartX.value = e.changedTouches[0].clientX;
      touchStartY.value = e.changedTouches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (touchStartX.value > edgeWidth) {
        return;
      }
      touchEndX.value = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistanceX = touchEndX.value - touchStartX.value;
      const swipeDistanceY = Math.abs(touchEndY - touchStartY.value);
      if (swipeDistanceX > minSwipeDistance && swipeDistanceX > swipeDistanceY * 1.5) {
        goBack();
      }
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 20;
      applyInfo.value = {};
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.options) {
        id.value = currentPage.options.id;
        const timestamp = currentPage.options.t;
        const forceRefresh = !!timestamp;
        if (forceRefresh || !currentPage.options.itemData) {
          loadActivityDetail();
        } else {
          try {
            const itemData = JSON.parse(decodeURIComponent(currentPage.options.itemData));
            activityDetail.value = {
              ...itemData,
              startTime: Number(itemData.startTime),
              endTime: Number(itemData.endTime)
            };
            if (activityDetail.value.clubId) {
              loadClubInfo(activityDetail.value.clubId);
            }
            parseFormFieldsFromData();
            checkCanApply();
            refreshActivityData();
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:443", "解析活动数据失败:", e);
            loadActivityDetail();
          }
        }
        getUserInfo();
        checkApplyStatus();
        common_vendor.index.$on("activityCheckInSuccess", handleCheckInSuccess);
        setupWebSocketListener();
      } else {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:461", "获取页面参数失败");
        common_vendor.index.showToast({
          title: "页面参数错误",
          icon: "none"
        });
      }
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.$off("activityCheckInSuccess", handleCheckInSuccess);
      utils_websocket.wsClient.messageHandlers.delete("check_in_notification");
    });
    const handleCheckInSuccess = async (data) => {
      if (data && data.activityId && data.activityId.toString() === id.value.toString()) {
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:482", "收到签到成功事件，开始刷新活动详情");
        await checkApplyStatus(false);
        await refreshActivityData();
        await common_vendor.nextTick$1();
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:493", "活动详情刷新完成，当前签到状态:", applyInfo.value.checkInStatus);
      }
    };
    const setupWebSocketListener = async () => {
      try {
        const serverUrl = api_api.apiModule.baseURL || "localhost:8081";
        if (!utils_websocket.wsClient.isConnected) {
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:505", "WebSocket未连接，正在建立连接...");
          try {
            await utils_websocket.wsClient.connect(serverUrl);
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:508", "WebSocket连接成功");
          } catch (error) {
            common_vendor.index.__f__("warn", "at pages/activity/activityDeatil.vue:510", "WebSocket连接失败，将在重连后自动注册监听器:", error);
          }
        } else {
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:514", "WebSocket已连接，直接注册监听器");
        }
        utils_websocket.wsClient.onMessageType("check_in_notification", (message) => {
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:519", "【WebSocket】收到签到通知:", message);
          if (message.activityId && message.activityId.toString() === id.value.toString()) {
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:523", "【WebSocket】签到通知匹配当前活动，开始刷新");
            handleCheckInSuccess({
              activityId: message.activityId,
              checkInStatus: message.checkInStatus
            });
            common_vendor.index.showToast({
              title: "签到成功",
              icon: "success",
              duration: 2e3
            });
          } else {
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:538", "【WebSocket】签到通知不匹配当前活动", {
              messageActivityId: message.activityId,
              currentActivityId: id.value
            });
          }
        });
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:545", "WebSocket签到通知监听已设置，当前连接状态:", utils_websocket.wsClient.isConnected);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:547", "设置WebSocket监听器失败:", error);
      }
    };
    const refreshActivityData = async () => {
      try {
        if (!id.value)
          return;
        const res = await proxy.$api.activity.getActivityDetail(id.value);
        if (res.code === 200 && res.data) {
          const newData = res.data;
          const oldPoster = activityDetail.value.poster;
          const oldJoinCount = activityDetail.value.joinCount;
          const oldViewCount = activityDetail.value.viewCount;
          Object.keys(newData).forEach((key) => {
            activityDetail.value[key] = newData[key];
          });
          if (oldPoster !== activityDetail.value.poster) {
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:573", "海报已更新:", activityDetail.value.poster);
          }
          if (oldJoinCount !== activityDetail.value.joinCount || oldViewCount !== activityDetail.value.viewCount) {
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:578", "数据已更新:", {
              joinCount: activityDetail.value.joinCount,
              viewCount: activityDetail.value.viewCount
            });
          }
          checkCanApply();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:588", "刷新活动数据失败:", error);
      }
    };
    const getUserInfo = async () => {
      try {
        const res = await proxy.$api.user.getUserInfo();
        if (res.code === 200) {
          userInfo.value = res.data;
          checkAdmin();
        }
      } catch (error) {
      }
    };
    const loadActivityDetail = async () => {
      if (!id.value) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:610", "活动ID不存在");
        common_vendor.index.showToast({
          title: "活动ID不存在",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.activity.getActivityDetail(id.value);
        if (res.code === 200 && res.data) {
          activityDetail.value = res.data;
          if (activityDetail.value.clubId) {
            loadClubInfo(activityDetail.value.clubId);
          }
          parseFormFieldsFromData();
          checkCanApply();
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:645", "加载活动详情失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const parseFormFieldsFromData = () => {
      try {
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:658", "解析表单字段，活动详情:", JSON.stringify(activityDetail.value));
        if (activityDetail.value && activityDetail.value.forms) {
          formFields.value = utils_activity.parseFormFields(activityDetail.value.forms);
        } else {
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:663", "活动没有自定义表单，使用默认表单");
          formFields.value = utils_activity.parseFormFields(null);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:668", "解析表单字段失败:", e);
        formFields.value = utils_activity.parseFormFields(null);
      }
    };
    const loadClubInfo = async (clubId) => {
      try {
        const res = await proxy.$api.club.getClubDetail(clubId);
        if (res.code === 200) {
          clubInfo.value = res.data;
        }
      } catch (error) {
      }
    };
    const checkAdmin = async () => {
      try {
        const clubId = activityDetail.value.clubId || (clubInfo.value ? clubInfo.value.id : null);
        if (!clubId) {
          isAdmin.value = false;
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:693", "没有clubId，设置为非管理员");
          checkCanApply();
          return;
        }
        const res = await proxy.$api.club.getUserRole(clubId);
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:701", "getUserRole 返回结果:", res);
        if (res.code === 200 && res.data && res.data.type > 0 && res.data.status == 1) {
          isAdmin.value = true;
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:706", "确认用户是管理员");
        } else {
          isAdmin.value = false;
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:709", "确认用户不是管理员");
        }
        checkCanApply();
        refreshActivityData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:718", "检查管理员身份失败:", error);
        isAdmin.value = false;
        checkCanApply();
      }
    };
    const checkApplyStatus = async (showLoading = true) => {
      try {
        if (!id.value)
          return;
        if (showLoading) {
          common_vendor.index.showLoading({ title: "加载中..." });
        }
        const res = await proxy.$api.activity.checkApplyStatus(id.value);
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:737", "checkApplyStatus API 返回结果:", res);
        if (res.code === 200) {
          if (res.data) {
            hasApplied.value = true;
            applyInfo.value = { ...res.data };
            common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:746", "applyInfo 已更新:", JSON.stringify(applyInfo.value));
            try {
              if (applyInfo.value.forms) {
                parsedForms.value = utils_activity.parseFormData(applyInfo.value.forms);
                if (Object.keys(parsedForms.value).length === 0) {
                  parsedForms.value = { reason: "用户未填写参加原因" };
                }
              } else {
                parsedForms.value = { reason: "用户未填写参加原因" };
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:762", "解析表单数据失败:", e);
              parsedForms.value = { reason: "表单数据解析失败" };
            }
          } else {
            hasApplied.value = false;
            applyInfo.value = {};
            parsedForms.value = {};
          }
          common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:776", "报名信息已更新:", {
            hasApplied: hasApplied.value,
            checkInStatus: applyInfo.value.checkInStatus,
            applyId: applyInfo.value.id
          });
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取报名状态失败",
            icon: "none"
          });
          applyInfo.value = {};
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:790", "检查报名状态失败:", error);
        hasApplied.value = false;
        applyInfo.value = {};
        parsedForms.value = {};
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        if (showLoading) {
          common_vendor.index.hideLoading();
        }
      }
    };
    const checkCanApply = () => {
      const actualStatus = utils_activity.getActualStatus(activityDetail.value);
      common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:810", "checkCanApply 执行:", {
        isAdmin: isAdmin.value,
        actualStatus,
        hasApplied: hasApplied.value
      });
      if (isAdmin.value) {
        showApplyBtn.value = false;
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:819", "用户是管理员，隐藏报名按钮");
        return;
      }
      showApplyBtn.value = actualStatus === 1 && !hasApplied.value;
      common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:825", "用户不是管理员，showApplyBtn =", showApplyBtn.value);
    };
    const getDisabledReason = () => {
      if (hasApplied.value) {
        return "您已报名此活动";
      }
      const actualStatus = utils_activity.getActualStatus(activityDetail.value);
      if (actualStatus === 0) {
        return "活动已取消";
      }
      if (actualStatus === 3) {
        return "活动已结束";
      }
      if (actualStatus === 2) {
        return "活动进行中";
      }
      return "报名已截止";
    };
    const formatFullDate = (timestamp) => {
      if (!timestamp)
        return "未设置";
      timestamp = Number(timestamp);
      const date = new Date(timestamp);
      return utils_common.formatDate(date);
    };
    const goBack = () => {
      const pages = getCurrentPages();
      utils_activity.notifyActivityDataChanged();
      setTimeout(() => {
        if (pages.length > 1) {
          common_vendor.index.navigateBack();
        } else {
          common_vendor.index.switchTab({
            url: "/pages/activity/activity"
          });
        }
      }, 100);
    };
    const goToClub = () => {
      if (clubInfo.value.id) {
        common_vendor.index.navigateTo({
          url: `/pages/club/detail?id=${clubInfo.value.id}`
        });
      }
    };
    const showApplyForm = () => {
      showApplyBtn.value = false;
      const result = utils_activity.checkUserInfoComplete(userInfo.value);
      if (!result.isComplete) {
        common_vendor.index.showModal({
          title: "信息不完整",
          content: `您的个人信息不完整，缺少: ${result.missingFields.join("、")}，请先完善个人信息后再报名活动`,
          confirmText: "去完善",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.switchTab({
                url: "/pages/user/user"
              });
            } else {
              showApplyBtn.value = true;
            }
          }
        });
        return;
      }
      if (!formFields.value || formFields.value.length === 0) {
        parseFormFieldsFromData();
      }
      if (formFields.value && formFields.value.length > 0) {
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:931", "填充前的表单字段:", JSON.stringify(formFields.value));
        formFields.value = utils_activity.fillUserInfoToForm(formFields.value, userInfo.value);
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:936", "填充后的表单字段:", JSON.stringify(formFields.value));
      } else {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:938", "表单字段为空，无法显示报名表单");
        common_vendor.index.showToast({
          title: "表单加载失败，请重试",
          icon: "none"
        });
        showApplyBtn.value = true;
        return;
      }
      applyPopup.value.open();
    };
    const closeApplyForm = () => {
      applyPopup.value.close();
      if (utils_activity.getActualStatus(activityDetail.value) === 1 && !hasApplied.value) {
        showApplyBtn.value = true;
      }
    };
    const onOptionChange = (index, e) => {
      const selectedIndex = e.detail.value;
      formFields.value[index].value = formFields.value[index].options[selectedIndex];
    };
    const onDateChange = (index, e) => {
      formFields.value[index].value = e.detail.value;
    };
    const submitApply = async () => {
      const validation = utils_activity.validateFormData(formFields.value);
      if (!validation.isValid) {
        common_vendor.index.showToast({
          title: validation.errorMessage,
          icon: "none"
        });
        return;
      }
      const formData = utils_activity.buildFormData(formFields.value);
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        const res = await proxy.$api.activity.applyActivity(id.value, formData);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          closeApplyForm();
          hasApplied.value = true;
          applyInfo.value = {
            id: res.data.applyId,
            activityId: id.value,
            userId: userInfo.value.id,
            status: res.data.status || 0,
            forms: JSON.stringify(formData),
            feedback: "",
            checkInStatus: 0,
            checkInTime: 0,
            createTime: Date.now(),
            qrCodeUrl: "",
            // 确保qrCodeUrl属性存在
            expireTime: 0
            // 确保expireTime属性存在
          };
          parsedForms.value = formData;
          common_vendor.index.showToast({
            title: res.data.needApproval ? "报名成功，等待审核" : "报名成功",
            icon: "success"
          });
          showApplyBtn.value = false;
          checkCanApply();
          refreshActivityData();
        } else {
          common_vendor.index.showToast({
            title: res.message || "报名失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:1042", "提交报名失败:", error);
        common_vendor.index.hideLoading();
        await checkApplyStatus();
        if (hasApplied.value) {
          closeApplyForm();
          showApplyBtn.value = false;
        } else {
          common_vendor.index.showToast({
            title: "提交请求失败，请稍后重试",
            icon: "none"
          });
        }
      }
    };
    const cancelApply = () => {
      if (!applyInfo.value || !applyInfo.value.id) {
        common_vendor.index.showToast({
          title: "报名信息不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "取消报名",
        content: "确定要取消报名吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "取消中..."
              });
              const result = await proxy.$api.activity.cancelApply(applyInfo.value.id);
              if (result.code === 200) {
                hasApplied.value = false;
                applyInfo.value = {};
                parsedForms.value = {};
                formFields.value.forEach((field) => {
                  field.value = "";
                });
                showApplyBtn.value = true;
                checkCanApply();
                refreshActivityData();
                common_vendor.index.showToast({
                  title: "已取消报名",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: result.message || "取消失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "网络异常，请稍后重试",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const showQRCode = async () => {
      try {
        if (!applyInfo.value) {
          common_vendor.index.showToast({
            title: "报名信息不存在",
            icon: "none"
          });
          return;
        }
        if (applyInfo.value.checkInStatus === 1) {
          common_vendor.index.showToast({
            title: "已签到",
            icon: "none"
          });
          return;
        }
        const currentTime = Date.now();
        const startTime = Number(activityDetail.value.startTime);
        if (currentTime < startTime) {
          common_vendor.index.showToast({
            title: "活动未开始，未到签到时间",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        common_vendor.index.showLoading({ title: "生成签到码中..." });
        const res = await proxy.$api.activity.generateCheckInCode({
          activityId: id.value,
          applyId: applyInfo.value.id,
          expireMinutes: 1
          // 1分钟有效期
        });
        if (res.code === 200 && res.data) {
          if (res.data.checkInCode) {
            applyInfo.value.checkInCode = res.data.checkInCode;
          }
          if (res.data.qrCodeUrl) {
            applyInfo.value.qrCodeUrl = res.data.qrCodeUrl;
          } else {
            common_vendor.index.showToast({
              title: "二维码生成失败",
              icon: "none"
            });
            return;
          }
          if (res.data.expireTime) {
            applyInfo.value.expireTime = res.data.expireTime;
          }
          qrcodePopup.value.open();
          const now = Date.now();
          const expireTime = res.data.expireTime;
          const timeToExpire = expireTime - now;
          if (timeToExpire > 1e3) {
            setTimeout(() => {
              if (qrcodePopup.value && qrcodePopup.value.isOpen) {
                common_vendor.index.showToast({
                  title: "签到码即将过期，请点击刷新",
                  icon: "none",
                  duration: 3e3
                });
              }
            }, timeToExpire - 5 * 60 * 1e3);
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "生成签到码失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:1218", "生成签到码错误:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const formatExpireTime = (timestamp) => {
      if (!timestamp)
        return "未设置";
      try {
        const date = new Date(Number(timestamp));
        return utils_common.formatDate(date, "yyyy-MM-dd hh:mm:ss");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:1235", "格式化时间错误:", error);
        return "时间格式错误";
      }
    };
    const closeQRCode = () => {
      qrcodePopup.value.close();
    };
    const refreshCheckInCode = async () => {
      await showQRCode();
    };
    const hideActionSheet = () => {
      actionSheet.value.close();
    };
    const shareActivity = () => {
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
      hideActionSheet();
    };
    const cancelActivity = () => {
      common_vendor.index.showModal({
        title: "取消活动",
        content: "确定要取消该活动吗？取消后无法恢复，已报名的用户将收到通知。",
        success: (res) => {
          if (res.confirm) {
            activityDetail.value.status = 0;
            common_vendor.index.showToast({
              title: "活动已取消",
              icon: "success"
            });
          }
        }
      });
      hideActionSheet();
    };
    const editActivity = () => {
      common_vendor.index.redirectTo({
        url: `/pages/activity/edit?id=${id.value}&clubId=${activityDetail.value.clubId}`
      });
    };
    const manageApplies = () => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/applies?id=${id.value}`
      });
    };
    const onCheckboxChange = (index, e) => {
      const selectedValues = e.detail.value;
      if (Array.isArray(selectedValues) && selectedValues.length > 0) {
        formFields.value[index].value = selectedValues.join(",");
      } else {
        formFields.value[index].value = "";
      }
      common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:1316", `选项变更 - 字段: ${formFields.value[index].label}, 值: ${formFields.value[index].value}`);
    };
    const isOptionChecked = (value, option) => {
      if (!value)
        return false;
      const values = value.split(",");
      return values.includes(option);
    };
    const getPosterUrl = (url) => {
      return utils_common.getImageUrl(url, "/static/images/default-poster.png", false);
    };
    const handleImageError = (e) => {
      common_vendor.index.__f__("error", "at pages/activity/activityDeatil.vue:1333", "二维码图片加载失败:", e);
      showBackupQRCode.value = true;
      if (applyInfo.value && applyInfo.value.qrCodeUrl) {
        common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:1339", "尝试使用备用方式显示二维码:", applyInfo.value.qrCodeUrl.substring(0, 50) + "...");
      }
    };
    const handleImageLoad = () => {
      common_vendor.index.__f__("log", "at pages/activity/activityDeatil.vue:1345", "二维码图片加载成功");
      showBackupQRCode.value = false;
    };
    const showBackupQRCode = common_vendor.ref(false);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTouchStart),
        b: common_vendor.o(handleTouchEnd),
        c: statusBarHeight.value + "px",
        d: common_vendor.o(goBack),
        e: common_vendor.p({
          title: "活动详情",
          showBack: true
        }),
        f: getPosterUrl(activityDetail.value.poster),
        g: common_vendor.t(common_vendor.unref(utils_activity.getStatusText)(activityDetail.value)),
        h: common_vendor.n(common_vendor.unref(utils_activity.getStatusClass)(activityDetail.value)),
        i: common_vendor.t(activityDetail.value.title || "加载中..."),
        j: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#b13b7a"
        }),
        k: common_vendor.t(formatFullDate(activityDetail.value.startTime)),
        l: common_vendor.t(formatFullDate(activityDetail.value.endTime)),
        m: common_vendor.p({
          type: "location",
          size: "18",
          color: "#b13b7a"
        }),
        n: common_vendor.t(activityDetail.value.address || "未设置地点"),
        o: common_vendor.p({
          type: "person",
          size: "18",
          color: "#b13b7a"
        }),
        p: common_vendor.t(activityDetail.value.joinCount || 0),
        q: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#b13b7a"
        }),
        r: common_vendor.t(activityDetail.value.viewCount || 0),
        s: clubInfo.value.id
      }, clubInfo.value.id ? {
        t: clubInfo.value.logo || "/static/images/default-club.png",
        v: common_vendor.t(clubInfo.value.name || "加载中..."),
        w: common_vendor.t(clubInfo.value.description || "暂无简介"),
        x: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        y: common_vendor.o(goToClub)
      } : {}, {
        z: activityDetail.value.description || "暂无详情",
        A: hasApplied.value
      }, hasApplied.value ? common_vendor.e({
        B: common_vendor.t(common_vendor.unref(utils_activity.getApplyStatusText)(applyInfo.value.status)),
        C: common_vendor.n(common_vendor.unref(utils_activity.getApplyStatusClass)(applyInfo.value.status)),
        D: applyInfo.value.status === 1
      }, applyInfo.value.status === 1 ? {
        E: common_vendor.p({
          type: "info",
          size: "16",
          color: "#ff9800"
        })
      } : {}, {
        F: applyInfo.value.feedback
      }, applyInfo.value.feedback ? {
        G: common_vendor.t(applyInfo.value.feedback)
      } : {}, {
        H: common_vendor.t(userInfo.value.username),
        I: common_vendor.t(userInfo.value.studentId),
        J: common_vendor.t(userInfo.value.mobile),
        K: common_vendor.t(userInfo.value.college),
        L: common_vendor.t(userInfo.value.className)
      }) : {}, {
        M: !isPopupOpen.value
      }, !isPopupOpen.value ? common_vendor.e({
        N: isAdmin.value
      }, isAdmin.value ? {
        O: common_vendor.o(editActivity),
        P: common_vendor.o(manageApplies)
      } : common_vendor.e({
        Q: !hasApplied.value && showApplyBtn.value
      }, !hasApplied.value && showApplyBtn.value ? {
        R: common_vendor.o(showApplyForm)
      } : hasApplied.value && applyInfo.value && applyInfo.value.status === 1 ? {
        T: common_vendor.t(applyInfo.value && applyInfo.value.checkInStatus === 1 ? "已签到" : "签到"),
        U: common_vendor.o(showQRCode)
      } : hasApplied.value && applyInfo.value && applyInfo.value.status === 0 ? {
        W: common_vendor.o(cancelApply)
      } : {
        X: common_vendor.t(getDisabledReason())
      }, {
        S: hasApplied.value && applyInfo.value && applyInfo.value.status === 1,
        V: hasApplied.value && applyInfo.value && applyInfo.value.status === 0
      })) : {}, {
        Y: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        Z: common_vendor.o(closeApplyForm),
        aa: formFields.value && formFields.value.length > 0
      }, formFields.value && formFields.value.length > 0 ? {
        ab: common_vendor.f(formFields.value, (field, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(field.label),
            b: common_vendor.t(field.required ? " *" : ""),
            c: field.type === "text"
          }, field.type === "text" ? {
            d: "请输入" + field.label,
            e: field.value,
            f: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            g: field.type === "number"
          }, field.type === "number" ? {
            h: "请输入" + field.label,
            i: field.value,
            j: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            k: field.type === "textarea"
          }, field.type === "textarea" ? {
            l: "请输入" + field.label,
            m: field.value,
            n: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            o: field.type === "select" || field.type === "radio"
          }, field.type === "select" || field.type === "radio" ? {
            p: common_vendor.t(field.value || "请选择" + field.label),
            q: field.options,
            r: common_vendor.o((e) => onOptionChange(idx, e), idx)
          } : {}, {
            s: field.type === "checkbox"
          }, field.type === "checkbox" ? {
            t: common_vendor.f(field.options, (option, optIdx, i1) => {
              return {
                a: option,
                b: isOptionChecked(field.value, option),
                c: common_vendor.t(option),
                d: optIdx
              };
            }),
            v: common_vendor.o((e) => onCheckboxChange(idx, e), idx)
          } : {}, {
            w: field.type === "date"
          }, field.type === "date" ? {
            x: common_vendor.t(field.value || "请选择日期"),
            y: field.value,
            z: common_vendor.o((e) => onDateChange(idx, e), idx)
          } : {}, {
            A: idx
          });
        })
      } : {}, {
        ac: common_vendor.o(closeApplyForm),
        ad: common_vendor.o(submitApply),
        ae: common_vendor.sr(applyPopup, "85b70b9c-7", {
          "k": "applyPopup"
        }),
        af: common_vendor.o(handlePopupChange),
        ag: common_vendor.p({
          type: "bottom"
        }),
        ah: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#333"
        }),
        ai: common_vendor.o(shareActivity),
        aj: isAdmin.value
      }, isAdmin.value ? {
        ak: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#333"
        }),
        al: common_vendor.o(cancelActivity)
      } : {}, {
        am: common_vendor.o(hideActionSheet),
        an: common_vendor.sr(actionSheet, "85b70b9c-9", {
          "k": "actionSheet"
        }),
        ao: common_vendor.p({
          type: "bottom"
        }),
        ap: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        aq: common_vendor.o(closeQRCode),
        ar: applyInfo.value && applyInfo.value.qrCodeUrl
      }, applyInfo.value && applyInfo.value.qrCodeUrl ? {
        as: applyInfo.value.qrCodeUrl,
        at: common_vendor.o(handleImageError),
        av: common_vendor.o(handleImageLoad)
      } : {}, {
        aw: !applyInfo.value || !applyInfo.value.qrCodeUrl
      }, !applyInfo.value || !applyInfo.value.qrCodeUrl ? {} : {}, {
        ax: applyInfo.value && applyInfo.value.qrCodeUrl
      }, applyInfo.value && applyInfo.value.qrCodeUrl ? {} : {}, {
        ay: common_vendor.t(userInfo.value.username || "未知用户"),
        az: common_vendor.t(activityDetail.value.title),
        aA: common_vendor.t(applyInfo.value && applyInfo.value.checkInStatus === 1 ? "已签到" : "未签到"),
        aB: applyInfo.value && applyInfo.value.checkInStatus === 1 ? 1 : "",
        aC: applyInfo.value && applyInfo.value.expireTime
      }, applyInfo.value && applyInfo.value.expireTime ? {
        aD: common_vendor.t(formatExpireTime(applyInfo.value.expireTime))
      } : {}, {
        aE: applyInfo.value && applyInfo.value.qrCodeUrl
      }, applyInfo.value && applyInfo.value.qrCodeUrl ? {
        aF: common_vendor.o(refreshCheckInCode)
      } : {}, {
        aG: common_vendor.sr(qrcodePopup, "85b70b9c-12", {
          "k": "qrcodePopup"
        }),
        aH: common_vendor.p({
          type: "center"
        }),
        aI: common_vendor.o(handleTouchStart),
        aJ: common_vendor.o(handleTouchEnd)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85b70b9c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity/activityDeatil.js.map
