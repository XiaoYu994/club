"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_activity = require("../../utils/activity.js");
const utils_common = require("../../utils/common.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_load_more2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_load_more + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "applies",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "5bf92545": statusBarHeight.value + 90 + "px",
      "3050c089": statusBarHeight.value + "px"
    }));
    const { proxy } = common_vendor.getCurrentInstance();
    const isAdmin = common_vendor.ref(false);
    const statusBarHeight = common_vendor.ref(20);
    const id = common_vendor.ref("");
    const activityInfo = common_vendor.ref({});
    const applyList = common_vendor.ref([]);
    const totalApply = common_vendor.ref(0);
    const loading = common_vendor.ref(true);
    const refreshing = common_vendor.ref(false);
    const loadMoreStatus = common_vendor.ref("more");
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const filterTabs = [
      { name: "全部", status: null },
      { name: "待审核", status: 0 },
      { name: "已通过", status: 1 },
      { name: "已拒绝", status: 2 }
    ];
    const currentTab = common_vendor.ref(0);
    const rejectPopup = common_vendor.ref(null);
    const rejectReason = common_vendor.ref("");
    const currentRejectId = common_vendor.ref(null);
    const filteredApplyList = common_vendor.computed(() => {
      const status = filterTabs[currentTab.value].status;
      if (status === null) {
        return applyList.value;
      }
      return applyList.value.filter((item) => item.status === status);
    });
    common_vendor.onMounted(() => {
      statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight || 20;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      id.value = currentPage.options.id;
      loadActivityInfo();
      loadApplyList();
    });
    const checkUserRole = async (clubId) => {
      try {
        const res = await proxy.$api.club.getUserRole(clubId);
        if (res.code === 200 && res.data) {
          isAdmin.value = res.data.type > 0 && res.data.status === 1;
        }
      } catch (e) {
        isAdmin.value = false;
      }
    };
    const loadActivityInfo = () => {
      common_vendor.index.showLoading({ title: "加载中..." });
      proxy.$api.activity.getActivityDetail(id.value).then((res) => {
        if (res.code === 200) {
          activityInfo.value = res.data;
          if (activityInfo.value.clubId) {
            checkUserRole(activityInfo.value.clubId);
          }
          if (res.data.applyCount !== void 0) {
            totalApply.value = res.data.applyCount;
          } else {
            proxy.$api.activity.getApplyList(id.value, { page: 1, pageSize: 1 }).then((applyRes) => {
              if (applyRes.code === 200 && applyRes.data.total !== void 0) {
                totalApply.value = applyRes.data.total;
              }
            });
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载活动信息失败",
            icon: "none"
          });
        }
      }).catch((error) => {
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    };
    const loadApplyList = (reset = true) => {
      if (reset) {
        page.value = 1;
        hasMore.value = true;
      }
      if (!hasMore.value && !reset)
        return;
      loading.value = true;
      const params = {
        page: page.value,
        pageSize: pageSize.value
      };
      const status = filterTabs[currentTab.value].status;
      if (status !== null) {
        params.status = status;
      }
      proxy.$api.activity.getApplyList(id.value, params).then((res) => {
        if (res.code === 200) {
          if (reset) {
            applyList.value = res.data.list || [];
          } else {
            applyList.value = [...applyList.value, ...res.data.list || []];
          }
          hasMore.value = res.data.hasMore || false;
          loadMoreStatus.value = hasMore.value ? "more" : "noMore";
          if (hasMore.value) {
            page.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载报名列表失败",
            icon: "none"
          });
        }
      }).catch((error) => {
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      }).finally(() => {
        loading.value = false;
        refreshing.value = false;
      });
    };
    const switchTab = (index) => {
      if (currentTab.value === index)
        return;
      currentTab.value = index;
      loadApplyList(true);
    };
    const onRefresh = () => {
      refreshing.value = true;
      loadApplyList(true);
    };
    const loadMore = () => {
      if (!hasMore.value)
        return;
      loadApplyList(false);
    };
    const approveApply = (applyId) => {
      common_vendor.index.showModal({
        title: "审核确认",
        content: "确定通过此报名申请吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "处理中..." });
            proxy.$api.activity.reviewApply(applyId, {
              status: 1,
              // 1表示通过
              feedback: "管理员已通过申请"
            }).then((res2) => {
              if (res2.code === 200) {
                common_vendor.index.showToast({
                  title: "已通过",
                  icon: "success"
                });
                const index = applyList.value.findIndex((item) => item.id === applyId);
                if (index !== -1) {
                  applyList.value[index].status = 1;
                }
                loadApplyList(true);
              } else {
                common_vendor.index.showToast({
                  title: res2.message || "操作失败",
                  icon: "none"
                });
              }
            }).catch((error) => {
              common_vendor.index.__f__("error", "at pages/activity/applies.vue:391", "审核报名失败:", error);
              common_vendor.index.showToast({
                title: "网络异常，请稍后重试",
                icon: "none"
              });
            }).finally(() => {
              common_vendor.index.hideLoading();
            });
          }
        }
      });
    };
    const rejectApply = (applyId) => {
      currentRejectId.value = applyId;
      proxy.$refs.rejectPopup.open("center");
    };
    const confirmReject = () => {
      common_vendor.index.showLoading({ title: "处理中..." });
      proxy.$api.activity.reviewApply(currentRejectId.value, {
        status: 2,
        // 2表示拒绝
        feedback: rejectReason.value.trim() || "管理员已拒绝申请"
      }).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "已拒绝",
            icon: "success"
          });
          const index = applyList.value.findIndex((item) => item.id === currentRejectId.value);
          if (index !== -1) {
            applyList.value[index].status = 2;
          }
          loadApplyList(true);
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at pages/activity/applies.vue:446", "拒绝报名失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
        proxy.$refs.rejectPopup.close();
      });
    };
    const cancelReject = () => {
      proxy.$refs.rejectPopup.close();
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const scanCheckIn = () => {
      if (!id.value) {
        common_vendor.index.showToast({
          title: "活动ID不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.scanCode({
        scanType: ["qrCode"],
        // 只扫描二维码
        onlyFromCamera: true,
        // 只允许从相机扫码
        success: async (res) => {
          var _a;
          try {
            common_vendor.index.showLoading({ title: "验证签到码..." });
            const checkInCode = res.result;
            if (!checkInCode || checkInCode.trim() === "") {
              common_vendor.index.showToast({
                title: "无效的签到码",
                icon: "none"
              });
              return;
            }
            common_vendor.index.__f__("log", "at pages/activity/applies.vue:501", "扫描到签到码:", checkInCode);
            const result = await proxy.$api.activity.verifyCheckInCode({
              activityId: id.value,
              checkInCode
            });
            if (result.code === 200) {
              common_vendor.index.showToast({
                title: "签到成功",
                icon: "success"
              });
              const applyId = result.data.applyId;
              const userId = result.data.userId;
              let username = "用户";
              const index = applyList.value.findIndex(
                (item) => item.id === applyId || item._id === applyId || item.applyId === applyId
              );
              if (index !== -1) {
                username = ((_a = applyList.value[index].user) == null ? void 0 : _a.username) || "用户";
              }
              await loadApplyList(true);
              common_vendor.index.$emit("activityCheckInSuccess", {
                activityId: id.value,
                applyId
              });
              setTimeout(() => {
                common_vendor.index.showToast({
                  title: `${username} 签到成功`,
                  icon: "none",
                  duration: 2e3
                });
              }, 1e3);
            } else {
              common_vendor.index.showToast({
                title: result.message || "签到失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/activity/applies.vue:555", "扫码签到错误:", error);
            common_vendor.index.showToast({
              title: "网络异常，请稍后重试",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/activity/applies.vue:565", "扫码失败:", err);
          if (err.errMsg && err.errMsg.includes("cancel")) {
            return;
          }
          common_vendor.index.showToast({
            title: "扫码失败，请重试",
            icon: "none"
          });
        }
      });
    };
    const exportApplyList = async () => {
      try {
        common_vendor.index.showLoading({ title: "导出中..." });
        const res = await proxy.$api.activity.exportApplyList(id.value);
        common_vendor.index.__f__("log", "at pages/activity/applies.vue:587", "【导出】后端返回结果:", res);
        if (res.code === 200 && res.data) {
          const { url, fileName } = res.data;
          common_vendor.index.__f__("log", "at pages/activity/applies.vue:592", "【导出】文件URL:", url);
          common_vendor.index.__f__("log", "at pages/activity/applies.vue:593", "【导出】文件名:", fileName);
          common_vendor.index.downloadFile({
            url,
            success: (downloadRes) => {
              common_vendor.index.__f__("log", "at pages/activity/applies.vue:598", "【导出】downloadFile success:", downloadRes);
              if (downloadRes.statusCode === 200) {
                const tempFilePath = downloadRes.tempFilePath;
                common_vendor.index.__f__("log", "at pages/activity/applies.vue:602", "【导出】临时文件路径:", tempFilePath);
                common_vendor.index.hideLoading();
                common_vendor.index.openDocument({
                  filePath: tempFilePath,
                  showMenu: true,
                  fileType: "xlsx",
                  success: () => {
                    common_vendor.index.__f__("log", "at pages/activity/applies.vue:613", "【导出】打开文档成功");
                    common_vendor.index.showToast({ title: "导出成功", icon: "success" });
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/activity/applies.vue:617", "【导出】打开文档失败:", err);
                    common_vendor.index.showModal({
                      title: "提示",
                      content: "文件下载成功，但无法直接打开。错误: " + (err.errMsg || "未知错误"),
                      showCancel: true,
                      cancelText: "取消",
                      confirmText: "复制链接",
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          common_vendor.index.setClipboardData({
                            data: url,
                            success: () => {
                              common_vendor.index.showToast({ title: "链接已复制，可在浏览器中下载", icon: "none", duration: 2e3 });
                            }
                          });
                        }
                      }
                    });
                  }
                });
              } else {
                common_vendor.index.__f__("error", "at pages/activity/applies.vue:638", "【导出】下载失败，状态码:", downloadRes.statusCode);
                common_vendor.index.hideLoading();
                common_vendor.index.showModal({
                  title: "下载失败",
                  content: `状态码: ${downloadRes.statusCode}，是否复制链接？`,
                  confirmText: "复制链接",
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      common_vendor.index.setClipboardData({
                        data: url,
                        success: () => {
                          common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
                        }
                      });
                    }
                  }
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/activity/applies.vue:658", "【导出】downloadFile失败:", err);
              common_vendor.index.hideLoading();
              const isDomainError = err.errMsg && (err.errMsg.includes("downloadFile:fail") || err.errMsg.includes("domain") || err.errMsg.includes("not in domain list"));
              common_vendor.index.showModal({
                title: "导出提示",
                content: isDomainError ? "下载失败，可能是域名未配置。请在微信公众平台配置downloadFile合法域名，或复制链接在浏览器中下载。" : "下载失败: " + (err.errMsg || "未知错误") + "。是否复制链接？",
                confirmText: "复制链接",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    common_vendor.index.setClipboardData({
                      data: url,
                      success: () => {
                        common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          common_vendor.index.__f__("error", "at pages/activity/applies.vue:688", "【导出】接口返回错误:", res);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: res.message || "导出失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/applies.vue:693", "【导出】导出报名表失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "导出失败: " + (error.message || "未知错误"), icon: "none" });
      }
    };
    const safeParseFormData = (formData) => {
      if (!formData)
        return {};
      if (typeof formData === "object" && !Array.isArray(formData)) {
        return formData;
      }
      try {
        return JSON.parse(formData);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/activity/applies.vue:712", "解析表单数据失败:", e);
        try {
          if (typeof formData === "string") {
            if (formData.startsWith("参加")) {
              return { "参加原因": formData.includes(":") ? formData.split(":")[1].trim() : formData };
            }
            if (formData.includes(":")) {
              const result = {};
              const pairs = formData.split(",");
              pairs.forEach((pair) => {
                const colonIndex = pair.indexOf(":");
                if (colonIndex > 0) {
                  const key = pair.substring(0, colonIndex).trim();
                  const value = pair.substring(colonIndex + 1).trim();
                  result[key] = value;
                }
              });
              if (Object.keys(result).length > 0) {
                return result;
              }
            }
            if (!formData.includes("{") && !formData.includes("}")) {
              return { "参加原因": formData.trim() };
            }
          }
        } catch (e2) {
          common_vendor.index.__f__("error", "at pages/activity/applies.vue:749", "尝试替代解析方法失败:", e2);
        }
        return { "表单数据": "解析失败，原始数据: " + (formData.substring(0, 30) + (formData.length > 30 ? "..." : "")) };
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "报名管理",
          showBack: true
        }),
        c: isAdmin.value
      }, isAdmin.value ? {
        d: common_vendor.p({
          type: "scan",
          size: "16",
          color: "#fff"
        }),
        e: common_vendor.o(scanCheckIn),
        f: common_vendor.p({
          type: "download",
          size: "16",
          color: "#fff"
        }),
        g: common_vendor.o(exportApplyList)
      } : {}, {
        h: common_vendor.t(activityInfo.value.title || "活动详情"),
        i: common_vendor.t(totalApply.value || 0),
        j: common_vendor.t(common_vendor.unref(utils_activity.getStatusText)(activityInfo.value)),
        k: common_vendor.f(filterTabs, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.name),
            b: currentTab.value === index
          }, currentTab.value === index ? {} : {}, {
            c: index,
            d: common_vendor.n({
              active: currentTab.value === index
            }),
            e: common_vendor.o(($event) => switchTab(index), index)
          });
        }),
        l: loading.value
      }, loading.value ? {
        m: common_vendor.p({
          status: "loading"
        })
      } : filteredApplyList.value.length === 0 ? {
        o: common_assets._imports_0$2
      } : {
        p: common_vendor.f(filteredApplyList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.user.avatar || "/static/images/avatar-default.png",
            b: common_vendor.t(item.user.username || "未知用户"),
            c: common_vendor.t(item.user.studentId || "未知"),
            d: common_vendor.t(item.user.className || "未知"),
            e: common_vendor.t(common_vendor.unref(utils_activity.getApplyStatusText)(item.status)),
            f: common_vendor.n(common_vendor.unref(utils_activity.getApplyStatusClass)(item.status)),
            g: Object.keys(safeParseFormData(item.forms)).length > 0
          }, Object.keys(safeParseFormData(item.forms)).length > 0 ? {
            h: common_vendor.f(safeParseFormData(item.forms), (value, key, i1) => {
              return {
                a: common_vendor.t(common_vendor.unref(utils_activity.getFieldDisplayName)(key)),
                b: common_vendor.t(value),
                c: key
              };
            })
          } : {}, {
            i: item.status === 1
          }, item.status === 1 ? common_vendor.e({
            j: common_vendor.t(item.checkInStatus === 1 ? "已签到" : "未签到"),
            k: common_vendor.n(item.checkInStatus === 1 ? "checked" : ""),
            l: item.checkInStatus === 1
          }, item.checkInStatus === 1 ? {
            m: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.checkInTime, "MM-dd hh:mm"))
          } : {}) : {}, {
            n: isAdmin.value && item.status === 0
          }, isAdmin.value && item.status === 0 ? {
            o: common_vendor.o(($event) => rejectApply(item.id), index),
            p: common_vendor.o(($event) => approveApply(item.id), index)
          } : {}, {
            q: index
          });
        })
      }, {
        n: filteredApplyList.value.length === 0,
        q: filteredApplyList.value.length > 0
      }, filteredApplyList.value.length > 0 ? {
        r: common_vendor.p({
          status: loadMoreStatus.value
        })
      } : {}, {
        s: common_vendor.o(loadMore),
        t: refreshing.value,
        v: common_vendor.o(onRefresh),
        w: rejectReason.value,
        x: common_vendor.o(($event) => rejectReason.value = $event.detail.value),
        y: common_vendor.t(rejectReason.value.length),
        z: common_vendor.o(cancelReject),
        A: common_vendor.o(confirmReject),
        B: common_vendor.sr(rejectPopup, "6c411f7f-5", {
          "k": "rejectPopup"
        }),
        C: common_vendor.p({
          type: "center"
        }),
        D: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6c411f7f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity/applies.js.map
