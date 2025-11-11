"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "activity-form",
  props: {
    // 活动数据，用于编辑模式
    activityData: {
      type: Object,
      default: () => ({})
    },
    // 是否为编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    // 社团ID
    clubId: {
      type: [Number, String],
      default: ""
    }
  },
  emits: ["cancel", "submit"],
  setup(__props, { emit: __emit }) {
    const { proxy } = common_vendor.getCurrentInstance();
    const props = __props;
    const emit = __emit;
    const formData = common_vendor.reactive({
      title: "",
      address: "",
      startTime: Date.now(),
      endTime: Date.now() + 72e5,
      // 默认2小时后结束
      poster: "",
      description: "",
      needApproval: true,
      forms: []
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
    common_vendor.onMounted(() => {
      if (props.isEdit && props.activityData) {
        initFormData();
      } else {
        addDefaultFields();
      }
    });
    common_vendor.watch(() => props.activityData, (newVal) => {
      if (newVal && props.isEdit) {
        initFormData();
      }
    }, { deep: true });
    const initFormData = () => {
      const data = props.activityData;
      formData.title = data.title || "";
      formData.address = data.address || "";
      formData.startTime = Number(data.startTime) || Date.now();
      formData.endTime = Number(data.endTime) || Date.now() + 72e5;
      formData.poster = data.poster || "";
      formData.description = data.description || "";
      formData.needApproval = data.needApproval !== void 0 ? data.needApproval : true;
      try {
        if (data.forms) {
          let forms;
          if (typeof data.forms === "string") {
            forms = JSON.parse(data.forms);
          } else if (Array.isArray(data.forms)) {
            forms = data.forms;
          } else {
            forms = [data.forms];
          }
          formData.forms = forms.map((field) => ({
            name: field.name || "未命名字段",
            type: field.type || "text",
            required: field.required || false,
            options: field.options || []
          }));
        } else {
          addDefaultFields();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/activity-form/activity-form.vue:264", "解析表单字段失败:", e);
        addDefaultFields();
      }
    };
    const addDefaultFields = () => {
      formData.forms = [
        {
          name: "参加原因",
          type: "textarea",
          required: false,
          options: []
        }
      ];
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(Number(timestamp));
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(Number(timestamp));
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const onStartDateChange = (e) => {
      const dateStr = e.detail.value;
      const [year, month, day] = dateStr.split("-").map(Number);
      const currentDate = new Date(Number(formData.startTime));
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const newDate = new Date(year, month - 1, day, hours, minutes);
      formData.startTime = newDate.getTime();
      if (formData.startTime > formData.endTime) {
        formData.endTime = formData.startTime + 72e5;
      }
    };
    const onStartTimeChange = (e) => {
      const timeStr = e.detail.value;
      const [hours, minutes] = timeStr.split(":").map(Number);
      const currentDate = new Date(Number(formData.startTime));
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();
      const newDate = new Date(year, month, day, hours, minutes);
      formData.startTime = newDate.getTime();
      if (formData.startTime > formData.endTime) {
        formData.endTime = formData.startTime + 72e5;
      }
    };
    const onEndDateChange = (e) => {
      const dateStr = e.detail.value;
      const [year, month, day] = dateStr.split("-").map(Number);
      const currentDate = new Date(Number(formData.endTime));
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const newDate = new Date(year, month - 1, day, hours, minutes);
      formData.endTime = newDate.getTime();
      if (formData.endTime < formData.startTime) {
        formData.startTime = formData.endTime - 72e5;
      }
    };
    const onEndTimeChange = (e) => {
      const timeStr = e.detail.value;
      const [hours, minutes] = timeStr.split(":").map(Number);
      const currentDate = new Date(Number(formData.endTime));
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();
      const newDate = new Date(year, month, day, hours, minutes);
      formData.endTime = newDate.getTime();
      if (formData.endTime < formData.startTime) {
        formData.startTime = formData.endTime - 72e5;
      }
    };
    const uploadPoster = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          proxy.$api.common.upload(tempFilePath).then((res2) => {
            var _a;
            if (res2.code === 200 || res2.code === 0) {
              const imageUrl = ((_a = res2.data) == null ? void 0 : _a.url) || res2.data;
              formData.poster = utils_common.getImageUrl(imageUrl);
              setTimeout(() => {
                formData.poster = formData.poster;
              }, 100);
              common_vendor.index.showToast({
                title: "上传成功",
                icon: "success"
              });
            } else {
              common_vendor.index.showToast({
                title: res2.message || res2.msg || "上传失败",
                icon: "none"
              });
              common_vendor.index.__f__("error", "at components/activity-form/activity-form.vue:413", "上传失败:", res2);
            }
          }).catch((err) => {
            common_vendor.index.showToast({
              title: "网络异常，请稍后重试",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at components/activity-form/activity-form.vue:421", "上传请求失败:", err);
          }).finally(() => {
            common_vendor.index.hideLoading();
          });
        }
      });
    };
    const getPosterPreviewUrl = (url) => {
      return utils_common.getImageUrl(url, "/static/images/default-poster.png", false);
    };
    const getFieldTypeIndex = (type) => {
      return fieldTypeMap[type] || 0;
    };
    const getFieldTypeName = (type) => {
      const index = fieldTypeMap[type] || 0;
      return fieldTypes[index];
    };
    const updateFieldType = (fieldIndex, typeIndex) => {
      const newType = reverseFieldTypeMap[typeIndex];
      formData.forms[fieldIndex].type = newType;
      if ((newType === "radio" || newType === "select" || newType === "checkbox") && (!formData.forms[fieldIndex].options || formData.forms[fieldIndex].options.length === 0)) {
        formData.forms[fieldIndex].options = ["选项1", "选项2"];
      }
    };
    const updateFieldRequired = (fieldIndex, required) => {
      formData.forms[fieldIndex].required = required;
    };
    const deleteField = (fieldIndex) => {
      common_vendor.index.showModal({
        title: "删除字段",
        content: "确定要删除此表单字段吗？",
        success: (res) => {
          if (res.confirm) {
            formData.forms.splice(fieldIndex, 1);
          }
        }
      });
    };
    const addField = () => {
      formData.forms.push({
        name: "新字段",
        type: "text",
        required: false,
        options: []
      });
    };
    const addOption = (fieldIndex) => {
      if (!formData.forms[fieldIndex].options) {
        formData.forms[fieldIndex].options = [];
      }
      formData.forms[fieldIndex].options.push(`选项${formData.forms[fieldIndex].options.length + 1}`);
    };
    const deleteOption = (fieldIndex, optionIndex) => {
      if (formData.forms[fieldIndex].options.length <= 2) {
        common_vendor.index.showToast({
          title: "至少保留两个选项",
          icon: "none"
        });
        return;
      }
      formData.forms[fieldIndex].options.splice(optionIndex, 1);
    };
    const onCancel = () => {
      emit("cancel");
    };
    const onSubmit = () => {
      if (!formData.title) {
        common_vendor.index.showToast({
          title: "请输入活动标题",
          icon: "none"
        });
        return;
      }
      if (!formData.address) {
        common_vendor.index.showToast({
          title: "请输入活动地点",
          icon: "none"
        });
        return;
      }
      if (!formData.description) {
        common_vendor.index.showToast({
          title: "请输入活动详情",
          icon: "none"
        });
        return;
      }
      for (const field of formData.forms) {
        if (!field.name) {
          common_vendor.index.showToast({
            title: "表单字段名称不能为空",
            icon: "none"
          });
          return;
        }
        if ((field.type === "radio" || field.type === "select" || field.type === "checkbox") && (!field.options || field.options.length < 2)) {
          common_vendor.index.showToast({
            title: `${field.name}至少需要两个选项`,
            icon: "none"
          });
          return;
        }
      }
      common_vendor.index.showLoading({
        title: "保存中..."
      });
      const submitData = {
        title: formData.title,
        address: formData.address,
        startTime: formData.startTime,
        endTime: formData.endTime,
        poster: formData.poster,
        description: formData.description,
        needApproval: formData.needApproval,
        forms: JSON.stringify(formData.forms),
        clubId: props.clubId
      };
      if (props.isEdit && props.activityData.id) {
        submitData.id = props.activityData.id;
      }
      emit("submit", submitData);
      setTimeout(() => {
        common_vendor.index.hideLoading();
      }, 500);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: formData.title,
        b: common_vendor.o(($event) => formData.title = $event.detail.value),
        c: formData.address,
        d: common_vendor.o(($event) => formData.address = $event.detail.value),
        e: common_vendor.t(formatDate(formData.startTime)),
        f: formatDate(formData.startTime),
        g: common_vendor.o(onStartDateChange),
        h: common_vendor.t(formatTime(formData.startTime)),
        i: formatTime(formData.startTime),
        j: common_vendor.o(onStartTimeChange),
        k: common_vendor.t(formatDate(formData.endTime)),
        l: formatDate(formData.endTime),
        m: common_vendor.o(onEndDateChange),
        n: common_vendor.t(formatTime(formData.endTime)),
        o: formatTime(formData.endTime),
        p: common_vendor.o(onEndTimeChange),
        q: formData.poster
      }, formData.poster ? {
        r: getPosterPreviewUrl(formData.poster)
      } : {
        s: common_vendor.p({
          type: "image",
          size: "50",
          color: "#999"
        })
      }, {
        t: common_vendor.o(uploadPoster),
        v: formData.description,
        w: common_vendor.o(($event) => formData.description = $event.detail.value),
        x: common_vendor.f(formData.forms, (field, fieldIndex, i0) => {
          return common_vendor.e({
            a: field.name,
            b: common_vendor.o(($event) => field.name = $event.detail.value, fieldIndex),
            c: field.required,
            d: common_vendor.o((e) => updateFieldRequired(fieldIndex, e.detail.value), fieldIndex),
            e: "6672200b-1-" + i0,
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
                c: "6672200b-2-" + i0 + "-" + i1,
                d: common_vendor.o(($event) => deleteOption(fieldIndex, optionIndex), optionIndex),
                e: optionIndex
              };
            }),
            l: common_vendor.p({
              type: "close",
              size: "16",
              color: "#999"
            }),
            m: "6672200b-3-" + i0,
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
        y: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#999"
        }),
        z: fieldTypes,
        A: common_vendor.p({
          type: "plusempty",
          size: "24",
          color: "#b13b7a"
        }),
        B: common_vendor.o(addField),
        C: common_vendor.o(onCancel),
        D: common_vendor.o(onSubmit)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6672200b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/activity-form/activity-form.js.map
