<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>注册您的用户账号</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input
            v-model="registerForm.phoneNumber"
            placeholder="请输入手机号码"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="所属企业" prop="companyId">
          <el-select
            v-model="registerForm.companyId"
            placeholder="请选择所属企业"
            size="large"
            filterable
            remote
            :remote-method="searchCompanies"
            :loading="companyLoading"
            style="width: 100%"
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
            {{ loading ? '注册中...' : '注册用户' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <el-link type="primary" @click="$router.push('/login')">
          已有账号？立即登录
        </el-link>
        <el-link type="primary" @click="$router.push('/company-register')">
          企业注册
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerUser, getCompanyList } from '@/api/auth'

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
  gender: 0,
  companyId: ''
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
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
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
    const response = await getCompanyList({ keyword, size: 20 })
    companyList.value = response.data.records
  } catch (error) {
    console.error('获取企业列表失败:', error)
  } finally {
    companyLoading.value = false
  }
}

const loadCompanies = async () => {
  try {
    companyLoading.value = true
    const response = await getCompanyList({ size: 20 })
    companyList.value = response.data.records
  } catch (error) {
    console.error('获取企业列表失败:', error)
  } finally {
    companyLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    // 移除确认密码字段
    const { confirmPassword, ...registerData } = registerForm
    
    const response = await registerUser(registerData)
    ElMessage.success(response.message || '用户注册成功，请等待企业管理员分配权限')
    
    // 注册成功后跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('用户注册失败:', error)
    ElMessage.error(error.message || '用户注册失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanies()
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
  margin: 0;
  padding: 20px;
}

.register-box {
  width: 600px;
  max-width: 100%;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.register-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.register-form {
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
}

.register-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style> 