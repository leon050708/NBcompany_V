<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>企业注册</h2>
        <p>注册您的企业信息</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-width="100px"
      >
        <el-form-item label="企业名称" prop="companyName">
          <el-input
            v-model="registerForm.companyName"
            placeholder="请输入企业名称"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="registerForm.contactPerson"
            placeholder="请输入联系人姓名"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="registerForm.contactPhone"
            placeholder="请输入联系电话"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input
            v-model="registerForm.contactEmail"
            placeholder="请输入联系邮箱"
            size="large"
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
            {{ loading ? '注册中...' : '注册企业' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <el-link type="primary" @click="$router.push('/login')">
          已有账号？立即登录
        </el-link>
        <el-link type="primary" @click="$router.push('/register')">
          用户注册
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  margin: 0;
  padding: 0;
}

.register-box {
  width: 500px;
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