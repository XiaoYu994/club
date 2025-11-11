<template>
	<view 
		class="club-container pageBg"
	>
	  
	  <!-- 顶部导航 -->
	  <!-- #ifndef MP-TOUTIAO -->
	  <custom-nav-bar title="社团列表"></custom-nav-bar>
	  <!-- #endif -->
	  
	  <!-- 搜索栏 -->
	  <view class="search-bar">
		<view class="search-input">
		  <uni-icons type="search" size="16" color="#999"></uni-icons>
		  <input 
			type="text" 
			v-model="searchKeyword" 
			placeholder="搜索社团" 
			confirm-type="search"
			@confirm="searchClubs"
		  />
		</view>
		<view class="filter-btn" @tap="showFilterDrawer">
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
	  
	  <!-- 社团列表 -->
	  <scroll-view 
		scroll-y 
		class="club-list"
		refresher-enabled
		:refresher-triggered="refreshing"
		@refresherrefresh="refreshClubs"
		@scrolltolower="loadMore"
		:show-scrollbar="false"
		enhanced
	  >
		<view class="list-container">
		  <!-- 社团卡片 -->
		  <view 
			v-for="(item, idx) in clubList" 
			:key="idx" 
			class="club-card"
			@tap="goToDetail(item)"
		  >
			<image class="club-logo" :src="item.logo || '/static/images/default-club.png'" mode="aspectFill"></image>
			<view class="club-info">
			  <view class="club-header">
				<view class="club-name">{{ item.name }}</view>
				<view class="club-type-tag" :class="getTypeClass(item.type)">{{ getTypeText(item.type) }}</view>
			  </view>
			  <view class="club-desc">{{ item.description || '暂无简介' }}</view>
			  <view class="club-meta">
				<view class="meta-item">
				  <uni-icons type="person" size="14" color="#666"></uni-icons>
				  <text>{{ item.memberCount || 0 }}名成员</text>
				</view>
				<view class="meta-item">
				  <uni-icons type="location" size="14" color="#666"></uni-icons>
				  <text>{{ item.address || '暂无地址' }}</text>
				</view>
			  </view>
			  <view class="club-stats">
				<view class="view-count">
				  <uni-icons type="eye" size="14" color="#999"></uni-icons>
				  <text>{{ item.viewCount || 0 }}</text>
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
		  <view v-if="clubList.length === 0 && !isLoading" class="empty-data">
			<image src="/static/images/empty-club.png" mode="aspectFit"></image>
			<text>暂无社团信息</text>
		  </view>
		  
		  <!-- 加载完毕提示 -->
		  <view v-if="clubList.length > 0 && !hasMore" class="no-more">
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
			  <text class="section-title">社团类型</text>
			  <view class="filter-options">
				<view 
				  v-for="(type, idx) in clubTypeOptions" 
				  :key="idx"
				  :class="['filter-option', filters.type === type.value ? 'active' : '']"
				  @tap="selectType(type.value)"
				>
				  {{ type.name }}
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
	  
	  <!-- 招新入口悬浮按钮 -->
	  <view class="recruitment-btn" @tap="goToRecruitment">
		<uni-icons type="personadd" size="20" color="#fff"></uni-icons>
		<text>社团招新</text>
	  </view>
	</view>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
  
  const { proxy } = getCurrentInstance()
  
  // 是否为十佳社团模式
  const isTopTen = ref(false)
  
  // 搜索关键字
  const searchKeyword = ref('')
  
  // 当前选中的标签
  const currentTag = ref(0)
  
  // 筛选标签
  const filterTags = ref([
	{ name: '全部社团', type: 'all' },
	{ name: '普通社团', type: 'normal' },
	{ name: '院级社团', type: 'college' },
	{ name: '校级社团', type: 'school' }
  ])
  
  // 社团类型选项
  const clubTypeOptions = [
	{ name: '全部', value: -1 },
	{ name: '普通社团', value: 0 },
	{ name: '院级社团', value: 1 },
	{ name: '校级社团', value: 2 }
  ]
  
  // 排序选项
  const sortOptions = [
	{ name: '默认排序', value: 'order_num' },
	{ name: '成员数量', value: 'member_count' },
	{ name: '浏览量', value: 'view_count' },
	{ name: '最新创建', value: 'create_time' }
  ]
  
  // 筛选条件
  const filters = reactive({
	type: -1,
	sortBy: 'order_num',
	// 按照降序排
	isAsc: true
  })
  
  // 列表数据
  const clubList = ref([])
  const page = ref(1)
  const pageSize = ref(10)
  const hasMore = ref(true)
  const isLoading = ref(false)
  const refreshing = ref(false)
  
  // 弹窗引用
  const filterPopup = ref(null)
  
  // 初始化
  onMounted(() => {
	// 检查是否“十佳社团”模式（URL 参数 topTen=1）
	const pages = getCurrentPages()
	const options = pages[pages.length - 1]?.options || {}
	if (options.topTen === '1') {
	  isTopTen.value = true
	  // 只取前十条，按 order_num 排序
	  pageSize.value = 10
	  filters.sortBy = 'order_num'
	  filters.isAsc = true
	}
	// 加载社团列表
	loadClubs()
  })
  
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
  
  // 加载社团列表
  const loadClubs = async () => {
	// 如果是十佳社团模式，调用后端专用接口
	if (isTopTen.value) {
	  try {
		const res = await proxy.$api.club.getTopTenClubs()
		if (res.code === 200) {
		  clubList.value = res.data || []
		} else {
		  uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
		}
	  } catch (error) {
		console.error('获取十佳社团失败', error)
		uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
	  }
	  return
	}
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
		} else if (tagType === 'college') {
		  params.type = 1
		} else if (tagType === 'school') {
		  params.type = 2
		}
	  }
	  
	  // 添加筛选条件
	  if (filters.type !== -1) {
		params.type = filters.type
	  }
	  
	  // 调用API获取数据
	  const res = await proxy.$api.club.getClubList(params)
	  
	  if (res.code === 200) {
		const clubs = res.data.list || []
		
		if (page.value === 1) {
		  clubList.value = clubs
		} else {
		  clubList.value = [...clubList.value, ...clubs]
		}
		
		hasMore.value = clubs.length === pageSize.value
		page.value++
	  } else {
		uni.showToast({
		  title: res.msg || '加载失败',
		  icon: 'none'
		})
	  }
	} catch (error) {
	  console.error('加载社团列表失败', error)
	  uni.showToast({
		title: '网络异常，请稍后重试',
		icon: 'none'
	  })
	} finally {
	  isLoading.value = false
	  refreshing.value = false
	}
  }
  
  // 刷新社团列表
  const refreshClubs = () => {
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
	loadClubs()
  }
  
  // 加载更多
  const loadMore = () => {
	if (hasMore.value && !isLoading.value) {
	  loadClubs()
	}
  }
  
  // 搜索社团
  const searchClubs = () => {
	page.value = 1
	loadClubs()
  }
  
  // 切换标签
  const switchTag = (idx) => {
	if (currentTag.value === idx) return
	currentTag.value = idx
	page.value = 1
	loadClubs()
  }
  
  // 显示筛选抽屉
  const showFilterDrawer = () => {
	filterPopup.value.open()
  }
  
  // 关闭筛选抽屉
  const closeFilterDrawer = () => {
	filterPopup.value.close()
  }
  
  // 选择社团类型
  const selectType = (type) => {
	filters.type = type
  }
  
  // 选择排序方式
  const selectSort = (sort) => {
	filters.sortBy = sort
	// 其他的都按照降序排
	filters.isAsc = false
  }
  
  // 重置筛选条件
  const resetFilters = () => {
	filters.type = -1
	filters.sortBy = 'order_num'
	filters.isAsc = true
  }
  
  // 应用筛选条件
  const applyFilters = () => {
	page.value = 1
	closeFilterDrawer()
	loadClubs()
  }
  
  // 跳转到社团详情
  const goToDetail = (item) => {
	uni.navigateTo({
	  url: `/pages/club/detail?id=${item.id}`
	})
  }
  
  // 跳转到招新页面
  const goToRecruitment = () => {
	uni.navigateTo({
	  url: '/pages/club/recruitment'
	})
  }
  </script>
  
  <style lang="scss" scoped>
.club-container {
  /* 添加边缘滑动区域样式 */
  .edge-swipe-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 30rpx; /* 与edgeWidth对应 */
    height: 100%;
    z-index: 999;
    /* 不设置背景色，保持透明 */
  }
  
  .search-bar {
    padding: 30rpx;
    display: flex;
    align-items: center;
    
    .search-input {
      flex: 1;
      height: 72rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
      
      input {
        flex: 1;
        height: 72rpx;
        font-size: 28rpx;
        margin-left: 20rpx;
      }
    }
    
    .filter-btn {
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
    }
  }
  
  .filter-tags {
    height: 80rpx;
    white-space: nowrap;
    padding: 0 20rpx;
    margin: 0 10rpx;
    
    .tag-item {
      display: inline-block;
      padding: 12rpx 30rpx;
      font-size: 28rpx;
      color: #666;
      margin-right: 20rpx;
      border-radius: 30rpx;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      
      &.active {
        color: #fff;
        background: #b13b7a;
        box-shadow: 0 2rpx 10rpx rgba(177, 59, 122, 0.3);
      }
    }
  }
  
  .club-list {
    height: calc(100vh - 250rpx);
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    
    /* 隐藏滚动条 - 样式方式 */
    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
      display: none;
    }
    
    /* 兼容Firefox浏览器 */
    scrollbar-width: none;
    /* 兼容IE和Edge浏览器 */
    -ms-overflow-style: none;
    
    .list-container {
      padding-bottom: 40rpx;
      width: 100%;
    }
    
    .club-card {
      margin-bottom: 30rpx;
      background: #fff;
      border-radius: 18rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
      display: flex;
      padding: 24rpx;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      
      .club-logo {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        flex-shrink: 0;
        margin-right: 24rpx;
        border: 1px solid #f0f0f0;
      }
      
      .club-info {
        max-width: calc(100% - 144rpx);
        overflow: hidden;
        
        .club-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;
          
          .club-name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            flex: 1 1 auto;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .club-type-tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            margin-left: 12rpx;
            flex-shrink: 0;
            &.normal {
              color: #666;
              background: #f5f5f5;
            }
            &.college {
              color: #2979ff;
              background: rgba(41, 121, 255, 0.1);
            }
            &.school {
              color: #b13b7a;
              background: rgba(177, 59, 122, 0.1);
            }
          }
        }
        
        .club-desc {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 16rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
        }
        
        .club-meta {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 16rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #666;
            margin-right: 30rpx;
            margin-bottom: 8rpx;
            
            text {
              margin-left: 8rpx;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
        
        .club-stats {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          
          .view-count {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            color: #999;
            
            text {
              margin-left: 6rpx;
            }
          }
        }
      }
    }
    
    .club-card .club-type-tag {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
    }

    .club-card .view-count {
      position: absolute;
      bottom: 24rpx;
      right: 24rpx;
    }
    
    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30rpx 0;
      
      text {
        font-size: 24rpx;
        color: #999;
        margin-left: 10rpx;
      }
    }
    
    .empty-data {
      padding: 100rpx 0;
      text-align: center;
      
      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
        opacity: 0.8;
      }
      
      text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .no-more {
      text-align: center;
      padding: 30rpx 0;
      
      text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .filter-drawer {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 30rpx 30rpx 0;
    box-sizing: border-box;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 30rpx;
      border-bottom: 1rpx solid #eee;
      
      text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        padding: 10rpx;
      }
    }
    
    .filter-content {
      flex: 1;
      overflow-y: auto;
      max-height: 60vh;
    }
    
    .filter-section {
      margin: 30rpx 0;
      
      .section-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        
        .filter-option {
          padding: 12rpx 24rpx;
          border: 1rpx solid #eee;
          border-radius: 30rpx;
          font-size: 26rpx;
          color: #666;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          
          &.active {
            background: #b13b7a;
            color: #fff;
            border-color: #b13b7a;
          }
        }
      }
    }
    
    .drawer-footer {
      padding: 20rpx 0 40rpx;
      display: flex;
      border-top: 1rpx solid #f5f5f5;
      
      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;
        margin: 0 10rpx;
        font-size: 28rpx;
      }
      
      .reset-btn {
        background: #f5f5f5;
        color: #666;
      }
      
      .confirm-btn {
        background: #b13b7a;
        color: #fff;
      }
    }
  }
  
  .recruitment-btn {
    position: fixed;
    bottom: 120rpx;
    right: 30rpx;
    width: 120rpx;
    height: 120rpx;
    background: #b13b7a;
    border-radius: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(177, 59, 122, 0.3);
    z-index: 10;
    
    text {
      font-size: 24rpx;
      color: #fff;
      margin-top: 6rpx;
    }
  }
}
</style>