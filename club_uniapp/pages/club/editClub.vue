<template>
  <view class="edit-club-container pageBg">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 顶部导航 -->
    <custom-nav-bar title="编辑社团" :showBack="true" @backClick="goBack"></custom-nav-bar>
    
    <!-- 表单区域 -->
    <view class="activity-form">
      <scroll-view scroll-y class="form-container">
        <!-- 基本信息 -->
        <view class="form-section">
          <view class="section-title">基本信息</view>
          <!-- 名称 -->
          <view class="form-item">
            <text class="form-label">社团名称</text>
            <input v-model="club.name" placeholder="请输入社团名称" class="form-input" />
          </view>
          <!-- Logo -->
          <view class="form-item">
            <text class="form-label">社团Logo</text>
            <view class="poster-upload" @tap="uploadLogo">
              <image v-if="club.logo" :src="club.logo" class="poster-preview" mode="aspectFill" />
              <view v-else class="upload-placeholder">
                <uni-icons type="image" size="50" color="#999" />
                <text>点击上传Logo</text>
              </view>
            </view>
          </view>
          <!-- 简介 -->
          <view class="form-item">
            <text class="form-label">社团简介</text>
            <textarea v-model="club.description" placeholder="请输入社团简介" class="form-textarea" />
          </view>
          <!-- 地址 -->
          <view class="form-item">
            <text class="form-label">地址</text>
            <input v-model="club.address" placeholder="请输入地址" class="form-input" />
          </view>
          <!-- 联系方式 -->
          <view class="form-item">
            <text class="form-label">联系方式</text>
            <input v-model="club.contact" placeholder="请输入联系方式" class="form-input" />
          </view>
        </view>
      </scroll-view>
      <!-- 底部操作栏 -->
      <view class="form-actions">
        <button class="cancel-btn" @tap="goBack">取消</button>
        <button class="submit-btn" @tap="submit">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
import { nextTick } from 'vue'
import { getImageUrl } from '@/utils/common.js'
const { proxy } = getCurrentInstance()

// 状态栏高度
const statusBarHeight = ref(20)
// 表单数据
const club = ref({ id: '', name: '', logo: '', description: '', type: 0, address: '', contact: '' })

// 类型选项
const typeOptions = ['普通社团', '院级社团', '校级社团']

// 初始化：获取传参并加载详情
onMounted(async () => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  club.value.id = currentPage.options.id

  // 加载社团详情
  try {
    const res = await proxy.$api.club.getClubDetail(club.value.id)
    if (res.code === 200) {
      Object.assign(club.value, res.data)
    } else {
      uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络异常', icon: 'none' })
  }
})

// 上传 Logo
const uploadLogo = () => {
  uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: (res) => {
    const path = res.tempFilePaths[0]
    uni.showLoading({ title: '上传中...' })
    proxy.$api.common.upload(path).then(r => {
      uni.hideLoading()
      if (r.code === 200) {
        // 处理 URL
        club.value.logo = getImageUrl(r.data.url || r.data, '', false)
      } else {
        uni.showToast({ title: r.message || '上传失败', icon: 'none' })
      }
    }).catch(() => {
      uni.hideLoading()
      uni.showToast({ title: '上传出错', icon: 'none' })
    })
  }})
}

// 类型切换
const onTypeChange = (e) => {
  club.value.type = Number(e.detail.value)
}

// 提交保存时，将 formFields 转为 JSON
const submit = async () => {
  if (!club.value.name) { uni.showToast({ title: '请输入名称', icon: 'none' }); return }
  try {
    uni.showLoading({ title: '保存中...' })
    // 合并更新数据
    const updateData = {
      name: club.value.name,
      logo: club.value.logo,
      description: club.value.description,
      type: club.value.type,
      address: club.value.address,
      contact: club.value.contact
    }
    const res = await proxy.$api.club.updateClub(club.value.id, updateData)
    uni.hideLoading()
    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/club/detail?id=${club.value.id}` })
      }, 800)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络异常', icon: 'none' })
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.edit-club-container {
    display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
  }

// 表单样式
.activity-form {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-container {
  flex: 1;
  padding: 20rpx 30rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.form-actions {
  display: flex;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.poster-upload {
  width: 100%;
  height: 320rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.poster-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  
  text {
    margin-top: 20rpx;
    font-size: 28rpx;
}
}

// 按钮样式
.cancel-btn, .submit-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
  margin-right: 20rpx;
}

.submit-btn {
  background-color: #b13b7a;
  color: #fff;
}
</style>