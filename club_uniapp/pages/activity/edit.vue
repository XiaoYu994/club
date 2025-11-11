<!-- pages/activity/edit.vue -->
<template>
    <view class="edit-activity-container pageBg">
      <!-- 状态栏 -->
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 顶部导航 -->
      <!-- #ifndef MP-TOUTIAO -->
      <custom-nav-bar :title="isEdit ? '编辑活动' : '创建活动'" :showBack="true" @backClick="goBack"></custom-nav-bar>
      <!-- #endif -->
      
      <!-- 活动表单 -->
      <activity-form 
        :activity-data="activityData" 
        :is-edit="isEdit"
        :club-id="clubId"
        @cancel="goBack"
        @submit="handleSubmit"
      ></activity-form>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted, getCurrentInstance } from 'vue';
  import ActivityForm from '@/components/activity-form/activity-form.vue';
  import { notifyActivityDataChanged } from '@/utils/activity.js';
  
  const { proxy } = getCurrentInstance();
  
  // 状态栏高度
  const statusBarHeight = ref(20);
  
  // 活动数据
  const activityData = ref({});
  
  // 是否为编辑模式
  const isEdit = ref(false);
  
  // 社团ID
  const clubId = ref('');
  
  // 初始化
  onMounted(() => {
    // 获取状态栏高度
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
    
    // 获取页面参数
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || {};
    
    // 获取活动ID和社团ID
    const activityId = options.id;
    clubId.value = options.clubId || '';
    
    // 判断是否为编辑模式
    isEdit.value = !!activityId;
    
    // 如果是编辑模式，加载活动数据
    if (isEdit.value) {
      loadActivityData(activityId);
    }
  });
  
  // 加载活动数据
  const loadActivityData = async (id) => {
    try {
      uni.showLoading({ title: '加载中...' });
      
      const res = await proxy.$api.activity.getActivityDetail(id);
      
      if (res.code === 200) {
        activityData.value = res.data;
        
        // 如果没有传入社团ID，从活动数据中获取
        if (!clubId.value && activityData.value.clubId) {
          clubId.value = activityData.value.clubId;
        }
      } else {
        uni.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    } finally {
      uni.hideLoading();
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (formData) => {
    try {
      uni.showLoading({ title: '提交中...' });
      
      // 确保表单数据完整
      if (!formData.title || !formData.address || !formData.description) {
        uni.hideLoading();
        uni.showToast({
          title: '请完善活动信息',
          icon: 'none'
        });
        return;
      }
      
      let res;
      
      try {
        if (isEdit.value) {
          // 编辑活动
		  formData.updateTime = Date.now()
          res = await proxy.$api.activity.updateActivity(formData);
        } else {
          // 创建活动
		   formData.createTime = Date.now()
          res = await proxy.$api.activity.createActivity(formData);
        }
      } catch (networkError) {
        console.error('API请求失败:', networkError);
        uni.hideLoading();
        uni.showToast({
          title: '网络异常，请检查网络连接后重试',
          icon: 'none',
          duration: 3000
        });
        return;
      }
      
      if (res && (res.code === 200 || res.code === 0)) {
        // 触发活动数据变化事件，通知列表页刷新
        notifyActivityDataChanged();
        
        uni.showToast({
          title: isEdit.value ? '编辑成功' : '创建成功',
          icon: 'success'
        });
        
        // 延迟返回，让用户看到成功提示，但减少延迟时间
        setTimeout(() => {
          // 获取活动ID
          const activityId = isEdit.value ? formData.id : (res.data?.id || res.data);
          
          if (activityId) {
            // 编辑成功后，直接跳转到活动详情页，使用redirectTo保留页面栈结构
            uni.redirectTo({
              url: `/pages/activity/activityDeatil?id=${activityId}&t=${Date.now()}`
            });
          } else if (clubId.value) {
            // 如果没有活动ID但有社团ID，返回社团详情页
            uni.redirectTo({
              url: `/pages/club/detail?id=${clubId.value}`
            });
          } else {
            // 否则返回活动列表页
            uni.switchTab({
              url: '/pages/activity/activity'
            });
          }
        }, 800); // 减少延迟时间
      } else {
        uni.showToast({
          title: res?.message || res?.msg || '提交失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        console.error('提交失败:', res);
      }
    } catch (error) {
      console.error('处理提交过程中发生错误:', error);
      uni.showToast({
        title: '操作异常，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      uni.hideLoading();
    }
  };
  
  // 返回上一页
  const goBack = () => {
    // 通知活动数据可能已变更
    notifyActivityDataChanged();
    
    // 添加短暂延迟，确保通知事件被处理
    setTimeout(() => {
      uni.navigateBack();
    }, 100);
  };
  </script>
  
  <style lang="scss" scoped>
  .edit-activity-container {
    min-height: 100vh;
  }
  
  .status-bar {
    width: 100%;
    background-color: #ffffff;
  }
  </style>