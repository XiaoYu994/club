<template>
  <view
    class="activity-card"
    :class="{ active: isActive }"
    @touchstart="isActive = true"
    @touchend="isActive = false"
    @touchcancel="isActive = false"
	@click="goDeatil"
  >
    <image class="card-img" :src="img" mode="aspectFill"></image>
    <view class="card-content">
      <view class="card-header">
        <text class="card-title">{{ title }}</text>
        <text class="card-extra">{{ extra }}</text>
      </view>
      <view class="card-desc">{{ desc }}</view>
      <view class="card-time">{{ time }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  img: { type: String, default: '/static/default.png' },
  title: { type: String, default: '标题文字' },
  extra: { type: String, default: '额外信息' },
  desc: { type: String, default: '内容主体，可自定义内容及样式内容主体，可自定义内容及样式内容主体，可自定义内容及样式内容主体，可自定义内容及样式内容主体，可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体内容主体可自定义内容及样式内容主体可自定义内容及样式内容主体可自定义内容及样式' },
  time: { type: String, default: '2024-05-01 12:00' }
})

const isActive = ref(false)

// 跳转到详情页面
function goDeatil(){
	uni.showToast({
	  title: `点击了 `,
	  icon: 'none'
	})
}
</script>

<style lang="scss" scoped>
.activity-card {
  display: flex;
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  padding: 20rpx;
  margin: 20rpx 0;
  transition: box-shadow 0.2s, transform 0.2s;
  align-items: flex-start;
  position: relative;
  .card-img {
  width: 150rpx;   // 或 160rpx
  height: 150rpx;  // 或 160rpx
  border-radius: 16rpx;
  object-fit: cover;
  margin-right: 24rpx; // 右侧间距可适当加大
  background: #f5f5f5;
  }
  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .card-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #222;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .card-extra {
        font-size: 24rpx;
        color: #999;
        margin-left: 20rpx;
        flex-shrink: 0;
      }
    }
	.card-desc {
	  font-size: 26rpx;
	  color: #666;
	  margin: 16rpx 0 0 0;
	  flex: 1;
	  word-break: break-all;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  display: -webkit-box;
	  -webkit-line-clamp: 2; // 显示2行
	  -webkit-box-orient: vertical;
	  white-space: normal;
	}
    .card-time {
      font-size: 22rpx;
      color: #bbb;
      align-self: flex-end;
      margin-top: 18rpx;
    }
  }
}
.activity-card.active {
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.16);
  transform: scale(1.03);
}
</style>