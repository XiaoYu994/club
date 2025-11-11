"use strict";
const common_vendor = require("../common/vendor.js");
function getActualStatus(activity) {
  if (!activity)
    return -1;
  const now = Date.now();
  const startTime = Number(activity.startTime || 0);
  const endTime = Number(activity.endTime || 0);
  if (activity.status === 0) {
    return 0;
  } else if (now > endTime) {
    return 3;
  } else if (now >= startTime && now <= endTime) {
    return 2;
  } else {
    return 1;
  }
}
function getStatusText(activity) {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0:
      return "已取消";
    case 1:
      return "报名中";
    case 2:
      return "进行中";
    case 3:
      return "已结束";
    default:
      return "未知";
  }
}
function getStatusClass(activity) {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0:
      return "cancelled";
    case 1:
      return "planned";
    case 2:
      return "ongoing";
    case 3:
      return "ended";
    default:
      return "";
  }
}
function getApplyStatusText(status) {
  switch (status) {
    case 0:
      return "审核中";
    case 1:
      return "已通过";
    case 2:
      return "已拒绝";
    default:
      return "未知";
  }
}
function getApplyStatusClass(status) {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "approved";
    case 2:
      return "rejected";
    default:
      return "";
  }
}
function checkUserInfoComplete(userInfo) {
  const requiredFields = ["username", "studentId", "mobile", "college", "className"];
  const missingFields = [];
  for (const field of requiredFields) {
    if (!userInfo[field]) {
      missingFields.push(getFieldDisplayName(field));
    }
  }
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}
function getFieldDisplayName(field) {
  const nameMap = {
    username: "姓名",
    studentId: "学号",
    mobile: "手机号",
    college: "学院",
    className: "班级",
    major: "专业",
    reason: "参加原因"
  };
  return nameMap[field] || field;
}
function parseFormFields(formConfig) {
  try {
    if (!formConfig) {
      return [{
        key: "reason",
        label: "参加原因",
        type: "textarea",
        required: false,
        value: ""
      }];
    }
    let parsedConfig;
    if (typeof formConfig === "object") {
      parsedConfig = formConfig;
    } else {
      parsedConfig = JSON.parse(formConfig);
    }
    if (!Array.isArray(parsedConfig)) {
      parsedConfig = [parsedConfig];
    }
    return parsedConfig.map((field) => {
      return {
        key: field.name.toLowerCase().replace(/\s/g, "_"),
        label: field.name,
        type: field.type || "text",
        required: field.required || false,
        value: "",
        options: field.options || []
      };
    });
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/activity.js:172", "解析表单字段失败:", e);
    return [{
      key: "reason",
      label: "参加原因",
      type: "textarea",
      required: false,
      value: ""
    }];
  }
}
function parseFormData(forms) {
  try {
    if (!forms)
      return {};
    if (typeof forms === "string") {
      return JSON.parse(forms);
    }
    if (typeof forms === "object") {
      return forms;
    }
    return {};
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/activity.js:203", "解析表单数据失败:", e);
    return {};
  }
}
function fillUserInfoToForm(formFields, userInfo) {
  if (!formFields || !Array.isArray(formFields) || !userInfo) {
    return formFields;
  }
  const userFieldMap = {
    "username": ["姓名", "名字", "用户名"],
    "studentId": ["学号", "学生编号", "学生ID"],
    "mobile": ["手机号", "电话", "联系方式", "手机"],
    "college": ["学院", "院系"],
    "className": ["班级", "班组"],
    "major": ["专业", "学科"]
  };
  return formFields.map((field) => {
    for (const [userField, labels] of Object.entries(userFieldMap)) {
      if (field.key === userField || labels.includes(field.label)) {
        field.value = userInfo[userField] || "";
        break;
      }
    }
    return field;
  });
}
function validateFormData(formFields) {
  if (!formFields || !Array.isArray(formFields)) {
    return { isValid: false, errorMessage: "表单数据无效" };
  }
  for (const field of formFields) {
    if (field.required) {
      if (field.type === "checkbox") {
        if (typeof field.value === "string") {
          if (!field.value) {
            return {
              isValid: false,
              errorMessage: `请至少选择一个${field.label}选项`
            };
          }
        } else if (Array.isArray(field.value)) {
          if (field.value.length === 0) {
            return {
              isValid: false,
              errorMessage: `请至少选择一个${field.label}选项`
            };
          }
        } else if (!field.value) {
          return {
            isValid: false,
            errorMessage: `请至少选择一个${field.label}选项`
          };
        }
      } else if (!field.value) {
        return {
          isValid: false,
          errorMessage: `请填写${field.label}`
        };
      }
    }
  }
  return { isValid: true, errorMessage: "" };
}
function buildFormData(formFields) {
  if (!formFields || !Array.isArray(formFields)) {
    return {};
  }
  const formData = {};
  formFields.forEach((field) => {
    formData[field.key] = field.value;
  });
  return formData;
}
function notifyActivityDataChanged() {
  common_vendor.index.$emit("activityDataChanged", true);
}
function listenActivityDataChanged(callback) {
  common_vendor.index.$on("activityDataChanged", callback);
  return () => {
    common_vendor.index.$off("activityDataChanged", callback);
  };
}
exports.buildFormData = buildFormData;
exports.checkUserInfoComplete = checkUserInfoComplete;
exports.fillUserInfoToForm = fillUserInfoToForm;
exports.getActualStatus = getActualStatus;
exports.getApplyStatusClass = getApplyStatusClass;
exports.getApplyStatusText = getApplyStatusText;
exports.getFieldDisplayName = getFieldDisplayName;
exports.getStatusClass = getStatusClass;
exports.getStatusText = getStatusText;
exports.listenActivityDataChanged = listenActivityDataChanged;
exports.notifyActivityDataChanged = notifyActivityDataChanged;
exports.parseFormData = parseFormData;
exports.parseFormFields = parseFormFields;
exports.validateFormData = validateFormData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/activity.js.map
