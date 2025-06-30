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
                <path d="M16 21V19A4 4 0 0 0 12 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 class="brand-title">加入我们</h1>
          <p class="brand-subtitle">开启您的企业协作之旅</p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>快速注册，即时使用</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>安全可靠的数据保护</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>专业的企业级服务</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧注册表单 -->
      <div class="register-section">
        <div class="register-card">
          <div class="register-header">
            <h2>创建账户</h2>
            <p>填写您的个人信息</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
            label-width="0"
      >
            <div class="form-row">
              <el-form-item prop="username" class="form-item">
          <el-input
            v-model="registerForm.username"
                  placeholder="用户名"
            size="large"
                  :prefix-icon="User"
                  class="custom-input"
          />
        </el-form-item>
        
              <el-form-item prop="nickname" class="form-item">
                <el-input
                  v-model="registerForm.nickname"
                  placeholder="昵称"
                  size="large"
                  :prefix-icon="UserFilled"
                  class="custom-input"
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item prop="password" class="form-item">
          <el-input
            v-model="registerForm.password"
            type="password"
                  placeholder="密码"
            size="large"
                  :prefix-icon="Lock"
            show-password
                  class="custom-input"
          />
        </el-form-item>
        
              <el-form-item prop="confirmPassword" class="form-item">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
                  placeholder="确认密码"
            size="large"
                  :prefix-icon="Lock"
            show-password
                  class="custom-input"
          />
        </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item prop="phoneNumber" class="form-item">
          <el-input
            v-model="registerForm.phoneNumber"
                  placeholder="手机号码"
            size="large"
                  :prefix-icon="Phone"
                  class="custom-input"
          />
        </el-form-item>
        
              <el-form-item prop="email" class="form-item">
          <el-input
            v-model="registerForm.email"
                  placeholder="邮箱地址"
            size="large"
                  :prefix-icon="Message"
                  class="custom-input"
          />
        </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item prop="gender" class="form-item">
                <el-radio-group v-model="registerForm.gender" class="gender-group">
                  <el-radio :label="1" class="gender-radio">
                    <el-icon><Male /></el-icon>
                    男
                  </el-radio>
                  <el-radio :label="0" class="gender-radio">
                    <el-icon><Female /></el-icon>
                    女
                  </el-radio>
          </el-radio-group>
        </el-form-item>
            </div>
        
            <el-form-item prop="companyId" class="company-select-item">
          <el-select
            v-model="registerForm.companyId"
            placeholder="请选择所属企业"
            size="large"
            filterable
            remote
            :remote-method="searchCompanies"
            :loading="companyLoading"
                class="custom-select"
            @change="handleCompanyChange"
          >
            <el-option
              v-for="company in companyList"
              :key="company.id"
              :label="company.companyName"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
                <span v-if="!loading">创建账户</span>
                <span v-else>注册中...</span>
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
            <div class="login-links">
              <el-link type="primary" class="login-link" @click="$router.push('/login')">
                <el-icon><ArrowLeft /></el-icon>
                返回登录
        </el-link>
              <el-link type="primary" class="login-link" @click="$router.push('/company-register')">
                <el-icon><OfficeBuilding /></el-icon>
          企业注册
        </el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, UserFilled, Lock, Phone, Message, Male, Female, 
  ArrowLeft, OfficeBuilding, Check 
} from '@element-plus/icons-vue'
import { registerUser } from '@/api/auth'
import { loadCompaniesMapping, getCompaniesMap } from '@/utils/companyMapping'

const router = useRouter()

const registerFormRef = ref()
const loading = ref(false)
const companyLoading = ref(false)
const companyList = ref([])

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phoneNumber: '',
  email: '',
  gender: 1,
  companyId: '',
  companyName: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  companyId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
  ]
}

const searchCompanies = async (keyword) => {
  if (!keyword) return
  
  try {
    companyLoading.value = true
    
    // 确保企业映射已加载
    await loadCompaniesMapping()
    
    // 从映射中搜索企业
    const companiesMap = getCompaniesMap()
    const filteredCompanies = []
    
    for (const [id, name] of companiesMap) {
      if (name.toLowerCase().includes(keyword.toLowerCase())) {
        filteredCompanies.push({ id, companyName: name })
      }
    }
    
    companyList.value = filteredCompanies.slice(0, 10) // 限制显示数量
  } catch (error) {
    console.error('搜索企业失败:', error)
  } finally {
    companyLoading.value = false
  }
}

const handleCompanyChange = (companyId) => {
  const company = companyList.value.find(c => c.id === companyId)
  if (company) {
    registerForm.companyName = company.companyName
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const response = await registerUser(registerForm)
    ElMessage.success(response.message || '注册成功')
    
    // 注册成功后跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 预加载企业列表
  await loadCompaniesMapping()
  const companiesMap = getCompaniesMap()
  companyList.value = Array.from(companiesMap, ([id, companyName]) => ({ id, companyName })).slice(0, 10)
})
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
  width: 1200px;
  height: 700px;
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
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.register-card {
  width: 100%;
  max-width: 500px;
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

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
  margin-bottom: 0;
}

.company-select-item {
  margin-bottom: 20px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  background: #f9fafb;
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

.custom-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  background: #f9fafb;
  height: 50px;
}

.custom-select :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  background: white;
}

.custom-select :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.gender-group {
  display: flex;
  gap: 20px;
  width: 100%;
}

.gender-radio {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.gender-radio:hover {
  border-color: #667eea;
  background: white;
}

.gender-radio.is-checked {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
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
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .login-links {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 