"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
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
  __name: "apply",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(20);
    const clubId = common_vendor.ref(null);
    const recruitmentId = common_vendor.ref(null);
    const clubInfo = common_vendor.ref({});
    const recruitmentInfo = common_vendor.ref(null);
    const formFields = common_vendor.ref([]);
    const defaultReason = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    const isRecruitmentActive = common_vendor.computed(() => {
      if (!recruitmentInfo.value)
        return false;
      const now = Date.now();
      const startTime = Number(recruitmentInfo.value.startTime);
      const endTime = Number(recruitmentInfo.value.endTime);
      return recruitmentInfo.value.status === 1 && now >= startTime && now <= endTime && getRemainingCount() > 0;
    });
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 20;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      clubId.value = currentPage.options.clubId;
      recruitmentId.value = currentPage.options.recruitmentId;
      loadClubInfo();
      loadRecruitmentInfo();
    });
    const loadClubInfo = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.club.getClubDetail(clubId.value);
        if (res.code === 200) {
          clubInfo.value = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
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
    };
    const loadRecruitmentInfo = async () => {
      try {
        if (!recruitmentId.value) {
          const res = await proxy.$api.club.getActiveRecruitment(clubId.value);
          if (res.code === 200 && res.data) {
            recruitmentInfo.value = res.data;
            parseFormFieldsFromRecruitment();
          }
        } else {
          const res = await proxy.$api.club.getRecruitmentDetail(recruitmentId.value);
          if (res.code === 200) {
            recruitmentInfo.value = res.data;
            parseFormFieldsFromRecruitment();
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/apply.vue:266", "加载招新信息失败", error);
      }
    };
    const parseFormFieldsFromRecruitment = () => {
      try {
        if (recruitmentInfo.value.forms) {
          let formConfig;
          if (typeof recruitmentInfo.value.forms === "object") {
            formConfig = recruitmentInfo.value.forms;
          } else {
            formConfig = JSON.parse(recruitmentInfo.value.forms);
          }
          if (!Array.isArray(formConfig)) {
            formConfig = [formConfig];
          }
          formFields.value = formConfig.map((field) => {
            return {
              key: field.name.toLowerCase().replace(/\s/g, "_"),
              label: field.name,
              type: field.type || "text",
              required: field.required || false,
              value: "",
              options: field.options || []
            };
          });
        } else {
          formFields.value = [];
        }
      } catch (e) {
        formFields.value = [];
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case 0:
          return "未开始";
        case 1:
          return "招新中";
        case 2:
          return "已结束";
        default:
          return "未知";
      }
    };
    const getStatusClass = (status) => {
      switch (status) {
        case 0:
          return "status-pending";
        case 1:
          return "status-active";
        case 2:
          return "status-ended";
        default:
          return "";
      }
    };
    const getRemainingCount = () => {
      if (!recruitmentInfo.value)
        return 0;
      const plan = Number(recruitmentInfo.value.planCount) || 0;
      const passed = Number(recruitmentInfo.value.passCount) || 0;
      return Math.max(0, plan - passed);
    };
    const previewImage = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const onOptionChange = (index, e) => {
      const selectedIndex = e.detail.value;
      formFields.value[index].value = formFields.value[index].options[selectedIndex];
    };
    const onCheckboxChange = (index, e) => {
      formFields.value[index].value = e.detail.value.join(",");
    };
    const isOptionChecked = (value, option) => {
      if (!value)
        return false;
      const values = value.split(",");
      return values.includes(option);
    };
    const submitApply = async () => {
      if (!isRecruitmentActive.value) {
        common_vendor.index.showToast({
          title: "招新已结束，无法提交申请",
          icon: "none"
        });
        return;
      }
      let formData = {};
      if (formFields.value.length > 0) {
        const missingFields = formFields.value.filter((field) => field.required && !field.value);
        if (missingFields.length > 0) {
          common_vendor.index.showToast({
            title: `请填写${missingFields[0].label}`,
            icon: "none"
          });
          return;
        }
        formFields.value.forEach((field) => {
          formData[field.key] = field.value;
        });
      } else {
        if (!defaultReason.value.trim()) {
          common_vendor.index.showToast({
            title: "请填写申请理由",
            icon: "none"
          });
          return;
        }
        formData = {
          reason: defaultReason.value
        };
      }
      try {
        submitting.value = true;
        common_vendor.index.showLoading({ title: "提交中..." });
        const res = await proxy.$api.club.applyJoinClub(clubId.value, formData);
        common_vendor.index.hideLoading();
        submitting.value = false;
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "申请已提交，等待审核",
            icon: "success"
          });
          setTimeout(() => {
            goBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || "申请失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        submitting.value = false;
        common_vendor.index.showToast({
          title: "申请失败，请稍后重试",
          icon: "none"
        });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: "申请加入社团",
          showBack: true
        }),
        d: clubInfo.value.logo || "/static/images/default-club.png",
        e: common_vendor.t(clubInfo.value.name || "加载中..."),
        f: recruitmentInfo.value
      }, recruitmentInfo.value ? common_vendor.e({
        g: recruitmentInfo.value.poster
      }, recruitmentInfo.value.poster ? {
        h: recruitmentInfo.value.poster,
        i: common_vendor.o(($event) => previewImage(recruitmentInfo.value.poster))
      } : {}, {
        j: common_vendor.t(recruitmentInfo.value.title),
        k: common_vendor.t(getStatusText(recruitmentInfo.value.status)),
        l: common_vendor.n(getStatusClass(recruitmentInfo.value.status)),
        m: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#b13b7a"
        }),
        n: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.startTime)),
        o: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.endTime)),
        p: recruitmentInfo.value.needInterview && recruitmentInfo.value.interviewPlace
      }, recruitmentInfo.value.needInterview && recruitmentInfo.value.interviewPlace ? {
        q: common_vendor.p({
          type: "location",
          size: "18",
          color: "#b13b7a"
        }),
        r: common_vendor.t(recruitmentInfo.value.interviewPlace)
      } : {}, {
        s: common_vendor.t(recruitmentInfo.value.planCount || 0),
        t: common_vendor.t(recruitmentInfo.value.joinCount || 0),
        v: common_vendor.t(recruitmentInfo.value.passCount || 0),
        w: common_vendor.t(getRemainingCount()),
        x: recruitmentInfo.value.description
      }, recruitmentInfo.value.description ? {
        y: recruitmentInfo.value.description
      } : {}) : {}, {
        z: isRecruitmentActive.value
      }, isRecruitmentActive.value ? common_vendor.e({
        A: formFields.value && formFields.value.length > 0
      }, formFields.value && formFields.value.length > 0 ? {
        B: common_vendor.f(formFields.value, (field, idx, i0) => {
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
            w: idx
          });
        })
      } : {
        C: defaultReason.value,
        D: common_vendor.o(($event) => defaultReason.value = $event.detail.value)
      }) : {
        E: common_vendor.p({
          type: "info",
          size: "32",
          color: "#999"
        })
      }, {
        F: common_vendor.o(goBack),
        G: common_vendor.t(submitting.value ? "提交中..." : "提交申请"),
        H: common_vendor.o(submitApply),
        I: submitting.value || !isRecruitmentActive.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b42bf0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/apply.js.map
