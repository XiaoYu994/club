<template>
  <el-card class="module-card">
    <template #header>
      <div class="card-header">
        <div>
          <h2>公告管理</h2>
          <p>即将提供公告发布、置顶、定时发布与富文本编辑能力。</p>
        </div>
        <el-button type="primary" disabled>新建公告（开发中）</el-button>
      </div>
    </template>
    <el-empty description="公告列表开发中，请稍后处理公告内容。" />
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

