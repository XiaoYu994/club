<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <span>{{ isEdit ? '编辑社团' : '创建社团' }}</span>
        <el-tag>待完成</el-tag>
      </div>
    </template>
    <el-empty description="表单设计开发中，将支持基础信息、人员配置与排序设置。" />
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEdit = computed(() => Boolean(route.params.id))
</script>

<style scoped>
.module-card {
  min-height: 420px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

