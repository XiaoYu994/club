<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <div>
          <h2>用户管理</h2>
          <p>建设中：即将支持多条件筛选、批量导出与状态管理。</p>
        </div>
        <el-button type="primary" disabled>导出用户（即将开放）</el-button>
      </div>
    </template>
    <el-empty description="列表模块建设中，稍后完善数据表格与操作栏。" />
  </el-card>
</template>

<script setup>
</script>

<style scoped>
.module-card {
  min-height: 440px;
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

