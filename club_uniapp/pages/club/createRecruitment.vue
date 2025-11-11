<template>
  <view class="create-recruitment-container pageBg">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <custom-nav-bar title="创建招新" :showBack="true" @backClick="goBack"></custom-nav-bar>
    <scroll-view scroll-y class="form-container">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        <view class="form-item">
          <text class="form-label">选择配置：</text>
          <picker mode="selector" :range="configs" range-key="name" @change="onConfigChange">
            <view class="form-picker">{{ selectedConfig ? selectedConfig.name : '请选择配置' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">招新标题：</text>
          <input v-model="title" class="form-input" placeholder="请输入招新标题" />
        </view>
      </view>
      
      <!-- 招新详情 -->
      <view class="form-section">
        <view class="section-title">招新详情</view>
        
        <!-- 添加海报上传 -->
        <view class="form-item">
          <text class="form-label">招新海报：</text>
          <view class="poster-upload" @tap="uploadPoster">
            <image v-if="poster" class="poster-preview" :src="poster" mode="aspectFill"></image>
            <view v-else class="upload-placeholder">
              <uni-icons type="image" size="50" color="#ccc"></uni-icons>
              <text>点击上传海报</text>
            </view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">招新描述：</text>
          <textarea v-model="description" class="form-textarea" placeholder="请输入招新描述"></textarea>
        </view>
      </view>
      
      <!-- 时间安排 -->
      <view class="form-section">
        <view class="section-title">时间安排</view>
        <view class="form-item">
          <text class="form-label">开始时间：</text>
          <picker mode="date" @change="onStartChange">
            <view class="form-picker date-input">
              <uni-icons type="calendar" size="16" color="#b13b7a"></uni-icons>
              <text class="date-text">{{ formattedStartTime || '请选择日期' }}</text>
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">结束时间：</text>
          <picker mode="date" @change="onEndChange">
            <view class="form-picker date-input">
              <uni-icons type="calendar" size="16" color="#b13b7a"></uni-icons>
              <text class="date-text">{{ formattedEndTime || '请选择日期' }}</text>
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 招新设置 -->
      <view class="form-section">
        <view class="section-title">招新设置</view>
        <view class="form-item">
          <text class="form-label">计划人数：</text>
          <input v-model.number="planCount" type="number" class="form-input" placeholder="请输入计划招收人数" />
        </view>
        <view class="form-item interview-item">
          <text class="form-label">需要面试：</text>
          <radio-group @change="onInterviewChange" class="radio-group">
            <label class="radio-item"><radio value="0" :checked="needInterview === 0" color="#b13b7a" />否</label>
            <label class="radio-item"><radio value="1" :checked="needInterview === 1" color="#b13b7a" />是</label>
          </radio-group>
        </view>
        <view v-if="needInterview === 1" class="form-item">
          <text class="form-label">面试地点：</text>
          <input v-model="interviewPlace" class="form-input" placeholder="请输入面试地点" />
        </view>
      </view>
      
      <!-- 报名表单设置 -->
      <view class="form-section">
        <view class="section-title">报名表单设置</view>
        
        <!-- 表单字段列表 -->
        <view class="form-fields">
          <view class="form-field-item" v-for="(field, fieldIndex) in formFields" :key="fieldIndex">
            <!-- 字段头部 -->
            <view class="field-header">
              <input class="field-name" v-model="field.name" placeholder="字段名称" />
              <view class="field-actions">
                <view class="required-switch">
                  <text>必填</text>
                  <switch :checked="field.required" @change="e => updateFieldRequired(fieldIndex, e.detail.value)" color="#b13b7a" />
                </view>
                <view class="delete-btn" @tap="deleteField(fieldIndex)">
                  <uni-icons type="trash" size="20" color="#999"></uni-icons>
                </view>
              </view>
            </view>
            
            <!-- 字段内容 -->
            <view class="field-content">
              <view class="field-type">
                <text>字段类型</text>
                <picker class="type-picker" :value="getFieldTypeIndex(field.type)" :range="fieldTypes" @change="e => updateFieldType(fieldIndex, e.detail.value)">
                  <view>{{ getFieldTypeName(field.type) }}</view>
                </picker>
              </view>
              
              <!-- 选项设置 -->
              <view class="field-options" v-if="field.type === 'radio' || field.type === 'checkbox'">
                <text class="options-label">选项设置</text>
                <view class="option-item" v-for="(option, optionIndex) in field.options" :key="optionIndex">
                  <input class="option-input" v-model="field.options[optionIndex]" placeholder="选项内容" />
                  <view class="delete-option" @tap="deleteOption(fieldIndex, optionIndex)">
                    <uni-icons type="close" size="16" color="#999"></uni-icons>
                  </view>
                </view>
                <view class="add-option" @tap="addOption(fieldIndex)">
                  <uni-icons type="plusempty" size="20" color="#b13b7a"></uni-icons>
                  <text>添加选项</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 添加字段按钮 -->
          <view class="add-field" @tap="addField">
            <uni-icons type="plusempty" size="24" color="#b13b7a"></uni-icons>
            <text>添加字段</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="form-actions">
      <button class="cancel-btn" @tap="goBack">取消</button>
      <button class="submit-btn" @tap="submitRecruitment">提交创建</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { formatDate } from '@/utils/common.js'
const { proxy } = getCurrentInstance()

const configs = ref([])
const selectedConfig = ref(null)
const clubId = ref(null)
const title = ref('')
const description = ref('')
const startTime = ref(null)
const endTime = ref(null)
const planCount = ref(0)
const needInterview = ref(0)
const interviewPlace = ref('')
const poster = ref('')
const formFields = ref([])

// 字段类型选项
const fieldTypes = [
  '文本输入',
  '数字输入',
  '多行文本',
  '单选',
  '多选',
  '日期选择'
]

// 字段类型映射
const fieldTypeMap = {
  'text': 0,
  'number': 1,
  'textarea': 2,
  'radio': 3,
  'checkbox': 4,
  'date': 5
}

// 反向映射
const reverseFieldTypeMap = {
  0: 'text',
  1: 'number',
  2: 'textarea',
  3: 'radio',
  4: 'checkbox',
  5: 'date'
}

const formattedStartTime = computed(() => startTime.value ? formatDate(startTime.value, 'yyyy-MM-dd') : '')
const formattedEndTime = computed(() => endTime.value ? formatDate(endTime.value, 'yyyy-MM-dd') : '')

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

onMounted(async () => {
  // 获取路由参数
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  clubId.value = current.options.clubId
  // 加载配置并过滤可用时间
  const res = await proxy.$api.club.getRecruitmentConfigs()
  if (res.code === 200) {
    const allConfigs = res.data || []
    const now = Date.now()
    configs.value = allConfigs.filter(c => now >= c.globalStartTime && now <= c.globalEndTime)
    if (!configs.value.length) {
      uni.showToast({ title: '当前暂无可用招新配置', icon: 'none' })
    }
  }
  // 添加默认表单字段
  addDefaultFields()
})

const onConfigChange = (e) => {
  const idx = e.detail.value
  selectedConfig.value = configs.value[idx]
}

const onStartChange = (e) => startTime.value = new Date(e.detail.value).getTime()
const onEndChange = (e) => endTime.value = new Date(e.detail.value).getTime()

const goBack = () => uni.navigateBack()

// 处理面试选项变更
const onInterviewChange = (e) => {
  needInterview.value = Number(e.detail.value)
}

// 上传海报
const uploadPoster = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      
      try {
        const uploadRes = await proxy.$api.common.upload(tempFilePath)
        if (uploadRes.code === 200) {
          poster.value = uploadRes.data.url || uploadRes.data
          uni.showToast({ title: '海报上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: uploadRes.message || '海报上传失败', icon: 'none' })
        }
      } catch (error) {
        console.error('上传海报失败', error)
        uni.showToast({ title: '海报上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

// 添加默认字段
const addDefaultFields = () => {
  formFields.value = [

    {
      name: '申请理由',
      type: 'textarea',
      required: true
    }
  ]
}

// 获取字段类型索引
const getFieldTypeIndex = (type) => {
  return fieldTypeMap[type] || 0
}

// 获取字段类型名称
const getFieldTypeName = (type) => {
  return fieldTypes[fieldTypeMap[type]] || '文本输入'
}

// 更新字段类型
const updateFieldType = (index, typeIndex) => {
  const newType = reverseFieldTypeMap[typeIndex]
  if (newType === 'radio' || newType === 'checkbox') {
    // 如果切换到单选或多选，添加默认选项
    if (formFields.value[index].type !== 'radio' && formFields.value[index].type !== 'checkbox') {
      formFields.value[index].options = ['选项1', '选项2']
    }
  }
  formFields.value[index].type = newType
}

// 更新是否必填
const updateFieldRequired = (index, required) => {
  formFields.value[index].required = required
}

// 删除字段
const deleteField = (index) => {
  formFields.value.splice(index, 1)
}

// 添加字段
const addField = () => {
  formFields.value.push({
    name: '新字段',
    type: 'text',
    required: false
  })
}

// 添加选项
const addOption = (fieldIndex) => {
  if (!formFields.value[fieldIndex].options) {
    formFields.value[fieldIndex].options = []
  }
  formFields.value[fieldIndex].options.push(`选项${formFields.value[fieldIndex].options.length + 1}`)
}

// 删除选项
const deleteOption = (fieldIndex, optionIndex) => {
  formFields.value[fieldIndex].options.splice(optionIndex, 1)
}

const submitRecruitment = async () => {
  if (!selectedConfig.value) return uni.showToast({ title: '请选择配置', icon: 'none' })
  // 检查是否在配置时间内
  const now = Date.now()
  if (now < selectedConfig.value.globalStartTime || now > selectedConfig.value.globalEndTime) {
    return uni.showToast({ title: '当前不在配置的招新时间范围内', icon: 'none' })
  }
  if (!title.value) return uni.showToast({ title: '请输入标题', icon: 'none' })
  if (!startTime.value || !endTime.value) return uni.showToast({ title: '请选择时间', icon: 'none' })
  if (!planCount.value) return uni.showToast({ title: '请输入计划人数', icon: 'none' })
  const payload = {
    clubId: Number(clubId.value),
    configId: selectedConfig.value.id,
    title: title.value,
    description: description.value,
    startTime: startTime.value,
    endTime: endTime.value,
    planCount: planCount.value,
    needInterview: needInterview.value,
    interviewPlace: needInterview.value === 1 ? interviewPlace.value : null,
    poster: poster.value,
    // 以下字段由前端提供，避免后端字段非空校验失败
    forms: JSON.stringify(formFields.value),
    joinCount: 0,
    passCount: 0
  }
  const res = await proxy.$api.club.createRecruitment(payload)
  if (res.code === 200) {
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } else {
    uni.showToast({ title: res.message || '创建失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.create-recruitment-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.status-bar {
  width: 100%;
  background-color: #b13b7a;
}
.form-container {
  flex: 1;
  padding: 20rpx 30rpx 120rpx;
}
.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1rpx;
      width: 60rpx;
      height: 4rpx;
      background: #b13b7a;
      border-radius: 4rpx;
    }
  }
}
.form-item {
  margin-bottom: 30rpx;
  &:last-child { margin-bottom: 0; }
  display: flex;
  flex-direction: column;
  
  &.interview-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}
.form-input, .form-textarea {
  width: 100%;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #f8f8f8;
  box-sizing: border-box;
  
  &:focus {
    border-color: #b13b7a;
    background: #fff;
  }
}
.form-input {
  height: 80rpx;
}
.form-textarea {
  min-height: 200rpx;
  padding: 20rpx;
}
.form-picker {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  background: #f8f8f8;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.date-input {
  display: flex;
  align-items: center;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #f8f8f8;
  border: 1rpx solid #ddd;
  
  .date-text {
    margin-left: 10rpx;
  }
}
.radio-group {
  display: flex;
  margin-top: 10rpx;
}
.radio-item {
  margin-right: 60rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}
.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.08);
  z-index: 99;
}
.cancel-btn {
  width: 48%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: #fff;
  border: 1rpx solid #b13b7a;
  color: #b13b7a;
  font-size: 28rpx;
}
.submit-btn {
  width: 48%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #b13b7a, #e9629e);
  color: #fff;
  font-size: 28rpx;
  box-shadow: 0 4rpx 8rpx rgba(177, 59, 122, 0.3);
}

.poster-upload {
  width: 100%;
  height: 360rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1rpx solid #ddd;
  
  .poster-preview {
    width: 100%;
    height: 100%;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    text {
      font-size: 28rpx;
      color: #999;
      margin-top: 20rpx;
    }
  }
}

.form-fields {
  margin-top: 30rpx;
  
  .form-field-item {
    background: #f8f8f8;
    border-radius: 8rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #ddd;
    
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .field-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        background: transparent;
        border: none;
        width: 60%;
      }
      
      .field-actions {
        display: flex;
        align-items: center;
        
        .required-switch {
          display: flex;
          align-items: center;
          margin-right: 20rpx;
          
          text {
            font-size: 24rpx;
            color: #666;
            margin-right: 10rpx;
          }
        }
        
        .delete-btn {
          padding: 10rpx;
        }
      }
    }
    
    .field-content {
      .field-type {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        
        text {
          font-size: 26rpx;
          color: #666;
        }
        
        .type-picker {
          flex: 1;
          height: 60rpx;
          line-height: 60rpx;
          padding: 0 20rpx;
          background: #fff;
          border-radius: 8rpx;
          font-size: 26rpx;
          margin-left: 10rpx;
        }
      }
      
      .field-options {
        margin-top: 20rpx;
        
        .options-label {
          font-size: 26rpx;
          color: #666;
          display: block;
          margin-bottom: 10rpx;
        }
        
        .option-item {
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;
          
          .option-input {
            flex: 1;
            height: 60rpx;
            padding: 0 20rpx;
            background: #fff;
            border-radius: 8rpx;
            font-size: 26rpx;
          }
          
          .delete-option {
            padding: 10rpx;
            margin-left: 10rpx;
          }
        }
        
        .add-option {
          display: flex;
          align-items: center;
          margin-top: 10rpx;
          padding: 10rpx;
          color: #b13b7a;
          font-size: 26rpx;
          
          text {
            margin-left: 10rpx;
          }
        }
      }
    }
  }
  
  .add-field {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    margin-top: 20rpx;
    color: #b13b7a;
    border: 1rpx dashed #ddd;
    
    text {
      margin-left: 10rpx;
      font-size: 28rpx;
    }
  }
}
</style> 