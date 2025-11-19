<template>
  <div class="module-grid" :style="{ gridTemplateColumns }">
    <div
      v-for="item in renderedItems"
      :key="item.key || item.title"
      class="module-grid__item"
      :class="{ 'is-disabled': item.disabled }"
      role="button"
      tabindex="0"
      @click="handleClick(item)"
      @keyup.enter="handleClick(item)"
    >
      <div class="module-grid__icon" :style="iconStyle(item)">
        <slot :name="`icon-${item.key}`" :item="item">
          <el-icon :size="28">
            <component :is="item.icon || 'Menu'" />
          </el-icon>
        </slot>
      </div>
      <div class="module-grid__info">
        <div class="module-grid__title">
          {{ item.title }}
          <el-tag v-if="item.tag" size="small" type="info" effect="plain">{{ item.tag }}</el-tag>
        </div>
        <p v-if="item.description">{{ item.description }}</p>
      </div>
      <el-icon class="module-grid__arrow"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  columns: { type: Number, default: 3 },
  gap: { type: Number, default: 18 },
})

const emit = defineEmits(['select'])

const router = useRouter()
const authStore = useAuthStore()

const renderedItems = computed(() =>
  props.items.filter((item) => {
    if (!item) return false
    if (!item.roles || !item.roles.length) return true
    return item.roles.some((role) => authStore.roles.includes(role))
  }),
)

const gridGap = computed(() => `${props.gap}px`)
const gridTemplateColumns = computed(() => {
  if (!props.columns || props.columns <= 0) {
    return 'repeat(auto-fit, minmax(220px, 1fr))'
  }
  return `repeat(${props.columns}, minmax(0, 1fr))`
})

const iconStyle = (item) => ({
  background: item.iconBackground || 'var(--gradient-brand-soft)',
  color: item.iconColor || 'var(--color-primary-600)',
})

const handleClick = (item) => {
  if (!item || item.disabled) return
  if (item.to) {
    router.push(item.to)
  }
  emit('select', item)
}
</script>

<style scoped>
.module-grid {
  display: grid;
  gap: v-bind(gridGap);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.module-grid__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  outline: none;
}

.module-grid__item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
}

.module-grid__item:focus-visible {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
}

.module-grid__item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.module-grid__icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-grid__info {
  flex: 1;
}

.module-grid__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.module-grid__info p {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(71, 85, 105, 0.75);
}

.module-grid__arrow {
  color: rgba(148, 163, 184, 0.8);
}
</style>

