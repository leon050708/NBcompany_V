<template>
  <div style="padding: 20px; background: #f0f0f0; min-height: 100vh;">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明路由系统正常工作。</p>
    <p>当前时间: {{ new Date().toLocaleString() }}</p>
    <el-button @click="$router.push('/login')">返回登录页面</el-button>
  </div>
</template>

<script setup>
console.log('测试页面已加载')
</script> 