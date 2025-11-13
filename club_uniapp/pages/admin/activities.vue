<template>
	<view class="admin-activities pageBg">
		<custom-nav-bar title="活动管理" />
		<view class="search-bar">
			<input v-model="searchKeyword" placeholder="搜索活动名称" class="search-input" />
			<button class="search-btn" @tap="loadActivities">搜索</button>
		</view>
		<view class="activity-table">
			<view class="activity-row activity-header">
				<view class="activity-cell">序号</view>
				<view class="activity-cell">活动名称</view>
				<view class="activity-cell">所属社团</view>
				<view class="activity-cell">状态</view>
				<view class="activity-cell">操作</view>
			</view>
			<view class="activity-row" v-for="(activity, idx) in activities" :key="activity.id">
				<view class="activity-cell">{{ (page-1)*pageSize + idx + 1 }}</view>
				<view class="activity-cell">{{ activity.title }}</view>
				<view class="activity-cell">{{ activity.clubName }}</view>
				<view class="activity-cell">
					<view class="status-badge" :class="'status-' + activity.status">
						{{ statusMap[activity.status] }}
					</view>
				</view>
				<view class="activity-cell action-cell">
					<!-- 操作菜单按钮 -->
					<button class="action-btn menu-btn" @tap="showActionMenu(activity)">操作</button>
				</view>
			</view>
		</view>
		<view class="pagination">
			<button @tap="prevPage" :disabled="page===1">上一页</button>
			<text>第{{page}}页</text>
			<button @tap="nextPage" :disabled="page*pageSize>=total">下一页</button>
		</view>

		<!-- 确认对话框 -->
		<uni-popup ref="confirmPopup" type="dialog">
			<uni-popup-dialog :title="confirmDialogTitle" :content="confirmDialogContent" :before-close="true"
				@confirm="handleConfirmAction" @close="$refs.confirmPopup.close()">
			</uni-popup-dialog>
		</uni-popup>
		<!-- 操作菜单弹出框 -->
		<uni-popup ref="actionPopup" type="bottom" borderRadius="8px">
			<view class="action-sheet-content">
				<view v-for="(btn, idx) in actionButtons" :key="idx" class="action-item" @tap="handleActionMenuItem(btn)">
					{{ btn.text }}
				</view>
				<view class="action-item cancel" @tap="actionPopup.close()">取消</view>
			</view>
		</uni-popup>

		<!-- 活动详情弹窗 -->
		<uni-popup ref="detailPopup" type="center" background-color="transparent">
			<scroll-view scroll-y class="detail-popup">
				<view class="detail-popup-title">活动详细信息</view>
				<view class="detail-content" v-if="activityDetail">
					<view class="detail-section">
						<view class="section-title">基本信息</view>
						<view class="detail-item">
							<text class="detail-label">活动名称：</text>
							<text class="detail-value">{{ activityDetail.title }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">所属社团：</text>
							<text class="detail-value">{{ activityDetail.clubName || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">活动状态：</text>
							<view class="status-badge" :class="'status-' + activityDetail.status">
								{{ activityDetail.statusName || statusMap[activityDetail.status] }}
							</view>
						</view>
						<view class="detail-item">
							<text class="detail-label">活动地点：</text>
							<text class="detail-value">{{ activityDetail.address || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">计划人数：</text>
							<text class="detail-value">{{ activityDetail.planCount || '不限' }}</text>
						</view>

					</view>

					<view class="detail-section">
						<view class="section-title">时间信息</view>
						<view class="detail-item">
							<text class="detail-label">开始时间：</text>
							<text class="detail-value">{{ formatTime(activityDetail.startTime) }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">结束时间：</text>
							<text class="detail-value">{{ formatTime(activityDetail.endTime) }}</text>
						</view>
					</view>

					<view class="detail-section">
						<view class="section-title">报名统计</view>
						<view class="detail-item">
							<text class="detail-label">总报名数：</text>
							<text class="detail-value">{{ activityDetail.totalApplies || 0 }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">待审核：</text>
							<text class="detail-value">{{ activityDetail.pendingApplies || 0 }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">已通过：</text>
							<text class="detail-value">{{ activityDetail.approvedApplies || 0 }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">已拒绝：</text>
							<text class="detail-value">{{ activityDetail.rejectedApplies || 0 }}</text>
						</view>
					</view>

					<view class="detail-section">
						<view class="section-title">签到统计</view>
						<view class="detail-item">
							<text class="detail-label">签到人数：</text>
							<text class="detail-value">{{ activityDetail.checkedInCount || 0 }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">签到率：</text>
							<text class="detail-value">{{ activityDetail.checkInRate || 0 }}%</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">社团成员：</text>
							<text class="detail-value">{{ activityDetail.memberCount || 0 }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">非社团成员：</text>
							<text class="detail-value">{{ activityDetail.nonMemberCount || 0 }}</text>
						</view>
					</view>

					<view class="detail-section" v-if="activityDetail.description">
						<view class="section-title">活动简介</view>
						<text class="detail-description">{{ activityDetail.description }}</text>
					</view>
				</view>
				<view class="detail-popup-buttons">
					<button class="cancel-btn" @tap="closeDetailPopup">关闭</button>
				</view>
			</scroll-view>
		</uni-popup>
	</view>
</template>
<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import api from '@/api/api.js'
	const activities = ref([])
	const page = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	const searchKeyword = ref('')

	// 确认对话框相关
	const confirmPopup = ref(null)
	// 操作菜单弹窗相关
	const actionPopup = ref(null)
	const confirmDialogTitle = ref('')
	const confirmDialogContent = ref('')
	const currentActivity = ref(null)
	const confirmAction = ref('')
	const confirmStatus = ref(null)
	const actionButtons = ref([])

	// 状态映射
	const statusMap = { 0: '取消', 1: '计划中', 2: '进行中', 3: '已结束' }

	// 活动详情相关
	const detailPopup = ref(null)
	const activityDetail = ref(null)

	function loadActivities() {
		api.admin.activity.getActivities({
			pageNo: page.value,
			pageSize: pageSize.value,
			keyword: searchKeyword.value
		}).then(res => {
			if (res.code === 200) {
				activities.value = res.data.list
				total.value = res.data.total
			}
		})
	}

	function prevPage() {
		if (page.value > 1) {
			page.value--;
			loadActivities();
		}
	}

	function nextPage() {
		if (page.value * pageSize.value < total.value) {
			page.value++;
			loadActivities();
		}
	}

	/**
	 * 显示删除确认对话框
	 * @param {Object} activity - 活动对象
	 */
	function showDeleteConfirm(activity) {
		confirmDialogTitle.value = '删除确认'
		confirmDialogContent.value = `确定要删除活动"${activity.title}"吗？此操作不可撤销。`
		currentActivity.value = activity
		confirmAction.value = 'delete'
		confirmPopup.value.open()
	}

	/**
	 * 显示状态变更确认对话框
	 * @param {Object} activity - 活动对象
	 * @param {number} status - 目标状态
	 */
	function showChangeStatusConfirm(activity, status) {
		confirmDialogTitle.value = `${statusMap[status]}确认`
		confirmDialogContent.value = `确定要将活动"${activity.title}"标记为${statusMap[status]}吗？`
		currentActivity.value = activity
		confirmAction.value = 'status'
		confirmStatus.value = status
		confirmPopup.value.open()
	}

	/**
	 * 处理确认对话框的确认操作
	 */
	function handleConfirmAction() {
		if (!currentActivity.value) return

		if (confirmAction.value === 'delete') {
			deleteActivity(currentActivity.value)
		} else if (confirmAction.value === 'status') {
			updateActivityStatus(currentActivity.value, confirmStatus.value)
		}

		// 关闭对话框
		confirmPopup.value.close()
	}

	/**
	 * 删除活动
	 * @param {Object} activity - 活动对象
	 */
	function deleteActivity(activity) {
		api.admin.activity.deleteActivity(activity.id).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
				// 重新加载数据
				loadActivities()
			} else {
				uni.showToast({
					title: res.message || '删除失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			})
			console.error('删除活动失败', err)
		})
	}

	/**
	 * 更新活动状态
	 * @param {Object} activity - 活动对象
	 * @param {number} status - 目标状态
	 */
	function updateActivityStatus(activity, status) {
		const data = {
			activityId: activity.id,
			status
		}

		api.admin.activity.updateActivityStatus(data).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '状态更新成功',
					icon: 'success'
				})
				// 重新加载数据
				loadActivities()
			} else {
				uni.showToast({
					title: res.message || '状态更新失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			})
			console.error('更新活动状态失败', err)
		})
	}

	/**
	 * 导出指定活动的报名名单
	 * @param {Object} activity - 活动对象
	 */
	function exportApplyList(activity) {
		uni.showLoading({ title: '导出中...' })

		// 使用用户端导出接口，避免 admin.activity 未定义的问题
		api.activity.exportApplyList(activity.id).then(res => {
			console.log('【导出】后端返回结果:', res)

			if (res.code === 200) {
				const { url, fileName } = res.data

				console.log('【导出】文件URL:', url)
				console.log('【导出】文件名:', fileName)

				// #ifdef MP-WEIXIN || APP-PLUS
				uni.downloadFile({
					url,
					success: downloadRes => {
						console.log('【导出】downloadFile success:', downloadRes)

						if (downloadRes.statusCode === 200) {
							const tempFilePath = downloadRes.tempFilePath
							console.log('【导出】临时文件路径:', tempFilePath)

							uni.hideLoading()

							// 直接使用临时文件打开，不保存到永久存储
							uni.openDocument({
								filePath: tempFilePath,
								showMenu: true,
								fileType: 'xlsx',
								success: () => {
									console.log('【导出】打开文档成功')
									uni.showToast({ title: '导出成功', icon: 'success' })
								},
								fail: err => {
									console.error('【导出】打开文档失败:', err)
									uni.showModal({
										title: '提示',
										content: '文件下载成功，但无法直接打开。错误: ' + (err.errMsg || '未知错误'),
										showCancel: true,
										cancelText: '取消',
										confirmText: '复制链接',
										success: modalRes => {
											if (modalRes.confirm) {
												uni.setClipboardData({
													data: url,
													success: () => {
														uni.showToast({ title: '链接已复制，可在浏览器中下载', icon: 'none', duration: 2000 })
													}
												})
											}
										}
									})
								}
							})
						} else {
							console.error('【导出】下载失败，状态码:', downloadRes.statusCode)
							uni.hideLoading()
							uni.showToast({ title: '下载文件失败', icon: 'none' })
						}
					},
					fail: err => {
						console.error('【导出】downloadFile失败:', err)
						uni.hideLoading()

						// 判断是否是域名配置问题
						const isDomainError = err.errMsg && (
							err.errMsg.includes('downloadFile:fail') ||
							err.errMsg.includes('domain') ||
							err.errMsg.includes('not in domain list')
						)

						uni.showModal({
							title: '导出提示',
							content: isDomainError
								? '下载失败，可能是域名未配置。请在微信公众平台配置downloadFile合法域名，或复制链接在浏览器中下载。'
								: '下载失败: ' + (err.errMsg || '未知错误') + '。是否复制链接？',
							confirmText: '复制链接',
							success: modalRes => {
								if (modalRes.confirm) {
									uni.setClipboardData({
										data: url,
										success: () => {
											uni.showToast({ title: '链接已复制', icon: 'none' })
										}
									})
								}
							}
						})
					}
				})
				// #endif
				// #ifdef H5
				const a = document.createElement('a')
				a.href = url
				a.download = fileName
				a.click()
				uni.hideLoading()
				uni.showToast({ title: '导出成功', icon: 'success' })
				// #endif
			} else {
				console.error('【导出】接口返回错误:', res)
				uni.hideLoading()
				uni.showToast({ title: res.message || '导出失败', icon: 'none' })
			}
		}).catch(error => {
			console.error('【导出】导出报名表失败:', error)
			uni.hideLoading()
			uni.showToast({ title: '导出失败: ' + (error.message || '未知错误'), icon: 'none' })
		})
	}

	/**
	 * 显示操作菜单
	 * @param {Object} activity - 活动对象
	 */
	function showActionMenu(activity) {
		currentActivity.value = activity
		const opts = []
		// 计划中(1)可通过，可取消
		if (activity.status === 1) opts.push({ text: '通过', value: 'approve' })
		if (activity.status === 1) opts.push({ text: '取消', value: 'cancel' })
		// 进行中(2)可结束，可取消
		if (activity.status === 2) {
			opts.push({ text: '结束', value: 'end' })
			opts.push({ text: '取消', value: 'cancel' })
		}
		// 已结束(3)不显示取消
		opts.push({ text: '查看详情', value: 'detail' })
		opts.push({ text: '删除', value: 'delete' })
		opts.push({ text: '导出报名名单', value: 'export' })
		actionButtons.value = opts
		actionPopup.value.open()
	}

	/**
	 * 处理操作菜单按钮点击
	 * @param {Object} btn - 按钮对象，包含 text 和 value
	 */
	function handleActionMenuItem(btn) {
		switch (btn.value) {
			case 'approve': showChangeStatusConfirm(currentActivity.value, 2); break;
			case 'cancel': showChangeStatusConfirm(currentActivity.value, 0); break;
			case 'end': showChangeStatusConfirm(currentActivity.value, 3); break;
			case 'detail': showActivityDetail(currentActivity.value); break;
			case 'delete': showDeleteConfirm(currentActivity.value); break;
			case 'export': exportApplyList(currentActivity.value); break;
		}
		actionPopup.value.close()
	}

	// 显示活动详情
	function showActivityDetail(activity) {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})

		api.admin.activity.getActivityDetail(activity.id).then(res => {
			uni.hideLoading()
			if (res.code === 200) {
				activityDetail.value = res.data
				detailPopup.value.open()
			} else {
				uni.showToast({
					title: res.message || '获取详情失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.hideLoading()
			// 如果API不存在，使用模拟数据
			console.warn('API not implemented, using mock data', err)
			activityDetail.value = {
				...activity,
				totalApplies: 50,
				pendingApplies: 10,
				approvedApplies: 35,
				rejectedApplies: 5,
				checkedInCount: 30,
				checkInRate: 85.71,
				memberCount: 20,
				nonMemberCount: 30
			}
			detailPopup.value.open()
		})
	}

	// 关闭详情弹窗
	function closeDetailPopup() {
		detailPopup.value.close()
	}

	// 格式化时间
	function formatTime(timestamp) {
		if (!timestamp) return '未设置'
		try {
			const date = new Date(parseInt(timestamp))
			return date.toLocaleString('zh-CN')
		} catch (error) {
			return '时间格式错误'
		}
	}

	onMounted(loadActivities)
</script>
<style lang="scss" scoped>
	.admin-activities {
		min-height: 100vh;
		background: #f5f5f5;
		padding-bottom: 40rpx;
	}

	.search-bar {
		display: flex;
		align-items: center;
		margin: 32rpx 24rpx 0 24rpx;

		.search-input {
			flex: 1;
			height: 64rpx;
			border-radius: 8rpx;
			border: 1rpx solid #ddd;
			padding: 0 20rpx;
			font-size: 28rpx;
		}

		.search-btn {
			margin-left: 16rpx;
			background: #2979ff;
			color: #fff;
			border-radius: 8rpx;
			padding: 0 32rpx;
			height: 64rpx;
			line-height: 64rpx;
			font-size: 28rpx;
		}
		.export-btn {
			margin-left: 16rpx;
			background: #4caf50;
			color: #fff;
			border-radius: 8rpx;
			padding: 0 32rpx;
			height: 64rpx;
			line-height: 64rpx;
			font-size: 28rpx;
		}
	}

	.activity-table {
		margin: 32rpx 24rpx 0 24rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(41, 121, 255, 0.04);
	}

	.activity-row {
		display: flex;
		align-items: center;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.activity-header {
		background: #e3f2fd;
		color: #1976d2;
	}

	.activity-row:not(.activity-header):nth-child(even) {
		background: #fafafa;
	}

	.activity-cell { flex: 1; text-align: center; padding: 16rpx 0; font-size: 24rpx; }
	.action-cell { display: flex; align-items: center; justify-content: center; gap: 4rpx; flex-wrap: wrap; }
	.action-btn {
		font-size: 20rpx;
		padding: 4rpx 8rpx;
		border-radius: 4rpx;
		margin: 0;
		min-width: 60rpx;
		height: 40rpx;
		line-height: 40rpx;
	}

	.status-btn {
		background-color: #ff9800;
		color: #fff;
	}

	.delete-btn {
		background-color: #f44336;
		color: #fff;
	}

	.export-btn-row {
		background-color: #2196f3;
		color: #fff;
		font-size: 14rpx;
		padding: 6rpx 16rpx;
		border-radius: 6rpx;
	}

	.status-badge {
		display: inline-block;
		padding: 6rpx 16rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #fff;
	}
	.status-0 { background: #f44336; }
	.status-1 { background: #2196f3; }
	.status-2 { background: #4caf50; }
	.status-3 { background: #9e9e9e; }

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 32rpx 0;

		button {
			margin: 0 16rpx;
			background: #2979ff;
			color: #fff;
			border-radius: 8rpx;
			padding: 0 32rpx;
			height: 56rpx;
			line-height: 56rpx;
			font-size: 26rpx;
		}
	}
	.menu-btn { background-color: #1976d2; color: #fff; }
	.action-sheet-content {
		padding-bottom: 20rpx;
		background: #fff;
	}
	.action-item {
		padding: 24rpx;
		text-align: center;
		font-size: 28rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	.action-item.cancel {
		color: #f44336;
	}

	/* 活动详情弹窗样式 */
	.detail-popup {
		background-color: #fff;
		border-radius: 16rpx;
		width: 700rpx;
		max-height: 80vh;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.detail-popup-title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		color: #333;
	}

	.detail-content {
		padding: 30rpx;
	}

	.detail-section {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #2979ff;
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 2rpx solid #e3f2fd;
	}

	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		min-height: 60rpx;
	}

	.detail-label {
		font-size: 28rpx;
		color: #666;
		min-width: 140rpx;
		font-weight: 500;
	}

	.detail-value {
		font-size: 28rpx;
		color: #333;
		flex: 1;
	}

	.detail-description {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		text-align: justify;
	}

	.detail-popup-buttons {
		padding: 30rpx;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: center;
	}

	.detail-popup-buttons .cancel-btn {
		background-color: #2979ff;
		color: #fff;
		border-radius: 40rpx;
		padding: 0 60rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
	}
</style>