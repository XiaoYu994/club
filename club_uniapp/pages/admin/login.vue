<template>
  <view class="login-container pageBg">
    <view class="login-header">
      <image class="login-logo" src="/static/images/logo.png" mode="aspectFit"></image>
      <text class="login-title">管理员登录</text>
    </view>
    
    <view class="login-form">
      <view class="input-group">
        <uni-icons type="person" size="20" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="username" 
          placeholder="请输入管理员账号" 
          class="input"
        />
      </view>
      
      <view class="input-group">
        <uni-icons type="locked" size="20" color="#999"></uni-icons>
        <input 
          type="password" 
          v-model="password" 
          placeholder="请输入管理员密码" 
          password 
          class="input"
        />
      </view>
      
      <button 
        class="login-button" 
        :disabled="!username || !password" 
        :class="{'button-disabled': !username || !password}"
        @tap="handleLogin"
      >
        登录
      </button>
    </view>
    
    <view class="login-footer">
      <text>© 2025 校园社团管理系统</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import apiModule from '@/api/api.js';

// 登录表单数据
const username = ref('');
const password = ref('');

/**
 * @description 管理员登录
 */
const handleLogin = async () => {
  if (!username.value || !password.value) {
    uni.showToast({
      title: '账号密码不能为空',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({ title: '登录中...' });
    
    const response = await apiModule.admin.login({
      username: username.value,
      password: password.value
    });
    
    if (response.code === 200) {
      // 存储管理员token和信息
      uni.setStorageSync('adminToken', response.data.token);
      uni.setStorageSync('adminInfo', response.data);
      
      // 跳转到管理员首页
      uni.reLaunch({
        url: '/pages/admin/index'
      });
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: response.message || '登录失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    // request.js已经显示了错误提示，这里不需要再显示
    // 只需要确保loading被关闭即可
  } finally {
    uni.hideLoading();
  }
};

onLoad(() => {
  // 检查是否已登录
  const token = uni.getStorageSync('adminToken');
  if (token) {
    uni.reLaunch({
      url: '/pages/admin/index'
    });
  }
});
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  
  .login-logo {
    width: 150rpx;
    height: 150rpx;
    margin-bottom: 30rpx;
  }
  
  .login-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.login-form {
  padding: 0 50rpx;
  
  .input-group {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 8rpx;
    padding: 24rpx 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .input {
      flex: 1;
      height: 40rpx;
      margin-left: 20rpx;
      font-size: 28rpx;
    }
  }
  
  .login-button {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background-color: #2979ff;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
    margin-top: 50rpx;
    box-shadow: 0 2rpx 10rpx rgba(41, 121, 255, 0.2);
    
    &.button-disabled {
      background-color: #cccccc;
      box-shadow: none;
    }
  }
}

.login-footer {
  margin-top: auto;
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style> 