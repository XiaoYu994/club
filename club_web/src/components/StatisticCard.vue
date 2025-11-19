<template>
  <div
    class="statistic-card"
    :class="[
      `statistic-card--${statusClass}`,
      { 'is-clickable': clickable || !!$attrs.onClick },
      { 'is-loading': loading },
    ]"
    role="group"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="card-title">
        <slot name="icon">
          <div v-if="iconComponent" class="icon-wrapper">
            <el-icon :size="22">
              <component :is="iconComponent" />
            </el-icon>
          </div>
        </slot>
        <div class="title-text">
          <span class="title">{{ title }}</span>
          <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <slot name="actions">
        <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
          <el-icon :size="18" class="hint-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </slot>
    </div>

    <div class="card-content">
      <div class="value-wrapper">
        <slot name="prefix">
          <span v-if="prefix" class="value-prefix">{{ prefix }}</span>
        </slot>
        <span class="value" v-if="!loading">{{ formattedValue }}</span>
        <el-skeleton v-else animated :throttle="200">
          <template #template>
            <el-skeleton-item variant="h1" style="width: 140px" />
          </template>
        </el-skeleton>
        <slot name="suffix">
          <span v-if="unit && !loading" class="value-unit">{{ unit }}</span>
        </slot>
      </div>
      <div class="trend" v-if="trendShown && !loading">
        <el-tag :type="trendTagType" effect="light" size="small">
          <el-icon v-if="trendDirection !== 'flat'" :size="14">
            <component :is="trendDirectionIcon" />
          </el-icon>
          <span class="trend-value">{{ trendText }}</span>
        </el-tag>
        <span v-if="trendLabel" class="trend-label">{{ trendLabel }}</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { InfoFilled, CaretTop, CaretBottom, Minus } from '@element-plus/icons-vue'
import { isNumber } from '@/utils/number'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  value: { type: [Number, String], default: '-' },
  formatter: { type: Function, default: null },
  decimals: { type: Number, default: 0 },
  unit: { type: String, default: '' },
  prefix: { type: String, default: '' },
  tooltip: { type: String, default: '' },
  trend: { type: Number, default: null },
  trendLabel: { type: String, default: '' },
  trendType: { type: String, default: 'percentage' }, // percentage | absolute
  trendDirection: { type: String, default: 'auto' }, // auto | up | down | flat
  icon: { type: [String, Object], default: '' },
  status: { type: String, default: 'default' }, // default | success | warning | danger | info
  loading: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const attrs = useAttrs()
const hasClickListener = computed(() => Boolean(attrs.onClick))

const trendShown = computed(() => props.trend !== null && props.trend !== undefined)

const statusClass = computed(() => {
  const allow = ['default', 'success', 'warning', 'danger', 'info']
  return allow.includes(props.status) ? props.status : 'default'
})

const iconComponent = computed(() => {
  if (!props.icon) return null
  if (typeof props.icon === 'string') return props.icon
  return props.icon
})

const trendDirection = computed(() => {
  if (!trendShown.value) return 'flat'
  if (props.trendDirection !== 'auto') return props.trendDirection
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'flat'
})

const trendDirectionIcon = computed(() => {
  switch (trendDirection.value) {
    case 'up':
      return CaretTop
    case 'down':
      return CaretBottom
    default:
      return Minus
  }
})

const trendTagType = computed(() => {
  switch (trendDirection.value) {
    case 'up':
      return 'success'
    case 'down':
      return 'danger'
    default:
      return 'info'
  }
})

const trendText = computed(() => {
  if (!trendShown.value) return ''
  if (props.trendType === 'percentage') {
    return `${Math.abs(props.trend).toFixed(1)}%`
  }
  return Math.abs(props.trend)
})

const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  if (isNumber(props.value) && props.decimals >= 0) {
    return Number(props.value).toLocaleString(undefined, {
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    })
  }
  return props.value
})

const handleClick = (event) => {
  if (props.clickable || hasClickListener.value) {
    emit('click', event)
  }
}
</script>

<style scoped>
.statistic-card {
  display: flex;
  flex-direction: column;
  padding: 20px 22px;
  border-radius: var(--radius-lg);
  background: var(--gradient-card);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  min-height: 148px;
}

.statistic-card.is-clickable {
  cursor: pointer;
}

.statistic-card.is-clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
}

.statistic-card--success {
  border-color: rgba(34, 197, 94, 0.25);
}

.statistic-card--warning {
  border-color: rgba(245, 158, 11, 0.25);
}

.statistic-card--danger {
  border-color: rgba(239, 68, 68, 0.25);
}

.statistic-card--info {
  border-color: rgba(59, 130, 246, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-title {
  display: flex;
  gap: 14px;
  align-items: center;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.subtitle {
  font-size: 12px;
  color: var(--color-neutral-500);
}

.hint-icon {
  color: var(--color-neutral-400);
  cursor: help;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: var(--gradient-brand-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.value-prefix {
  font-size: 28px;
  font-weight: 500;
  color: var(--color-neutral-400);
}

.value {
  font-size: 38px;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.1;
}

.value-unit {
  font-size: 14px;
  color: var(--color-neutral-500);
  transform: translateY(6px);
}

.trend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.trend-label {
  color: var(--color-neutral-500);
}

.trend-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.statistic-card.is-loading {
  pointer-events: none;
  opacity: 0.78;
}

@media (max-width: 768px) {
  .statistic-card {
    padding: 16px;
  }

  .value {
    font-size: 32px;
  }
}
</style>

