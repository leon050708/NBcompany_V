<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>用户登录</h2>
        <p>欢迎使用企业管理系统</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <el-link type="primary" @click="$router.push('/register')">
          还没有账号？立即注册
        </el-link>
        <el-link type="primary" @click="$router.push('/company-register')">
          企业注册
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await userStore.loginAction(loginForm)
    ElMessage.success('登录成功')
    
    // 根据用户角色跳转到不同页面
    const userRole = getUserRole(userStore.userInfo)
    const targetRoute = getTargetRouteByRole(userRole)
    
    console.log('用户角色:', userRole)
    console.log('跳转目标:', targetRoute)
    
    router.push(targetRoute)
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 获取用户角色
function getUserRole(userInfo) {
  if (userInfo.userType === 2) {
    return 'admin' // 平台管理员
  } else if (userInfo.userType === 1 && userInfo.companyRole === 2) {
    return 'company_admin' // 企业管理员
  } else if (userInfo.userType === 1 && userInfo.companyRole === 1) {
    return 'user' // 普通用户
  } else {
    return 'user' // 默认普通用户
  }
}

// 根据角色获取目标路由
function getTargetRouteByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin-dashboard'
    case 'company_admin':
      return '/company-dashboard'
    case 'user':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-top: 20px;
}
</style> 