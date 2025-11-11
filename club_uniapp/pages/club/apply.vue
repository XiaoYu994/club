<template>
	<view class="apply-container pageBg">
		<!-- 状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部导航 -->
		<custom-nav-bar title="申请加入社团" :showBack="true" @backClick="goBack"></custom-nav-bar>
		
		<scroll-view scroll-y class="apply-content">
			<!-- 社团信息 -->
			<view class="club-info">
				<image class="club-logo" :src="clubInfo.logo || '/static/images/default-club.png'" mode="aspectFill"></image>
				<view class="club-name">{{ clubInfo.name || '加载中...' }}</view>
			</view>
			
			<!-- 招新信息 -->
			<view class="recruitment-info" v-if="recruitmentInfo">
				<view class="section-title">招新信息</view>
				
				<!-- 招新海报 -->
				<image 
					v-if="recruitmentInfo.poster" 
					class="recruitment-poster" 
					:src="recruitmentInfo.poster" 
					mode="widthFix"
					@tap="previewImage(recruitmentInfo.poster)"
				></image>
				
				<view class="recruitment-card">
					<view class="recruitment-title">{{ recruitmentInfo.title }}</view>
					
					<!-- 招新状态标签 -->
					<view class="status-tag" :class="getStatusClass(recruitmentInfo.status)">
						{{ getStatusText(recruitmentInfo.status) }}
					</view>
					
					<!-- 招新时间 -->
					<view class="recruitment-period">
						<uni-icons type="calendar" size="18" color="#b13b7a"></uni-icons>
						<text>{{ formatDate(recruitmentInfo.startTime) }} ~ {{ formatDate(recruitmentInfo.endTime) }}</text>
					</view>
					
					<!-- 面试地点 -->
					<view class="recruitment-place" v-if="recruitmentInfo.needInterview && recruitmentInfo.interviewPlace">
						<uni-icons type="location" size="18" color="#b13b7a"></uni-icons>
						<text>面试地点：{{ recruitmentInfo.interviewPlace }}</text>
					</view>
					
					<!-- 招募情况 -->
					<view class="recruitment-stats">
						<view class="stat-item">
							<text class="stat-value">{{ recruitmentInfo.planCount || 0 }}</text>
							<text class="stat-label">计划招募</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ recruitmentInfo.joinCount || 0 }}</text>
							<text class="stat-label">已报名</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ recruitmentInfo.passCount || 0 }}</text>
							<text class="stat-label">已通过</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ getRemainingCount() }}</text>
							<text class="stat-label">剩余名额</text>
						</view>
					</view>
					
					<!-- 描述信息 -->
					<rich-text v-if="recruitmentInfo.description" :nodes="recruitmentInfo.description" class="recruitment-desc"></rich-text>
				</view>
			</view>
			
			<!-- 申请表单 -->
			<view class="apply-form" v-if="isRecruitmentActive">
				<view class="section-title">申请表单</view>
				
				<view v-if="formFields && formFields.length > 0" class="form-content">
					<view v-for="(field, idx) in formFields" :key="idx" class="form-item">
						<text class="form-label">{{ field.label }}{{ field.required ? ' *' : '' }}</text>
						
						<!-- 文本输入 -->
						<input 
							v-if="field.type === 'text'" 
							type="text" 
							v-model="field.value" 
							:placeholder="'请输入' + field.label"
							class="form-input"
						/>
						
						<!-- 数字输入 -->
						<input 
							v-if="field.type === 'number'" 
							type="number" 
							v-model="field.value" 
							:placeholder="'请输入' + field.label"
							class="form-input"
						/>
						
						<!-- 长文本 -->
						<textarea 
							v-if="field.type === 'textarea'" 
							v-model="field.value" 
							:placeholder="'请输入' + field.label"
							class="form-textarea"
						/>
						
						<!-- 单选 -->
						<picker 
							v-if="field.type === 'select' || field.type === 'radio'" 
							mode="selector" 
							:range="field.options" 
							@change="(e) => onOptionChange(idx, e)"
						>
							<view class="form-picker">
								{{ field.value || '请选择' + field.label }}
							</view>
						</picker>
						
						<!-- 多选 (checkbox) -->
						<view v-if="field.type === 'checkbox'" class="checkbox-group">
							<checkbox-group @change="(e) => onCheckboxChange(idx, e)">
								<label v-for="(option, optIdx) in field.options" :key="optIdx" class="checkbox-item">
									<checkbox :value="option" :checked="isOptionChecked(field.value, option)" />
									<text class="checkbox-label">{{ option }}</text>
								</label>
							</checkbox-group>
						</view>
					</view>
				</view>
				
				<view v-else class="empty-form">
					<text>请填写申请理由</text>
					<textarea 
						v-model="defaultReason" 
						placeholder="请输入申请理由"
						class="form-textarea"
					/>
				</view>
			</view>
			
			<!-- 招新已结束提示 -->
			<view class="recruitment-ended" v-else>
				<uni-icons type="info" size="32" color="#999"></uni-icons>
				<text>招新已结束，无法提交申请</text>
			</view>
			
			<!-- 底部区域占位 -->
			<view style="height: 150rpx;"></view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar">
			<button class="cancel-btn" @tap="goBack">取消</button>
			<button 
				class="submit-btn" 
				@tap="submitApply" 
				:disabled="submitting || !isRecruitmentActive"
			>{{ submitting ? '提交中...' : '提交申请' }}</button>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, computed } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 状态栏高度
const statusBarHeight = ref(20)
// 社团ID
const clubId = ref(null)
// 招新ID
const recruitmentId = ref(null)
// 社团信息
const clubInfo = ref({})
// 招新信息
const recruitmentInfo = ref(null)
// 表单字段
const formFields = ref([])
// 默认申请理由
const defaultReason = ref('')
// 提交状态
const submitting = ref(false)

// 判断招新是否进行中
const isRecruitmentActive = computed(() => {
	if (!recruitmentInfo.value) return false
	
	const now = Date.now()
	const startTime = Number(recruitmentInfo.value.startTime)
	const endTime = Number(recruitmentInfo.value.endTime)
	
	return recruitmentInfo.value.status === 1 && 
		now >= startTime && 
		now <= endTime && 
		getRemainingCount() > 0
})

// 初始化
onMounted(() => {
	// 获取状态栏高度
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 20
	
	// 获取路由参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	clubId.value = currentPage.options.clubId
	recruitmentId.value = currentPage.options.recruitmentId
	
	// 加载社团信息
	loadClubInfo()
	
	// 加载招新信息
	loadRecruitmentInfo()
})

// 加载社团信息
const loadClubInfo = async () => {
	try {
		uni.showLoading({ title: '加载中...' })
		
		const res = await proxy.$api.club.getClubDetail(clubId.value)
		
		if (res.code === 200) {
			clubInfo.value = res.data
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		uni.showToast({
			title: '网络异常，请稍后重试',
			icon: 'none'
		})
	} finally {
		uni.hideLoading()
	}
}

// 加载招新信息
const loadRecruitmentInfo = async () => {
	try {
		if (!recruitmentId.value) {
			// 如果没有指定招新ID，获取当前有效的招新信息
			const res = await proxy.$api.club.getActiveRecruitment(clubId.value)
			
			if (res.code === 200 && res.data) {
				recruitmentInfo.value = res.data
				parseFormFieldsFromRecruitment()
			}
		} else {
			// 获取指定的招新信息
			const res = await proxy.$api.club.getRecruitmentDetail(recruitmentId.value)
			
			if (res.code === 200) {
				recruitmentInfo.value = res.data
				parseFormFieldsFromRecruitment()
			}
		}
	} catch (error) {
		console.error('加载招新信息失败', error)
	}
}

// 解析招新表单字段
const parseFormFieldsFromRecruitment = () => {
	try {
		if (recruitmentInfo.value.forms) {
			let formConfig;
			
			// 如果已经是对象，不需要再解析
			if (typeof recruitmentInfo.value.forms === 'object') {
				formConfig = recruitmentInfo.value.forms;
			} else {
				formConfig = JSON.parse(recruitmentInfo.value.forms);
			}
			
			// 确保formConfig是数组
			if (!Array.isArray(formConfig)) {
				formConfig = [formConfig];
			}
			
			// 清空现有字段并设置新字段
			formFields.value = formConfig.map(field => {
				return {
					key: field.name.toLowerCase().replace(/\s/g, '_'),
					label: field.name,
					type: field.type || 'text',
					required: field.required || false,
					value: '',
					options: field.options || []
				}
			});
		} else {
			// 使用默认表单
			formFields.value = [];
		}
	} catch (e) {
		// 解析失败时使用空表单
		formFields.value = [];
	}
}

// 获取招新状态文本
const getStatusText = (status) => {
	switch (status) {
		case 0: return '未开始';
		case 1: return '招新中';
		case 2: return '已结束';
		default: return '未知';
	}
}

// 获取招新状态样式类
const getStatusClass = (status) => {
	switch (status) {
		case 0: return 'status-pending';
		case 1: return 'status-active';
		case 2: return 'status-ended';
		default: return '';
	}
}

// 获取剩余名额
const getRemainingCount = () => {
	if (!recruitmentInfo.value) return 0;
	
	const plan = Number(recruitmentInfo.value.planCount) || 0;
	const passed = Number(recruitmentInfo.value.passCount) || 0;
	
	return Math.max(0, plan - passed);
}

// 预览图片
const previewImage = (url) => {
	if (!url) return;
	uni.previewImage({
		urls: [url],
		current: url
	});
}

// 选项变更
const onOptionChange = (index, e) => {
	const selectedIndex = e.detail.value
	formFields.value[index].value = formFields.value[index].options[selectedIndex]
}

// 多选框变更
const onCheckboxChange = (index, e) => {
	formFields.value[index].value = e.detail.value.join(',');
}

// 检查选项是否被选中
const isOptionChecked = (value, option) => {
	if (!value) return false;
	const values = value.split(',');
	return values.includes(option);
}

// 提交申请
const submitApply = async () => {
	if (!isRecruitmentActive.value) {
		uni.showToast({
			title: '招新已结束，无法提交申请',
			icon: 'none'
		});
		return;
	}
	
	// 构建提交数据
	let formData = {};
	
	if (formFields.value.length > 0) {
		// 验证必填字段
		const missingFields = formFields.value.filter(field => field.required && !field.value);
		if (missingFields.length > 0) {
			uni.showToast({
				title: `请填写${missingFields[0].label}`,
				icon: 'none'
			});
			return;
		}
		
		// 收集表单数据
		formFields.value.forEach(field => {
			formData[field.key] = field.value;
		});
	} else {
		// 使用默认理由
		if (!defaultReason.value.trim()) {
			uni.showToast({
				title: '请填写申请理由',
				icon: 'none'
			});
			return;
		}
		
		formData = {
			reason: defaultReason.value
		};
	}
	
	try {
		submitting.value = true;
		uni.showLoading({ title: '提交中...' });
		
		// 调用API提交申请
		const res = await proxy.$api.club.applyJoinClub(clubId.value, formData);
		
		// 确保无论成功与否都隐藏加载提示
		uni.hideLoading();
		submitting.value = false;
		
		if (res.code === 200) {
			// 显示成功提示
			uni.showToast({
				title: '申请已提交，等待审核',
				icon: 'success'
			});
			
			// 延迟返回
			setTimeout(() => {
				goBack();
			}, 1500);
		} else {
			// 显示错误提示
			uni.showToast({
				title: res.message || '申请失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.hideLoading();
		submitting.value = false;
		
		uni.showToast({
			title: '申请失败，请稍后重试',
			icon: 'none'
		});
	}
}

// 返回上一页
const goBack = () => {
	uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.apply-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
}

.status-bar {
	width: 100%;
	background-color: #b13b7a;
}

.apply-content {
	flex: 1;
	overflow: hidden;
	padding: 30rpx;
}

// 社团信息
.club-info {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	
	.club-logo {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.club-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
}

// 招新信息
.recruitment-info {
	margin-bottom: 30rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}
	
	.recruitment-poster {
		width: 100%;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.recruitment-card {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
		
		.recruitment-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
			margin-right: 120rpx; // 为状态标签留出空间
		}
		
		.status-tag {
			position: absolute;
			right: 20rpx;
			top: 20rpx;
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			font-size: 22rpx;
			color: #fff;
			
			&.status-pending {
				background-color: #909399;
			}
			
			&.status-active {
				background-color: #67C23A;
			}
			
			&.status-ended {
				background-color: #909399;
			}
		}
		
		.recruitment-period, .recruitment-place {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #999;
			margin-bottom: 10rpx;
			
			uni-icons {
				margin-right: 8rpx;
			}
		}
		
		.recruitment-stats {
			display: flex;
			justify-content: space-around;
			margin: 20rpx 0;
			padding: 10rpx 0;
			border-top: 1rpx dashed #eee;
			border-bottom: 1rpx dashed #eee;
			
			.stat-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.stat-value {
					font-size: 28rpx;
					font-weight: bold;
					color: #b13b7a;
					margin-bottom: 4rpx;
				}
				
				.stat-label {
					font-size: 22rpx;
					color: #999;
				}
			}
		}
		
		.recruitment-desc {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
			margin-top: 10rpx;
		}
	}
}

// 申请表单
.apply-form {
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}
	
	.form-content {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.form-item {
			margin-bottom: 30rpx;
			
			.form-label {
				display: block;
				font-size: 28rpx;
				color: #333;
				margin-bottom: 16rpx;
			}
			
			.form-input {
				width: 100%;
				height: 80rpx;
				padding: 0 20rpx;
				border: 1rpx solid #eee;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
			
			.form-textarea {
				width: 100%;
				height: 200rpx;
				padding: 20rpx;
				border: 1rpx solid #eee;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
			
			.form-picker {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				padding: 0 20rpx;
				border: 1rpx solid #eee;
				border-radius: 8rpx;
				font-size: 28rpx;
				color: #333;
			}
			
			.checkbox-group {
				display: flex;
				flex-direction: column;
				
				.checkbox-item {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.checkbox-label {
						font-size: 28rpx;
						margin-left: 10rpx;
					}
				}
			}
		}
	}
	
	.empty-form {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		text {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 16rpx;
		}
		
		.form-textarea {
			width: 100%;
			height: 200rpx;
			padding: 20rpx;
			border: 1rpx solid #eee;
			border-radius: 8rpx;
			font-size: 28rpx;
		}
	}
}

// 招新已结束提示
.recruitment-ended {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	
	uni-icons {
		margin-bottom: 20rpx;
	}
	
	text {
		font-size: 28rpx;
		color: #999;
	}
}

// 底部操作栏
.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #fff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
	
	button {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		border-radius: 40rpx;
	}
	
	.cancel-btn {
		margin-right: 20rpx;
		background-color: #f5f5f5;
		color: #666;
	}
	
	.submit-btn {
		background-color: #b13b7a;
		color: #fff;
		
		&:disabled {
			background-color: #d3a3b9;
		}
	}
}
</style> 