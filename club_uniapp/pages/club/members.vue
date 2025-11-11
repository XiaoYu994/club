<template>
  <view class="members-container pageBg">
    <!-- 顶部导航 -->
    <custom-nav-bar :title="'社团成员 - ' + clubName" :showBack="true" @backClick="goBack"></custom-nav-bar>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索成员" 
          confirm-type="search"
          @confirm="searchMembers"
        />
      </view>

      <!-- 导出按钮 -->
      <view v-if="isAdmin" class="export-btn" @tap="exportMemberData">
        <uni-icons type="download" size="18" color="#b13b7a"></uni-icons>
      </view>

      <view v-if="isAdmin" class="filter-btn" @tap="showFilterDrawer">
        <uni-icons type="paperplane" size="18" color="#b13b7a"></uni-icons>
      </view>
    </view>
    
    <!-- 标签筛选 -->
    <scroll-view class="filter-tags" scroll-x>
      <view 
        v-for="(tag, idx) in filterTags" 
        :key="idx" 
        :class="['tag-item', currentTag === idx ? 'active' : '']"
        @tap="switchTag(idx)"
      >
        {{ tag.name }}
      </view>
    </scroll-view>
    
    <!-- 成员列表 -->
    <scroll-view 
      scroll-y 
      class="members-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshMembers"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <!-- 成员卡片 -->
        <view 
          v-for="(item, idx) in memberList" 
          :key="idx" 
          class="member-card"
          @tap="showMemberDetail(item)"
        >
          <image class="member-avatar" :src="item.user.avatar || '/static/images/avatar-default.png'" mode="aspectFill"></image>
          <view class="member-info">
            <view class="member-header">
              <view class="member-name">{{ item.user.username }}</view>
              <view :class="['member-role', getRoleClass(item.type)]">{{ getRoleText(item.type) }}</view>
            </view>
            <view class="member-meta">
              <view class="meta-item">
                <uni-icons type="person" size="14" color="#666"></uni-icons>
                <text>{{ item.user.studentId || '未填写学号' }}</text>
              </view>
              <view class="meta-item">
                <uni-icons type="location" size="14" color="#666"></uni-icons>
                <text>{{ item.user.college || '未填写学院' }}</text>
              </view>
            </view>
            <view class="member-stats">
              <view class="join-time">
                加入时间: {{ formatDate(item.joinTime) }}
              </view>
              <view v-if="isAdmin && item.type < 2" class="action-btn" @tap.stop="showActionSheet(item)">
                <uni-icons type="more-filled" size="18" color="#999"></uni-icons>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <!-- 无数据提示 -->
        <view v-if="memberList.length === 0 && !isLoading" class="empty-data">
          <image src="/static/images/empty-club.png" mode="aspectFit"></image>
          <text>暂无成员信息</text>
        </view>
        
        <!-- 加载完毕提示 -->
        <view v-if="memberList.length > 0 && !hasMore" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 筛选抽屉 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-drawer">
        <view class="drawer-header">
          <text>筛选条件</text>
          <view class="close-btn" @tap="closeFilterDrawer">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <scroll-view scroll-y class="filter-content">
          <view class="filter-section">
            <text class="section-title">成员角色</text>
            <view class="filter-options">
              <view 
                v-for="(role, idx) in roleOptions" 
                :key="idx"
                :class="['filter-option', filters.role === role.value ? 'active' : '']"
                @tap="selectRole(role.value)"
              >
                {{ role.name }}
              </view>
            </view>
          </view>
          
          <view class="filter-section">
            <text class="section-title">排序方式</text>
            <view class="filter-options">
              <view 
                v-for="(sort, idx) in sortOptions" 
                :key="idx"
                :class="['filter-option', filters.sortBy === sort.value ? 'active' : '']"
                @tap="selectSort(sort.value)"
              >
                {{ sort.name }}
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="drawer-footer">
          <button class="reset-btn" @tap="resetFilters">重置</button>
          <button class="confirm-btn" @tap="applyFilters">确认</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 成员操作菜单 -->
    <uni-popup ref="actionSheet" type="bottom">
      <view class="action-sheet-content">
        <view v-if="selectedMember && selectedMember.type === 0 && isPresident" class="action-item" @tap="promoteMember">
          <uni-icons type="arrow-up" size="18" color="#333"></uni-icons>
          <text>设为管理员</text>
        </view>
        <view v-if="selectedMember && selectedMember.type === 1 && isPresident" class="action-item" @tap="demoteMember">
          <uni-icons type="arrow-down" size="18" color="#333"></uni-icons>
          <text>取消管理员</text>
        </view>
        <view v-if="selectedMember && isPresident && selectedMember.type < 2" class="action-item" @tap="transferPresident">
          <uni-icons type="redo" size="18" color="#333"></uni-icons>
          <text>转让社长</text>
        </view>
        <view v-if="selectedMember && ((selectedMember.status === 1 && (selectedMember.type === 0 || (selectedMember.type === 1 && isPresident))) || (selectedMember.status === 0 && isPresident))" class="action-item warning" @tap="toggleDisableMember">
          <uni-icons type="forbidden" size="18" color="#f44336"></uni-icons>
          <text>{{ selectedMember.status === 1 ? '禁用成员' : '启用成员' }}</text>
        </view>
        <view v-if="selectedMember && isPresident && selectedMember.type < 2" class="action-item warning" @tap="removeMember">
          <uni-icons type="delete" size="18" color="#f44336"></uni-icons>
          <text>移除成员</text>
        </view>
        <!-- 审核退出申请 -->
        <view v-if="selectedMember && isAdmin && selectedMember.status === 2" class="action-item warning" @tap="approveExit">
          <uni-icons type="check" size="18" color="#4caf50"></uni-icons>
          <text>同意退出</text>
        </view>
        <view v-if="selectedMember && isAdmin && selectedMember.status === 2" class="action-item warning" @tap="rejectExit">
          <uni-icons type="close" size="18" color="#f44336"></uni-icons>
          <text>拒绝退出</text>
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

// 社团ID和名称
const clubId = ref(null)
const clubName = ref('')

// 搜索关键字
const searchKeyword = ref('')

// 当前选中的标签
const currentTag = ref(0)

// 筛选标签
const filterTags = ref([
  { name: '全部成员', type: 'all' },
  { name: '普通成员', type: 'normal' },
  { name: '管理员', type: 'admin' },
  { name: '退出申请', type: 'exit' }
])

// 角色选项
const roleOptions = [
  { name: '全部', value: -1 },
  { name: '普通成员', value: 0 },
  { name: '管理员', value: 1 },
  { name: '社长', value: 2 }
]

// 排序选项
const sortOptions = [
  { name: '默认排序', value: 'join_time' },
  { name: '按姓名', value: 'username' },
  { name: '按学号', value: 'student_id' }
]

// 筛选条件
const filters = reactive({
  role: -1,
  sortBy: 'join_time',
  isAsc: false
})

// 列表数据
const memberList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)
const isAdmin = ref(false)
const isPresident = ref(false)

// 选中的成员
const selectedMember = ref(null)

// 弹窗引用
const filterPopup = ref(null)
const actionSheet = ref(null)

// 初始化
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  clubId.value = currentPage.options.clubId
  clubName.value = decodeURIComponent(currentPage.options.clubName || '')
  
  // 检查用户角色
  checkUserRole()
  
  // 加载成员列表
  loadMembers()
})

// 检查用户角色
const checkUserRole = async () => {
  try {
    if (!clubId.value) return
    
    const res = await proxy.$api.club.getUserRole(clubId.value)
    
    if (res.code === 200 && res.data) {
      // 检查是否是管理员
      isAdmin.value = res.data.type > 0 && res.data.status === 1
      // 检查是否是社长
      isPresident.value = res.data.type === 2 && res.data.status === 1
    } else {
      isAdmin.value = false
    isPresident.value = false
      isPresident.value = false
    }
  } catch (error) {
    isAdmin.value = false
  }
}

// 加载成员列表
const loadMembers = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 构建查询参数
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      orderBy: filters.sortBy,
      isAsc: filters.isAsc
    }
    
    // 根据当前选中的标签添加对应的筛选条件
    if (currentTag.value > 0) {
      const tagType = filterTags.value[currentTag.value].type
      if (tagType === 'normal') {
        params.type = 0
      } else if (tagType === 'admin') {
        params.type = 1
      } else if (tagType === 'exit') {
        params.status = 2
      }
    }
    
    // 添加筛选条件
    if (filters.role !== -1) {
      params.type = filters.role
    }
    
    // 调用API获取数据
    const res = await proxy.$api.club.getClubMembers(clubId.value, params)
    
    if (res.code === 200) {
      const members = res.data.list || []
      
      if (page.value === 1) {
        memberList.value = members
      } else {
        memberList.value = [...memberList.value, ...members]
      }
      
      hasMore.value = members.length === pageSize.value
      page.value++
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载成员列表失败', error)
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

// 刷新成员列表
const refreshMembers = () => {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  
  // 重置搜索关键字
  searchKeyword.value = ''
  
  // 重置当前选中的标签
  currentTag.value = 0
  
  // 重置筛选条件
  resetFilters()
  
  // 重新加载数据
  loadMembers()
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadMembers()
  }
}

// 搜索成员
const searchMembers = () => {
  page.value = 1
  loadMembers()
}

// 切换标签
const switchTag = (idx) => {
  if (currentTag.value === idx) return
  currentTag.value = idx
  page.value = 1
  // 清空搜索及重置筛选条件，确保切换标签时获取正确数据
  searchKeyword.value = ''
  resetFilters()
  loadMembers()
}

// 显示筛选抽屉
const showFilterDrawer = () => {
  filterPopup.value.open()
}

// 关闭筛选抽屉
const closeFilterDrawer = () => {
  filterPopup.value.close()
}

// 选择成员角色
const selectRole = (role) => {
  filters.role = role
}

// 选择排序方式
const selectSort = (sort) => {
  filters.sortBy = sort
  // 其他的都按照降序排
  filters.isAsc = false
}

// 重置筛选条件
const resetFilters = () => {
  filters.role = -1
  filters.sortBy = 'join_time'
  filters.isAsc = false
}

// 应用筛选条件
const applyFilters = () => {
  page.value = 1
  closeFilterDrawer()
  loadMembers()
}

// 获取角色文本
const getRoleText = (type) => {
  switch (type) {
    case 0: return '普通成员';
    case 1: return '管理员';
    case 2: return '社长';
    default: return '未知角色';
  }
}

// 获取角色样式类
const getRoleClass = (type) => {
  switch (type) {
    case 0: return 'normal';
    case 1: return 'admin';
    case 2: return 'president';
    default: return '';
  }
}


// 显示操作菜单
const showActionSheet = (member) => {
  selectedMember.value = member
  actionSheet.value.open()
}

// 隐藏操作菜单
const hideActionSheet = () => {
  actionSheet.value.close()
}

// 设为管理员
const promoteMember = async () => {
  if (!selectedMember.value) return
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const res = await proxy.$api.club.updateMemberRole({
      clubId: clubId.value,
      userId: selectedMember.value.userId,
      type: 1 // 设为管理员
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '已设为管理员',
        icon: 'success'
      })
      
      // 更新本地数据
      const index = memberList.value.findIndex(item => item.userId === selectedMember.value.userId)
      if (index !== -1) {
        memberList.value[index].type = 1
      }
      
      hideActionSheet()
    } else {
      uni.showToast({
        title: res.message || '操作失败',
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

// 取消管理员
const demoteMember = async () => {
  if (!selectedMember.value) return
  
  try {
    uni.showLoading({ title: '处理中...' })
    
    const res = await proxy.$api.club.updateMemberRole({
      clubId: clubId.value,
      userId: selectedMember.value.userId,
      type: 0 // 设为普通成员
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '已取消管理员',
        icon: 'success'
      })
      
      // 更新本地数据
      const index = memberList.value.findIndex(item => item.userId === selectedMember.value.userId)
      if (index !== -1) {
        memberList.value[index].type = 0
      }
      
      hideActionSheet()
    } else {
      uni.showToast({
        title: res.message || '操作失败',
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

// 移除成员
const removeMember = () => {
  if (!selectedMember.value) return
  
  uni.showModal({
    title: '确认移除',
    content: `确定要将 ${selectedMember.value.user.username} 移出社团吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' })
          
          const result = await proxy.$api.club.removeMember({
            clubId: clubId.value,
            userId: selectedMember.value.userId
          })
          
          if (result.code === 200) {
            uni.showToast({
              title: '已移除成员',
              icon: 'success'
            })
            
            // 更新本地数据
            memberList.value = memberList.value.filter(item => item.userId !== selectedMember.value.userId)
            
            hideActionSheet()
          } else {
            uni.showToast({
              title: result.message || '操作失败',
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
    }
  })
}

// 禁用或启用成员
const toggleDisableMember = () => {
  if (!selectedMember.value) return;
  const newStatus = selectedMember.value.status === 1 ? 0 : 1;
  const action = newStatus === 1 ? '启用' : '禁用';
  uni.showModal({
    title: `${action}成员`,
    content: `确定要${action}【${selectedMember.value.user.username}】吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          const result = await proxy.$api.club.updateMemberStatus({ clubId: clubId.value, userId: selectedMember.value.userId, status: newStatus });
          uni.hideLoading();
          if (result.code === 200) {
            uni.showToast({ title: `${action}成功`, icon: 'success' });
            const index = memberList.value.findIndex(item => item.userId === selectedMember.value.userId);
            if (index !== -1) {
              memberList.value[index].status = newStatus;
            }
            hideActionSheet();
            checkUserRole();
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

// 同意退出申请
const approveExit = () => {
  if (!selectedMember.value) return;
  uni.showModal({
    title: '同意退出',
    content: `确定同意【${selectedMember.value.user.username}】退出社团吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          const result = await proxy.$api.club.removeMember({ clubId: clubId.value, userId: selectedMember.value.userId });
          uni.hideLoading();
          if (result.code === 200) {
            uni.showToast({ title: '已同意退出', icon: 'success' });
            memberList.value = memberList.value.filter(item => item.userId !== selectedMember.value.userId);
            hideActionSheet();
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

// 拒绝退出申请
const rejectExit = () => {
  if (!selectedMember.value) return;
  uni.showModal({
    title: '拒绝退出',
    content: `确定拒绝【${selectedMember.value.user.username}】退出申请吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          const result = await proxy.$api.club.updateMemberStatus({ clubId: clubId.value, userId: selectedMember.value.userId, status: 1 });
          uni.hideLoading();
          if (result.code === 200) {
            uni.showToast({ title: '已拒绝退出', icon: 'success' });
            // 恢复成员状态
            const idx = memberList.value.findIndex(item => item.userId === selectedMember.value.userId);
            if (idx !== -1) memberList.value[idx].status = 1;
            hideActionSheet();
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

// 转让社长
const transferPresident = async () => {
  if (!selectedMember.value) return;
  uni.showModal({
    title: '转让社长',
    content: `确认将社长职位转让给【${selectedMember.value.user.username}】吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });
          // 获取当前用户ID
          const userRes = await proxy.$api.user.getUserInfo();
          const currentUserId = userRes.data.id;
          // 降级当前社长为管理员
          await proxy.$api.club.updateMemberRole({ clubId: clubId.value, userId: currentUserId, type: 1 });
          // 提升选中成员为社长
          const promoteRes = await proxy.$api.club.updateMemberRole({ clubId: clubId.value, userId: selectedMember.value.userId, type: 2 });
          if (promoteRes.code === 200) {
            uni.showToast({ title: '已转让社长', icon: 'success' });
            loadMembers();
            hideActionSheet();
            checkUserRole();
          } else {
            uni.showToast({ title: promoteRes.message || '操作失败', icon: 'none' });
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

// 导出成员数据
const exportMemberData = async () => {
  try {
    uni.showLoading({ title: '导出中...' })
    
    // 调用后端导出接口
    const res = await proxy.$api.club.exportClubMembers(clubId.value)
    
    if (res.code === 200 && res.data) {
      const { url, fileName } = res.data
      
      // 在微信小程序平台，使用downloadFile API
      // #ifdef MP-WEIXIN
      uni.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            const tempFilePath = res.tempFilePath
            // 保存文件
            uni.saveFile({
              tempFilePath: tempFilePath,
              success: (saveRes) => {
                const savedFilePath = saveRes.savedFilePath
                uni.hideLoading()
                uni.showToast({ title: '导出成功', icon: 'success' })
                
                // 打开文件
                uni.openDocument({
                  filePath: savedFilePath,
                  showMenu: true,
                  success: () => {
                    console.log('打开文档成功')
                  },
                  fail: () => {
                    uni.showModal({
                      title: '提示',
                      content: '导出成功，但无法直接打开Excel文件',
                      showCancel: false
                    })
                  }
                })
              },
              fail: () => {
                uni.hideLoading()
                uni.showModal({
                  title: '导出提示',
                  content: '无法保存文件，是否复制下载链接？',
                  confirmText: '复制链接',
                  success: (res) => {
                    if (res.confirm) {
                      uni.setClipboardData({
                        data: url,
                        success: () => {
                          uni.showToast({
                            title: '链接已复制',
                            icon: 'none'
                          })
                        }
                      })
                    }
                  }
                })
              }
            })
          } else {
            uni.hideLoading()
            uni.showToast({ title: '下载文件失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showModal({
            title: '导出提示',
            content: '下载失败，是否复制链接？',
            confirmText: '复制链接',
            success: (res) => {
              if (res.confirm) {
                uni.setClipboardData({
                  data: url,
                  success: () => {
                    uni.showToast({
                      title: '链接已复制',
                      icon: 'none'
                    })
                  }
                })
              }
            }
          })
        }
      })
      // #endif
      
      // 其他平台，尝试直接跳转到链接
      // #ifndef H5 || MP-WEIXIN
      uni.hideLoading()
      
      // 提供复制链接选项
      uni.showModal({
        title: '导出提示',
        content: '文件已准备好，是否复制下载链接？',
        confirmText: '复制链接',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: url,
              success: () => {
                uni.showToast({
                  title: '链接已复制',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
      // #endif
    } else {
      uni.hideLoading()
      uni.showToast({ title: res.message || '导出失败', icon: 'none' })
    }
  } catch (error) {
    console.error('导出成员数据失败', error)
    uni.hideLoading()
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.members-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

  .search-bar {
    display: flex;
  padding: 20rpx 30rpx;
  background-color: #fff;
    align-items: center;
}
    
    .search-input {
      flex: 1;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
  margin-right: 20rpx;
  
  uni-icons {
    margin-right: 10rpx;
  }
      
      input {
        flex: 1;
    height: 100%;
        font-size: 28rpx;
      }
    }
    
.filter-btn, .export-btn {
  width: 70rpx;
  height: 70rpx;
  background-color: rgba(177, 59, 122, 0.1);
  border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20rpx;
  }
  
  .filter-tags {
    white-space: nowrap;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
    
    .tag-item {
      display: inline-block;
    padding: 10rpx 30rpx;
    margin-right: 20rpx;
      font-size: 28rpx;
      color: #666;
    background-color: #f5f5f5;
      border-radius: 30rpx;
      
      &.active {
      background-color: #b13b7a;
        color: #fff;
      }
    }
  }
  
  .members-list {
  flex: 1;
  padding: 0 30rpx;
    
    .list-container {
    padding: 20rpx 0;
    }
    
    .member-card {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    padding: 20rpx;
      display: flex;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
      
      .member-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      background-color: #f5f5f5;
      }
      
      .member-info {
      flex: 1;
      display: flex;
      flex-direction: column;
        
        .member-header {
          display: flex;
          align-items: center;
        justify-content: space-between;
        margin-bottom: 10rpx;
          
          .member-name {
            font-size: 32rpx;
            color: #333;
          font-weight: bold;
          }
          
          .member-role {
          font-size: 24rpx;
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            
            &.normal {
            background-color: #e0f7fa;
            color: #00acc1;
            }
            
            &.admin {
            background-color: #e8f5e9;
            color: #43a047;
            }
            
            &.president {
            background-color: #fff8e1;
            color: #ffb300;
            }
          }
        }
        
        .member-meta {
          display: flex;
          flex-wrap: wrap;
        margin-bottom: 10rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #666;
            margin-right: 30rpx;
          margin-bottom: 10rpx;
            
          uni-icons {
            margin-right: 6rpx;
            }
          }
        }
        
        .member-stats {
          display: flex;
          align-items: center;
        justify-content: space-between;
          
          .join-time {
            font-size: 24rpx;
            color: #999;
          }
          
          .action-btn {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
    
  .loading-more, .no-more, .empty-data {
    padding: 30rpx;
      display: flex;
    flex-direction: column;
      align-items: center;
        color: #999;
    font-size: 24rpx;
    
    uni-icons {
      margin-bottom: 10rpx;
      }
      
      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
      }
    }
  }
  
  .filter-drawer {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  overflow: hidden;
    
    .drawer-header {
    padding: 30rpx;
      display: flex;
      align-items: center;
    justify-content: space-between;
      border-bottom: 1rpx solid #eee;
      
      text {
        font-size: 32rpx;
      font-weight: bold;
        color: #333;
      }
      
      .close-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      }
    }
    
    .filter-content {
      max-height: 60vh;
    padding: 0 30rpx;
    
    .filter-section {
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      
      .section-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        
        .filter-option {
          padding: 10rpx 30rpx;
          background-color: #f5f5f5;
          border-radius: 30rpx;
          font-size: 28rpx;
          color: #666;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          
          &.active {
            background-color: #b13b7a;
            color: #fff;
          }
          }
        }
      }
    }
    
    .drawer-footer {
    padding: 20rpx 30rpx;
      display: flex;
    border-top: 1rpx solid #eee;
      
      button {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      }
      
      .reset-btn {
      background-color: #f5f5f5;
        color: #666;
      margin-right: 20rpx;
      }
      
      .confirm-btn {
      background-color: #b13b7a;
        color: #fff;
      }
    }
  }
  
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