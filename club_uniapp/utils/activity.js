/**
 * activity.js - 活动相关工具函数
 */

/**
 * 获取活动实际状态
 * @param {Object} activity - 活动对象
 * @returns {number} - 活动状态码：0-已取消，1-报名中，2-进行中，3-已结束，-1-未知
 */
export function getActualStatus(activity) {
  if (!activity) return -1;
  
  const now = Date.now();
  const startTime = Number(activity.startTime || 0);
  const endTime = Number(activity.endTime || 0);
  
  if (activity.status === 0) {
    return 0; // 已取消
  } else if (now > endTime) {
    return 3; // 已结束
  } else if (now >= startTime && now <= endTime) {
    return 2; // 进行中
  } else {
    return 1; // 报名中
  }
}

/**
 * 获取状态文本
 * @param {Object} activity - 活动对象
 * @returns {string} - 状态文本
 */
export function getStatusText(activity) {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0: return '已取消';
    case 1: return '报名中';
    case 2: return '进行中';
    case 3: return '已结束';
    default: return '未知';
  }
}

/**
 * 获取状态类名
 * @param {Object} activity - 活动对象
 * @returns {string} - 状态类名
 */
export function getStatusClass(activity) {
  const actualStatus = getActualStatus(activity);
  switch (actualStatus) {
    case 0: return 'cancelled';
    case 1: return 'planned';
    case 2: return 'ongoing';
    case 3: return 'ended';
    default: return '';
  }
}

/**
 * 获取报名状态文本
 * @param {number} status - 报名状态码
 * @returns {string} - 报名状态文本
 */
export function getApplyStatusText(status) {
  switch (status) {
    case 0: return '审核中';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
}

/**
 * 获取报名状态类名
 * @param {number} status - 报名状态码
 * @returns {string} - 报名状态类名
 */
export function getApplyStatusClass(status) {
  switch (status) {
    case 0: return 'pending';
    case 1: return 'approved';
    case 2: return 'rejected';
    default: return '';
  }
}

/**
 * 检查用户信息是否完整
 * @param {Object} userInfo - 用户信息对象
 * @returns {Object} - 包含isComplete和missingFields两个属性
 */
export function checkUserInfoComplete(userInfo) {
  // 检查必要的用户信息字段是否存在且不为空
  const requiredFields = ['username', 'studentId', 'mobile', 'college', 'className'];
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

/**
 * 获取字段显示名称
 * @param {string} field - 字段名
 * @returns {string} - 字段显示名称
 */
export function getFieldDisplayName(field) {
  const nameMap = {
    username: '姓名',
    studentId: '学号',
    mobile: '手机号',
    college: '学院',
    className: '班级',
    major: '专业',
    reason: '参加原因'
  };
  return nameMap[field] || field;
}

/**
 * 解析表单字段
 * @param {string|Object} formConfig - 表单配置
 * @returns {Array} - 解析后的表单字段数组
 */
export function parseFormFields(formConfig) {
  try {
    if (!formConfig) {
      // 使用默认表单
      return [{ 
        key: "reason", 
        label: "参加原因", 
        type: "textarea", 
        required: false, 
        value: "" 
      }];
    }
    
    let parsedConfig;
    
    // 如果已经是对象，不需要再解析
    if (typeof formConfig === 'object') {
      parsedConfig = formConfig;
    } else {
      parsedConfig = JSON.parse(formConfig);
    }
    
    // 确保是数组
    if (!Array.isArray(parsedConfig)) {
      parsedConfig = [parsedConfig];
    }
    
    // 转换为标准格式
    return parsedConfig.map(field => {
      return {
        key: field.name.toLowerCase().replace(/\s/g, '_'),
        label: field.name,
        type: field.type || 'text',
        required: field.required || false,
        value: '',
        options: field.options || []
      };
    });
  } catch (e) {
    console.error('解析表单字段失败:', e);
    // 解析失败时使用默认表单
    return [{ 
      key: "reason", 
      label: "参加原因", 
      type: "textarea", 
      required: false, 
      value: "" 
    }];
  }
}

/**
 * 解析表单数据
 * @param {string|Object} forms - 表单数据
 * @returns {Object} - 解析后的表单数据对象
 */
export function parseFormData(forms) {
  try {
    if (!forms) return {};
    
    if (typeof forms === 'string') {
      return JSON.parse(forms);
    }
    
    if (typeof forms === 'object') {
      return forms;
    }
    
    return {};
  } catch (e) {
    console.error('解析表单数据失败:', e);
    return {};
  }
}

/**
 * 填充用户信息到表单
 * @param {Array} formFields - 表单字段数组
 * @param {Object} userInfo - 用户信息
 * @returns {Array} - 填充后的表单字段数组
 */
export function fillUserInfoToForm(formFields, userInfo) {
  if (!formFields || !Array.isArray(formFields) || !userInfo) {
    return formFields;
  }
  
  // 用户信息字段映射
  const userFieldMap = {
    'username': ['姓名', '名字', '用户名'],
    'studentId': ['学号', '学生编号', '学生ID'],
    'mobile': ['手机号', '电话', '联系方式', '手机'],
    'college': ['学院', '院系'],
    'className': ['班级', '班组'],
    'major': ['专业', '学科']
  };
  
  return formFields.map(field => {
    // 检查字段是否应该填充用户信息
    for (const [userField, labels] of Object.entries(userFieldMap)) {
      // 如果字段键名匹配或字段标签匹配
      if (field.key === userField || labels.includes(field.label)) {
        field.value = userInfo[userField] || '';
        break;
      }
    }
    return field;
  });
}

/**
 * 验证表单数据
 * @param {Array} formFields - 表单字段数组
 * @returns {Object} - 包含isValid和errorMessage两个属性
 */
export function validateFormData(formFields) {
  if (!formFields || !Array.isArray(formFields)) {
    return { isValid: false, errorMessage: '表单数据无效' };
  }
  
  for (const field of formFields) {
    // 检查必填字段是否有值
    if (field.required) {
      // 对于checkbox类型，需要特殊处理
      if (field.type === 'checkbox') {
        // 如果值是字符串（逗号分隔的选项），检查是否为空
        if (typeof field.value === 'string') {
          if (!field.value) {
            return { 
              isValid: false, 
              errorMessage: `请至少选择一个${field.label}选项` 
            };
          }
        } 
        // 如果值是数组，检查是否为空数组
        else if (Array.isArray(field.value)) {
          if (field.value.length === 0) {
            return { 
              isValid: false, 
              errorMessage: `请至少选择一个${field.label}选项` 
            };
          }
        }
        // 如果值既不是字符串也不是数组，则认为是无效值
        else if (!field.value) {
          return { 
            isValid: false, 
            errorMessage: `请至少选择一个${field.label}选项` 
          };
        }
      } 
      // 其他类型字段的检查
      else if (!field.value) {
        return { 
          isValid: false, 
          errorMessage: `请填写${field.label}` 
        };
      }
    }
  }
  
  return { isValid: true, errorMessage: '' };
}

/**
 * 格式化日期时间
 * @param {number|string|Date} timestamp - 时间戳或日期对象
 * @param {string} format - 格式化模式，默认为'YYYY-MM-DD HH:mm'
 * @returns {string} - 格式化后的日期时间字符串
 */
export function formatDateTime(timestamp, format = 'YYYY-MM-DD HH:mm') {
  if (!timestamp) return '';
  
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(Number(timestamp));
  }
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 构建表单提交数据
 * @param {Array} formFields - 表单字段数组
 * @returns {Object} - 构建后的表单数据对象
 */
export function buildFormData(formFields) {
  if (!formFields || !Array.isArray(formFields)) {
    return {};
  }
  
  const formData = {};
  
  formFields.forEach(field => {
    formData[field.key] = field.value;
  });
  
  return formData;
}

/**
 * 检查用户是否已报名活动
 * @param {Object} applyInfo - 报名信息对象
 * @returns {boolean} - 是否已报名
 */
export function hasApplied(applyInfo) {
  return !!applyInfo && (applyInfo.status === 0 || applyInfo.status === 1);
}

/**
 * 获取报名按钮文本
 * @param {Object} activity - 活动对象
 * @param {Object} applyInfo - 报名信息对象
 * @returns {string} - 按钮文本
 */
export function getApplyButtonText(activity, applyInfo) {
  const actualStatus = getActualStatus(activity);
  
  if (actualStatus === 0) {
    return '活动已取消';
  } else if (actualStatus === 3) {
    return '活动已结束';
  } else if (hasApplied(applyInfo)) {
    if (applyInfo.status === 0) {
      return '审核中';
    } else {
      return '已报名';
    }
  } else if (applyInfo && applyInfo.status === 2) {
    return '报名被拒绝';
  } else {
    return '立即报名';
  }
}

/**
 * 获取报名按钮状态
 * @param {Object} activity - 活动对象
 * @param {Object} applyInfo - 报名信息对象
 * @returns {boolean} - 按钮是否禁用
 */
export function isApplyButtonDisabled(activity, applyInfo) {
  const actualStatus = getActualStatus(activity);
  
  if (actualStatus === 0 || actualStatus === 3) {
    return true;
  } else if (hasApplied(applyInfo)) {
    return true;
  } else if (applyInfo && applyInfo.status === 2) {
    return true;
  } else {
    return false;
  }
} 

/**
 * 通知活动数据已变更
 * 在活动创建、编辑、删除等操作后调用，通知相关页面刷新数据
 */
export function notifyActivityDataChanged() {
  uni.$emit('activityDataChanged', true);
}

/**
 * 监听活动数据变更事件
 * @param {Function} callback - 数据变更时的回调函数
 * @returns {Function} - 用于移除监听的函数
 */
export function listenActivityDataChanged(callback) {
  uni.$on('activityDataChanged', callback);
  
  // 返回一个函数，用于移除监听
  return () => {
    uni.$off('activityDataChanged', callback);
  };
} 