<template>
  <view class="edit-container pageBg">
    <custom-nav-bar :title="isEdit ? '编辑招新配置' : '新建招新配置'" backButton @back="goBack"></custom-nav-bar>
    
    <view class="form-container">
      <uni-forms ref="form" :model="formData" :rules="rules" validateTrigger="bind" labelWidth="140rpx">
        <!-- 基本信息 -->
        <view class="form-section">
          <view class="section-title">基本信息</view>
          
          <uni-forms-item label="配置名称" name="name" required>
            <uni-easyinput v-model="formData.name" placeholder="请输入配置名称" />
          </uni-forms-item>
          
          <uni-forms-item label="学期" name="semester" required>
            <uni-easyinput v-model="formData.semester" placeholder="如: 2023-2024-1" />
          </uni-forms-item>
          
          <uni-forms-item label="招新状态" name="status">
            <view class="status-switch">
              <text class="status-text">{{ formData.status === 1 ? '启用' : '禁用' }}</text>
              <switch :checked="formData.status === 1" @change="onStatusChange" color="#2979ff" />
            </view>
          </uni-forms-item>
        </view>
        
        <!-- 招新时间 -->
        <view class="form-section">
          <view class="section-title">招新时间</view>
          
          <uni-forms-item label="开始日期" name="globalStartTime" required>
            <uni-datetime-picker 
              v-model="formData.globalStartTime" 
              type="date" 
              :clearIcon="false" 
              returnType="timestamp"
              @change="onStartDateChange"
            />
          </uni-forms-item>
          
          <uni-forms-item label="结束日期" name="globalEndTime" required>
            <uni-datetime-picker 
              v-model="formData.globalEndTime" 
              type="date" 
              :clearIcon="false" 
              returnType="timestamp"
              @change="onEndDateChange"
            />
          </uni-forms-item>
        </view>
        
        <!-- 社团类型配置 -->
        <!--
        <view class="form-section">
          <view class="section-title">社团类型配置 (JSON)</view>
          <uni-forms-item name="typeConfig">
            <view class="json-editor">
              <textarea 
                v-model="formData.typeConfig" 
                placeholder="输入社团类型配置的JSON数据" 
                :style="{height: editorHeight + 'px'}"
                @input="resizeEditor"
              />
            </view>
          </uni-forms-item>
        </view>
        -->
        
        <!-- 配置说明 -->
        <view class="form-section">
          <view class="section-title">配置说明</view>
          
          <uni-forms-item name="description">
            <view class="description-editor">
              <textarea 
                v-model="formData.description" 
                placeholder="输入配置说明" 
                :style="{height: descHeight + 'px'}"
                @input="resizeDesc"
              />
              <view class="character-count">{{ formData.description ? formData.description.length : 0 }}/200</view>
            </view>
          </uni-forms-item>
        </view>
      </uni-forms>
      
      <!-- 提交按钮 -->
      <view class="form-actions">
        <button class="action-btn cancel-btn" @tap="goBack" :disabled="submitting">取消</button>
        <button class="action-btn submit-btn" @tap="submitForm" :disabled="submitting">
          <uni-icons v-if="submitting" type="spinner-cycle" size="20" color="#fff"></uni-icons>
          <text>{{ submitting ? '提交中...' : '保存配置' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import apiModule from '@/api/api.js';

// 表单数据
const isEdit = ref(false);
const configId = ref(null);
const formData = reactive({
  name: '',
  semester: '',
  globalStartTime: Date.now(),
  globalEndTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 默认30天后
  status: 1, // 默认启用
  // typeConfig: '', // 移除typeConfig字段
  description: '',
  createUserId: null
});

// 状态和高度
const submitting = ref(false);
const editorHeight = ref(240);
const descHeight = ref(160);
const form = ref(null);

// 校验规则
const rules = {
  name: {
    rules: [
      { required: true, errorMessage: '请输入配置名称' },
      { maxLength: 50, errorMessage: '配置名称不能超过50个字符' }
    ]
  },
  semester: {
    rules: [
      { required: true, errorMessage: '请输入学期' },
      { maxLength: 20, errorMessage: '学期不能超过20个字符' }
    ]
  },
  globalStartTime: {
    rules: [
      { required: true, errorMessage: '请选择开始日期' }
    ]
  },
  globalEndTime: {
    rules: [
      { required: true, errorMessage: '请选择结束日期' },
      { 
        validateFunction: (rule, value, data, callback) => {
          if (value <= data.globalStartTime) {
            callback('结束日期必须晚于开始日期');
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
      { maxLength: 200, errorMessage: '配置说明不能超过200个字符' }
    ]
  }
};

// 调整文本区域高度
const resizeEditor = (e) => {
  const contentHeight = Math.max(e.detail.height, 240);
  editorHeight.value = contentHeight < 500 ? contentHeight : 500;
};

const resizeDesc = (e) => {
  const contentHeight = Math.max(e.detail.height, 160);
  descHeight.value = contentHeight < 300 ? contentHeight : 300;
};

// 状态切换
const onStatusChange = (e) => {
  formData.status = e.detail.value ? 1 : 0;
};

// 日期选择
const onStartDateChange = (timestamp) => {
  formData.globalStartTime = timestamp;
};

const onEndDateChange = (timestamp) => {
  formData.globalEndTime = timestamp;
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 提交表单
const submitForm = () => {
  form.value.validate().then(async (valid) => {
    if (valid) {
      submitting.value = true;
      
      // 获取当前管理员ID
      const adminInfo = uni.getStorageSync('adminInfo');
      if (adminInfo && adminInfo.id) {
        formData.createUserId = adminInfo.id;
      }
      
      // 处理JSON格式
      // if (formData.typeConfig && formData.typeConfig.trim()) { // 移除typeConfig处理
      //   try {
      //     // 确保是有效的JSON
      //     const parsedJson = JSON.parse(formData.typeConfig.trim());
      //     formData.typeConfig = JSON.stringify(parsedJson);
      //   } catch (e) {
      //     uni.showToast({
      //       title: 'JSON格式错误，请检查',
      //       icon: 'none'
      //     });
      //     submitting.value = false;
      //     return;
      //   }
      // }
      
      try {
        let response;
        
        if (isEdit.value) {
          // 更新配置
          const updateData = { ...formData, id: configId.value };
          response = await apiModule.admin.recruitment.updateConfig(updateData);
        } else {
          // 新建配置
          response = await apiModule.admin.recruitment.createConfig(formData);
        }
        
        if (response.code === 200) {
          uni.showToast({
            title: isEdit.value ? '更新成功' : '创建成功',
            icon: 'success'
          });
          
          // 延迟返回列表页面
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.message || '操作失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('提交配置失败:', error);
        uni.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none'
        });
      } finally {
        submitting.value = false;
      }
    }
  }).catch((errors) => {
    console.log('表单校验错误:', errors);
  });
};

// 加载配置详情
const loadConfigDetail = async (id) => {
  try {
    uni.showLoading({ title: '加载中...' });
    const response = await apiModule.admin.recruitment.getConfigDetail(id);
    
    if (response.code === 200 && response.data) {
      const data = response.data;
      
      // 填充表单
      Object.keys(formData).forEach(key => {
        if (data[key] !== undefined) {
          // if (key === 'typeConfig' && data[key]) { // 移除typeConfig处理
          //   try {
          //     // 格式化JSON以便于编辑
          //     const parsedJson = JSON.parse(data[key]);
          //     formData[key] = JSON.stringify(parsedJson, null, 2);
          //   } catch (e) {
          //     formData[key] = data[key];
          //   }
          // } else if (key === 'globalStartTime' || key === 'globalEndTime') {
          if (key === 'globalStartTime' || key === 'globalEndTime') {
            formData[key] = data[key] ? Number(data[key]) : '';
          } else {
            formData[key] = data[key];
          }
        }
      });
    } else {
      uni.showToast({
        title: response.message || '获取配置详情失败',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('获取配置详情失败:', error);
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } finally {
    uni.hideLoading();
  }
};

// 页面加载
onMounted(() => {
  // 获取参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 获取配置ID
  let id = null;
  
  // 兼容不同平台的参数获取方式
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
    // 新建配置，设置合理的默认值
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 设置默认学期（根据当前月份判断）
    if (month >= 9) {
      // 秋季学期
      formData.semester = `${year}-${year+1}-1`;
    } else if (month >= 2) {
      // 春季学期
      formData.semester = `${year-1}-${year}-2`;
    } else {
      // 寒假期间
      formData.semester = `${year-1}-${year}-2`;
    }
    
    // 不再设置typeConfig默认值
  }
});
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  padding-bottom: 50rpx;
}

.form-container {
  padding: 30rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #2979ff;
    margin-bottom: 30rpx;
    border-left: 6rpx solid #2979ff;
    padding-left: 16rpx;
  }
}

.status-switch {
  display: flex;
  align-items: center;
  
  .status-text {
    margin-right: 20rpx;
    color: #333;
    font-size: 28rpx;
  }
}

.json-editor, .description-editor {
  width: 100%;
  position: relative;
  
  textarea {
    width: 100%;
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 1.6;
    background-color: #f8faff;
    border: 1px solid #e0e0e0;
    border-radius: 8rpx;
    color: #333;
  }
}

.description-editor {
  width: 100%;
  position: relative;
  margin: 0;
  padding: 0;
  background: none;

  textarea {
    width: 100%;
    min-height: 100px;
    max-height: 200px;
    padding: 12rpx 20rpx;
    font-size: 28rpx;
    line-height: 1.5;
    background-color: #f8faff;
    border: 1px solid #e0e0e0;
    border-radius: 8rpx;
    color: #333;
    box-sizing: border-box;
    resize: vertical;
  }
}

.character-count {
  position: absolute;
  right: 20rpx;
  bottom: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 30rpx;
  margin-top: 50rpx;
  padding: 0 30rpx;
  
  .action-btn {
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    width: 240rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .uni-icons {
      margin-right: 10rpx;
      animation: spin 1s infinite linear;
    }
    
    &.cancel-btn {
      background-color: #f0f0f0;
      color: #666;
      
      &:after {
        border: none;
      }
    }
    
    &.submit-btn {
      background-color: #2979ff;
      color: #fff;
      
      &:after {
        border: none;
      }
      
      &:disabled {
        opacity: 0.6;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 