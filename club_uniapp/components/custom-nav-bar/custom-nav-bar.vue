<template>
	<view class="layout">
		<view class="navbar">
			<view class="statusBar" :style="{height:getStatusBarHeight()+'px'}"></view>
			<view class="titleBar"
			:style="{height:getTitleBarHeight()+'px',marginLeft:getLeftIconLeft()+'px'}">
				<!-- 新增左侧插槽 -->
				<view class="left-slot">
					<slot name="left"></slot>
				</view>
				<view class="title">{{title}}</view>
				<!-- 新增右侧插槽，确保不被胶囊遮挡 -->
				<view class="right-slot" :style="{right:getMenuButtonRight()+'px'}">
					<slot name="right"></slot>
				</view>
			</view>
		</view>
		<view class="fill" :style="{height:getNavBarHeight()+'px'}"></view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {getStatusBarHeight,getTitleBarHeight,getNavBarHeight,getLeftIconLeft,getMenuButtonRight} from "@/utils/system.js"

defineProps({
	title:{
		type:String,
		default:"壁纸"
	}
})
</script>

<style lang="scss" scoped>
.layout{
	.navbar{
		position: fixed;
		top:0;
		left:0;
		width: 100%;
		z-index: 10;
		background:
		linear-gradient(to bottom,transparent,#fff 400rpx),
		linear-gradient(to right,#beecd8 20%,#F4E2D8);
		.statusBar{
			// 状态栏占位区域
		}
		.titleBar{
			display: flex;
			align-items: center;
			padding:0 30rpx;
			position: relative;
			.left-slot {
				position: absolute;
				left: 30rpx;
				top: 50%;
				transform: translateY(-50%);
				display: flex;
				align-items: center;
				z-index: 2;
				max-width: 50%; // 确保左侧插槽有足够空间显示多个按钮
			}
			.title{
				flex: 1;
				text-align: center;
				font-size: 22px;
				font-weight: 700;
				color: $text-color-primary;
				padding: 0 150rpx; // 为左右两侧的按钮留出足够空间
			}
			.right-slot {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				display: flex;
				align-items: center;
				z-index: 2;
			}
		}
	}
	.fill{}
}
</style>