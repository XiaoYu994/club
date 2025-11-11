<template>
  <view class="admin-password pageBg">
    <custom-nav-bar title="修改密码" />
    
    <view class="password-form">
      <view class="form-item">
        <text class="form-label">旧密码</text>
        <input class="form-input" type="safe-password" password v-model="form.oldPassword" placeholder="请输入旧密码" />
      </view>
      
      <view class="form-item">
        <text class="form-label">新密码</text>
        <input class="form-input" type="safe-password" password v-model="form.newPassword" placeholder="请输入新密码" />
      </view>
      
      <view class="form-item">
        <text class="form-label">确认新密码</text>
        <input class="form-input" type="safe-password" password v-model="confirmPassword" placeholder="请再次输入新密码" />
      </view>
      
      <button class="submit-btn" @tap="updatePassword">保存修改</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: ''
})

// 确认密码
const confirmPassword = ref('')

// 更新密码
async function updatePassword() {
  try {
    // 表单验证
    if (!form.oldPassword) {
      uni.showToast({
        title: '请输入旧密码',
        icon: 'none'
      })
      return
    }
    
    if (!form.newPassword) {
      uni.showToast({
        title: '请输入新密码',
        icon: 'none'
      })
      return
    }
    
    if (form.newPassword.length < 6) {
      uni.showToast({
        title: '新密码长度不能小于6位',
        icon: 'none'
      })
      return
    }
    
    if (form.newPassword !== confirmPassword.value) {
      uni.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      })
      return
    }
    
    // 调用API
    const res = await proxy.$api.admin.updatePassword(form)
    
    if (res.code === 200) {
      uni.showToast({
        title: '密码修改成功',
        icon: 'success'
      })
      
      // 清空表单
      form.oldPassword = ''
      form.newPassword = ''
      confirmPassword.value = ''
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '密码修改失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('密码修改失败', error)
    uni.showToast({
      title: '密码修改失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.password-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 180rpx 30rpx 30rpx;
}

.password-form {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .form-item {
    margin-bottom: 30rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .form-input {
      width: 100%;
      height: 80rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #2979ff;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    margin-top: 40rpx;
  }
}
</style> 