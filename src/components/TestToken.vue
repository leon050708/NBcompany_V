<template>
  <div class="test-token-container">
    <el-container class="full-container">
      <el-header class="header">
        <div class="header-left">
          <el-button @click="$router.push('/dashboard')" text>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2>Token 测试组件</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" size="small" @click="refreshToken">刷新Token</el-button>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <el-card class="test-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="token-section">
                <h3>当前Token状态</h3>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="Token存在">
                    <el-tag :type="hasToken ? 'success' : 'danger'">
                      {{ hasToken ? '是' : '否' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="Token值">
                    <el-input
                      v-model="tokenDisplay"
                      type="textarea"
                      :rows="3"
                      readonly
                      placeholder="暂无Token"
                    />
                  </el-descriptions-item>
                  <el-descriptions-item label="用户信息">
                    <el-input
                      v-model="userInfoDisplay"
                      type="textarea"
                      :rows="4"
                      readonly
                      placeholder="暂无用户信息"
                    />
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
            
            <el-col :span="12">
              <div class="api-section">
                <h3>API测试</h3>
                <el-space direction="vertical" style="width: 100%">
                  <el-button 
                    type="primary" 
                    @click="testGetUserProfile"
                    :loading="loading.getUserProfile"
                  >
                    测试获取用户信息
                  </el-button>
                  
                  <el-button 
                    type="success" 
                    @click="testUpdateProfile"
                    :loading="loading.updateProfile"
                  >
                    测试更新用户信息
                  </el-button>
                  
                  <el-button 
                    type="warning" 
                    @click="testInvalidToken"
                    :loading="loading.invalidToken"
                  >
                    测试无效Token
                  </el-button>
                  
                  <el-button 
                    type="info" 
                    @click="clearToken"
                  >
                    清除Token
                  </el-button>
                </el-space>
                
                <div class="api-result">
                  <h4>API响应结果：</h4>
                  <el-input
                    v-model="apiResult"
                    type="textarea"
                    :rows="6"
                    readonly
                    placeholder="点击上方按钮测试API调用"
                  />
                </div>
              </div>
            </el-col>
          </el-row>
          
          <el-divider />
          
          <div class="debug-section">
            <h3>调试工具</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-button @click="showTokenInConsole" type="primary" block>
                  在控制台显示Token
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button @click="showUserInfoInConsole" type="success" block>
                  在控制台显示用户信息
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-button @click="showAllInConsole" type="warning" block>
                  显示所有调试信息
                </el-button>
              </el-col>
            </el-row>
            
            <el-divider />
            
            <h3>注册测试</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-button @click="testCompanyRegister" type="primary" block>
                  测试企业注册
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button @click="testUserRegister" type="success" block>
                  测试用户注册
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserProfile, updateUserProfile, registerCompany, registerUser } from '@/api/auth'

const userStore = useUserStore()

// 响应式数据
const tokenDisplay = ref('')
const userInfoDisplay = ref('')
const apiResult = ref('')
const loading = ref({
  getUserProfile: false,
  updateProfile: false,
  invalidToken: false
})

// 计算属性
const hasToken = computed(() => !!userStore.token)

// 更新显示内容
const updateDisplay = () => {
  tokenDisplay.value = userStore.token || '暂无Token'
  userInfoDisplay.value = JSON.stringify(userStore.userInfo, null, 2) || '暂无用户信息'
}

// 刷新Token
const refreshToken = () => {
  updateDisplay()
  ElMessage.success('Token信息已刷新')
}

// 测试获取用户信息
const testGetUserProfile = async () => {
  if (!hasToken.value) {
    ElMessage.error('请先登录获取Token')
    return
  }
  
  loading.value.getUserProfile = true
  apiResult.value = '正在请求...'
  
  try {
    const response = await getUserProfile()
    apiResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('获取用户信息成功')
    
    // 更新显示
    updateDisplay()
  } catch (error) {
    apiResult.value = `错误: ${error.message}`
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value.getUserProfile = false
  }
}

// 测试更新用户信息
const testUpdateProfile = async () => {
  if (!hasToken.value) {
    ElMessage.error('请先登录获取Token')
    return
  }
  
  loading.value.updateProfile = true
  apiResult.value = '正在请求...'
  
  try {
    const testData = {
      nickname: '测试昵称',
      phoneNumber: '13800138000',
      email: 'test@example.com',
      gender: 0
    }
    
    const response = await updateUserProfile(testData)
    apiResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('更新用户信息成功')
    
    // 更新显示
    updateDisplay()
  } catch (error) {
    apiResult.value = `错误: ${error.message}`
    ElMessage.error('更新用户信息失败')
  } finally {
    loading.value.updateProfile = false
  }
}

// 测试无效Token
const testInvalidToken = async () => {
  loading.value.invalidToken = true
  apiResult.value = '正在测试无效Token...'
  
  try {
    // 临时保存当前token
    const originalToken = userStore.token
    // 设置一个无效的token
    localStorage.setItem('token', 'invalid_token')
    
    const response = await getUserProfile()
    apiResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('测试完成')
    
    // 恢复原始token
    localStorage.setItem('token', originalToken)
    updateDisplay()
  } catch (error) {
    apiResult.value = `预期错误: ${error.message}`
    ElMessage.warning('无效Token测试完成（这是预期的错误）')
    
    // 恢复原始token
    const originalToken = userStore.token
    if (originalToken) {
      localStorage.setItem('token', originalToken)
    }
    updateDisplay()
  } finally {
    loading.value.invalidToken = false
  }
}

// 清除Token
const clearToken = () => {
  userStore.logout()
  updateDisplay()
  apiResult.value = 'Token已清除'
  ElMessage.success('Token已清除')
}

// 调试方法
const showTokenInConsole = () => {
  console.log('=== Token信息 ===')
  console.log('Token:', userStore.token)
  console.log('Token (localStorage):', localStorage.getItem('token'))
  console.log('================')
  ElMessage.info('Token信息已输出到控制台')
}

const showUserInfoInConsole = () => {
  console.log('=== 用户信息 ===')
  console.log('用户信息:', userStore.userInfo)
  console.log('用户信息 (localStorage):', JSON.parse(localStorage.getItem('userInfo') || '{}'))
  console.log('================')
  ElMessage.info('用户信息已输出到控制台')
}

const showAllInConsole = () => {
  userStore.debugInfo()
  ElMessage.info('所有调试信息已输出到控制台')
}

// 测试企业注册
const testCompanyRegister = async () => {
  try {
    const testData = {
      companyName: "新建科技公司",
      contactPerson: "王小明",
      contactPhone: "13912345678",
      contactEmail: "wangxm@newtech.com"
    }
    
    apiResult.value = '正在测试企业注册...'
    const response = await registerCompany(testData)
    apiResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('企业注册测试完成')
    
  } catch (error) {
    apiResult.value = `错误: ${error.message}`
    ElMessage.error('企业注册测试失败')
  }
}

// 测试用户注册
const testUserRegister = async () => {
  try {
    const testData = {
      username: "newemployee",
      password: "password123",
      nickname: "新员工",
      phoneNumber: "13312345678",
      email: "newemployee@example.com",
      gender: 1,
      companyId: 1,
      companyName: "新建科技公司"
    }
    
    apiResult.value = '正在测试用户注册...'
    const response = await registerUser(testData)
    apiResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('用户注册测试完成')
    
  } catch (error) {
    apiResult.value = `错误: ${error.message}`
    ElMessage.error('用户注册测试失败')
  }
}

// 组件挂载时初始化
onMounted(() => {
  updateDisplay()
})
</script>

<style scoped>
.test-token-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.full-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  margin: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  margin: 0;
}

.test-card {
  max-width: 1200px;
  margin: 0 auto;
}

.token-section h3,
.api-section h3,
.debug-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.api-result {
  margin-top: 20px;
}

.api-result h4 {
  margin-bottom: 10px;
  color: #606266;
}

.debug-section {
  margin-top: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style> 