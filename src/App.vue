<script setup>
// 应用根组件
</script>

<template>
  <div id="app">
    <router-view />
    </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  }

/* 确保Element Plus组件不会产生额外的边距 */
.el-container {
  margin: 0;
  padding: 0;
  }

.el-header {
  margin: 0;
  padding: 0;
}

.el-main {
  margin: 0;
  padding: 0;
}

.el-aside {
  margin: 0;
  padding: 0;
}
</style>
