<template>
  <div class="user-profile">
    <h2>个人资料</h2>
    
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-button 
            v-if="!isEditing" 
            type="primary" 
            size="small" 
            @click="startEdit"
          >
            编辑资料
          </el-button>
          <div v-else>
            <el-button type="success" size="small" @click="saveProfile" :loading="saving">
              保存
            </el-button>
            <el-button size="small" @click="cancelEdit" style="margin-left: 10px;">
              取消
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form 
        :model="profileForm" 
        :rules="profileRules" 
        ref="profileFormRef" 
        label-width="120px"
        :disabled="!isEditing"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="profileForm.realName" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="profileForm.phoneNumber" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="profileForm.companyName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户类型">
              <el-input v-model="userTypeText" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
          <el-button 
            v-if="!isChangingPassword" 
            type="warning" 
            size="small" 
            @click="startChangePassword"
          >
            修改密码
          </el-button>
          <div v-else>
            <el-button type="success" size="small" @click="savePassword" :loading="changingPassword">
              确认修改
            </el-button>
            <el-button size="small" @click="cancelChangePassword" style="margin-left: 10px;">
              取消
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef" 
        label-width="120px"
        :disabled="!isChangingPassword"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile, updateUserProfile, updateUserPassword } from '@/api/auth'

const userStore = useUserStore()

// 响应式数据
const isEditing = ref(false)
const isChangingPassword = ref(false)
const saving = ref(false)
const changingPassword = ref(false)

const profileFormRef = ref()
const passwordFormRef = ref()

// 表单数据
const profileForm = reactive({
  username: '',
  realName: '',
  email: '',
  phoneNumber: '',
  companyName: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const userTypeText = computed(() => {
  const userType = userStore.userInfo?.userType
  switch (userType) {
    case 0: return '普通用户'
    case 1: return '企业管理员'
    case 2: return '平台管理员'
    default: return '未知'
  }
})

// 加载用户资料
const loadUserProfile = async () => {
  try {
    const response = await getUserProfile()
    const userData = response.data
    
    // 填充表单数据
    profileForm.username = userData.username || ''
    profileForm.realName = userData.realName || userData.name || ''
    profileForm.email = userData.email || ''
    profileForm.phoneNumber = userData.phoneNumber || userData.phone || ''
    profileForm.companyName = userData.companyName || ''
    
    // 如果用户信息中有公司ID，尝试获取公司名称
    if (userData.companyId && !profileForm.companyName) {
      profileForm.companyName = userData.companyName || '未知公司'
    }
  } catch (error) {
    console.error('加载用户资料失败:', error)
    ElMessage.error('加载用户资料失败')
  }
}

// 编辑资料
const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  loadUserProfile() // 重新加载数据，取消修改
}

const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    
    saving.value = true
    await updateUserProfile(profileForm)
    
    // 更新store中的用户信息
    userStore.updateUserInfo(profileForm)
    
    isEditing.value = false
    ElMessage.success('资料更新成功')
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('更新资料失败:', error)
      ElMessage.error('更新资料失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 修改密码
const startChangePassword = () => {
  isChangingPassword.value = true
  // 清空密码表单
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const cancelChangePassword = () => {
  isChangingPassword.value = false
  passwordFormRef.value?.resetFields()
}

const savePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    changingPassword.value = true
    await updateUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    isChangingPassword.value = false
    passwordFormRef.value.resetFields()
    ElMessage.success('密码修改成功')
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败，请重试')
    }
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.user-profile h2 {
  margin-bottom: 20px;
  color: #303133;
}

.profile-card {
  margin-bottom: 20px;
}

.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: bold;
  color: #303133;
}
</style> 