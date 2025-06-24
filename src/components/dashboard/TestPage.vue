<template>
  <div class="test-page">
    <h2>系统测试页面</h2>
    
    <el-card class="test-card">
      <template #header>
        <span>API连接测试</span>
      </template>
      
      <div class="test-section">
        <h3>直接连接测试</h3>
        <el-button @click="testDirectConnection" :loading="testingDirect">
          测试直接连接到后端
        </el-button>
        <div v-if="directResult" class="test-result">
          <pre>{{ directResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h3>代理连接测试</h3>
        <el-button @click="testProxyConnection" :loading="testingProxy">
          测试通过代理连接
        </el-button>
        <div v-if="proxyResult" class="test-result">
          <pre>{{ proxyResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h3>用户信息测试</h3>
        <el-button @click="testUserInfo">
          获取当前用户信息
        </el-button>
        <div v-if="userInfoResult" class="test-result">
          <pre>{{ userInfoResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h3>Token测试</h3>
        <el-button @click="testToken">
          检查Token状态
        </el-button>
        <div v-if="tokenResult" class="test-result">
          <pre>{{ tokenResult }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/auth'
import request from '@/utils/request'

const userStore = useUserStore()

// 响应式数据
const testingDirect = ref(false)
const testingProxy = ref(false)
const directResult = ref('')
const proxyResult = ref('')
const userInfoResult = ref('')
const tokenResult = ref('')

// 直接连接测试
const testDirectConnection = async () => {
  testingDirect.value = true
  directResult.value = ''
  
  try {
    // 使用代理路径而不是直接访问后端
    const response = await fetch('/api/v1/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const data = await response.json()
    directResult.value = JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      data: data
    }, null, 2)
    
    if (response.ok) {
      ElMessage.success('直接连接测试成功')
    } else {
      ElMessage.warning(`直接连接测试失败: ${response.status}`)
    }
  } catch (error) {
    directResult.value = JSON.stringify({
      error: error.message,
      type: error.name
    }, null, 2)
    ElMessage.error('直接连接测试失败')
  } finally {
    testingDirect.value = false
  }
}

// 代理连接测试
const testProxyConnection = async () => {
  testingProxy.value = true
  proxyResult.value = ''
  
  try {
    const response = await request({
      url: '/v1/companies',
      method: 'get'
    })
    
    proxyResult.value = JSON.stringify({
      success: true,
      data: response.data
    }, null, 2)
    
    ElMessage.success('代理连接测试成功')
  } catch (error) {
    proxyResult.value = JSON.stringify({
      success: false,
      error: error.message,
      response: error.response?.data
    }, null, 2)
    ElMessage.error('代理连接测试失败')
  } finally {
    testingProxy.value = false
  }
}

// 用户信息测试
const testUserInfo = async () => {
  userInfoResult.value = ''
  
  try {
    const response = await getUserProfile()
    userInfoResult.value = JSON.stringify({
      success: true,
      data: response.data
    }, null, 2)
    
    ElMessage.success('用户信息获取成功')
  } catch (error) {
    userInfoResult.value = JSON.stringify({
      success: false,
      error: error.message,
      response: error.response?.data
    }, null, 2)
    ElMessage.error('用户信息获取失败')
  }
}

// Token测试
const testToken = () => {
  const token = localStorage.getItem('token')
  const userInfo = userStore.userInfo
  
  tokenResult.value = JSON.stringify({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : '无',
    userInfo: userInfo,
    isLoggedIn: userStore.isLoggedIn
  }, null, 2)
  
  if (token) {
    ElMessage.success('Token存在且有效')
  } else {
    ElMessage.warning('Token不存在')
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.test-page h2 {
  margin-bottom: 20px;
  color: #303133;
}

.test-card {
  margin-bottom: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.test-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.test-section h3 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.test-section .el-button {
  margin-bottom: 15px;
}

.test-result {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.test-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
}
</style> 