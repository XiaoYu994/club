<template>
  <div class="page-header surface-card">
    <div class="page-header__main">
      <div class="page-header__labels">
        <slot name="tag" />
      </div>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
      <div v-if="meta" class="page-header__meta">
        <el-icon><Timer /></el-icon>
        <span>{{ meta }}</span>
      </div>
    </div>
    <div class="page-header__extra">
      <slot name="extra" />
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { Timer } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  meta: { type: String, default: '' },
})
</script>

<style scoped>
.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  padding: 22px 28px;
  background: linear-gradient(120deg, rgba(148, 163, 184, 0.18), rgba(224, 231, 255, 0.28));
  border-radius: var(--radius-xl);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: var(--shadow-sm);
}

.page-header__main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-header__labels {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 20px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-neutral-800, #1f2937);
}

p {
  color: rgba(71, 85, 105, 0.85);
  font-size: 15px;
  line-height: 1.5;
}

.page-header__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(71, 85, 105, 0.7);
}

.page-header__extra {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header__actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-header__extra,
  .page-header__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 18px;
  }

  h1 {
    font-size: 22px;
  }
}
</style>

