<template>
  <div class="filter-toolbar glass-panel">
    <div class="toolbar-prefix">
      <slot name="prefix" />
    </div>

    <el-form
      class="filters-form"
      :inline="true"
      :model="internalValue"
      @submit.prevent
    >
      <template v-for="item in filters" :key="item.field">
        <slot :name="`filter-${item.field}`" :model="internalValue" :item="item">
          <el-form-item :label="item.label" :prop="item.field" class="filters-form__item">
            <component
              :is="resolveControl(item)"
              v-model="internalValue[item.field]"
              v-bind="controlProps(item)"
              @change="() => handleChange(item.field)"
              @keyup.enter="handleSearch"
            >
              <template v-if="item.type === 'select'" v-for="option in item.options" :key="option.value">
                <el-option :label="option.label" :value="option.value" />
              </template>
              <template
                v-else-if="item.type === 'radio'"
                v-for="option in item.options"
                :key="option.value"
              >
                <el-radio :label="option.value">{{ option.label }}</el-radio>
              </template>
              <template
                v-else-if="item.type === 'checkbox'"
                v-for="option in item.options"
                :key="option.value"
              >
                <el-checkbox :label="option.value">{{ option.label }}</el-checkbox>
              </template>
            </component>
          </el-form-item>
        </slot>
      </template>
    </el-form>

    <div class="toolbar-actions">
      <slot name="actions">
        <el-button type="primary" :loading="loading" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button v-if="showReset" text @click="handleReset">重置</el-button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import { Search } from '@element-plus/icons-vue'
import { isPlainObject } from '@/utils/object'

const defaultDatePresets = [
  { label: '今日', value: 'today' },
  { label: '近7天', value: 'last7' },
  { label: '近30天', value: 'last30' },
  { label: '本月', value: 'month' },
]

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  filters: {
    type: Array,
    default: () => [],
  },
  loading: { type: Boolean, default: false },
  showReset: { type: Boolean, default: true },
  datePresets: {
    type: Array,
    default: () => defaultDatePresets,
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const internalValue = reactive({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newVal) => {
    if (!isPlainObject(newVal)) return
    Object.keys(internalValue).forEach((key) => {
      if (!(key in newVal)) {
        delete internalValue[key]
      }
    })
    Object.assign(internalValue, newVal)
  },
  { deep: true },
)

const controlMap = {
  input: 'el-input',
  select: 'el-select',
  'date-range': 'el-date-picker',
  daterange: 'el-date-picker',
  date: 'el-date-picker',
  radio: 'el-radio-group',
  checkbox: 'el-checkbox-group',
}

const resolveControl = (item) => {
  if (item.component) return item.component
  return controlMap[item.type] || 'el-input'
}

const dateRangeShortcuts = computed(() =>
  props.datePresets.map((preset) => ({
    text: preset.label,
    value: calculatePresetRange(preset.value),
  })),
)

const controlProps = (item) => {
  const base = {
    placeholder: item.placeholder || `请选择${item.label || ''}`,
    clearable: item.clearable !== false,
    style: { width: item.width || '200px' },
  }

  if (item.type === 'input') {
    return {
      ...base,
      placeholder: item.placeholder || '请输入关键词',
    }
  }

  if (item.type === 'select') {
    return {
      ...base,
      filterable: item.filterable ?? true,
      multiple: item.multiple ?? false,
      collapseTags: true,
      collapseTagsTooltip: true,
    }
  }

  if (item.type === 'radio' || item.type === 'checkbox') {
    return {
      ...base,
      style: { width: item.width || 'auto' },
    }
  }

  if (item.type === 'date-range' || item.type === 'daterange') {
    return {
      ...base,
      type: 'daterange',
      unlinkPanels: true,
      rangeSeparator: '至',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: item.valueFormat || 'YYYY-MM-DD HH:mm:ss',
      defaultTime: ['00:00:00', '23:59:59'],
      shortcuts: dateRangeShortcuts.value,
    }
  }

  if (item.type === 'date') {
    return {
      ...base,
      type: item.picker || 'date',
      valueFormat: item.valueFormat || 'YYYY-MM-DD',
    }
  }

  return base
}

const calculatePresetRange = (preset) => {
  const end = dayjs()
  switch (preset) {
    case 'today':
      return [end.startOf('day').toDate(), end.endOf('day').toDate()]
    case 'last7':
      return [end.subtract(6, 'day').startOf('day').toDate(), end.endOf('day').toDate()]
    case 'last30':
      return [end.subtract(29, 'day').startOf('day').toDate(), end.endOf('day').toDate()]
    case 'month':
      return [end.startOf('month').toDate(), end.endOf('month').toDate()]
    default:
      return preset
  }
}

const syncModel = () => {
  emit('update:modelValue', { ...internalValue })
}

const handleChange = (field) => {
  if (Array.isArray(internalValue[field]) && internalValue[field].length === 0) {
    internalValue[field] = undefined
  }
  syncModel()
}

const handleReset = () => {
  Object.keys(internalValue).forEach((key) => {
    internalValue[key] = undefined
  })
  syncModel()
  emit('reset')
}

const handleSearch = () => {
  syncModel()
  emit('search', { ...internalValue })
}
</script>

<style scoped>
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 16px 20px;
}

.toolbar-prefix {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters-form {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
}

.filters-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--color-neutral-600);
  padding: 0 12px 0 0;
}

.filters-form__item {
  margin-bottom: 0;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 960px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-form {
    width: 100%;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

