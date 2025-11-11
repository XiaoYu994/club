<template>
  <view class="notice-edit-container">
    <custom-nav-bar :title="isEdit ? '编辑公告' : '发布公告'" />
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading-box">
      <uni-icons type="spinner-cycle" size="32" color="#2979ff"></uni-icons>
      <text>加载中...</text>
    </view>
    
    <!-- 编辑表单 -->
    <view v-else class="notice-form">
      <uni-forms ref="form" :modelValue="formData" :rules="rules" labelWidth="80px">
        <!-- 标题 -->
        <uni-forms-item label="标题" name="title" required>
          <uni-easyinput
            v-model="formData.title"
            placeholder="请输入公告标题"
            maxlength="50"
            trim="both"
          />
        </uni-forms-item>
        
        <!-- 封面图 -->
        <uni-forms-item label="封面图" name="coverImage">
          <view class="upload-box">
            <view v-if="!formData.coverImage" class="upload-btn" @tap="chooseImage">
              <uni-icons type="image" size="32" color="#999"></uni-icons>
              <text>点击上传封面</text>
            </view>
            <view v-else class="image-preview">
              <image :src="formData.coverImage" mode="aspectFill" @tap="previewImage"></image>
              <view class="remove-btn" @tap.stop="removeImage">
                <uni-icons type="trash" size="20" color="#fff"></uni-icons>
              </view>
            </view>
          </view>
        </uni-forms-item>
        
        <!-- 内容 -->
        <uni-forms-item label="内容" name="content" required>
          <view class="editor-container">
            <textarea
              v-model="formData.content"
              class="content-textarea"
              placeholder="请输入公告内容"
              maxlength="10000"
              :style="{ height: editorHeight }"
            />
            <view class="character-count">
              {{ formData.content.length }}/10000
            </view>
          </view>
        </uni-forms-item>
        
        <!-- 公告类型 -->
        <uni-forms-item label="类型" name="type">
          <uni-data-select 
            v-model="formData.type" 
            :localdata="typeOptions"
            :clear="false"
            placeholder="请选择公告类型"
          />
        </uni-forms-item>
        
        <!-- 是否置顶 -->
        <uni-forms-item label="置顶" name="isTop">
          <switch 
            :checked="formData.isTop === 1" 
            @change="onTopChange"
            color="#2979ff"
          />
        </uni-forms-item>
      </uni-forms>
      
      <!-- 表单操作 -->
      <view class="form-actions">
        <button class="action-btn cancel-btn" @tap="goBack">取消</button>
        <button class="action-btn confirm-btn" :disabled="submitting" @tap="submitForm">
          {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '发布公告') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import apiModule from '@/api/api.js';

// 公告ID
const noticeId = ref(null);
// 是否是编辑模式
const isEdit = computed(() => !!noticeId.value);
// 加载状态
const loading = ref(false);
// 提交状态
const submitting = ref(false);
// 表单引用
const form = ref(null);
// 编辑器高度
const editorHeight = ref('300px');
// 表单数据
const formData = reactive({
  title: '',
  content: '',
  coverImage: '',
  type: 0,
  isTop: 0
});

// 公告类型选项
const typeOptions = ref([
  { value: 0, text: '普通公告' },
  { value: 1, text: '重要公告' },
  { value: 2, text: '紧急公告' }
]);

// 表单验证规则
const rules = {
  title: {
    rules: [
      { required: true, errorMessage: '请输入公告标题' },
      { minLength: 2, maxLength: 50, errorMessage: '标题长度应在2-50个字符之间' }
    ]
  },
  content: {
    rules: [
      { required: true, errorMessage: '请输入公告内容' },
      { minLength: 5, errorMessage: '内容不能少于5个字符' }
    ]
  }
};

// 添加onLoad生命周期钩子
onLoad((options) => {
  console.log('onLoad options:', options);
  if (options && options.id) {
    noticeId.value = options.id;
    console.log('Setting noticeId in onLoad to:', noticeId.value);
    // 加载公告详情
    loadNoticeDetail();
  }
});

// 页面加载
onMounted(() => {
  // 验证管理员登录状态
  const token = uni.getStorageSync('adminToken');
  if (!token) {
    uni.reLaunch({
      url: '/pages/admin/login'
    });
    return;
  }
  
  // 适配屏幕高度设置编辑器高度
  uni.getSystemInfo({
    success: (res) => {
      const windowHeight = res.windowHeight;
      // 设置编辑器高度为屏幕高度的40%
      editorHeight.value = windowHeight * 0.4 + 'px';
    }
  });
});

/**
 * @description 加载公告详情
 */
const loadNoticeDetail = async () => {
  loading.value = true;
  try {
    const response = await apiModule.admin.notice.getNoticeDetail(noticeId.value);
    console.log('Notice detail response:', response);
    
    if (response.code === 200 && response.data) {
      const detail = response.data;
      
      // 填充表单数据
      formData.title = detail.title || '';
      formData.content = detail.content || '';
      formData.coverImage = detail.coverImage || '';
      formData.type = detail.type || 0;
      formData.isTop = detail.isTop || 0;
      
    } else {
      uni.showToast({
        title: response.message || '获取公告详情失败',
        icon: 'none'
      });
      setTimeout(() => {
        goBack();
      }, 1500);
    }
  } catch (error) {
    console.error('获取公告详情失败:', error);
    uni.showToast({
      title: '获取公告详情失败，请重试',
      icon: 'none'
    });
    setTimeout(() => {
      goBack();
    }, 1500);
  } finally {
    loading.value = false;
  }
};

/**
 * @description 选择封面图片
 */
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 上传图片
      uploadImage(res.tempFilePaths[0]);
    }
  });
};

/**
 * @description 上传图片
 */
const uploadImage = async (filePath) => {
  uni.showLoading({
    title: '上传中...'
  });
  
  try {
    const res = await apiModule.common.upload(filePath);
    
    if (res && res.code === 200) {
      formData.coverImage = res.data;
      uni.hideLoading();
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      });
    } else {
      uni.hideLoading();
      uni.showToast({
        title: res?.message || '上传失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    });
  }
};

/**
 * @description 预览图片
 */
const previewImage = () => {
  if (formData.coverImage) {
    uni.previewImage({
      urls: [formData.coverImage],
      current: 0
    });
  }
};

/**
 * @description 移除图片
 */
const removeImage = () => {
  uni.showModal({
    title: '提示',
    content: '确定要移除封面图片吗？',
    success: (res) => {
      if (res.confirm) {
        formData.coverImage = '';
      }
    }
  });
};

/**
 * @description 提交表单
 */
const submitForm = () => {
  form.value.validate().then(async (res) => {
    if (res) {
      submitting.value = true;
      
      try {
        let response;
        
        // 编辑模式
        if (isEdit.value) {
          response = await apiModule.admin.notice.updateNotice(noticeId.value, formData);
        } 
        // 创建模式
        else {
          response = await apiModule.admin.notice.createNotice(formData);
        }
        
        if (response.code === 200) {
          uni.showToast({
            title: isEdit.value ? '修改成功' : '发布成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            goBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.message || (isEdit.value ? '修改失败' : '发布失败'),
            icon: 'none'
          });
        }
      } catch (error) {
        console.error(isEdit.value ? '修改公告失败:' : '发布公告失败:', error);
        uni.showToast({
          title: isEdit.value ? '修改失败，请重试' : '发布失败，请重试',
          icon: 'none'
        });
      } finally {
        submitting.value = false;
      }
    }
  });
};

/**
 * @description 处理置顶开关变化
 */
const onTopChange = (e) => {
  formData.isTop = e.detail.value ? 1 : 0;
};

/**
 * @description 返回上一页
 */
const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.notice-edit-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  
  text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.notice-form {
  padding: 30rpx;
  
  :deep(.uni-forms) {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 30rpx;
    
    .uni-forms-item {
      padding: 15rpx 0;
      
      .uni-forms-item__label {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
      
      .uni-easyinput,
      .uni-easyinput__content-input {
        height: 80rpx;
      }
      
      .uni-easyinput__content-input {
        font-size: 28rpx;
      }
    }
  }
  
  .upload-box {
    width: 100%;
    
    .upload-btn {
      width: 300rpx;
      height: 200rpx;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f9f9f9;
      
      text {
        margin-top: 15rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .image-preview {
      position: relative;
      width: 300rpx;
      height: 200rpx;
      border-radius: 8rpx;
      overflow: hidden;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .remove-btn {
        position: absolute;
        right: 10rpx;
        top: 10rpx;
        width: 50rpx;
        height: 50rpx;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 25rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  
  .editor-container {
    position: relative;
    width: 100%;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    
    .content-textarea {
      width: 100%;
      padding: 20rpx;
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      box-sizing: border-box;
    }
    
    .character-count {
      position: absolute;
      right: 20rpx;
      bottom: 10rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    padding: 0 30rpx;
    
    .action-btn {
      width: 45%;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 32rpx;
      border-radius: 40rpx;
      
      &.cancel-btn {
        color: #666;
        background-color: #f0f0f0;
        border: 1rpx solid #ddd;
      }
      
      &.confirm-btn {
        color: #fff;
        background-color: #2979ff;
        box-shadow: 0 4rpx 8rpx rgba(41, 121, 255, 0.2);
        
        &:active {
          transform: scale(0.98);
        }
        
        &:disabled {
          opacity: 0.6;
        }
      }
    }
  }
}
</style> 