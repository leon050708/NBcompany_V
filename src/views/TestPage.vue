<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明基本功能正常。</p>
    
    <!-- 简单测试组件 -->
    <SimpleTest />
    
    <el-card>
      <template #header>
        <span>功能测试</span>
      </template>
      
      <el-button type="primary" @click="testUserStore">
        测试用户状态
      </el-button>
      
      <div v-if="userInfo" style="margin-top: 20px;">
        <h3>用户信息:</h3>
        <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import SimpleTest from '@/components/dashboard/SimpleTest.vue'

const userStore = useUserStore()
const userInfo = ref(null)

const testUserStore = () => {
  userInfo.value = userStore.userInfo
  console.log('用户信息:', userStore.userInfo)
  console.log('是否已登录:', userStore.isLoggedIn)
}

onMounted(() => {
  console.log('测试页面已加载')
  testUserStore()
})
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 