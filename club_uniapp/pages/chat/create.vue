<template>
  <view class="create-chat-container pageBg">
    <!-- 顶部导航 -->
    <!-- #ifndef MP-TOUTIAO -->
    <custom-nav-bar title="创建群聊" :showBack="true"></custom-nav-bar>
    <!-- #endif -->
    
    <!-- 创建表单 -->
    <view class="form-container">
      <view class="form-item">
        <text class="label">群组名称</text>
        <input 
          class="input"
          v-model="formData.name"
          placeholder="请输入群组名称"
          maxlength="30"
        />
      </view>
      
      <view class="form-item">
        <text class="label">群组简介</text>
        <textarea
          class="textarea"
          v-model="formData.description"
          placeholder="请输入群组简介"
          maxlength="200"
        ></textarea>
      </view>
      
      <view class="form-item">
        <text class="label">群组头像</text>
        <view class="avatar-uploader" @tap="chooseAvatar">
          <image 
            v-if="formData.avatar" 
            :src="formData.avatar" 
            class="avatar-preview" 
            mode="aspectFill"
          ></image>
          <view v-else class="upload-placeholder">
            <uni-icons type="camera" size="24" color="#999"></uni-icons>
            <text>上传头像</text>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">关联社团</text>
        <view class="club-selector" @tap="showClubSelector">
          <text v-if="selectedClub.name">{{ selectedClub.name }}</text>
          <text v-else class="placeholder">请选择关联社团</text>
          <uni-icons type="arrowright" size="18" color="#999"></uni-icons>
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">群组类型</text>
        <picker 
          @change="onTypeChange" 
          :value="typeIndex" 
          :range="groupTypes"
          range-key="name"
        >
          <view class="picker">
            <text>{{ groupTypes[typeIndex].name }}</text>
            <uni-icons type="arrowright" size="18" color="#999"></uni-icons>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <view class="switch-item">
          <text>是否允许非社团成员加入</text>
          <switch 
            :checked="formData.allowNonMembers" 
            @change="onSwitchChange" 
            color="#2979ff"
          />
        </view>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-btn" @tap="submitForm" :class="{ 'disabled': !isFormValid }">
      创建群组
    </view>
    
    <!-- 社团选择弹窗 -->
    <uni-popup ref="clubSelectorPopup" type="bottom">
      <view class="club-popup">
        <view class="popup-header">
          <text>选择关联社团</text>
          <uni-icons type="closeempty" size="24" color="#999" @click="closeClubSelector"></uni-icons>
        </view>
        <scroll-view class="club-list" scroll-y>
          <view 
            v-for="club in clubList" 
            :key="club.id" 
            class="club-item" 
            @tap="selectClub(club)"
          >
            <image :src="club.logo || '/static/img/club-default.png'" class="club-logo" mode="aspectFill"></image>
            <view class="club-info">
              <text class="club-name">{{ club.name }}</text>
              <text class="club-members">{{ club.memberCount }}名成员</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { chatAPI } from '@/api/api.js';
import { clubAPI } from '@/api/api.js';
import { getToken } from '@/utils/auth.js';

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  avatar: '',
  clubId: null,
  type: 0, // 0-公共群 1-部门群 2-管理员群
  allowNonMembers: false
});

// 群组类型
const groupTypes = [
  { id: 0, name: '公共群' },
  { id: 1, name: '部门群' },
  { id: 2, name: '管理员群' }
];
const typeIndex = ref(0);

// 关联社团
const selectedClub = reactive({
  id: null,
  name: ''
});
const clubList = ref([]);
const clubSelectorPopup = ref(null);

// 表单验证
const isFormValid = computed(() => {
  return formData.name.trim() !== '' && selectedClub.id !== null;
});

// 初始化
onLoad(async () => {
  // 获取用户的社团列表
  await loadUserClubs();
});

// 加载用户的社团
const loadUserClubs = async () => {
  try {
    const response = await clubAPI.getUserClubs();
    if (response.code === 1) {
      clubList.value = response.data || [];
      
      // 如果只有一个社团，自动选择
      if (clubList.value.length === 1) {
        selectClub(clubList.value[0]);
      }
    }
  } catch (error) {
    console.error('获取社团列表失败:', error);
    uni.showToast({
      title: '获取社团列表失败',
      icon: 'none'
    });
  }
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      // 上传头像
      uploadAvatar(tempFilePath);
    }
  });
};

// 上传头像
const uploadAvatar = (filePath) => {
  uni.showLoading({
    title: '上传中...'
  });
  
  uni.uploadFile({
    url: '/api/user/upload/image', // 图片上传API
    filePath: filePath,
    name: 'file',
    header: {
      'token': getToken()
    },
    success: (uploadRes) => {
      try {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 1 && data.data) {
          formData.avatar = data.data.url;
        } else {
          uni.showToast({
            title: data.msg || '上传失败',
            icon: 'none'
          });
        }
      } catch (e) {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

// 显示社团选择器
const showClubSelector = () => {
  clubSelectorPopup.value.open('bottom');
};

// 关闭社团选择器
const closeClubSelector = () => {
  clubSelectorPopup.value.close();
};

// 选择社团
const selectClub = (club) => {
  selectedClub.id = club.id;
  selectedClub.name = club.name;
  formData.clubId = club.id;
  closeClubSelector();
};

// 群组类型选择
const onTypeChange = (e) => {
  typeIndex.value = e.detail.value;
  formData.type = groupTypes[typeIndex.value].id;
};

// 切换开关
const onSwitchChange = (e) => {
  formData.allowNonMembers = e.detail.value;
};

// 提交表单
const submitForm = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '创建中...'
  });
  
  try {
    const response = await chatAPI.createChatGroup(formData);
    if (response.code === 1) {
      uni.showToast({
        title: '群组创建成功',
        icon: 'success'
      });
      
      // 创建成功后跳转到聊天室
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/chat/room?id=${response.data.id}&name=${encodeURIComponent(response.data.name)}`
        });
      }, 1500);
    } else {
      uni.showToast({
        title: response.msg || '创建失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('创建群组失败:', error);
    uni.showToast({
      title: '创建群组失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style lang="scss" scoped>
.create-chat-container {
  min-height: 100vh;
  padding-bottom: 100rpx;
  
  .form-container {
    background: #fff;
    border-radius: 16rpx;
    margin: 20rpx;
    padding: 0 30rpx;
    
    .form-item {
      padding: 30rpx 0;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      .input, .textarea {
        width: 100%;
        font-size: 28rpx;
        color: #333;
      }
      
      .textarea {
        min-height: 160rpx;
        line-height: 1.5;
      }
      
      .avatar-uploader {
        width: 160rpx;
        height: 160rpx;
        border: 1px dashed #ddd;
        border-radius: 10rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        .avatar-preview {
          width: 160rpx;
          height: 160rpx;
          border-radius: 10rpx;
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          
          text {
            font-size: 24rpx;
            color: #999;
            margin-top: 10rpx;
          }
        }
      }
      
      .club-selector, .picker {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80rpx;
        padding: 0 20rpx;
        background: #f9f9f9;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333;
        
        .placeholder {
          color: #999;
        }
      }
      
      .switch-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
  
  .submit-btn {
    position: fixed;
    bottom: 40rpx;
    left: 40rpx;
    right: 40rpx;
    height: 90rpx;
    line-height: 90rpx;
    background: #2979ff;
    color: #fff;
    text-align: center;
    border-radius: 45rpx;
    font-size: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.3);
    
    &.disabled {
      background: #ccc;
      box-shadow: none;
    }
  }
  
  .club-popup {
    background: #fff;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    overflow: hidden;
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid #f5f5f5;
      
      text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }
    
    .club-list {
      max-height: 700rpx;
      
      .club-item {
        display: flex;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1px solid #f5f5f5;
        
        .club-logo {
          width: 80rpx;
          height: 80rpx;
          border-radius: 8rpx;
          margin-right: 20rpx;
        }
        
        .club-info {
          flex: 1;
          
          .club-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .club-members {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}
</style> 