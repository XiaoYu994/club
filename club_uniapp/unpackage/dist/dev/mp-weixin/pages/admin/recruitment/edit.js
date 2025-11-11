"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_api = require("../../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_custom_nav_bar2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_datetime_picker2 + _easycom_uni_forms2 + _easycom_uni_icons2)();
}
const _easycom_custom_nav_bar = () => "../../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_datetime_picker = () => "../../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_forms = () => "../../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_datetime_picker + _easycom_uni_forms + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const isEdit = common_vendor.ref(false);
    const configId = common_vendor.ref(null);
    const formData = common_vendor.reactive({
      name: "",
      semester: "",
      globalStartTime: Date.now(),
      globalEndTime: Date.now() + 30 * 24 * 60 * 60 * 1e3,
      // 默认30天后
      status: 1,
      // 默认启用
      // typeConfig: '', // 移除typeConfig字段
      description: "",
      createUserId: null
    });
    const submitting = common_vendor.ref(false);
    common_vendor.ref(240);
    const descHeight = common_vendor.ref(160);
    const form = common_vendor.ref(null);
    const rules = {
      name: {
        rules: [
          { required: true, errorMessage: "请输入配置名称" },
          { maxLength: 50, errorMessage: "配置名称不能超过50个字符" }
        ]
      },
      semester: {
        rules: [
          { required: true, errorMessage: "请输入学期" },
          { maxLength: 20, errorMessage: "学期不能超过20个字符" }
        ]
      },
      globalStartTime: {
        rules: [
          { required: true, errorMessage: "请选择开始日期" }
        ]
      },
      globalEndTime: {
        rules: [
          { required: true, errorMessage: "请选择结束日期" },
          {
            validateFunction: (rule, value, data, callback) => {
              if (value <= data.globalStartTime) {
                callback("结束日期必须晚于开始日期");
              }
              return true;
            }
          }
        ]
      },
      // typeConfig: { // 移除typeConfig校验
      //   rules: [
      //     { 
      //       validateFunction: (rule, value, data, callback) => {
      //         if (value && value.trim()) {
      //           try {
      //             JSON.parse(value.trim());
      //           } catch (e) {
      //             callback('社团类型配置必须是有效的JSON格式');
      //             return false;
      //           }
      //         }
      //         return true;
      //       }
      //     }
      //   ]
      // },
      description: {
        rules: [
          { maxLength: 200, errorMessage: "配置说明不能超过200个字符" }
        ]
      }
    };
    const resizeDesc = (e) => {
      const contentHeight = Math.max(e.detail.height, 160);
      descHeight.value = contentHeight < 300 ? contentHeight : 300;
    };
    const onStatusChange = (e) => {
      formData.status = e.detail.value ? 1 : 0;
    };
    const onStartDateChange = (timestamp) => {
      formData.globalStartTime = timestamp;
    };
    const onEndDateChange = (timestamp) => {
      formData.globalEndTime = timestamp;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const submitForm = () => {
      form.value.validate().then(async (valid) => {
        if (valid) {
          submitting.value = true;
          const adminInfo = common_vendor.index.getStorageSync("adminInfo");
          if (adminInfo && adminInfo.id) {
            formData.createUserId = adminInfo.id;
          }
          try {
            let response;
            if (isEdit.value) {
              const updateData = { ...formData, id: configId.value };
              response = await api_api.apiModule.admin.recruitment.updateConfig(updateData);
            } else {
              response = await api_api.apiModule.admin.recruitment.createConfig(formData);
            }
            if (response.code === 200) {
              common_vendor.index.showToast({
                title: isEdit.value ? "更新成功" : "创建成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } else {
              common_vendor.index.showToast({
                title: response.message || "操作失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/admin/recruitment/edit.vue:266", "提交配置失败:", error);
            common_vendor.index.showToast({
              title: "网络异常，请稍后再试",
              icon: "none"
            });
          } finally {
            submitting.value = false;
          }
        }
      }).catch((errors) => {
        common_vendor.index.__f__("log", "at pages/admin/recruitment/edit.vue:276", "表单校验错误:", errors);
      });
    };
    const loadConfigDetail = async (id) => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_api.apiModule.admin.recruitment.getConfigDetail(id);
        if (response.code === 200 && response.data) {
          const data = response.data;
          Object.keys(formData).forEach((key) => {
            if (data[key] !== void 0) {
              if (key === "globalStartTime" || key === "globalEndTime") {
                formData[key] = data[key] ? Number(data[key]) : "";
              } else {
                formData[key] = data[key];
              }
            }
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "获取配置详情失败",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/edit.vue:318", "获取配置详情失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      let id = null;
      if (currentPage.options && currentPage.options.id) {
        id = currentPage.options.id;
      } else if (currentPage.$route && currentPage.$route.query.id) {
        id = currentPage.$route.query.id;
      }
      if (id) {
        configId.value = parseInt(id);
        isEdit.value = true;
        loadConfigDetail(configId.value);
      } else {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (month >= 9) {
          formData.semester = `${year}-${year + 1}-1`;
        } else if (month >= 2) {
          formData.semester = `${year - 1}-${year}-2`;
        } else {
          formData.semester = `${year - 1}-${year}-2`;
        }
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: isEdit.value ? "编辑招新配置" : "新建招新配置",
          backButton: true
        }),
        c: common_vendor.o(($event) => formData.name = $event),
        d: common_vendor.p({
          placeholder: "请输入配置名称",
          modelValue: formData.name
        }),
        e: common_vendor.p({
          label: "配置名称",
          name: "name",
          required: true
        }),
        f: common_vendor.o(($event) => formData.semester = $event),
        g: common_vendor.p({
          placeholder: "如: 2023-2024-1",
          modelValue: formData.semester
        }),
        h: common_vendor.p({
          label: "学期",
          name: "semester",
          required: true
        }),
        i: common_vendor.t(formData.status === 1 ? "启用" : "禁用"),
        j: formData.status === 1,
        k: common_vendor.o(onStatusChange),
        l: common_vendor.p({
          label: "招新状态",
          name: "status"
        }),
        m: common_vendor.o(onStartDateChange),
        n: common_vendor.o(($event) => formData.globalStartTime = $event),
        o: common_vendor.p({
          type: "date",
          clearIcon: false,
          returnType: "timestamp",
          modelValue: formData.globalStartTime
        }),
        p: common_vendor.p({
          label: "开始日期",
          name: "globalStartTime",
          required: true
        }),
        q: common_vendor.o(onEndDateChange),
        r: common_vendor.o(($event) => formData.globalEndTime = $event),
        s: common_vendor.p({
          type: "date",
          clearIcon: false,
          returnType: "timestamp",
          modelValue: formData.globalEndTime
        }),
        t: common_vendor.p({
          label: "结束日期",
          name: "globalEndTime",
          required: true
        }),
        v: descHeight.value + "px",
        w: common_vendor.o([($event) => formData.description = $event.detail.value, resizeDesc]),
        x: formData.description,
        y: common_vendor.t(formData.description ? formData.description.length : 0),
        z: common_vendor.p({
          name: "description"
        }),
        A: common_vendor.sr(form, "8183a1db-1", {
          "k": "form"
        }),
        B: common_vendor.p({
          model: formData,
          rules,
          validateTrigger: "bind",
          labelWidth: "140rpx"
        }),
        C: common_vendor.o(goBack),
        D: submitting.value,
        E: submitting.value
      }, submitting.value ? {
        F: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#fff"
        })
      } : {}, {
        G: common_vendor.t(submitting.value ? "提交中..." : "保存配置"),
        H: common_vendor.o(submitForm),
        I: submitting.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8183a1db"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/recruitment/edit.js.map
