"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_api = require("../../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2)();
}
const _easycom_custom_nav_bar = () => "../../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const detail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(true);
    const formFields = common_vendor.ref([]);
    const recruitmentId = common_vendor.ref(null);
    const loadDetail = async () => {
      if (!recruitmentId.value) {
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
        return;
      }
      isLoading.value = true;
      try {
        const response = await api_api.apiModule.admin.recruitment.getRecruitmentDetail(recruitmentId.value);
        if (response.code === 200 && response.data) {
          detail.value = response.data;
          if (detail.value.forms) {
            try {
              formFields.value = JSON.parse(detail.value.forms);
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/admin/recruitment/detail.vue:199", "解析表单配置失败:", e);
              formFields.value = [];
            }
          }
        } else {
          common_vendor.index.showToast({
            title: response.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/detail.vue:210", "获取招新详情失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const getStatusText = (status) => {
      const statusMap = {
        0: "待审核",
        1: "已通过",
        2: "已结束",
        3: "已驳回"
      };
      return statusMap[status] || "未知";
    };
    const getStatusClass = (status) => {
      const classMap = {
        0: "status-pending",
        1: "status-approved",
        2: "status-ended",
        3: "status-rejected"
      };
      return classMap[status] || "";
    };
    const getFieldTypeText = (type) => {
      const typeMap = {
        "text": "单行文本",
        "textarea": "多行文本",
        "select": "单选",
        "checkbox": "多选",
        "radio": "单选按钮",
        "number": "数字",
        "date": "日期",
        "phone": "手机号",
        "email": "邮箱"
      };
      return typeMap[type] || type;
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(parseInt(timestamp));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const formatDateTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(parseInt(timestamp));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const getPassRate = () => {
      if (!detail.value || !detail.value.joinCount || detail.value.joinCount === 0) {
        return 0;
      }
      return Math.round((detail.value.passCount || 0) / detail.value.joinCount * 100);
    };
    const getRemainingCount = () => {
      if (!detail.value)
        return 0;
      const remaining = (detail.value.planCount || 0) - (detail.value.passCount || 0);
      return Math.max(0, remaining);
    };
    const previewPoster = () => {
      if (detail.value && detail.value.poster) {
        common_vendor.index.previewImage({
          urls: [detail.value.poster],
          current: detail.value.poster
        });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onLoad((options) => {
      if (options.id) {
        recruitmentId.value = parseInt(options.id);
        loadDetail();
      } else {
        common_vendor.index.showToast({
          title: "缺少招新ID参数",
          icon: "none"
        });
      }
    });
    common_vendor.onMounted(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "招新详情"
        }),
        b: isLoading.value
      }, isLoading.value ? {
        c: common_vendor.p({
          type: "spinner-cycle",
          size: "32",
          color: "#2979ff"
        })
      } : detail.value ? common_vendor.e({
        e: common_vendor.t(getStatusText(detail.value.status)),
        f: common_vendor.n(getStatusClass(detail.value.status)),
        g: common_vendor.t(detail.value.clubName),
        h: common_vendor.t(detail.value.title),
        i: common_vendor.t(detail.value.description || "无"),
        j: common_vendor.t(formatDate(detail.value.startTime)),
        k: common_vendor.t(formatDate(detail.value.endTime)),
        l: common_vendor.t(detail.value.planCount),
        m: common_vendor.t(detail.value.needInterview ? "是" : "否"),
        n: detail.value.needInterview
      }, detail.value.needInterview ? {
        o: common_vendor.t(detail.value.interviewPlace || "待定")
      } : {}, {
        p: common_vendor.t(formatDateTime(detail.value.createTime)),
        q: detail.value.updateTime !== detail.value.createTime
      }, detail.value.updateTime !== detail.value.createTime ? {
        r: common_vendor.t(formatDateTime(detail.value.updateTime))
      } : {}, {
        s: common_vendor.t(detail.value.joinCount || 0),
        t: common_vendor.t(detail.value.passCount || 0),
        v: common_vendor.t(getPassRate()),
        w: common_vendor.t(getRemainingCount()),
        x: detail.value.poster
      }, detail.value.poster ? {
        y: detail.value.poster,
        z: common_vendor.o(previewPoster)
      } : {}, {
        A: formFields.value.length > 0
      }, formFields.value.length > 0 ? {
        B: common_vendor.f(formFields.value, (field, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(field.label),
            b: common_vendor.t(getFieldTypeText(field.type)),
            c: field.required
          }, field.required ? {} : {}, {
            d: field.placeholder
          }, field.placeholder ? {
            e: common_vendor.t(field.placeholder)
          } : {}, {
            f: field.options && field.options.length > 0
          }, field.options && field.options.length > 0 ? {
            g: common_vendor.f(field.options, (option, idx, i1) => {
              return {
                a: common_vendor.t(option),
                b: idx
              };
            })
          } : {}, {
            h: index
          });
        })
      } : {}, {
        C: detail.value.reviewComment || detail.value.status !== 0
      }, detail.value.reviewComment || detail.value.status !== 0 ? common_vendor.e({
        D: common_vendor.t(getStatusText(detail.value.status)),
        E: common_vendor.n(getStatusClass(detail.value.status)),
        F: detail.value.reviewComment
      }, detail.value.reviewComment ? {
        G: common_vendor.t(detail.value.reviewComment)
      } : {}) : {}) : {
        H: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        }),
        I: common_vendor.o(goBack)
      }, {
        d: detail.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f235c747"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/recruitment/detail.js.map
