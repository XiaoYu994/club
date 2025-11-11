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
  __name: "editRecruitment",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const configs = common_vendor.ref([]);
    const selectedConfig = common_vendor.ref(null);
    const clubId = common_vendor.ref(null);
    const recruitmentId = common_vendor.ref(null);
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const startTime = common_vendor.ref(null);
    const endTime = common_vendor.ref(null);
    const planCount = common_vendor.ref(0);
    const needInterview = common_vendor.ref(0);
    const interviewPlace = common_vendor.ref("");
    const poster = common_vendor.ref("");
    const formFields = common_vendor.ref([]);
    const isLoading = common_vendor.ref(true);
    const fieldTypes = [
      "文本输入",
      "数字输入",
      "多行文本",
      "单选",
      "多选",
      "日期选择"
    ];
    const fieldTypeMap = {
      "text": 0,
      "number": 1,
      "textarea": 2,
      "radio": 3,
      "checkbox": 4,
      "date": 5
    };
    const reverseFieldTypeMap = {
      0: "text",
      1: "number",
      2: "textarea",
      3: "radio",
      4: "checkbox",
      5: "date"
    };
    const formattedStartTime = common_vendor.computed(() => startTime.value ? utils_common.formatDate(startTime.value, "yyyy-MM-dd") : "");
    const formattedEndTime = common_vendor.computed(() => endTime.value ? utils_common.formatDate(endTime.value, "yyyy-MM-dd") : "");
    const statusBarHeight = common_vendor.ref(common_vendor.index.getSystemInfoSync().statusBarHeight || 20);
    common_vendor.onMounted(async () => {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      clubId.value = current.options.clubId;
      recruitmentId.value = current.options.recruitmentId;
      if (!recruitmentId.value) {
        common_vendor.index.showToast({ title: "招新ID不能为空", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
        return;
      }
      await loadRecruitmentConfigs();
      await loadRecruitmentDetail();
      isLoading.value = false;
    });
    const loadRecruitmentConfigs = async () => {
      try {
        const res = await proxy.$api.club.getRecruitmentConfigs();
        if (res.code === 200) {
          configs.value = res.data || [];
        } else {
          common_vendor.index.showToast({ title: res.message || "加载配置失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/editRecruitment.vue:236", "加载配置失败", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      }
    };
    const loadRecruitmentDetail = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.club.getRecruitmentDetail(recruitmentId.value);
        if (res.code === 200 && res.data) {
          const recruitment = res.data;
          title.value = recruitment.title;
          description.value = recruitment.description;
          startTime.value = recruitment.startTime;
          endTime.value = recruitment.endTime;
          planCount.value = recruitment.planCount;
          needInterview.value = recruitment.needInterview;
          interviewPlace.value = recruitment.interviewPlace || "";
          poster.value = recruitment.poster || "";
          const configId = recruitment.configId;
          if (configId && configs.value.length > 0) {
            selectedConfig.value = configs.value.find((c) => c.id === configId) || configs.value[0];
          }
          if (recruitment.forms) {
            try {
              formFields.value = JSON.parse(recruitment.forms);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/club/editRecruitment.vue:271", "解析表单字段失败", error);
              addDefaultFields();
            }
          } else {
            addDefaultFields();
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "加载招新详情失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/editRecruitment.vue:281", "加载招新详情失败", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const onStartChange = (e) => startTime.value = new Date(e.detail.value).getTime();
    const onEndChange = (e) => endTime.value = new Date(e.detail.value).getTime();
    const goBack = () => common_vendor.index.navigateBack();
    const onInterviewChange = (e) => {
      needInterview.value = Number(e.detail.value);
    };
    const addDefaultFields = () => {
      formFields.value = [
        {
          name: "申请理由",
          type: "textarea",
          required: true
        }
      ];
    };
    const getFieldTypeIndex = (type) => {
      return fieldTypeMap[type] || 0;
    };
    const getFieldTypeName = (type) => {
      return fieldTypes[fieldTypeMap[type]] || "文本输入";
    };
    const updateFieldType = (index, typeIndex) => {
      const newType = reverseFieldTypeMap[typeIndex];
      if (newType === "radio" || newType === "checkbox") {
        if (formFields.value[index].type !== "radio" && formFields.value[index].type !== "checkbox") {
          formFields.value[index].options = ["选项1", "选项2"];
        }
      }
      formFields.value[index].type = newType;
    };
    const updateFieldRequired = (index, required) => {
      formFields.value[index].required = required;
    };
    const deleteField = (index) => {
      formFields.value.splice(index, 1);
    };
    const addField = () => {
      formFields.value.push({
        name: "新字段",
        type: "text",
        required: false
      });
    };
    const addOption = (fieldIndex) => {
      if (!formFields.value[fieldIndex].options) {
        formFields.value[fieldIndex].options = [];
      }
      formFields.value[fieldIndex].options.push(`选项${formFields.value[fieldIndex].options.length + 1}`);
    };
    const deleteOption = (fieldIndex, optionIndex) => {
      formFields.value[fieldIndex].options.splice(optionIndex, 1);
    };
    const uploadPoster = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "上传中..." });
          try {
            const uploadRes = await proxy.$api.common.upload(tempFilePath);
            if (uploadRes.code === 200) {
              poster.value = uploadRes.data.url || uploadRes.data;
              common_vendor.index.showToast({ title: "海报上传成功", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: uploadRes.message || "海报上传失败", icon: "none" });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/club/editRecruitment.vue:382", "上传海报失败", error);
            common_vendor.index.showToast({ title: "海报上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    const updateRecruitment = async () => {
      if (!selectedConfig.value)
        return common_vendor.index.showToast({ title: "请选择配置", icon: "none" });
      const now = Date.now();
      if (now < selectedConfig.value.globalStartTime || now > selectedConfig.value.globalEndTime) {
        return common_vendor.index.showToast({ title: "当前不在配置的招新时间范围内", icon: "none" });
      }
      if (!title.value)
        return common_vendor.index.showToast({ title: "请输入标题", icon: "none" });
      if (!startTime.value || !endTime.value)
        return common_vendor.index.showToast({ title: "请选择时间", icon: "none" });
      if (!planCount.value)
        return common_vendor.index.showToast({ title: "请输入计划人数", icon: "none" });
      const payload = {
        clubId: Number(clubId.value),
        configId: selectedConfig.value.id,
        title: title.value,
        description: description.value,
        startTime: startTime.value,
        endTime: endTime.value,
        planCount: planCount.value,
        needInterview: needInterview.value,
        interviewPlace: needInterview.value === 1 ? interviewPlace.value : null,
        poster: poster.value,
        forms: JSON.stringify(formFields.value)
      };
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const res = await proxy.$api.club.updateRecruitment(recruitmentId.value, payload);
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "更新成功", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "更新失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/editRecruitment.vue:429", "更新招新失败", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: "编辑招新",
          showBack: true
        }),
        d: common_vendor.t(selectedConfig.value ? selectedConfig.value.name : "加载中..."),
        e: title.value,
        f: common_vendor.o(($event) => title.value = $event.detail.value),
        g: poster.value
      }, poster.value ? {
        h: poster.value
      } : {
        i: common_vendor.p({
          type: "image",
          size: "50",
          color: "#ccc"
        })
      }, {
        j: common_vendor.o(uploadPoster),
        k: description.value,
        l: common_vendor.o(($event) => description.value = $event.detail.value),
        m: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#b13b7a"
        }),
        n: common_vendor.t(formattedStartTime.value || "请选择日期"),
        o: common_vendor.o(onStartChange),
        p: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#b13b7a"
        }),
        q: common_vendor.t(formattedEndTime.value || "请选择日期"),
        r: common_vendor.o(onEndChange),
        s: planCount.value,
        t: common_vendor.o(common_vendor.m(($event) => planCount.value = $event.detail.value, {
          number: true
        })),
        v: needInterview.value === 0,
        w: needInterview.value === 1,
        x: common_vendor.o(onInterviewChange),
        y: needInterview.value === 1
      }, needInterview.value === 1 ? {
        z: interviewPlace.value,
        A: common_vendor.o(($event) => interviewPlace.value = $event.detail.value)
      } : {}, {
        B: common_vendor.f(formFields.value, (field, fieldIndex, i0) => {
          return common_vendor.e({
            a: field.name,
            b: common_vendor.o(($event) => field.name = $event.detail.value, fieldIndex),
            c: field.required,
            d: common_vendor.o((e) => updateFieldRequired(fieldIndex, e.detail.value), fieldIndex),
            e: "99322b79-4-" + i0,
            f: common_vendor.o(($event) => deleteField(fieldIndex), fieldIndex),
            g: common_vendor.t(getFieldTypeName(field.type)),
            h: getFieldTypeIndex(field.type),
            i: common_vendor.o((e) => updateFieldType(fieldIndex, e.detail.value), fieldIndex),
            j: field.type === "radio" || field.type === "checkbox"
          }, field.type === "radio" || field.type === "checkbox" ? {
            k: common_vendor.f(field.options, (option, optionIndex, i1) => {
              return {
                a: field.options[optionIndex],
                b: common_vendor.o(($event) => field.options[optionIndex] = $event.detail.value, optionIndex),
                c: "99322b79-5-" + i0 + "-" + i1,
                d: common_vendor.o(($event) => deleteOption(fieldIndex, optionIndex), optionIndex),
                e: optionIndex
              };
            }),
            l: common_vendor.p({
              type: "close",
              size: "16",
              color: "#999"
            }),
            m: "99322b79-6-" + i0,
            n: common_vendor.p({
              type: "plusempty",
              size: "20",
              color: "#b13b7a"
            }),
            o: common_vendor.o(($event) => addOption(fieldIndex), fieldIndex)
          } : {}, {
            p: fieldIndex
          });
        }),
        C: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#999"
        }),
        D: fieldTypes,
        E: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#b13b7a"
        }),
        F: common_vendor.o(addField),
        G: common_vendor.o(goBack),
        H: common_vendor.o(updateRecruitment)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-99322b79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/editRecruitment.js.map
