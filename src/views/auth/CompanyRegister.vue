<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>
    
    <div class="register-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 21V7L13 3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 21V11L13 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 13H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 17H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 class="brand-title">企业入驻</h1>
          <p class="brand-subtitle">开启您的企业数字化转型</p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>专业的企业管理平台</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>快速审核，即时开通</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>7×24小时技术支持</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧注册表单 -->
      <div class="register-section">
        <div class="register-card">
          <div class="register-header">
        <h2>企业注册</h2>
            <p>填写您的企业信息</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
            label-width="0"
      >
            <el-form-item prop="companyName">
          <el-input
            v-model="registerForm.companyName"
                placeholder="企业名称"
            size="large"
                :prefix-icon="OfficeBuilding"
                class="custom-input"
          />
        </el-form-item>
        
            <el-form-item prop="contactPerson">
          <el-input
            v-model="registerForm.contactPerson"
                placeholder="联系人姓名"
            size="large"
                :prefix-icon="User"
                class="custom-input"
          />
        </el-form-item>
        
            <el-form-item prop="contactPhone">
          <el-input
            v-model="registerForm.contactPhone"
                placeholder="联系电话"
            size="large"
                :prefix-icon="Phone"
                class="custom-input"
          />
        </el-form-item>
        
            <el-form-item prop="contactEmail">
          <el-input
            v-model="registerForm.contactEmail"
                placeholder="联系邮箱"
            size="large"
                :prefix-icon="Message"
                class="custom-input"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
                <span v-if="!loading">提交注册</span>
                <span v-else>提交中...</span>
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
            <div class="login-links">
              <el-link type="primary" class="login-link" @click="$router.push('/login')">
                <el-icon><ArrowLeft /></el-icon>
                返回登录
        </el-link>
              <el-link type="primary" class="login-link" @click="$router.push('/register')">
                <el-icon><UserFilled /></el-icon>
          用户注册
        </el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  OfficeBuilding, User, Phone, Message, ArrowLeft, UserFilled, Check 
} from '@element-plus/icons-vue'
import { registerCompany } from '@/api/auth'

const router = useRouter()

const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  companyName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: ''
})

const registerRules = {
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const response = await registerCompany(registerForm)
    ElMessage.success(response.message || '企业注册成功，请等待平台管理员审核')
    
    // 注册成功后跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('企业注册失败:', error)
    ElMessage.error(error.message || '企业注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.register-content {
  display: flex;
  width: 1000px;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.brand-content {
  text-align: center;
  z-index: 1;
  position: relative;
}

.logo-container {
  margin-bottom: 30px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  font-weight: 300;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  opacity: 0.9;
}

.feature-item .el-icon {
  color: #4ade80;
  font-size: 16px;
}

/* 右侧注册区域 */
.register-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.register-header p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.register-form {
  margin-bottom: 30px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  background: #f9fafb;
  margin-bottom: 20px;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  background: white;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.custom-input :deep(.el-input__inner) {
  height: 50px;
  font-size: 16px;
}

.register-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.register-footer {
  text-align: center;
}

.login-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-content {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
  
  .brand-section {
    padding: 40px 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .register-section {
    padding: 30px 20px;
  }
  
  .login-links {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 