<template>
	<view class="detail-container pageBg">
		<!-- 状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部导航 -->
		<!-- #ifndef MP-TOUTIAO -->
		<custom-nav-bar title="社团详情" :showBack="true" @backClick="goBack"></custom-nav-bar>
		<!-- #endif -->
		
		<!-- 社团内容 -->
		<scroll-view scroll-y class="detail-content">
			<!-- 社团头图 -->
			<view class="banner-container">
				<image 
					class="club-banner" 
					:src="clubDetail.logo || '/static/images/default-club.png'" 
					mode="aspectFill"
				></image>
<!-- 				<view class="banner-overlay">
					<view class="status-tag" :class="clubDetail.status === 1 ? 'active' : 'inactive'">
						{{ clubDetail.status === 1 ? '正常' : '已禁用' }}
					</view>
				</view> -->
			</view>

			<!-- 社团标题 -->
			<view class="club-title">
				<text>{{ clubDetail.name || '加载中...' }}</text>
				<view class="club-type-tag" :class="getTypeClass(clubDetail.type)">{{ getTypeText(clubDetail.type) }}</view>
			</view>
			
			<!-- 社团信息 -->
			<view class="info-section">
				<view class="info-item">
					<uni-icons type="person" size="18" color="#b13b7a"></uni-icons>
					<text>{{ clubDetail.memberCount || 0 }}名成员</text>
				</view>
				<view class="info-item">
					<uni-icons type="location" size="18" color="#b13b7a"></uni-icons>
					<text>{{ clubDetail.address || '未设置地点' }}</text>
				</view>
				<view class="info-item" v-if="clubDetail.contact">
					<uni-icons type="phone" size="18" color="#b13b7a"></uni-icons>
					<text>联系方式:{{ clubDetail.contact }}</text>
				</view>
				<view class="info-item">
					<uni-icons type="eye" size="18" color="#b13b7a"></uni-icons>
					<text>{{ clubDetail.viewCount || 0 }}次浏览</text>
				</view>
				
				<!-- 扩展信息展示 -->
				<view class="ext-info-section" v-if="extJsonData && Object.keys(extJsonData).length > 0">
					<view class="section-title">扩展信息</view>
					<view v-for="(value, key) in extJsonData" :key="key" class="info-item ext-item">
						<text class="ext-label">{{ key }}:</text>
						<text class="ext-value">{{ value }}</text>
					</view>
				</view>
			</view>
			
			<!-- 社团详情 -->
			<view class="detail-section">
				<view class="section-title">社团简介</view>
				<rich-text :nodes="clubDetail.description || '暂无简介'"></rich-text>
			</view>
			
			<!-- 招新信息 -->
			<view class="recruitment-section" v-if="recruitmentInfo">
				<view class="section-title">招新信息</view>
				<view 
					class="recruitment-card" 
					@tap="isAdmin ? goToEditRecruitment() : null"
					:class="{'admin-editable': isAdmin}"
				>
					<!-- 管理员编辑提示 -->
					<view class="edit-tip" v-if="isAdmin">
						<uni-icons type="compose" size="16" color="#b13b7a"></uni-icons>
						<text>点击编辑招新信息</text>
					</view>
					
					<view class="recruitment-title">{{ recruitmentInfo.title }}</view>
					<view class="recruitment-period">
						<uni-icons type="calendar" size="18" color="#b13b7a"></uni-icons>
						<text>{{ formatDate(recruitmentInfo.startTime) }} ~ {{ formatDate(recruitmentInfo.endTime) }}</text>
					</view>
					<view class="recruitment-status" :class="getRecruitmentStatusClass()">
						{{ getRecruitmentStatusText() }}
					</view>
					<rich-text v-if="recruitmentInfo.description" :nodes="recruitmentInfo.description" class="recruitment-desc"></rich-text>
				</view>
			</view>
			
			<!-- 社团活动 -->
			<view class="activities-section" v-if="clubActivities.length > 0">
				<view class="section-title">社团活动</view>
				<view class="activity-list">
					<view 
						v-for="(item, idx) in clubActivities" 
						:key="idx" 
						class="activity-item"
						@tap="goToActivity(item)"
					>
						<image class="activity-image" :src="item.poster || '/static/images/default-club.png'" mode="aspectFill"></image>
						<view class="activity-info">
							<view class="activity-name">{{ item.title }}</view>
							<view class="activity-time">{{ formatDate(item.startTime) }}</view>
							<view class="activity-status" :class="getActivityStatusClass(item)">
								{{ getActivityStatusText(item) }}
							</view>
						</view>
					</view>
				</view>
				
				<view class="view-more" @tap="viewAllActivities" v-if="hasMoreActivities">
					<text>查看更多活动</text>
					<uni-icons type="right" size="14" color="#999"></uni-icons>
				</view>
			</view>
			
			<!-- 社团成员 -->
			<view class="members-section" v-if="isAdmin || isMember">
				<view class="section-title">社团成员</view>
				<view class="member-list">
					<view 
						v-for="(member, idx) in clubMembers.slice(0, 4)" 
						:key="idx" 
						class="member-item"
					>
						<image class="member-avatar" :src="member.user.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
						<view class="member-info">
							<view class="member-name">{{ member.user.username }}</view>
							<view class="member-role" :class="member.type > 0 ? 'admin' : ''">
								{{ getMemberRoleText(member.type) }}
							</view>
						</view>
					</view>
				</view>
				
				<view class="view-more" @tap="viewAllMembers" v-if="hasMoreMembers">
					<text>查看更多成员</text>
					<uni-icons type="right" size="14" color="#999"></uni-icons>
				</view>
			</view>
			
			<!-- 加入社团表单 (如果用户已经申请加入，显示申请状态) -->
			<view v-if="false" class="applied-section">
				<view class="section-title">申请状态</view>
				<view :class="['apply-status', getApplyStatusClass(applyInfo.status)]">
					{{ getApplyStatusText(applyInfo.status) }}
				</view>
				
				<view v-if="applyInfo.feedback" class="feedback-info">
					<view class="feedback-title">反馈信息：</view>
					<view class="feedback-content">{{ applyInfo.feedback }}</view>
				</view>
				
				<!-- 显示已填写的申请信息 -->
				<view v-if="applyInfo.forms" class="apply-info">
					<view class="info-title">申请信息：</view>
					<view v-for="(value, key, index) in parsedForms" :key="index" class="info-item">
						<text class="info-label">{{ getFieldLabel(key) }}：</text>
						<text class="info-value">{{ value }}</text>
					</view>
				</view>
			</view>
			
			<!-- 底部区域占位 -->
			<view style="height: 150rpx;"></view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar">
			
			<view v-if="isAdmin" class="admin-actions">
				<button class="edit-btn" @tap="editClub">编辑社团</button>
				<button class="manage-btn" @tap="manageMembers">管理成员</button>
				<button class="activity-btn" @tap="manageActivities">活动管理</button>
				<button class="apply-btn" @tap="manageApplies">申请管理</button>
			</view>
			
			<view v-else class="user-actions">
				<!-- 账号被禁用 -->
				<button v-if="memberStatus === 0" class="disabled-btn" disabled>账号已被禁用</button>
				<!-- 已提交退出申请 -->
				<button v-else-if="memberStatus === 2" class="disabled-btn" disabled>退出申请已提交</button>
				<!-- 正常用户：非成员可申请 -->
				<button v-else-if="!isMember" class="apply-btn" @tap="goToApply">申请加入</button>
				<!-- 正常成员：显示成员中心 -->
				<button v-else class="member-btn" @tap="showMemberActions">成员中心</button>
			</view>
		</view>
		
		<!-- 加入社团表单弹窗 -->
		<uni-popup ref="joinPopup" type="bottom">
			<view class="join-popup-content">
				<view class="popup-header">
					<text class="popup-title">申请加入社团</text>
					<view class="close-btn" @tap="closeJoinForm">
						<uni-icons type="close" size="20" color="#999"></uni-icons>
					</view>
				</view>
				
				<scroll-view scroll-y class="popup-content">
					<!-- 显示招新信息 -->
					<view v-if="recruitmentInfo" class="recruitment-info">
						<view class="recruitment-title">{{ recruitmentInfo.title }}</view>
						<view class="recruitment-period">
							招新时间: {{ formatDate(recruitmentInfo.startTime) }} ~ {{ formatDate(recruitmentInfo.endTime) }}
						</view>
						<rich-text v-if="recruitmentInfo.description" :nodes="recruitmentInfo.description" class="recruitment-desc"></rich-text>
					</view>
					
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
				</scroll-view>
				
				<view class="popup-footer">
					<view class="footer-buttons">
						<button class="cancel-btn" @tap="closeJoinForm">取消</button>
						<button class="confirm-btn" @tap="submitJoin">确认申请</button>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 操作菜单 -->
		<uni-popup ref="actionSheet" type="bottom">
			<view class="action-sheet-content">
				<view v-if="isMember && !isAdmin && memberStatus === 1" class="action-item warning" @tap="quitClub">
					<uni-icons type="close" size="20" color="#f44336"></uni-icons>
					<text>退出社团</text>
				</view>
				<view class="action-item cancel" @tap="hideActionSheet">取消</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 状态栏高度
const statusBarHeight = ref(20)
// 社团ID
const id = ref(null)
// 用户角色和状态
const isAdmin = ref(false)
const isMember = ref(false)
// 成员状态：0=禁用,1=正常,2=申请中
const memberStatus = ref(null)
// 社团详情
const clubDetail = ref({})
// 社团活动
const clubActivities = ref([])
const hasMoreActivities = ref(false)
// 社团成员
const clubMembers = ref([])
const hasMoreMembers = ref(false)
// 表单字段
const formFields = ref([])
// 默认申请理由
const defaultReason = ref('')
// 申请信息
const applyInfo = ref(null)
// 是否已申请
const hasApplied = ref(false)
// 解析后的表单数据
const parsedForms = ref({})
// 用户信息
const userInfo = ref({
	username: '',
	studentId: '',
	avatar: ''
})
// 招新信息
const recruitmentInfo = ref(null)
// 是否在招新期间
const isRecruitmentPeriod = ref(false)
// 扩展信息
const extJsonData = ref({})

// 弹窗引用
const joinPopup = ref(null)
const actionSheet = ref(null)

// 初始化
onMounted(async () => {
	// 获取状态栏高度
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 20

	// 获取路由参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	id.value = currentPage.options.id || currentPage.options.clubId

	// 加载社团详情
	loadClubDetail()

	// 先获取用户信息和角色
	await getUserInfo()

	// 加载社团活动（需要等待用户角色确定后再过滤）
	loadClubActivities()

	// 加载社团成员
	loadClubMembers()

	// 检查申请状态
	checkApplyStatus()

	// 检查招新状态
	checkRecruitmentStatus()

	// 加载扩展信息
	// loadExtJsonData() // 删除下方加载扩展信息的代码，因为现在直接从clubDetail中获取
})

// 获取用户信息
const getUserInfo = async () => {
	try {
		const res = await proxy.$api.user.getUserInfo()
		if (res.code === 200) {
			userInfo.value = res.data

			// 检查用户是否是社团管理员或成员
			await checkUserRole()
		}
	} catch (error) {
		// 错误已处理
	}
}

// 获取社团详情
const loadClubDetail = async () => {
	if (!id.value) {
		console.error('社团ID为空');
		uni.showToast({ title: '社团ID无效', icon: 'none' });
		setTimeout(() => {
			uni.navigateBack();
		}, 1500);
		return;
	}
	
	try {
		uni.showLoading({ title: '加载中...' });
		console.log('正在加载社团详情，ID:', id.value);
		const res = await proxy.$api.club.getClubDetail(id.value);
		uni.hideLoading();
		
		console.log('社团详情加载结果:', res);
		
		if (res.code === 200 && res.data) {
			clubDetail.value = res.data;
			
			// 解析扩展字段JSON
			parseExtJson();
			
			// 检查是否有招新信息
			if (clubDetail.value.recruitment) {
				recruitmentInfo.value = clubDetail.value.recruitment;
			}
			
			// 检查是否有报名表单
			parseForms();
		} else {
			console.error('社团详情数据无效:', res);
			uni.showToast({ title: res.message || '加载失败', icon: 'none' });
		}
	} catch (e) {
		console.error('加载社团详情异常:', e);
		uni.hideLoading();
	}
}

// 解析扩展字段JSON
const parseExtJson = () => {
	try {
		let extJson = clubDetail.value.ext_json || '{}'
		if (typeof extJson === 'string') {
			extJson = JSON.parse(extJson)
		}
		extJsonData.value = extJson
	} catch (e) {
		console.error('解析扩展字段失败', e)
		extJsonData.value = {}
	}
}

// 加载社团活动
const loadClubActivities = async () => {
	try {
		// 添加明確的clubId參數，確保後端能正確識別
		const params = {
			pageNo: 1,
			pageSize: 3,
			clubId: id.value // 明確添加clubId參數
		}

		const res = await proxy.$api.activity.getClubActivities(id.value, params)

		if (res.code === 200) {
			let activities = res.data.list || []

			// 如果不是管理员，过滤掉计划中（status=1）和已取消（status=0）的活动
			// 只显示已发布的活动（status=2或3）
			if (!isAdmin.value) {
				activities = activities.filter(activity => activity.status === 2 || activity.status === 3)
			}

			clubActivities.value = activities
			hasMoreActivities.value = res.data.total > clubActivities.value.length
		} else {
			console.error('加载社团活动失败:', res.message)
			clubActivities.value = []
			hasMoreActivities.value = false
		}
	} catch (error) {
		console.error('加载社团活动失败:', error)
		clubActivities.value = []
		hasMoreActivities.value = false
	}
}

// 加载社团成员
const loadClubMembers = async () => {
	try {
		const res = await proxy.$api.club.getClubMembers(id.value, { pageNo: 1, pageSize: 5 })
		
		if (res.code === 200) {
			clubMembers.value = res.data.list || []
			hasMoreMembers.value = res.data.total > clubMembers.value.length
		}
	} catch (error) {
		console.error('加载社团成员失败', error)
	}
}

// 检查用户角色
const checkUserRole = async () => {
	try {
		if (!id.value) return

		const res = await proxy.$api.club.getUserRole(id.value)

		if (res.code === 200 && res.data) {
			// 检查是否是管理员
			isAdmin.value = res.data.type > 0 && res.data.status === 1
			// 检查是否是成员（正常状态）
			isMember.value = res.data.status === 1
			// 保存成员状态
			memberStatus.value = res.data.status
		} else {
			isAdmin.value = false
			isMember.value = false
			memberStatus.value = null
		}
	} catch (error) {
		isAdmin.value = false
		isMember.value = false
		memberStatus.value = null
	}
}

// 检查申请状态
const checkApplyStatus = async () => {
	try {
		if (!id.value) return
		
		const res = await proxy.$api.club.checkApplyStatus(id.value)
		
		if (res.code === 200) {
			// 有申请数据，表示已申请
			if (res.data) {
				hasApplied.value = true
				applyInfo.value = res.data
				
				// 解析已提交的表单数据
				try {
					if (applyInfo.value.forms) {
						// 尝试解析JSON字符串
						if (typeof applyInfo.value.forms === 'string') {
							parsedForms.value = JSON.parse(applyInfo.value.forms)
						} else if (typeof applyInfo.value.forms === 'object') {
							// 如果已经是对象，直接使用
							parsedForms.value = applyInfo.value.forms
						} else {
							parsedForms.value = {}
						}
					} else {
						parsedForms.value = {}
					}
				} catch (e) {
					console.error('解析表单数据失败:', e)
					parsedForms.value = {}
				}
			} else {
				// data为null，表示未申请
				hasApplied.value = false
				applyInfo.value = null
				parsedForms.value = {}
			}
		}
	} catch (error) {
		hasApplied.value = false
		applyInfo.value = null
	}
}

// 解析社团表单字段
const parseFormFieldsFromData = () => {
	try {
		if (clubDetail.value.forms) {
			let formConfig;
			
			// 如果已经是对象，不需要再解析
			if (typeof clubDetail.value.forms === 'object') {
				formConfig = clubDetail.value.forms;
			} else {
				formConfig = JSON.parse(clubDetail.value.forms);
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

// 检查招新状态
const checkRecruitmentStatus = async () => {
	try {
		if (!id.value) return
		
		const res = await proxy.$api.club.getActiveRecruitment(id.value)
		
		if (res.code === 200 && res.data) {
			recruitmentInfo.value = res.data
			
			// 检查是否在招新期间
			const now = Date.now()
			const startTime = Number(recruitmentInfo.value.startTime || 0)
			const endTime = Number(recruitmentInfo.value.endTime || 0)
			
			isRecruitmentPeriod.value = now >= startTime && now <= endTime && recruitmentInfo.value.status === 1
			
			// 如果有招新信息，解析表单字段
			if (recruitmentInfo.value.forms) {
				parseFormFieldsFromRecruitment()
			}
		} else {
			recruitmentInfo.value = null
			isRecruitmentPeriod.value = false
		}
	} catch (error) {
		recruitmentInfo.value = null
		isRecruitmentPeriod.value = false
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

// 获取社团类型文本
const getTypeText = (type) => {
	switch (type) {
		case 0: return '普通社团';
		case 1: return '院级社团';
		case 2: return '校级社团';
		default: return '未知类型';
	}
}

// 获取社团类型样式类
const getTypeClass = (type) => {
	switch (type) {
		case 0: return 'normal';
		case 1: return 'college';
		case 2: return 'school';
		default: return '';
	}
}

// 获取成员角色文本
const getMemberRoleText = (type) => {
	switch (type) {
		case 0: return '普通成员';
		case 1: return '管理员';
		case 2: return '社长';
		default: return '未知角色';
	}
}

// 获取活动状态文本
const getActivityStatusText = (activity) => {
  const status = activity.status;

  // status=0: 已取消
  if (status === 0) {
    return '已取消';
  }

  // status=1: 计划中
  if (status === 1) {
    return '计划中';
  }

  // status=3: 已结束
  if (status === 3) {
    return '已结束';
  }

  // status=2: 已发布，根据时间判断
  const now = Date.now();
  const startTime = Number(activity.startTime || 0);
  const endTime = Number(activity.endTime || 0);

  if (now > endTime) {
    return '已结束';
  } else if (now >= startTime && now <= endTime) {
    return '进行中';
  } else {
    return '报名中';
  }
}

// 获取活动状态类名
const getActivityStatusClass = (activity) => {
  const status = activity.status;

  // status=0: 已取消
  if (status === 0) {
    return 'cancelled';
  }

  // status=1: 计划中
  if (status === 1) {
    return 'planned';
  }

  // status=3: 已结束
  if (status === 3) {
    return 'ended';
  }

  // status=2: 已发布，根据时间判断
  const now = Date.now();
  const startTime = Number(activity.startTime || 0);
  const endTime = Number(activity.endTime || 0);

  if (now > endTime) {
    return 'ended';
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing';
  } else {
    return 'signup';
  }
}

// 获取申请状态文本
const getApplyStatusText = (status) => {
	switch (status) {
		case 0: return '审核中';
		case 1: return '已通过';
		case 2: return '已拒绝';
		default: return '未知';
	}
}

// 获取申请状态类名
const getApplyStatusClass = (status) => {
	switch (status) {
		case 0: return 'pending';
		case 1: return 'approved';
		case 2: return 'rejected';
		default: return '';
	}
}

// 获取字段标签
const getFieldLabel = (key) => {
	const field = formFields.value.find(f => f.key === key)
	return field ? field.label : key
}

// 获取无法申请的原因
const getDisabledReason = () => {
	if (isMember) {
		return '您已是社团成员';
	}
	
	if (hasApplied) {
		if (applyInfo.value.status === 1) {
			return '申请已通过';
		} else if (applyInfo.value.status === 2) {
			return '申请被拒绝';
		}
		return '您已申请加入';
	}
	
	if (!isRecruitmentPeriod.value) {
		return '当前不在招新期间';
	}
	
	if (clubDetail.value.status !== 1) {
		return '社团已禁用';
	}
	
	return '无法申请';
}

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 前往活动详情
const goToActivity = (item) => {
	uni.navigateTo({
		url: `/pages/activity/activityDeatil?id=${item.id}`
	})
}

// 查看所有活动
const viewAllActivities = () => {
	uni.navigateTo({
		url: `/pages/club/activities?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
	})
}

// 查看所有成员
const viewAllMembers = () => {
	uni.navigateTo({
		url: `/pages/club/members?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
	})
}

// 显示加入表单
const showJoinForm = () => {
	// 检查用户信息是否完善
	if (!isUserInfoComplete()) {
		return;
	}
	
	joinPopup.value.open();
}

// 跳转到申请页面
const goToApply = () => {
	// 检查用户信息是否完善
	if (!isUserInfoComplete()) {
		return;
	}
	// 检查是否有进行中的招新活动
	if (!recruitmentInfo.value || !isRecruitmentPeriod.value) {
		uni.showToast({ title: '当前不在招新期间', icon: 'none' });
		return;
	}
	// 跳转到申请页面，传递社团ID和招新ID
	uni.navigateTo({
		url: `/pages/club/apply?clubId=${id.value}&recruitmentId=${recruitmentInfo.value ? recruitmentInfo.value.id : ''}`
	});
}

// 检查用户信息是否完整
const isUserInfoComplete = () => {
	// 检查必要的用户信息字段是否存在且不为空
	const requiredFields = ['username', 'studentId', 'mobile', 'college', 'className'];
	const missingFields = [];
	
	for (const field of requiredFields) {
		if (!userInfo.value[field]) {
			missingFields.push(getFieldDisplayName(field));
		}
	}
	
	if (missingFields.length > 0) {
		uni.showModal({
			title: '信息不完整',
			content: `您的个人信息不完整，缺少: ${missingFields.join('、')}，请先完善个人信息后再申请加入社团`,
			confirmText: '去完善',
			success: (res) => {
				if (res.confirm) {
					uni.switchTab({
						url: '/pages/user/user'
					});
				}
			}
		});
		return false;
	}
	
	return true;
}

// 获取字段显示名称
const getFieldDisplayName = (field) => {
	const nameMap = {
		username: '姓名',
		studentId: '学号',
		mobile: '手机号',
		college: '学院',
		className: '班级',
		major: '专业'
	};
	return nameMap[field] || field;
}

// 关闭加入表单
const closeJoinForm = () => {
	joinPopup.value.close()
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

// 提交加入申请
const submitJoin = async () => {
	// 验证用户信息完整性
	if (!isUserInfoComplete()) {
		return;
	}
	
	// 验证是否在招新期间
	if (!isRecruitmentPeriod.value) {
		uni.showToast({
			title: '当前不在招新期间',
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
	
	// 添加招新ID
	if (recruitmentInfo.value && recruitmentInfo.value.id) {
		formData.recruitmentId = recruitmentInfo.value.id;
	}
	
	try {
		uni.showLoading({ title: '提交中...' });
		
		// 调用API提交申请
		const res = await proxy.$api.club.applyJoinClub(id.value, formData);
		
		// 确保无论成功与否都隐藏加载提示
		uni.hideLoading();
		
		if (res.code === 200) {
			// 先关闭表单弹窗
			closeJoinForm();
			
			// 更新本地状态
			hasApplied.value = true;
			applyInfo.value = {
				id: res.data.applyId,
				clubId: id.value,
				userId: userInfo.value.id,
				status: res.data.status || 0,
				forms: JSON.stringify(formData),
				feedback: '',
				createTime: Date.now()
			};
			
			// 保存解析后的表单数据
			parsedForms.value = formData;
			
			// 显示成功提示
			uni.showToast({
				title: '申请已提交，等待审核',
				icon: 'success'
			});
		} else {
			// 显示错误提示
			uni.showToast({
				title: res.message || '申请失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.hideLoading();
		
		// 尝试检查是否已经申请成功
		await checkApplyStatus();
		
		// 如果检查后发现已申请，不显示错误
		if (hasApplied.value) {
			// 如果已经申请成功，关闭表单
			closeJoinForm();
		} else {
			// 如果未申请成功，显示错误
			uni.showToast({
				title: '申请失败，请稍后重试',
				icon: 'none'
			});
		}
	}
}

// 显示成员操作菜单
const showMemberActions = () => {
	actionSheet.value.open();
}

// 隐藏操作菜单
const hideActionSheet = () => {
	actionSheet.value.close();
}


// 提交退出申请（需要管理员审批）
const quitClub = () => {
	uni.showModal({
    title: '退出申请',
    content: '确认要提交退出社团申请吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({ title: '处理中...' });
          // 提交退出申请，设置成员状态为2（退出申请中）
          const result = await proxy.$api.club.updateMemberStatus({ clubId: id.value, userId: userInfo.value.id, status: 2 });
					uni.hideLoading();
          if (result.code === 200) {
						// 更新本地状态
            memberStatus.value = 2;
						isMember.value = false;
            uni.showToast({ title: '退出申请已提交，请等待管理员审核', icon: 'success' });
					} else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
				}
			}
		}
	});
};

// 编辑社团
const editClub = () => {
	uni.navigateTo({
		url: `/pages/club/editClub?id=${id.value}`
	});
}

// 管理成员
const manageMembers = () => {
	uni.navigateTo({
		url: `/pages/club/members?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
	});
}

// 管理活动
const manageActivities = () => {
	uni.navigateTo({
		url: `/pages/club/activities?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
	});
}

// 管理申请
const manageApplies = () => {
	uni.navigateTo({
		url: `/pages/club/applies?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
	});
}

// 取消申请
const cancelApply = async () => {
	uni.showModal({
		title: '确认取消',
		content: '确定要取消申请加入该社团吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({ title: '取消中...' });
					
					const res = await proxy.$api.club.cancelApply(applyInfo.value.id);
					
					uni.hideLoading();
					
					if (res.code === 200) {
						// 更新本地状态
						hasApplied.value = false;
						applyInfo.value = null;
						parsedForms.value = {};
						
						uni.showToast({
							title: '已取消申请',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.message || '取消失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					
					// 重新检查申请状态
					await checkApplyStatus();
					
					if (!hasApplied.value) {
						// 如果已经取消成功，不显示错误
					} else {
						uni.showToast({
							title: '网络异常，请稍后重试',
							icon: 'none'
						});
					}
				}
			}
		}
	});
}

// 获取招新状态文本
const getRecruitmentStatusText = () => {
	if (recruitmentInfo.value.status === 0) {
		return '招新已结束';
	} else if (isRecruitmentPeriod.value) {
		return '当前招新中';
	} else {
		return '招新未开始';
	}
}

// 获取招新状态类名
const getRecruitmentStatusClass = () => {
	if (recruitmentInfo.value.status === 0) {
		return 'ended';
	} else if (isRecruitmentPeriod.value) {
		return 'ongoing';
	} else {
		return 'planned';
	}
}

// 创建招新
const handleCreateRecruitment = () => {
	uni.navigateTo({
		url: `/pages/club/createRecruitment?clubId=${id.value}`
	});
}

// 跳转到编辑招新页面
const goToEditRecruitment = () => {
	uni.navigateTo({
		url: `/pages/club/editRecruitment?clubId=${id.value}&recruitmentId=${recruitmentInfo.value ? recruitmentInfo.value.id : ''}`
	});
}
</script>

<style lang="scss" scoped>
// 工具混合 - 移到顶部
@mixin text-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.detail-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
}

.status-bar {
	width: 100%;
	background-color: #b13b7a;
}

.detail-content {
	flex: 1;
	overflow: hidden;
}

// 社团头图
.banner-container {
	position: relative;
	width: 100%;
	height: 400rpx;
	
	.club-banner {
		width: 100%;
		height: 100%;
	}
	
	.banner-overlay {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		z-index: 2;
	}
}

// 社团标题
.club-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 30rpx 20rpx;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	
	.club-type-tag {
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		color: #fff;
		
		&.normal {
			background-color: #4caf50;
		}
		
		&.college {
			background-color: #2196f3;
		}
		
		&.school {
			background-color: #b13b7a;
		}
	}
}

// 社团信息
.info-section {
	display: flex;
	flex-wrap: wrap;
	padding: 0 30rpx 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.info-item {
		display: flex;
		align-items: center;
		margin-right: 30rpx;
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #666;
		
		uni-icons {
			margin-right: 8rpx;
		}
	}
}

// 扩展信息
.ext-info-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}
	
	.ext-item {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
		font-size: 26rpx;
		color: #666;
		
		.ext-label {
			font-weight: bold;
			color: #333;
			margin-right: 10rpx;
		}
	}
}

// 详情部分
.detail-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
	}
	
	rich-text {
		font-size: 28rpx;
		line-height: 1.6;
		color: #666;
	}
}

// 招新信息
.recruitment-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.recruitment-card {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
		
		// 可编辑样式
		&.admin-editable {
			position: relative;
			border: 1rpx dashed #b13b7a;
			
			&:hover, &:active {
				background-color: #fff9fb;
			}
		}
		
		.edit-tip {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;
			font-size: 24rpx;
			color: #999;
			
			uni-icons {
				margin-right: 8rpx;
			}
		}
		
		.recruitment-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.recruitment-period {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #999;
			margin-bottom: 10rpx;
			
			uni-icons {
				margin-right: 8rpx;
			}
		}
		
		.recruitment-status {
			display: inline-block;
			margin-top: 10rpx;
			margin-bottom: 20rpx;
			padding: 6rpx 20rpx;
			border-radius: 20rpx;
			font-size: 26rpx;
			
			&.planned {
				background-color: #e3f2fd;
				color: #2196f3;
			}
			
			&.ongoing {
				background-color: #e8f5e9;
				color: #4caf50;
			}
			
			&.ended {
				background-color: #f5f5f5;
				color: #9e9e9e;
			}
		}
		
		.recruitment-desc {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
		}

		.recruitment-btn {
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
			background-color: #b13b7a;
			color: #fff;
			border-radius: 8rpx;
			margin-top: 20rpx;
		}
	}
}

// 社团活动
.activities-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.activity-list {
		margin-top: 20rpx;
	}
	
	.activity-item {
		display: flex;
		margin-bottom: 30rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.activity-image {
			width: 160rpx;
			height: 120rpx;
			border-radius: 8rpx;
			margin-right: 20rpx;
		}
		
		.activity-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			
			.activity-name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
				@include text-ellipsis;
			}
			
			.activity-time {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 10rpx;
			}
			
			.activity-status {
				align-self: flex-start;
				font-size: 22rpx;
				padding: 2rpx 12rpx;
				border-radius: 20rpx;

				&.planned {
					background-color: #fff3e0;
					color: #ff9800;
				}

				&.signup {
					background-color: #e3f2fd;
					color: #2196f3;
				}

				&.ongoing {
					background-color: #e8f5e9;
					color: #4caf50;
				}

				&.ended {
					background-color: #f5f5f5;
					color: #9e9e9e;
				}

				&.cancelled {
					background-color: #ffebee;
					color: #f44336;
				}
			}
		}
	}
	
	.view-more {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #999;
		
		uni-icons {
			margin-left: 6rpx;
		}
	}
}

// 社团成员
.members-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.member-list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20rpx;
	}
	
	.member-item {
		display: flex;
		align-items: center;
		width: 48%;
		margin-bottom: 20rpx;
		margin-right: 2%;
		padding: 16rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.member-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 16rpx;
		}
		
		.member-info {
			flex: 1;
			
			.member-name {
				font-size: 26rpx;
				color: #333;
				margin-bottom: 6rpx;
				@include text-ellipsis;
			}
			
			.member-role {
				font-size: 22rpx;
				color: #999;
				
				&.admin {
					color: #b13b7a;
				}
			}
		}
	}
}

// 申请状态
.applied-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.apply-status {
		display: inline-block;
		margin-top: 10rpx;
		margin-bottom: 20rpx;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
		
		&.pending {
			background-color: #fff8e1;
			color: #ffc107;
		}
		
		&.approved {
			background-color: #e8f5e9;
			color: #4caf50;
		}
		
		&.rejected {
			background-color: #ffebee;
			color: #f44336;
		}
	}
	
	.feedback-info {
		margin-bottom: 20rpx;
		
		.feedback-title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}
		
		.feedback-content {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
			padding: 20rpx;
			background-color: #f5f5f5;
			border-radius: 8rpx;
		}
	}
	
	.apply-info {
		.info-title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
		}
		
		.info-item {
			margin-bottom: 10rpx;
			font-size: 26rpx;
			
			.info-label {
				color: #999;
			}
			
			.info-value {
				color: #333;
			}
		}
	}
}

// 底部操作栏
.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
	
	.admin-actions {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		
		button {
			margin-left: 20rpx;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
			border-radius: 40rpx;
		}
		
		.edit-btn {
			background-color: #f5f5f5;
			color: #333;
		}
		
		.manage-btn {
			background-color: #b13b7a;
			color: #fff;
		}

		.activity-btn {
			background-color: #4caf50;
			color: #fff;
		}

		.apply-btn {
			background-color: #2196f3;
			color: #fff;
		}

		.recruit-btn {
			background-color: #4caf50;
			color: #fff;
			margin-left: 20rpx;
		}
	}
	
	.user-actions {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		
		button {
			width: 240rpx;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
			border-radius: 40rpx;
		}
		
		.apply-btn {
			background-color: #b13b7a;
			color: #fff;
		}
		
		.member-btn {
			background-color: #4caf50;
			color: #fff;
		}
		
		.disabled-btn {
			background-color: #ccc;
			color: #666;
			opacity: 0.7;
		}
	}
}

// 状态标签
.status-tag {
	display: inline-block;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	
	&.active {
		background-color: #e8f5e9;
		color: #4caf50;
	}
	
	&.inactive {
		background-color: #ffebee;
		color: #f44336;
	}
}

// 加入社团表单弹窗
.join-popup-content {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	
	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		.popup-title {
			font-size: 32rpx;
			font-weight: bold;
		}
		
		.close-btn {
			padding: 10rpx;
		}
	}
	
	.popup-content {
		max-height: 60vh;
		padding: 30rpx;
		
		.recruitment-info {
			margin-bottom: 30rpx;
			padding: 20rpx;
			background-color: #f5f5f5;
			border-radius: 12rpx;
			
			.recruitment-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.recruitment-period {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 10rpx;
			}
			
			.recruitment-desc {
				font-size: 26rpx;
				color: #666;
				line-height: 1.6;
			}
		}
		
		.form-content {
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
	
	.popup-footer {
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #eee;
		
		.footer-buttons {
			display: flex;
			
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
			
			.confirm-btn {
				background-color: #b13b7a;
				color: #fff;
			}
		}
	}
}

// 操作菜单
.action-sheet-content {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	
	.action-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100rpx;
		font-size: 28rpx;
		color: #333;
		border-bottom: 1rpx solid #eee;
		
		uni-icons {
			margin-right: 10rpx;
		}
		
		&.warning {
			color: #f44336;
		}
		
		&.cancel {
			margin-top: 20rpx;
			color: #999;
		}
	}
}
</style>
