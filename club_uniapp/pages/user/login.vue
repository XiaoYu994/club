<template>
  <view class="login-page">
    <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
    <view class="title">校园社团管理小程序</view>
    <view class="login-tip">登录后使用更多功能</view>
    
    <view class="login-btns">
      <button class="wechat-login-btn" @tap="showLoginModal" open-type="getUserInfo">
        <image src="/static/images/wechat-icon.png" mode="aspectFit"></image>
        一键登录
      </button>
      <button class="phone-login-btn" @tap="phoneLogin">手机号登录</button>
    </view>
    
    <view class="agreement">
      <checkbox :checked="agreeProtocol" @tap="agreeProtocol = !agreeProtocol" />
      <text>同意《服务协议》、《隐私协议》</text>
    </view>
    
    <!-- 登录确认弹窗 -->
    <view class="login-modal" v-if="showModal">
      <view class="modal-content">
        <view class="modal-title">登录需同意</view>
        <view class="modal-links">
          <text class="link">《服务协议》</text>
          <text class="link">《隐私协议》</text>
        </view>
        <view class="modal-buttons">
          <button class="cancel-btn" @tap="cancelLogin">不同意</button>
          <button class="confirm-btn" @tap="confirmLogin">同意并登录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { setUser } from '@/utils/auth.js'

const { proxy } = getCurrentInstance()
const agreeProtocol = ref(false)
const showModal = ref(false)

// 显示登录确认弹窗
function showLoginModal() {
  if (!agreeProtocol.value) {
    uni.showToast({ title: '请先同意协议', icon: 'none' })
    return
  }
  showModal.value = true
}

// 取消登录
function cancelLogin() {
  showModal.value = false
}

// 确认微信登录
async function confirmLogin() {
  showModal.value = false
  try {
    // 获取微信登录code
    const loginResult = await new Promise((resolve, reject) => {
      uni.login({
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
    
    // 调用后端登录接口
    if (loginResult && loginResult.code) {
      console.log('微信登录code:', loginResult.code)
      const res = await proxy.$api.user.wxLogin(loginResult.code)
      
      if (res.code === 200) {
        // 保存token
        uni.setStorageSync('token', res.data.token)
        // 保存用户信息到本地缓存
        setUser(res.data)
        
        // 显示登录成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 登录成功后重新加载用户页面，确保状态更新
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/user/user' })
        }, 1500)
      } 
    } else {
      throw new Error('获取登录凭证失败')
    }
  } catch (error) {
    console.error("登录失败", error)
    uni.showToast({ 
      title: '登录失败', 
      icon: 'none' 
    })
  }
}

// 手机号登录
async function phoneLogin() {
  if (!agreeProtocol.value) {
    uni.showToast({ title: '请先同意协议', icon: 'none' })
    return
  }
  // 跳转到手机号登录页面
  // uni.navigateTo({ url: '/pages/user/phoneLogin' })
  // 调用后端登录接口
  const res = await proxy.$api.user.wxLogin("phoneLogin");
  console.log(res.data)
  if (res.code === 200) {
    // 保存token
    uni.setStorageSync('token', res.data.token)
    // 保存用户信息到本地缓存
    setUser(res.data)
    
    // 显示登录成功提示
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    // 登录成功后重新加载用户页面，确保状态更新
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/user/user' })
    }, 1500)
  } 
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  background: #f5f6fa;
  
  .logo {
    width: 140rpx;
    height: 140rpx;
    margin-bottom: 20rpx;
  }
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .login-tip {
    font-size: 28rpx;
    color: #888;
    margin-bottom: 60rpx;
  }
  
  .login-btns {
    width: 80%;
    margin-bottom: 30rpx;
    
    .wechat-login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #07c160;
      color: #fff;
      height: 88rpx;
      border-radius: 44rpx;
      margin-bottom: 20rpx;
      
      image {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
    }
    
    .phone-login-btn {
      background: #f5f5f5;
      color: #333;
      height: 88rpx;
      border-radius: 44rpx;
      line-height: 88rpx;
    }
  }
  
  .agreement {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #888;
    
    checkbox {
      transform: scale(0.7);
      margin-right: 4rpx;
    }
  }
}

// 登录确认弹窗
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  
  .modal-content {
    width: 80%;
    background: #fff;
    border-radius: 12rpx;
    padding: 40rpx 30rpx;
    
    .modal-title {
      text-align: center;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 30rpx;
    }
    
    .modal-links {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40rpx;
      
      .link {
        color: #2a5fff;
        font-size: 28rpx;
        margin-bottom: 10rpx;
      }
    }
    
    .modal-buttons {
      display: flex;
      justify-content: space-between;
      
      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        font-size: 28rpx;
        border-radius: 40rpx;
      }
      
      .cancel-btn {
        background: #f5f5f5;
        color: #666;
        margin-right: 20rpx;
      }
      
      .confirm-btn {
        background: #07c160;
        color: #fff;
      }
    }
  }
}
</style>