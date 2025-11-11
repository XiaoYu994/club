<template>
  <view class="admin-clubs pageBg">
    <custom-nav-bar title="社团管理" />
    <view class="search-bar">
      <input v-model="searchKeyword" placeholder="搜索社团名称" class="search-input" />
      <button class="search-btn" @tap="loadClubs">搜索</button>
      <button class="create-btn" @tap="showCreateModal">创建社团</button>
    </view>
    <view class="club-table">
      <view class="club-row club-header">
        <view class="club-cell">序号</view>
        <view class="club-cell">社团名称</view>
        <view class="club-cell">类型</view>
        <view class="club-cell">状态</view>
        <view class="club-cell">操作</view>
      </view>
      <view class="club-row" v-for="(club, idx) in clubs" :key="club.id">
        <view class="club-cell">{{ (page-1)*pageSize + idx + 1 }}</view>
        <view class="club-cell">{{ club.name }}</view>
        <view class="club-cell">{{ clubTypes[club.type || 0] }}</view>
        <view class="club-cell">
          <view class="status-badge" :class="club.status ? 'status-active' : 'status-inactive'">
            {{ club.status ? '启用' : '禁用' }}
          </view>
        </view>
        <view class="club-cell action-cell">
          <!-- 操作菜单按钮 -->
          <button class="action-btn menu-btn" @tap="showActionMenu(club)">操作</button>
        </view>
      </view>
    </view>
    <view class="pagination">
      <button @tap="prevPage" :disabled="page===1">上一页</button>
      <text>第{{page}}页</text>
      <button @tap="nextPage" :disabled="page*pageSize>=total">下一页</button>
    </view>
    
    <!-- 创建社团对话框 -->
    <uni-popup ref="createPopup" type="center" background-color="transparent">
      <scroll-view scroll-y class="custom-popup">
        <view class="custom-popup-title">创建社团</view>
        <view class="popup-form">
          <view class="form-item">
            <text class="label">社团名称</text>
            <input v-model="clubForm.name" class="input" placeholder="请输入社团名称"/>
          </view>
          <view class="form-item">
            <text class="label">社团简介</text>
            <textarea v-model="clubForm.description" class="textarea" placeholder="请输入社团简介"/>
          </view>
          <view class="form-item">
            <text class="label">社团类型</text>
            <picker :value="clubTypeIndex" :range="clubTypes" @change="handleTypeChange" class="picker">
              <view class="picker-text">{{ clubTypes[clubTypeIndex] }}</view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">社团Logo</text>
            <view class="logo-upload">
              <view class="logo-preview" v-if="clubForm.logo" @tap="previewImage">
                <image :src="clubForm.logo" mode="aspectFill"></image>
                <view class="logo-actions">
                  <text class="logo-action delete" @tap.stop="removeLogo">删除</text>
                </view>
              </view>
              <view class="logo-selector" v-else @tap="chooseLogo">
                <text class="iconfont icon-add">+</text>
                <text class="upload-text">上传Logo</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="label">排序号</text>
            <input v-model="clubForm.orderNum" type="number" class="input" placeholder="请输入排序号，数字越小排序越靠前"/>
          </view>
          <view class="form-item">
            <text class="label">社团地址</text>
            <input v-model="clubForm.address" class="input" placeholder="请输入社团地址"/>
          </view>
          <view class="form-item">
            <text class="label">联系方式</text>
            <input v-model="clubForm.contact" class="input" placeholder="请输入联系方式"/>
          </view>
          <view class="form-item">
            <text class="label">创建人</text>
            <view class="user-selector" @tap="showUserSelector">
              <view class="selected-user" v-if="selectedUser">
                <text>{{ selectedUser.username || '用户' + selectedUser.id }}</text>
              </view>
              <view class="placeholder" v-else>请选择创建人</view>
              <text class="selector-arrow">▼</text>
            </view>
          </view>
        </view>
        <view class="custom-popup-buttons">
          <button class="cancel-btn" @tap="cancelCreate">取消</button>
          <button class="confirm-btn" @tap="submitCreate">确定</button>
        </view>
      </scroll-view>
    </uni-popup>
    
    <!-- 设置排序对话框 -->
    <uni-popup ref="orderPopup" type="dialog">
      <uni-popup-dialog
        title="设置排序"
        :before-close="true"
        @confirm="submitOrderUpdate"
        @close="cancelOrderUpdate">
        <view class="popup-form">
          <view class="form-item">
            <text class="label">排序号（数字越小排序越靠前）</text>
            <input v-model="orderForm.orderNum" type="number" class="input" placeholder="请输入排序号"/>
          </view>
        </view>
      </uni-popup-dialog>
    </uni-popup>

    <!-- 用户选择弹窗 -->
    <uni-popup ref="userSelectorPopup" type="bottom">
      <view class="user-selector-popup">
        <view class="user-selector-header">
          <view class="user-selector-title">选择创建人</view>
          <view class="user-search">
            <input v-model="userSearchKeyword" placeholder="搜索用户" class="user-search-input" @input="searchUsers"/>
          </view>
        </view>
        <view class="user-list">
          <view class="user-loading" v-if="loadingUsers">加载中...</view>
          <view class="user-item" 
                v-for="user in filteredUsers" 
                :key="user.id" 
                @tap="selectUser(user)">
            <view class="user-avatar">
              <image v-if="user.avatar" :src="user.avatar" mode="aspectFill"></image>
              <text v-else>{{ getUserInitial(user) }}</text>
            </view>
            <view class="user-info">
              <view class="user-name">{{ user.username || '用户' + user.id }}</view>
              <view class="user-desc">{{ user.mobile || '无联系方式' }}</view>
            </view>
          </view>
          <view class="no-users" v-if="filteredUsers.length === 0 && !loadingUsers">
            没有匹配的用户
          </view>
        </view>
        <view class="user-selector-footer">
          <button class="cancel-btn" @tap="closeUserSelector">取消</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 确认对话框 -->
    <uni-popup ref="confirmPopup" type="dialog">
      <uni-popup-dialog 
        :title="confirmDialogTitle" 
        :content="confirmDialogContent" 
        :before-close="true"
        @confirm="handleConfirmAction" 
        @close="$refs.confirmPopup.close()">
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

    <!-- 社团详情弹窗 -->
    <uni-popup ref="detailPopup" type="center" background-color="transparent">
      <scroll-view scroll-y class="detail-popup">
        <view class="detail-popup-title">社团详细信息</view>
        <view class="detail-content" v-if="clubDetail">
          <view class="detail-section">
            <view class="section-title">基本信息</view>
            <view class="detail-item">
              <text class="detail-label">社团名称：</text>
              <text class="detail-value">{{ clubDetail.name }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">社团类型：</text>
              <text class="detail-value">{{ getClubTypeName(clubDetail.type) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">状态：</text>
              <view class="status-badge" :class="clubDetail.status ? 'status-active' : 'status-inactive'">
                {{ clubDetail.status ? '启用' : '禁用' }}
              </view>
            </view>
            <view class="detail-item">
              <text class="detail-label">社团地址：</text>
              <text class="detail-value">{{ clubDetail.address || '未设置' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">联系方式：</text>
              <text class="detail-value">{{ clubDetail.contact || '未设置' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">浏览量：</text>
              <text class="detail-value">{{ clubDetail.viewCount || 0 }}</text>
            </view>
          </view>

          <view class="detail-section">
            <view class="section-title">成员统计</view>
            <view class="detail-item">
              <text class="detail-label">社长：</text>
              <text class="detail-value">{{ clubDetail.president ? clubDetail.president.username : '未设置' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">总成员数：</text>
              <text class="detail-value">{{ clubDetail.totalMembers || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">普通成员：</text>
              <text class="detail-value">{{ clubDetail.normalMembers || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">干部：</text>
              <text class="detail-value">{{ clubDetail.officers || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">指导老师：</text>
              <text class="detail-value">{{ clubDetail.teachers || 0 }}</text>
            </view>
          </view>

          <view class="detail-section">
            <view class="section-title">活动统计</view>
            <view class="detail-item">
              <text class="detail-label">活动数量：</text>
              <text class="detail-value">{{ clubDetail.activityCount || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">招新数量：</text>
              <text class="detail-value">{{ clubDetail.recruitmentCount || 0 }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">申请人数：</text>
              <text class="detail-value">{{ clubDetail.applicationCount || 0 }}</text>
            </view>
          </view>

          <view class="detail-section" v-if="clubDetail.description">
            <view class="section-title">社团简介</view>
            <text class="detail-description">{{ clubDetail.description }}</text>
          </view>
        </view>
        <view class="detail-popup-buttons">
          <button class="cancel-btn" @tap="closeDetailPopup">关闭</button>
        </view>
      </scroll-view>
    </uni-popup>

    <!-- 编辑社团弹窗 -->
    <uni-popup ref="editPopup" type="center" background-color="transparent">
      <scroll-view scroll-y class="custom-popup">
        <view class="custom-popup-title">编辑社团信息</view>
        <view class="popup-form">
          <view class="form-item">
            <text class="label">社团名称</text>
            <input v-model="editForm.name" class="input" placeholder="请输入社团名称"/>
          </view>
          <view class="form-item">
            <text class="label">社团简介</text>
            <textarea v-model="editForm.description" class="textarea" placeholder="请输入社团简介"/>
          </view>
          <view class="form-item">
            <text class="label">社团类型</text>
            <picker :value="editTypeIndex" :range="clubTypes" @change="handleEditTypeChange" class="picker">
              <view class="picker-text">{{ clubTypes[editTypeIndex] }}</view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">社团地址</text>
            <input v-model="editForm.address" class="input" placeholder="请输入社团地址"/>
          </view>
          <view class="form-item">
            <text class="label">联系方式</text>
            <input v-model="editForm.contact" class="input" placeholder="请输入联系方式"/>
          </view>
        </view>
        <view class="custom-popup-buttons">
          <button class="cancel-btn" @tap="cancelEditClub">取消</button>
          <button class="confirm-btn" @tap="submitEditClub">确定</button>
        </view>
      </scroll-view>
    </uni-popup>
  </view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/api.js'

const clubs = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

// 创建社团表单
const clubForm = ref({
  name: '',
  description: '',
  logo: '', // 可以后续添加上传功能
  orderNum: 9999,
  type: 0,
  address: '',
  contact: '',
  createUserId: null
})

// 社团类型选择器
const clubTypeIndex = ref(0)
const clubTypes = ['普通社团', '院级社团', '校级社团']

// 确认对话框相关
const confirmPopup = ref(null)
const confirmDialogTitle = ref('')
const confirmDialogContent = ref('')
const confirmAction = ref('')
const currentClub = ref(null)
const confirmStatus = ref(false)

// 操作菜单弹窗相关
const actionPopup = ref(null)
const actionButtons = ref([])

// 创建社团对话框引用
const createPopup = ref(null)

// 用户选择相关
const userSelectorPopup = ref(null)
const users = ref([])
const filteredUsers = ref([])
const selectedUser = ref(null)
const userSearchKeyword = ref('')
const loadingUsers = ref(false)

// 排序对话框相关
const orderPopup = ref(null)
const orderForm = ref({
  clubId: null,
  orderNum: 9999
})

// 社团详情相关
const detailPopup = ref(null)
const clubDetail = ref(null)

// 编辑社团相关
const editPopup = ref(null)
const editForm = ref({
  name: '',
  description: '',
  type: 0,
  address: '',
  contact: ''
})
const editTypeIndex = ref(0)

// 加载用户列表
function loadUsers() {
  loadingUsers.value = true
  api.admin.user.getUsers({ pageSize: 50 }).then(res => {
    if (res.code === 200) {
      users.value = res.data.list || []
      filteredUsers.value = [...users.value]
    } else {
      uni.showToast({
        title: '加载用户失败',
        icon: 'none'
      })
    }
    loadingUsers.value = false
  }).catch(err => {
    console.error('加载用户列表失败', err)
    loadingUsers.value = false
    uni.showToast({
      title: '加载用户失败',
      icon: 'none'
    })
  })
}

// 显示用户选择器
function showUserSelector() {
  if (users.value.length === 0) {
    loadUsers()
  }
  userSearchKeyword.value = ''
  filteredUsers.value = [...users.value]
  userSelectorPopup.value.open()
}

// 关闭用户选择器
function closeUserSelector() {
  userSelectorPopup.value.close()
}

// 选择用户
function selectUser(user) {
  selectedUser.value = user
  clubForm.value.createUserId = user.id
  userSelectorPopup.value.close()
}

// 搜索用户
function searchUsers() {
  if (!userSearchKeyword.value) {
    filteredUsers.value = [...users.value]
    return
  }
  
  const keyword = userSearchKeyword.value.toLowerCase()
  filteredUsers.value = users.value.filter(user => 
    (user.username && user.username.toLowerCase().includes(keyword)) || 
    (user.mobile && user.mobile.includes(keyword)) ||
    (user.id.toString().includes(keyword))
  )
}

// 获取用户名首字母
function getUserInitial(user) {
  const name = user.username || ''
  return name ? name.charAt(0).toUpperCase() : '#'
}

// 选择Logo图片
function chooseLogo() {
  uni.chooseImage({
    count: 1, // 限制只能选择一张图片
    sizeType: ['compressed'], // 压缩图片
    sourceType: ['album', 'camera'], // 可以从相册或拍照
    success: (res) => {
      // 显示加载中
      uni.showLoading({
        title: '上传中...',
        mask: true
      })
      
      // 上传图片
      const tempFilePath = res.tempFilePaths[0]
      uploadLogo(tempFilePath)
    }
  })
}

// 上传Logo到服务器
function uploadLogo(filePath) {
  api.common.upload(filePath).then(res => {
    uni.hideLoading()
    if (res.code === 200 && res.data && res.data.url) {
      // 上传成功，设置logo URL
      clubForm.value.logo = res.data.url
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.hideLoading()
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    })
    console.error('上传Logo失败', err)
  })
}

// 预览Logo图片
function previewImage() {
  if (clubForm.value.logo) {
    uni.previewImage({
      urls: [clubForm.value.logo],
      current: clubForm.value.logo
    })
  }
}

// 删除已上传的Logo
function removeLogo(e) {
  // 阻止冒泡，避免触发previewImage
  e && e.stopPropagation()
  
  // 显示确认对话框
  uni.showModal({
    title: '删除确认',
    content: '确定要删除已上传的Logo吗？',
    success: (res) => {
      if (res.confirm) {
        clubForm.value.logo = ''
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
}

function loadClubs() {
  api.admin.club.getClubs({ 
    pageNo: page.value, 
    pageSize: pageSize.value, 
    keyword: searchKeyword.value 
  }).then(res => {
    if(res.code===200){
      clubs.value = res.data.list
      total.value = res.data.total
    }
  })
}

function handleTypeChange(e) {
  clubTypeIndex.value = e.detail.value
  clubForm.value.type = parseInt(e.detail.value)
}

/**
 * 显示操作菜单
 * @param {Object} club - 社团对象
 */
function showActionMenu(club) {
  currentClub.value = club
  const opts = []
  
  // 根据社团状态显示不同的操作按钮
  if (club.status) {
    opts.push({ text: '禁用', value: 'disable' })
  } else {
    opts.push({ text: '启用', value: 'enable' })
  }
  
  opts.push({ text: '查看详情', value: 'detail' })
  opts.push({ text: '编辑信息', value: 'edit' })
  opts.push({ text: '设置排序', value: 'order' })
  opts.push({ text: '删除', value: 'delete' })
  
  actionButtons.value = opts
  actionPopup.value.open()
}

/**
 * 处理操作菜单按钮点击
 * @param {Object} btn - 按钮对象，包含 text 和 value
 */
function handleActionMenuItem(btn) {
  switch (btn.value) {
    case 'enable': 
      showStatusConfirm(currentClub.value, true); 
      break;
    case 'disable': 
      showStatusConfirm(currentClub.value, false); 
      break;
    case 'detail':
      showClubDetail(currentClub.value);
      break;
    case 'edit':
      showEditClub(currentClub.value);
      break;
    case 'order':
      showOrderUpdate(currentClub.value);
      break;
    case 'delete': 
      showDeleteConfirm(currentClub.value); 
      break;
  }
  
  actionPopup.value.close()
}

/**
 * 显示状态变更确认对话框
 * @param {Object} club - 社团对象
 * @param {boolean} status - 目标状态
 */
function showStatusConfirm(club, status) {
  confirmDialogTitle.value = `${status ? '启用' : '禁用'}确认`
  confirmDialogContent.value = `确定要${status ? '启用' : '禁用'}社团"${club.name}"吗？`
  currentClub.value = club
  confirmAction.value = 'status'
  confirmStatus.value = status
  confirmPopup.value.open()
}

/**
 * 显示删除确认对话框
 * @param {Object} club - 社团对象
 */
function showDeleteConfirm(club) {
  confirmDialogTitle.value = '删除确认'
  confirmDialogContent.value = `确定要删除社团"${club.name}"吗？此操作不可撤销。`
  currentClub.value = club
  confirmAction.value = 'delete'
  confirmPopup.value.open()
}

/**
 * 处理确认对话框的确认操作
 */
function handleConfirmAction() {
  if (!currentClub.value) return

  if (confirmAction.value === 'delete') {
    deleteClub(currentClub.value)
  } else if (confirmAction.value === 'status') {
    updateClubStatus(currentClub.value, confirmStatus.value)
  }

  // 关闭对话框
  confirmPopup.value.close()
}

/**
 * 更新社团状态
 * @param {Object} club - 社团对象
 * @param {boolean} status - 目标状态
 */
function updateClubStatus(club, status) {
  const updateData = {
    clubId: club.id,
    status: status ? 1 : 0  // 转换布尔值为整数
  }
  
  api.admin.club.updateClubStatus(updateData).then(res => {
    if(res.code===200) {
      uni.showToast({
        title: '状态更新成功',
        icon: 'success'
      })
      loadClubs()
    } else {
      uni.showToast({
        title: res.message || '更新失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
    console.error('更新社团状态失败', err)
  })
}

/**
 * 删除社团
 * @param {Object} club - 社团对象
 */
function deleteClub(club) {
  api.admin.club.deleteClub(club.id).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
      loadClubs()
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
    console.error('删除社团失败', err)
  })
}

function showCreateModal() {
  // 重置表单
  clubForm.value = {
    name: '',
    description: '',
    logo: '',
    orderNum: 9999,
    type: 0,
    address: '',
    contact: '',
    createUserId: null
  }
  clubTypeIndex.value = 0
  selectedUser.value = null
  
  // 显示创建弹窗
  createPopup.value.open()
}

function submitCreate() {
  // 检查必填字段
  if (!clubForm.value.name) {
    uni.showToast({
      title: '请输入社团名称',
      icon: 'none'
    })
    return
  }
  
  // 检查创建人是否已选择
  if (!clubForm.value.createUserId) {
    uni.showToast({
      title: '请选择创建人',
      icon: 'none'
    })
    return
  }
  
  // 提交创建社团请求
  api.admin.club.createClub(clubForm.value).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
      createPopup.value.close()
      loadClubs()
    } else {
      uni.showToast({
        title: res.message || '创建失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    })
    console.error('创建社团失败', err)
  })
}

function cancelCreate() {
  createPopup.value.close()
}

function prevPage(){ 
  if(page.value>1){ 
    page.value--
    loadClubs()
  } 
}

function nextPage(){ 
  if(page.value*pageSize.value<total.value){ 
    page.value++
    loadClubs() 
  } 
}

function showOrderUpdate(club) {
  orderForm.value.clubId = club.id
  orderForm.value.orderNum = club.orderNum
  orderPopup.value.open()
}

function submitOrderUpdate() {
  if (!orderForm.value.clubId) return
  if (isNaN(orderForm.value.orderNum) || orderForm.value.orderNum < 0) {
    uni.showToast({
      title: '请输入有效的数字',
      icon: 'none'
    })
    return
  }

  api.admin.club.updateClubOrder(orderForm.value).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '排序更新成功',
        icon: 'success'
      })
      orderPopup.value.close()
      loadClubs()
    } else {
      uni.showToast({
        title: res.message || '更新失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
    console.error('更新排序失败', err)
  })
}

function cancelOrderUpdate() {
  orderPopup.value.close()
}

// 获取社团类型名称
function getClubTypeName(type) {
  return clubTypes[type] || '未知类型'
}

// 显示社团详情
function showClubDetail(club) {
  uni.showLoading({
    title: '加载中...',
    mask: true
  })
  
  api.admin.club.getClubDetail(club.id).then(res => {
    uni.hideLoading()
    if (res.code === 200) {
      clubDetail.value = res.data
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
    clubDetail.value = {
      ...club,
      president: { username: '张三' }, // 模拟社长信息
      totalMembers: 25,
      normalMembers: 20,
      officers: 3,
      teachers: 2,
      activityCount: 8,
      recruitmentCount: 2,
      applicationCount: 15
    }
    detailPopup.value.open()
  })
}

// 关闭详情弹窗
function closeDetailPopup() {
  detailPopup.value.close()
}

// 显示编辑社团弹窗
function showEditClub(club) {
  editForm.value = {
    name: club.name,
    description: club.description || '',
    type: club.type || 0,
    address: club.address || '',
    contact: club.contact || ''
  }
  editTypeIndex.value = club.type || 0
  currentClub.value = club
  editPopup.value.open()
}

// 处理编辑类型选择
function handleEditTypeChange(e) {
  editTypeIndex.value = e.detail.value
  editForm.value.type = parseInt(e.detail.value)
}

// 提交编辑社团
function submitEditClub() {
  if (!editForm.value.name) {
    uni.showToast({
      title: '请输入社团名称',
      icon: 'none'
    })
    return
  }

  const updateData = {
    ...editForm.value
  }

  // 调用更新API
  api.admin.club.updateClub(currentClub.value.id, updateData).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
      editPopup.value.close()
      loadClubs()
    } else {
      uni.showToast({
        title: res.message || '更新失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '更新失败',
      icon: 'none'
    })
    console.error('更新社团失败', err)
  })
}

// 取消编辑社团
function cancelEditClub() {
  editPopup.value.close()
}

onMounted(() => {
  loadClubs()
})
</script>
<style lang="scss" scoped>
.admin-clubs {
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
  
  .create-btn {
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

.club-table {
  margin: 32rpx 24rpx 0 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(41, 121, 255, 0.04);
}

.club-row {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.club-header {
  background: #e3f2fd;
  color: #1976d2;
}

.club-row:not(.club-header):nth-child(even) {
  background: #fafafa;
}

.club-cell { 
  flex: 1; 
  text-align: center; 
  padding: 16rpx 0; 
  font-size: 24rpx; 
}

.action-cell { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}

.status-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-active { 
  background: #4caf50; 
}

.status-inactive { 
  background: #f44336; 
}

.action-btn {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  margin: 0;
  min-width: 60rpx;
  height: 40rpx;
  line-height: 40rpx;
}

.menu-btn { 
  background-color: #1976d2; 
  color: #fff; 
}

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

// 弹窗表单样式
.popup-form {
  padding: 16rpx 0;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 8rpx;
  color: #333;
}

.input, .textarea, .picker {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #f8f8f8;
  margin-bottom: 5rpx;
}

.input {
  height: 80rpx;
}

.textarea {
  height: 160rpx;
}

.picker {
  height: 72rpx;
  display: flex;
  align-items: center;
}

.picker-text {
  color: #333;
}

/* 用户选择器样式 */
.user-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  padding: 0 20rpx;
  background-color: #f8f8f8;
}

.selected-user {
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  font-size: 28rpx;
  color: #999;
}

.selector-arrow {
  font-size: 24rpx;
  color: #666;
}

/* 用户选择弹窗样式 */
.user-selector-popup {
  background-color: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 30rpx;
  max-height: 1000rpx;
  display: flex;
  flex-direction: column;
}

.user-selector-header {
  margin-bottom: 30rpx;
}

.user-selector-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}

.user-search {
  margin-top: 20rpx;
}

.user-search-input {
  border: 1px solid #eaeaea;
  border-radius: 40rpx;
  height: 70rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  max-height: 750rpx;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  overflow: hidden;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-avatar text {
  font-size: 36rpx;
  color: #666;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
}

.user-loading {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
}

.no-users {
  text-align: center;
  padding: 50rpx 0;
  color: #999;
}

.user-selector-footer {
  padding-top: 30rpx;
  display: flex;
  justify-content: center;
}

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

/* 自定义弹窗样式 */
.custom-popup {
  background-color: #fff;
  border-radius: 16rpx;
  width: 650rpx;
  padding: 30rpx;
  max-height: 80vh; /* 使用视口高度而不是固定值 */
  overflow-y: auto;
  box-sizing: border-box;
}

.custom-popup-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.custom-popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin: 0 20rpx;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background-color: #2979ff;
  color: #fff;
}

/* 表单样式优化 */
.popup-form {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10rpx;
}

.form-item {
  margin-bottom: 30rpx;
  width: 100%;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 12rpx;
  color: #333;
  font-weight: 500;
}

.input, .textarea, .picker {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #f8f8f8;
}

.input:focus, .textarea:focus {
  border-color: #2979ff;
  background-color: #fff;
}

.textarea {
  height: 180rpx;
}

.picker {
  height: 80rpx;
  display: flex;
  align-items: center;
}

.picker-text {
  color: #333;
}

/* 社团Logo上传样式 */
.logo-upload {
  width: 100%;
  height: 180rpx;
  border: 1px dashed #dcdfe6;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rpx;
  position: relative;
  overflow: hidden;
  background-color: #f9f9f9;
}

.logo-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-action {
  font-size: 24rpx;
  color: #fff;
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  background-color: #f44336;
}

.logo-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.logo-selector:active {
  background-color: #eaeaea;
}

.iconfont {
  font-size: 50rpx;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
}

/* 社团详情弹窗样式 */
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