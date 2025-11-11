<template>
  <view class="pageBg">
    <!-- 自定义导航栏 -->
    <custom-nav-bar title="校园导览" :showBack="true"></custom-nav-bar>
    
    <!-- 地图展示区 -->
    <view class="map-container">
      <image
        src="/static/images/map1.png"
        mode="widthFix"
        class="map-image"
        @click="previewImage"
      />
    </view>
  </view>
</template>

<script setup>
// 地图 URL
const imageUrl = '/static/images/map1.png'

// 点击预览图片
function previewImage() {
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  })
}
</script>

<style scoped>
.map-container {
  margin: 20rpx;
}
.map-image {
  width: 100%;
  border-radius: 12rpx;
  display: block;
}
</style> 