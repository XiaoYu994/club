<template>
  <view class="form-section">
    <view class="section-title">报名表单设置</view>
    <view class="form-fields">
      <view class="form-field-item" v-for="(field, idx) in fields" :key="idx">
        <view class="field-header">
          <input class="field-name" v-model="fields[idx].name" placeholder="字段名称" />
          <view class="field-actions">
            <view class="required-switch">
              <text>必填</text>
              <switch :checked="fields[idx].required" @change="onRequiredChange(idx, $event.detail.value)" color="#b13b7a" />
            </view>
            <view class="delete-btn" @tap="onDeleteField(idx)">
              <uni-icons type="trash" size="20" color="#999" />
            </view>
          </view>
        </view>
        <view class="field-content">
          <view class="field-type">
            <text>字段类型</text>
            <picker class="type-picker" :value="getFieldTypeIndex(fields[idx].type)" :range="fieldTypes" @change="e => onTypeChange(idx, e.detail.value)">
              <view>{{ getFieldTypeName(fields[idx].type) }}</view>
            </picker>
          </view>
          <view class="field-options" v-if="fields[idx].type==='radio' || fields[idx].type==='checkbox'">
            <text class="options-label">选项设置</text>
            <view class="option-item" v-for="(opt, optIdx) in fields[idx].options" :key="optIdx">
              <input class="option-input" v-model="fields[idx].options[optIdx]" placeholder="选项内容" />
              <view class="delete-option" @tap="onDeleteOption(idx, optIdx)">
                <uni-icons type="close" size="16" color="#999" />
              </view>
            </view>
            <view class="add-option" @tap="onAddOption(idx)">
              <uni-icons type="plusempty" size="20" color="#b13b7a" />
              <text>添加选项</text>
            </view>
          </view>
        </view>
      </view>
      <view class="add-field" @tap="onAddField">
        <uni-icons type="plusempty" size="24" color="#b13b7a" />
        <text>添加字段</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(['update:modelValue']);
const fields = ref([]);

watch(
  () => props.modelValue,
  (val) => {
    fields.value = Array.isArray(val) ? val : [];
  },
  { immediate: true }
);

const fieldTypes = ['文本输入','数字输入','多行文本','单选','多选','日期选择'];
const fieldTypeMap = { text:0, number:1, textarea:2, radio:3, checkbox:4, date:5 };
const reverseFieldTypeMap = { 0:'text',1:'number',2:'textarea',3:'radio',4:'checkbox',5:'date' };

const getFieldTypeIndex = (type) => fieldTypeMap[type] ?? 0;
const getFieldTypeName = (type) => fieldTypes[getFieldTypeIndex(type)];

function updateModel() {
  emit('update:modelValue', fields.value);
}

function onAddField() {
  fields.value.push({ name: '新字段', type: 'text', required: false, options: [] });
  updateModel();
}
function onDeleteField(idx) {
  fields.value.splice(idx, 1);
  updateModel();
}
function onRequiredChange(idx, required) {
  fields.value[idx].required = required;
  updateModel();
}
function onTypeChange(idx, typeIdx) {
  const newType = reverseFieldTypeMap[typeIdx];
  fields.value[idx].type = newType;
  if ((newType === 'radio' || newType === 'checkbox') && (!fields.value[idx].options || fields.value[idx].options.length < 2)) {
    fields.value[idx].options = ['选项1','选项2'];
  }
  updateModel();
}
function onAddOption(idx) {
  const options = fields.value[idx].options || [];
  options.push(`选项${options.length + 1}`);
  fields.value[idx].options = options;
  updateModel();
}
function onDeleteOption(idx, optIdx) {
  const options = fields.value[idx].options;
  if (options && options.length > 1) {
    options.splice(optIdx, 1);
    fields.value[idx].options = options;
    updateModel();
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-top: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-fields {
  margin-top: 30rpx;
}
.form-field-item {
  background: #f8f8f8;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.field-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}
.field-actions {
  display: flex;
  align-items: center;
}
.required-switch {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}
.required-switch text {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}
.delete-btn {
  padding: 10rpx;
}
.field-content {
  .field-type {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }
  .field-type text {
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
  .field-options {
    margin-top: 20rpx;
  }
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
  }
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
  .add-option {
    display: flex;
    align-items: center;
    padding: 10rpx 0;
  }
  .add-option text {
    font-size: 26rpx;
    color: #b13b7a;
    margin-left: 10rpx;
  }
}
.add-field {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
}
.add-field text {
  font-size: 28rpx;
  color: #b13b7a;
  margin-left: 10rpx;
}
</style>