<template>
  <view class="user-center pageBg">
	  <!-- #ifndef MP-TOUTIAO -->
	  <custom-nav-bar title="我的"></custom-nav-bar>
	  <!-- #endif -->
    
    <block >
      <!-- 个人信息 -->
      <view class="user-info">
        <image class="avatar" :src="user.avatar || '/static/images/avatar-default.png'" mode="aspectFill" @tap="chooseAvatar"></image>
        <view class="info">
          <view class="nickname">{{ user.username || '未设置' }}</view>
          <view class="desc">{{ user.studentId || '未绑定学号' }} | {{ user.college || '未绑定学院' }}</view>
        </view>
        <button class="edit-btn" @tap="editProfile">编辑</button>
      </view>

      <!-- 快捷入口 -->
      <view class="quick-entry">
        <view class="entry-item" @tap="goMyClubs">
          <uni-icons type="star" size="28" color="#ffb300"></uni-icons>
          <text>我的社团</text>
        </view>
        <view class="entry-item" @tap="goMyActivities">
          <uni-icons type="calendar" size="28" color="#2a5fff"></uni-icons>
          <text>我的活动</text>
        </view>
        <view class="entry-item" @tap="goMyMessages">
          <uni-icons type="email" size="28" color="#22e58b"></uni-icons>
          <text>我的消息</text>
        </view>
        <view class="entry-item" @tap="goMyApplies">
          <uni-icons type="paperplane" size="28" color="#ff6b6b"></uni-icons>
          <text>我的申请</text>
        </view>
      </view>

      <!-- 其他功能 -->
      <view class="menu-list">
        <view class="menu-item" @tap="goSetting">
          <uni-icons type="gear" size="22" color="#888"></uni-icons>
          <text>后台管理</text>
          <uni-icons type="right" size="18" color="#bbb"></uni-icons>
        </view>
        <view class="menu-item">
          <uni-icons type="chat" size="22" color="#888"></uni-icons>
          <button class="contact-service-btn" open-type="contact">联系客服</button>
          <uni-icons type="right" size="18" color="#bbb"></uni-icons>
        </view>
        <view class="menu-item" @tap="goAbout">
          <uni-icons type="info" size="22" color="#888"></uni-icons>
          <text>关于我们</text>
          <uni-icons type="right" size="18" color="#bbb"></uni-icons>
        </view>
        <view class="menu-item logout" @tap="logout">
          <text>退出登录</text>
        </view>
      </view>
    </block>

    <!-- 编辑个人信息弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">编辑个人信息</text>
          <view class="close-btn" @tap="closeEditPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <scroll-view class="popup-content" scroll-y>
          <!-- 头像 -->
          <view class="form-item avatar-upload">
            <text class="form-label">头像</text>
            <view class="avatar-wrapper" @tap="chooseAvatar">
              <image class="edit-avatar" :src="editForm.avatar" mode="aspectFill"></image>
              <view class="avatar-edit-icon">
                <uni-icons type="camera" size="20" color="#fff"></uni-icons>
              </view>
            </view>
          </view>
          
          <!-- 用户名 -->
          <view class="form-item">
            <text class="form-label">用户名</text>
            <input class="form-input" v-model="editForm.username" placeholder="请输入用户名" />
          </view>
          
          <!-- 性别 -->
          <view class="form-item">
            <text class="form-label">性别</text>
            <radio-group class="radio-group" @change="onGenderChange">
              <label class="radio-label">
                <radio :checked="editForm.gender === 1" value="1" color="#b13b7a" />
                <text>男</text>
              </label>
              <label class="radio-label">
                <radio :checked="editForm.gender === 2" value="2" color="#b13b7a" />
                <text>女</text>
              </label>
            </radio-group>
          </view>
          
          <!-- 手机号 -->
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="editForm.mobile" placeholder="请输入手机号" type="number" maxlength="11" />
          </view>
          
          <!-- 邮箱 -->
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input class="form-input" v-model="editForm.email" placeholder="请输入邮箱" type="text" />
          </view>
          
          <!-- 学号 -->
          <view class="form-item">
            <text class="form-label">学号</text>
            <input class="form-input" v-model="editForm.studentId" placeholder="请输入学号" type="text" />
          </view>
          
          <!-- 学院 -->
          <view class="form-item">
            <text class="form-label">学院</text>
            <picker mode="selector" :range="collegeOptions" @change="onCollegeChange" class="form-picker">
              <view class="picker-value">{{ editForm.college || '请选择学院' }}</view>
            </picker>
          </view>
          
          <!-- 专业 -->
          <view class="form-item">
            <text class="form-label">专业</text>
            <input class="form-input" v-model="editForm.major" placeholder="请输入专业" />
          </view>
          
          <!-- 班级 -->
          <view class="form-item">
            <text class="form-label">班级</text>
            <input class="form-input" v-model="editForm.className" placeholder="请输入班级" />
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @tap="closeEditPopup">取消</button>
          <button class="confirm-btn" @tap="saveUserInfo">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, onMounted, onActivated } from 'vue'
import { removeUser } from '@/utils/auth.js'

const { proxy } = getCurrentInstance()
const isLoggedIn = ref(false)
const editPopup = ref(null)

// 用户信息 - 直接使用后端返回的数据结构
const user = ref({})

// 编辑表单
const editForm = reactive({
  avatar: '',
  username: '',
  gender: 1,
  mobile: '',
  email: '',
  studentId: '',
  college: '',
  major: '',
  className: ''
})

// 学院选项
const collegeOptions = [
  '信息工程学院',
  '电子信息学院',
  '机械工程学院',
  '经济管理学院',
  '外国语学院',
  '艺术学院',
  '其他学院'
]

// 初始化
onMounted(() => {
  // 检查是否已登录
  const token = uni.getStorageSync('token')
  if (token) {
    isLoggedIn.value = true
  }
  // 获取用户信息
  getUserInfo()
})

// 添加页面激活时的钩子函数
onActivated(() => {
  // 检查是否已登录
  const token = uni.getStorageSync('token')  
  // 正确设置登录状态 - 如果有token则为true，否则为false
  isLoggedIn.value = !!token
  // 如果已登录，则重新获取用户信息
  if (token) {
    getUserInfo()
  } else {
    // 如果没有token，确保用户信息被清空
    user.value = {}
  }
})

// 跳转到登录页
function goToLogin() {
  uni.navigateTo({ url: '/pages/user/login' })
}

// 获取用户信息
async function getUserInfo() {
  try {
    // 调用API获取用户信息
    const res = await proxy.$api.user.getUserInfo()
    if (res.code === 200) {
      // 直接使用后端返回的数据
      user.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  }
}

// 初始化编辑表单
function initEditForm() {
  // 确保user.value不为null且包含必要的属性
  if (!user.value) {
    user.value = {}
  }
  editForm.avatar = user.value.avatar || '/static/images/avatar-default.png'
  editForm.username = user.value.username || ''
  editForm.gender = user.value.gender || 1
  editForm.mobile = user.value.mobile || ''
  editForm.email = user.value.email || ''
  editForm.studentId = user.value.studentId || ''
  editForm.college = user.value.college || ''
  editForm.major = user.value.major || ''
  editForm.className = user.value.className || ''
}

// 显示编辑弹窗
async function editProfile() {
  try {
    // 先获取最新的用户信息
    await getUserInfo()
    // 然后初始化编辑表单
    initEditForm()
    // 打开弹窗
    editPopup.value.open()
  } catch (error) {
    console.error('获取用户信息失败', error)
    // 即使获取失败也尝试打开弹窗，使用现有数据
    initEditForm()
    editPopup.value.open()
  }
}

// 关闭编辑弹窗
function closeEditPopup() {
  editPopup.value.close()
}

// 保存用户信息
async function saveUserInfo() {
  try {
    // 如果头像是本地路径，先上传到服务器
    if (editForm.avatar && !editForm.avatar.startsWith('http')) {
      const uploadRes = await proxy.$api.common.upload(editForm.avatar)
      console.log('上传头像结果:', uploadRes)
      if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
        editForm.avatar = uploadRes.data.url
      } else {
        uni.showToast({ title: '头像上传失败', icon: 'none' })
        return
      }
    }
    // 这里调用API更新用户信息
    console.log(editForm)
    const res = await proxy.$api.user.updateUserInfo(editForm)
    
    if (res.code === 200) {
      // 关闭弹窗
      closeEditPopup()
      
      // 提示成功
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 重新获取用户信息，确保数据是最新的
      await getUserInfo()
    }
  } catch (error) {
    console.error('保存失败', error)
    // uni.showToast({
    //   title: '保存失败',
    //   icon: 'none'
    // })
  }
}

// 选择头像，上传并更新用户头像
async function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      try {
        // 上传文件
        const uploadRes = await proxy.$api.common.upload(tempFilePath)
        if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
          const newUrl = uploadRes.data.url
          // 更新后端用户信息
          const updateRes = await proxy.$api.user.updateUserInfo({ avatar: newUrl })
          if (updateRes.code === 200) {
            // 更新本地状态
            user.value.avatar = newUrl
            editForm.avatar = newUrl
            uni.showToast({ title: '头像已更新', icon: 'success' })
          } else {
            uni.showToast({ title: updateRes.msg || '头像更新失败', icon: 'none' })
          }
        } else {
          uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' })
        }
      } catch (error) {
        console.error('上传头像失败', error)
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    }
  })
}

// 性别选择
function onGenderChange(e) {
  editForm.gender = parseInt(e.detail.value)
}

// 学院选择
function onCollegeChange(e) {
  const index = e.detail.value
  editForm.college = collegeOptions[index]
}

// 其他功能函数
function goMyClubs() {
  uni.navigateTo({ url: '/pages/user/myClubs' })
}

function goMyActivities() {
  uni.navigateTo({ url: '/pages/user/myActivities' })
}

function goMyMessages() {
  uni.navigateTo({ url: '/pages/notification/notification' })
}

function goMyApplies() {
  uni.navigateTo({ url: '/pages/user/myApplies' })
}

function goResourceCenter() {
  uni.navigateTo({ url: '/pages/resourceCenter/resourceCenter' })
}

function goSetting() {
  uni.navigateTo({ url: '/pages/admin/login' })
  // 对于分包中的页面，正确的路径依然是 /pages/admin/login
  // 分包配置只是优化了小程序加载性能，不影响页面路由
}


function goAbout() {
  uni.showModal({
    title: '关于我们',
    content: `校园社团管理小程序
版本：v1.0.0
开发者：xhy
联系方式：123456789@qq.com
© 2025 `,
    showCancel: false,
    confirmText: '我知道了'
  })
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        isLoggedIn.value = false
        // 清除本地token和用户信息
        uni.removeStorageSync('token')
        removeUser()
        user.value = {}
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        })
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/user/login'
          })
        }, 500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.user-center {
  min-height: 100vh;
  padding-bottom: 40rpx;
  position: relative;
}

// 未登录状态样式
.not-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  
  .logo {
    width: 140rpx;
    height: 140rpx;
    margin-bottom: 20rpx;
  }
  
  .app-name {
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
  
  .login-btn {
    width: 80%;
      background: #07c160;
      color: #fff;
      height: 88rpx;
      border-radius: 44rpx;
      line-height: 88rpx;
  }
}

// 已登录状态样式
.user-info {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  margin: 32rpx 24rpx 0 24rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  position: relative;
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: #f5f5f5;
  }
  
  .info {
    flex: 1;
    
    .nickname {
      font-size: 34rpx;
      font-weight: bold;
      color: #222;
      margin-bottom: 8rpx;
    }
    
    .desc {
      font-size: 24rpx;
      color: #888;
    }
  }
  
  .edit-btn {
    font-size: 24rpx;
    color: #2a5fff;
    background: #f0f4ff;
    border-radius: 32rpx;
    padding: 8rpx 24rpx;
    border: none;
    position: absolute;
    right: 24rpx;
    top: 32rpx;
  }
}

.quick-entry {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 32rpx 24rpx 0 24rpx;
  
  .entry-item {
    width: 48%;
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 16rpx;
    padding: 32rpx 0 24rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
    font-size: 26rpx;
    color: #333;
    
    .uni-icons {
      margin-bottom: 12rpx;
    }
  }
}

.menu-list {
  margin: 32rpx 24rpx 0 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 0 28rpx 24rpx;
    font-size: 28rpx;
    color: #333;
    border-bottom: 1rpx solid #f0f0f0;
    
    .uni-icons {
      margin-right: 18rpx;
    }
    
    text {
      flex: 1;
    }
    
    .contact-service-btn {
      flex: 1;
      text-align: left;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      font-size: 28rpx;
      color: #333;
      line-height: normal;
      
      &::after {
        border: none;
      }
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .logout {
    color: #f56c6c;
    text-align: center;
  }
}

// 编辑弹窗样式
.edit-popup {
  width: 650rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      padding: 10rpx;
    }
  }
  
  .popup-content {
    padding: 30rpx;
    max-height: 750rpx;
    
    .form-item {
      margin-bottom: 30rpx;
      
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #666;
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
      
      .form-picker {
        width: 100%;
        height: 80rpx;
        background: #f8f8f8;
        border-radius: 12rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        
        .picker-value {
          color: #333;
        }
      }
      
      .radio-group {
        display: flex;
        
        .radio-label {
          display: flex;
          align-items: center;
          margin-right: 40rpx;
          
          text {
            font-size: 28rpx;
            color: #333;
            margin-left: 8rpx;
          }
        }
      }
      
      &.avatar-upload {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .avatar-wrapper {
          position: relative;
          width: 150rpx;
          height: 150rpx;
          border-radius: 50%;
          overflow: hidden;
          margin-top: 20rpx;
          
          .edit-avatar {
            width: 100%;
            height: 100%;
          }
          
          .avatar-edit-icon {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50rpx;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }
  }
  
  .popup-footer {
    display: flex;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    
    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      margin: 0 10rpx;
      font-size: 28rpx;
    }
    
    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }
    
    .confirm-btn {
      background: #b13b7a;
      color: #fff;
    }
  }
}
</style>