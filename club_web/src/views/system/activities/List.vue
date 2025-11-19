<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <div>
          <h2>活动管理</h2>
          <p>即将支持跨社团活动总览、审批流转与导出名单。</p>
        </div>
        <el-button type="primary" disabled>批量导出（待上线）</el-button>
      </div>
    </template>
    <el-empty description="活动列表表格开发中，敬请期待。" />
  </el-card>
</template>

<script setup>
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

.card-header h2 {
  margin-bottom: 6px;
}

.card-header p {
  color: #64748b;
  font-size: 13px;
}
</style>

