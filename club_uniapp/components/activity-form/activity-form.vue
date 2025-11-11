<!-- components/activity-form/activity-form.vue -->
<template>
  <view class="activity-form">
    <view class="form-container">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <!-- 活动标题 -->
        <view class="form-item">
          <text class="form-label">活动标题</text>
          <input class="form-input" v-model="formData.title" placeholder="请输入活动标题" />
        </view>
        
        <!-- 活动地点 -->
        <view class="form-item">
          <text class="form-label">活动地点</text>
          <input class="form-input" v-model="formData.address" placeholder="请输入活动地点" />
        </view>
        
        <!-- 开始时间 -->
        <view class="form-item">
          <text class="form-label">开始时间</text>
          <view class="datetime-picker-row">
            <picker class="form-picker datetime-picker" mode="date" :value="formatDate(formData.startTime)" @change="onStartDateChange">
              <view>{{ formatDate(formData.startTime) }}</view>
            </picker>
            <picker class="form-picker datetime-picker" mode="time" :value="formatTime(formData.startTime)" @change="onStartTimeChange">
              <view>{{ formatTime(formData.startTime) }}</view>
            </picker>
          </view>
        </view>
        
        <!-- 结束时间 -->
        <view class="form-item">
          <text class="form-label">结束时间</text>
          <view class="datetime-picker-row">
            <picker class="form-picker datetime-picker" mode="date" :value="formatDate(formData.endTime)" @change="onEndDateChange">
              <view>{{ formatDate(formData.endTime) }}</view>
            </picker>
            <picker class="form-picker datetime-picker" mode="time" :value="formatTime(formData.endTime)" @change="onEndTimeChange">
              <view>{{ formatTime(formData.endTime) }}</view>
            </picker>
          </view>
        </view>
        
        <!-- 活动海报 -->
        <view class="form-item">
          <text class="form-label">活动海报</text>
          <view class="poster-upload" @tap="uploadPoster">
            <image v-if="formData.poster" class="poster-preview" :src="getPosterPreviewUrl(formData.poster)" mode="aspectFill"></image>
            <view v-else class="upload-placeholder">
              <uni-icons type="image" size="50" color="#999"></uni-icons>
              <text>点击上传海报</text>
            </view>
          </view>
        </view>
        
        <!-- 审核开关 -->
<!--        <view class="form-item">
          <view class="switch-container">
            <text class="form-label">需要审核</text>
            <switch :checked="formData.needApproval" @change="e => formData.needApproval = e.detail.value" color="#b13b7a" />
          </view>
        </view> -->
      </view>
      
      <!-- 活动详情 -->
      <view class="form-section">
        <view class="section-title">活动详情</view>
        <view class="form-item">
          <textarea class="form-textarea" v-model="formData.description" placeholder="请输入活动详情描述" />
        </view>
      </view>
      
      <!-- 报名表单设置 -->
      <view class="form-section">
        <view class="section-title">报名表单设置</view>
        
        <!-- 表单字段列表 -->
        <view class="form-fields">
          <view class="form-field-item" v-for="(field, fieldIndex) in formData.forms" :key="fieldIndex">
            <!-- 字段头部 -->
            <view class="field-header">
              <input class="field-name" v-model="field.name" placeholder="字段名称" />
              <view class="field-actions">
                <view class="required-switch">
                  <text>必填</text>
                  <switch :checked="field.required" @change="e => updateFieldRequired(fieldIndex, e.detail.value)" color="#b13b7a" />
                </view>
                <view class="delete-btn" @tap="deleteField(fieldIndex)">
                  <uni-icons type="trash" size="20" color="#999"></uni-icons>
                </view>
              </view>
            </view>
            
            <!-- 字段内容 -->
            <view class="field-content">
              <view class="field-type">
                <text>字段类型</text>
                <picker class="type-picker" :value="getFieldTypeIndex(field.type)" :range="fieldTypes" @change="e => updateFieldType(fieldIndex, e.detail.value)">
                  <view>{{ getFieldTypeName(field.type) }}</view>
                </picker>
              </view>
              
              <!-- 选项设置 -->
              <view class="field-options" v-if="field.type === 'radio' || field.type === 'checkbox'">
                <text class="options-label">选项设置</text>
                <view class="option-item" v-for="(option, optionIndex) in field.options" :key="optionIndex">
                  <input class="option-input" v-model="field.options[optionIndex]" placeholder="选项内容" />
                  <view class="delete-option" @tap="deleteOption(fieldIndex, optionIndex)">
                    <uni-icons type="close" size="16" color="#999"></uni-icons>
                  </view>
                </view>
                <view class="add-option" @tap="addOption(fieldIndex)">
                  <uni-icons type="plusempty" size="20" color="#b13b7a"></uni-icons>
                  <text>添加选项</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 添加字段按钮 -->
          <view class="add-field" @tap="addField">
            <uni-icons type="plusempty" size="24" color="#b13b7a"></uni-icons>
            <text>添加字段</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="form-actions">
      <button class="cancel-btn" @tap="onCancel">取消</button>
      <button class="submit-btn" @tap="onSubmit">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { getImageUrl } from '@/utils/common.js';

// 获取组件实例
const { proxy } = getCurrentInstance();

// 接收父组件传递的属性
const props = defineProps({
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
    default: ''
  }
});

// 向父组件发送事件
const emit = defineEmits(['cancel', 'submit']);

// 表单数据
const formData = reactive({
  title: '',
  address: '',
  startTime: Date.now(),
  endTime: Date.now() + 7200000, // 默认2小时后结束
  poster: '',
  description: '',
  needApproval: true,
  forms: []
});

// 字段类型选项
const fieldTypes = [
  '文本输入',
  '数字输入',
  '多行文本',
  '单选',
  '多选',
  '日期选择'
];

// 字段类型映射
const fieldTypeMap = {
  'text': 0,
  'number': 1,
  'textarea': 2,
  'radio': 3,
  'checkbox': 4,
  'date': 5
};

// 反向映射
const reverseFieldTypeMap = {
  0: 'text',
  1: 'number',
  2: 'textarea',
  3: 'radio',
  4: 'checkbox',
  5: 'date'
};

// 初始化
onMounted(() => {
  // 如果是编辑模式，加载活动数据
  if (props.isEdit && props.activityData) {
    initFormData();
  } else {
    // 新建模式，添加默认的表单字段
    addDefaultFields();
  }
});

// 监听props变化
watch(() => props.activityData, (newVal) => {
  if (newVal && props.isEdit) {
    initFormData();
  }
}, { deep: true });

// 初始化表单数据
const initFormData = () => {
  const data = props.activityData;
  
  // 复制基本信息
  formData.title = data.title || '';
  formData.address = data.address || '';
  formData.startTime = Number(data.startTime) || Date.now();
  formData.endTime = Number(data.endTime) || (Date.now() + 7200000);
  formData.poster = data.poster || '';
  formData.description = data.description || '';
  formData.needApproval = data.needApproval !== undefined ? data.needApproval : true;
  
  // 解析表单字段
  try {
    if (data.forms) {
      let forms;
      if (typeof data.forms === 'string') {
        forms = JSON.parse(data.forms);
      } else if (Array.isArray(data.forms)) {
        forms = data.forms;
      } else {
        forms = [data.forms];
      }
      
      formData.forms = forms.map(field => ({
        name: field.name || '未命名字段',
        type: field.type || 'text',
        required: field.required || false,
        options: field.options || []
      }));
    } else {
      addDefaultFields();
    }
  } catch (e) {
    console.error('解析表单字段失败:', e);
    addDefaultFields();
  }
};

// 添加默认字段
const addDefaultFields = () => {
  formData.forms = [
    {
      name: '参加原因',
      type: 'textarea',
      required: false,
      options: []
    }
  ];
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 开始日期变更
const onStartDateChange = (e) => {
  const dateStr = e.detail.value;
  const [year, month, day] = dateStr.split('-').map(Number);
  
  const currentDate = new Date(Number(formData.startTime));
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  
  const newDate = new Date(year, month - 1, day, hours, minutes);
  formData.startTime = newDate.getTime();
  
  // 如果开始时间大于结束时间，调整结束时间
  if (formData.startTime > formData.endTime) {
    formData.endTime = formData.startTime + 7200000; // 默认2小时后结束
  }
};

// 开始时间变更
const onStartTimeChange = (e) => {
  const timeStr = e.detail.value;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const currentDate = new Date(Number(formData.startTime));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  
  const newDate = new Date(year, month, day, hours, minutes);
  formData.startTime = newDate.getTime();
  
  // 如果开始时间大于结束时间，调整结束时间
  if (formData.startTime > formData.endTime) {
    formData.endTime = formData.startTime + 7200000; // 默认2小时后结束
  }
};

// 结束日期变更
const onEndDateChange = (e) => {
  const dateStr = e.detail.value;
  const [year, month, day] = dateStr.split('-').map(Number);
  
  const currentDate = new Date(Number(formData.endTime));
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  
  const newDate = new Date(year, month - 1, day, hours, minutes);
  formData.endTime = newDate.getTime();
  
  // 如果结束时间小于开始时间，调整开始时间
  if (formData.endTime < formData.startTime) {
    formData.startTime = formData.endTime - 7200000; // 默认提前2小时开始
  }
};

// 结束时间变更
const onEndTimeChange = (e) => {
  const timeStr = e.detail.value;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const currentDate = new Date(Number(formData.endTime));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  
  const newDate = new Date(year, month, day, hours, minutes);
  formData.endTime = newDate.getTime();
  
  // 如果结束时间小于开始时间，调整开始时间
  if (formData.endTime < formData.startTime) {
    formData.startTime = formData.endTime - 7200000; // 默认提前2小时开始
  }
};

// 上传海报
const uploadPoster = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      // 显示上传中
      uni.showLoading({
        title: '上传中...'
      });
      
      // 使用已有的upload方法上传图片
      proxy.$api.common.upload(tempFilePath).then(res => {
        if (res.code === 200 || res.code === 0) {
          // 成功上传，更新海报URL
          const imageUrl = res.data?.url || res.data;
          
          // 使用通用函数处理图片URL
          formData.poster = getImageUrl(imageUrl);
            
          // 强制刷新图片
          setTimeout(() => {
            // 触发视图更新
            formData.poster = formData.poster;
          }, 100);
          
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          });
        } else {
          // 服务器返回错误
          uni.showToast({
            title: res.message || res.msg || '上传失败',
            icon: 'none'
          });
          console.error('上传失败:', res);
        }
      }).catch(err => {
        // 请求失败
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none'
        });
        console.error('上传请求失败:', err);
      }).finally(() => {
        uni.hideLoading();
      });
    }
  });
};

// 获取海报预览URL
const getPosterPreviewUrl = (url) => {
  // 不添加时间戳，避免重复请求上传接口
  return getImageUrl(url, '/static/images/default-poster.png', false);
};

// 获取字段类型索引
const getFieldTypeIndex = (type) => {
  return fieldTypeMap[type] || 0;
};

// 获取字段类型名称
const getFieldTypeName = (type) => {
  const index = fieldTypeMap[type] || 0;
  return fieldTypes[index];
};

// 更新字段类型
const updateFieldType = (fieldIndex, typeIndex) => {
  const newType = reverseFieldTypeMap[typeIndex];
  formData.forms[fieldIndex].type = newType;
  
  // 如果切换到选择类型，但没有选项，添加默认选项
  if ((newType === 'radio' || newType === 'select' || newType === 'checkbox') && 
      (!formData.forms[fieldIndex].options || formData.forms[fieldIndex].options.length === 0)) {
    formData.forms[fieldIndex].options = ['选项1', '选项2'];
  }
};

// 更新字段必填状态
const updateFieldRequired = (fieldIndex, required) => {
  formData.forms[fieldIndex].required = required;
};

// 删除字段
const deleteField = (fieldIndex) => {
  uni.showModal({
    title: '删除字段',
    content: '确定要删除此表单字段吗？',
    success: (res) => {
      if (res.confirm) {
        formData.forms.splice(fieldIndex, 1);
      }
    }
  });
};

// 添加字段
const addField = () => {
  formData.forms.push({
    name: '新字段',
    type: 'text',
    required: false,
    options: []
  });
};

// 添加选项
const addOption = (fieldIndex) => {
  if (!formData.forms[fieldIndex].options) {
    formData.forms[fieldIndex].options = [];
  }
  formData.forms[fieldIndex].options.push(`选项${formData.forms[fieldIndex].options.length + 1}`);
};

// 删除选项
const deleteOption = (fieldIndex, optionIndex) => {
  if (formData.forms[fieldIndex].options.length <= 2) {
    uni.showToast({
      title: '至少保留两个选项',
      icon: 'none'
    });
    return;
  }
  formData.forms[fieldIndex].options.splice(optionIndex, 1);
};

// 取消
const onCancel = () => {
  emit('cancel');
};

// 提交
const onSubmit = () => {
  // 表单验证
  if (!formData.title) {
    uni.showToast({
      title: '请输入活动标题',
      icon: 'none'
    });
    return;
  }
  
  if (!formData.address) {
    uni.showToast({
      title: '请输入活动地点',
      icon: 'none'
    });
    return;
  }
  
  if (!formData.description) {
    uni.showToast({
      title: '请输入活动详情',
      icon: 'none'
    });
    return;
  }
  
  // 验证表单字段
  for (const field of formData.forms) {
    if (!field.name) {
      uni.showToast({
        title: '表单字段名称不能为空',
        icon: 'none'
      });
      return;
    }
    
    // 验证选择类型的字段必须有选项
    if ((field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') && 
        (!field.options || field.options.length < 2)) {
      uni.showToast({
        title: `${field.name}至少需要两个选项`,
        icon: 'none'
      });
      return;
    }
  }
  
  // 显示加载中
  uni.showLoading({
    title: '保存中...'
  });
  
  // 构建提交数据
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
  
  // 如果是编辑模式，添加ID
  if (props.isEdit && props.activityData.id) {
    submitData.id = props.activityData.id;
  }
  
  // 发送提交事件
  emit('submit', submitData);
  
  // 隐藏加载中
  setTimeout(() => {
    uni.hideLoading();
  }, 500);
};
</script>

<style lang="scss" scoped>
.activity-form {
  padding-bottom: 120rpx;
  
  .form-container {
    padding: 20rpx;
  }
  
  .form-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 30rpx;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
    }
  }
  
  .form-item {
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .form-input, .form-textarea {
      width: 100%;
      background: #f8f8f8;
      border-radius: 8rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
    
    .form-input {
      height: 80rpx;
      padding: 0 20rpx;
    }
    
    .form-textarea {
      height: 200rpx;
      padding: 20rpx;
    }
    
    .datetime-picker-row {
      display: flex;
      align-items: center;
    }
    
    .form-picker {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      padding: 0 20rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      
      &.datetime-picker {
        width: 48%;
        margin-right: 4%;
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
    
    .poster-upload {
      width: 100%;
      height: 360rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      .poster-preview {
        width: 100%;
        height: 100%;
      }
      
      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        text {
          font-size: 28rpx;
          color: #999;
          margin-top: 20rpx;
        }
      }
    }
  }
  
  .form-fields {
    margin-top: 30rpx;
    
    .form-field-item {
      background: #f8f8f8;
      border-radius: 8rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      
      .field-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;
        
        .field-name {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
        }
        
        .field-actions {
          display: flex;
          align-items: center;
          
          .required-switch {
            display: flex;
            align-items: center;
            margin-right: 20rpx;
            
            text {
              font-size: 24rpx;
              color: #666;
              margin-right: 10rpx;
            }
          }
          
          .delete-btn {
            padding: 10rpx;
          }
        }
      }
      
      .field-content {
        .field-type {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          
          text {
            font-size: 26rpx;
            color: #666;
          }
          
          .type-picker {
            flex: 1;
            height: 60rpx;
            line-height: 60rpx;
            padding: 0 20rpx;
            background: #fff;
            border-radius: 8rpx;
            font-size: 26rpx;
            margin-left: 10rpx;
          }
        }
        
        .field-options {
          margin-top: 20rpx;
          
          .options-label {
            font-size: 26rpx;
            color: #666;
            display: block;
            margin-bottom: 10rpx;
          }
          
          .option-item {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;
            
            .option-input {
              flex: 1;
              height: 60rpx;
              padding: 0 20rpx;
              background: #fff;
              border-radius: 8rpx;
              font-size: 26rpx;
            }
            
            .delete-option {
              padding: 10rpx;
              margin-left: 10rpx;
            }
          }
          
          .add-option {
            display: flex;
            align-items: center;
            padding: 10rpx 0;
            
            text {
              font-size: 26rpx;
              color: #b13b7a;
              margin-left: 10rpx;
            }
          }
        }
      }
    }
    
    .add-field {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      
      text {
        font-size: 28rpx;
        color: #b13b7a;
        margin-left: 10rpx;
      }
    }
  }
  
  .form-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
    display: flex;
    z-index: 999;
    
    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      margin: 0 10rpx;
      font-size: 28rpx;
      border: 1rpx solid transparent;
      z-index: 1000;
    }
    
    .cancel-btn {
      background-color: #f5f5f5 !important;
      color: #666 !important;
      border: 1rpx solid #ddd !important;
    }
    
    .submit-btn {
      background-color: #b13b7a !important;
      color: #fff !important;
      border: 1rpx solid #b13b7a !important;
    }
  }
}
</style>
