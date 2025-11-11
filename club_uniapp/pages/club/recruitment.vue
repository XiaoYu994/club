<template>
  <view class="recruitment-container pageBg">
    <!-- 顶部导航 -->
    <custom-nav-bar title="社团招新" :showBack="true" @backClick="goBack"></custom-nav-bar>
    
    <!-- 搜索欄 -->
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
    </view>
    
    <!-- 筛选标签 -->
    <scroll-view class="filter-tabs" scroll-x>
      <view 
        v-for="(tag, idx) in filterTags" 
        :key="idx" 
        :class="['tag-item', currentTag === idx ? 'active' : '']"
        @tap="switchTag(idx)"
      >
        {{ tag.name }}
      </view>
    </scroll-view>
    
    <!-- 社團列表 -->
    <scroll-view 
      scroll-y 
      class="clubs-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshClubs"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
      enhanced
    >
      <view class="list-container">
        <!-- 社團卡片 -->
        <view 
          v-for="(item, idx) in clubList" 
          :key="idx" 
          class="club-card"
          @tap="goToApply(item)"
        >
          <image class="club-logo" :src="item.logo || '/static/images/default-club.png'" mode="aspectFill"></image>
          <view class="club-info">
            <view class="club-title">{{ item.name }}</view>
            <view class="club-desc">{{ item.description || '暂无简介' }}</view>
            <view class="club-meta">
              <view class="meta-item">
                <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                <text>招新截止: {{ item.endTime ? formatDate(item.endTime) : '暂无' }}</text>
              </view>
              <view class="meta-item">
                <uni-icons type="personadd" size="14" color="#666"></uni-icons>
                <text>已有 {{ item.memberCount || 0 }} 人加入</text>
              </view>
            </view>
            <view class="club-tags">
              <view class="tag" v-for="(tag, tagIdx) in (item.tags ? item.tags.split(',') : [])" :key="tagIdx">
                {{ tag }}
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加載狀態 -->
        <view v-if="isLoading" class="loading-more">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <!-- 無數據提示 -->
        <view v-if="clubList.length === 0 && !isLoading" class="empty-data">
          <image src="/static/images/empty-club.png" mode="aspectFit"></image>
          <text>暂无招新社团</text>
        </view>
        
        <!-- 加載完畢提示 -->
        <view v-if="clubList.length > 0 && !hasMore" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { formatDate } from '@/utils/common.js'

const { proxy } = getCurrentInstance()

// 搜索關鍵字
const searchKeyword = ref('')

// 當前選中的標籤
const currentTag = ref(0)

// 篩選標籤
const filterTags = ref([
  { name: '全部社团', type: 'all' },
  { name: '普通社团', type: 'normal' },
  { name: '院级社团', type: 'college' },
  { name: '校级社团', type: 'school' }
])

// 列表數據
const clubList = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)
const refreshing = ref(false)

// 加载招新详情到列表
onMounted(() => {
  loadClubs()
})

// 加載社團列表
const loadClubs = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 構建查詢參數
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      isRecruiting: true // 只查詢正在招新的社團
    }
    
    // 根據當前選中的標籤添加對應的篩選條件
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
    
    // 調用API獲取數據
    const res = await proxy.$api.club.getClubList(params)
    
    if (res.code === 200) {
      const clubs = res.data.list || []
      // 并行获取所有社团的招新详情
      const clubsWithRecruit = await Promise.all(
        clubs.map(async item => {
          const recRes = await proxy.$api.club.getActiveRecruitment(item.id)
          if (recRes.code === 200 && recRes.data) {
            item.startTime = recRes.data.startTime
            item.endTime = recRes.data.endTime
          }
          return item
        })
      )
      if (page.value === 1) {
        clubList.value = clubsWithRecruit
      } else {
        clubList.value = [...clubList.value, ...clubsWithRecruit]
      }
      hasMore.value = clubsWithRecruit.length === pageSize.value
      page.value++
    } else {
      uni.showToast({
        title: res.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加載社團列表失敗', error)
    uni.showToast({
      title: '網絡異常，請稍後重試',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    refreshing.value = false
  }
}

// 刷新社團列表
const refreshClubs = () => {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  
  // 重置搜索關鍵字
  searchKeyword.value = ''
  
  // 重置當前選中的標籤
  currentTag.value = 0
  
  // 重新加載數據
  loadClubs()
}

// 加載更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadClubs()
  }
}

// 搜索社團
const searchClubs = () => {
  page.value = 1
  loadClubs()
}

// 切換標籤
const switchTag = (idx) => {
  if (currentTag.value === idx) return
  currentTag.value = idx
  page.value = 1
  loadClubs()
}

// 跳转到社团申请表单
const goToApply = (club) => {
  uni.navigateTo({
    url: `/pages/club/apply?clubId=${club.id}`
  })
}

// 返回上一頁
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.recruitment-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
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
  }
  
  .filter-tabs {
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
  
  .clubs-list {
    flex: 1;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    
    /* 隱藏滾動條 - 樣式方式 */
    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
      display: none;
    }
    
    /* 兼容Firefox瀏覽器 */
    scrollbar-width: none;
    /* 兼容IE和Edge瀏覽器 */
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
      padding: 24rpx;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      
      .club-logo {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
        margin-right: 24rpx;
        object-fit: cover;
      }
      
      .club-info {
        flex: 1;
        overflow: hidden;
        
        .club-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 10rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
        
        .club-tags {
          display: flex;
          flex-wrap: wrap;
          
          .tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
            color: #b13b7a;
            background: rgba(177, 59, 122, 0.1);
            margin-right: 16rpx;
            margin-bottom: 8rpx;
          }
        }
      }
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
}
</style> 