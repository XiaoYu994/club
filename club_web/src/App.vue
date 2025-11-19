<script setup>
</script>

<template>
  <div id="app">
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default { name: 'App' }
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }

#app { min-height: 100vh; display: flex; flex-direction: column; }

/* 主要内容区域 */
.main-content { flex: 1; }

/* 响应式在各组件内部处理 */

/* 平滑滚动 */
html { scroll-behavior: smooth; }

/* 全局动画 */
* { transition: color 0.3s ease, background-color 0.3s ease; }
</style>
