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
  __name: "createRecruitment",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const configs = common_vendor.ref([]);
    const selectedConfig = common_vendor.ref(null);
    const clubId = common_vendor.ref(null);
    const recruitmentId = common_vendor.ref(null);
    const copyFromId = common_vendor.ref(null);
    const isEditMode = common_vendor.computed(() => !!recruitmentId.value);
    const isCopyMode = common_vendor.computed(() => !!copyFromId.value);
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const startTime = common_vendor.ref(null);
    const endTime = common_vendor.ref(null);
    const planCount = common_vendor.ref(0);
    const needInterview = common_vendor.ref(0);
    const interviewPlace = common_vendor.ref("");
    const poster = common_vendor.ref("");
    const formFields = common_vendor.ref([]);
    const pageTitle = common_vendor.computed(() => {
      if (isEditMode.value)
        return "编辑招新";
      if (isCopyMode.value)
        return "复制创建招新";
      return "创建招新";
    });
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
    const formattedGlobalStartTime = common_vendor.computed(() => {
      var _a;
      return ((_a = selectedConfig.value) == null ? void 0 : _a.globalStartTime) ? utils_common.formatDate(selectedConfig.value.globalStartTime, "yyyy-MM-dd") : "";
    });
    const formattedGlobalEndTime = common_vendor.computed(() => {
      var _a;
      return ((_a = selectedConfig.value) == null ? void 0 : _a.globalEndTime) ? utils_common.formatDate(selectedConfig.value.globalEndTime, "yyyy-MM-dd") : "";
    });
    const statusBarHeight = common_vendor.ref(common_vendor.index.getSystemInfoSync().statusBarHeight || 20);
    common_vendor.onMounted(async () => {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      clubId.value = current.options.clubId;
      recruitmentId.value = current.options.recruitmentId;
      copyFromId.value = current.options.copyFrom;
      await loadRecruitmentConfigs();
      if (isEditMode.value) {
        await loadRecruitmentDetail();
      } else if (isCopyMode.value) {
        await loadRecruitmentForCopy();
      } else {
        addDefaultFields();
      }
    });
    const loadRecruitmentConfigs = async () => {
      try {
        const res = await proxy.$api.club.getRecruitmentConfigs();
        if (res.code === 200) {
          const allConfigs = res.data || [];
          if (isEditMode.value) {
            configs.value = allConfigs;
          } else {
            const now = Date.now();
            configs.value = allConfigs.filter((c) => now >= c.globalStartTime && now <= c.globalEndTime);
            if (!configs.value.length) {
              common_vendor.index.showToast({ title: "当前暂无可用招新配置", icon: "none" });
            }
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "加载配置失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:276", "加载配置失败", error);
      }
    };
    const loadRecruitmentDetail = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.club.getRecruitmentDetail(recruitmentId.value);
        if (res.code === 200 && res.data) {
          const recruitment = res.data;
          if (recruitment.status !== 0 && recruitment.status !== 3) {
            let statusText = "";
            switch (recruitment.status) {
              case 1:
                statusText = "进行中";
                break;
              case 2:
                statusText = "已结束";
                break;
              default:
                statusText = "未知状态";
            }
            common_vendor.index.showToast({
              title: `该招新活动状态为"${statusText}"，不允许编辑`,
              icon: "none",
              duration: 2e3
            });
            setTimeout(() => common_vendor.index.navigateBack(), 2e3);
            return;
          }
          title.value = recruitment.title;
          description.value = recruitment.description;
          startTime.value = recruitment.startTime;
          endTime.value = recruitment.endTime;
          planCount.value = recruitment.planCount;
          needInterview.value = recruitment.needInterview;
          interviewPlace.value = recruitment.interviewPlace || "";
          poster.value = recruitment.poster || "";
          const configId = recruitment.configId;
          common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:324", "招新的configId:", configId);
          common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:325", "可用配置列表:", configs.value);
          if (configId && configs.value.length > 0) {
            selectedConfig.value = configs.value.find((c) => c.id == configId);
            common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:330", "找到的配置:", selectedConfig.value);
            if (!selectedConfig.value) {
              common_vendor.index.__f__("warn", "at pages/club/createRecruitment.vue:333", "未找到匹配的配置，configId:", configId);
              common_vendor.index.showToast({ title: "未找到对应的招新配置", icon: "none" });
            }
          }
          if (recruitment.forms) {
            try {
              formFields.value = JSON.parse(recruitment.forms);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:343", "解析表单字段失败", error);
              addDefaultFields();
            }
          } else {
            addDefaultFields();
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "加载招新详情失败", icon: "none" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:354", "加载招新详情失败", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const loadRecruitmentForCopy = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.club.getRecruitmentDetail(copyFromId.value);
        if (res.code === 200 && res.data) {
          const recruitment = res.data;
          title.value = recruitment.title + " (复制)";
          description.value = recruitment.description;
          startTime.value = recruitment.startTime;
          endTime.value = recruitment.endTime;
          planCount.value = recruitment.planCount;
          needInterview.value = recruitment.needInterview;
          interviewPlace.value = recruitment.interviewPlace || "";
          poster.value = recruitment.poster || "";
          const configId = recruitment.configId;
          common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:381", "招新的configId:", configId);
          common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:382", "可用配置列表:", configs.value);
          if (configId && configs.value.length > 0) {
            selectedConfig.value = configs.value.find((c) => c.id == configId);
            common_vendor.index.__f__("log", "at pages/club/createRecruitment.vue:386", "找到的配置:", selectedConfig.value);
            if (!selectedConfig.value) {
              common_vendor.index.__f__("warn", "at pages/club/createRecruitment.vue:389", "未找到匹配的配置，configId:", configId);
              common_vendor.index.showToast({ title: "未找到对应的招新配置", icon: "none" });
            }
          }
          if (recruitment.forms) {
            try {
              formFields.value = JSON.parse(recruitment.forms);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:399", "解析表单字段失败", error);
              addDefaultFields();
            }
          } else {
            addDefaultFields();
          }
        } else {
          common_vendor.index.showToast({ title: res.message || "加载招新详情失败", icon: "none" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:410", "加载招新详情失败", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const onConfigChange = (e) => {
      const idx = e.detail.value;
      selectedConfig.value = configs.value[idx];
    };
    const onStartChange = (e) => startTime.value = new Date(e.detail.value).getTime();
    const onEndChange = (e) => endTime.value = new Date(e.detail.value).getTime();
    const goBack = () => common_vendor.index.navigateBack();
    const onInterviewChange = (e) => {
      needInterview.value = Number(e.detail.value);
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
            common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:451", "上传海报失败", error);
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
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
    const submitRecruitment = async () => {
      if (!selectedConfig.value)
        return common_vendor.index.showToast({ title: "请选择配置", icon: "none" });
      if (!isEditMode.value) {
        const now = Date.now();
        if (now < selectedConfig.value.globalStartTime || now > selectedConfig.value.globalEndTime) {
          return common_vendor.index.showToast({ title: "当前不在配置的招新时间范围内", icon: "none" });
        }
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
        forms: JSON.stringify(formFields.value),
        joinCount: 0,
        passCount: 0
      };
      if (isEditMode.value) {
        payload.status = 0;
      }
      try {
        common_vendor.index.showLoading({ title: isEditMode.value ? "保存中..." : "提交中..." });
        let res;
        if (isEditMode.value) {
          res = await proxy.$api.club.updateRecruitment(recruitmentId.value, payload);
        } else {
          res = await proxy.$api.club.createRecruitment(payload);
        }
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: isEditMode.value ? "更新成功" : "创建成功",
            icon: "success"
          });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || (isEditMode.value ? "更新失败" : "创建失败"),
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/createRecruitment.vue:588", "提交失败", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: pageTitle.value,
          showBack: true
        }),
        d: common_vendor.t(selectedConfig.value ? selectedConfig.value.name : "请选择配置"),
        e: configs.value,
        f: common_vendor.o(onConfigChange),
        g: selectedConfig.value
      }, selectedConfig.value ? {
        h: common_vendor.t(formattedGlobalStartTime.value),
        i: common_vendor.t(formattedGlobalEndTime.value)
      } : {}, {
        j: title.value,
        k: common_vendor.o(($event) => title.value = $event.detail.value),
        l: poster.value
      }, poster.value ? {
        m: poster.value
      } : {
        n: common_vendor.p({
          type: "image",
          size: "50",
          color: "#ccc"
        })
      }, {
        o: common_vendor.o(uploadPoster),
        p: description.value,
        q: common_vendor.o(($event) => description.value = $event.detail.value),
        r: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#b13b7a"
        }),
        s: common_vendor.t(formattedStartTime.value || "请选择日期"),
        t: common_vendor.o(onStartChange),
        v: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#b13b7a"
        }),
        w: common_vendor.t(formattedEndTime.value || "请选择日期"),
        x: common_vendor.o(onEndChange),
        y: planCount.value,
        z: common_vendor.o(common_vendor.m(($event) => planCount.value = $event.detail.value, {
          number: true
        })),
        A: needInterview.value === 0,
        B: needInterview.value === 1,
        C: common_vendor.o(onInterviewChange),
        D: needInterview.value === 1
      }, needInterview.value === 1 ? {
        E: interviewPlace.value,
        F: common_vendor.o(($event) => interviewPlace.value = $event.detail.value)
      } : {}, {
        G: common_vendor.f(formFields.value, (field, fieldIndex, i0) => {
          return common_vendor.e({
            a: field.name,
            b: common_vendor.o(($event) => field.name = $event.detail.value, fieldIndex),
            c: field.required,
            d: common_vendor.o((e) => updateFieldRequired(fieldIndex, e.detail.value), fieldIndex),
            e: "6e3c49f1-4-" + i0,
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
                c: "6e3c49f1-5-" + i0 + "-" + i1,
                d: common_vendor.o(($event) => deleteOption(fieldIndex, optionIndex), optionIndex),
                e: optionIndex
              };
            }),
            l: common_vendor.p({
              type: "close",
              size: "16",
              color: "#999"
            }),
            m: "6e3c49f1-6-" + i0,
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
        H: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#999"
        }),
        I: fieldTypes,
        J: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#b13b7a"
        }),
        K: common_vendor.o(addField),
        L: common_vendor.o(goBack),
        M: common_vendor.t(isEditMode.value ? "保存更新" : "提交创建"),
        N: common_vendor.o(submitRecruitment)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e3c49f1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/createRecruitment.js.map
