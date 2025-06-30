<template>
  <div class="user-profile">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">个人资料</h1>
          <p class="page-subtitle">管理您的个人信息和账户设置</p>
        </div>
        <div class="header-right">
          <div class="user-avatar">
            <el-avatar :size="60" :src="userStore.userInfo?.avatar || ''">
              {{ userStore.userInfo?.realName?.charAt(0) || 'U' }}
            </el-avatar>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 基本信息卡片 -->
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon"><User /></el-icon>
              <span class="header-title">基本信息</span>
            </div>
            <div class="header-actions">
              <el-button 
                v-if="!isEditing" 
                type="primary" 
                size="small" 
                @click="startEdit"
                class="action-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
              <div v-else class="edit-actions">
                <el-button type="success" size="small" @click="saveProfile" :loading="saving" class="action-btn">
                  <el-icon><Check /></el-icon>
                  保存
                </el-button>
                <el-button size="small" @click="cancelEdit" class="action-btn cancel-btn">
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </div>
            </div>
          </div>
        </template>
        
        <el-form 
          :model="profileForm" 
          :rules="profileRules" 
          ref="profileFormRef" 
          label-width="120px"
          :disabled="!isEditing"
          class="profile-form"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phoneNumber">
                <el-input v-model="profileForm.phoneNumber" placeholder="请输入手机号码" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="公司名称">
                <el-input v-model="profileForm.companyName" disabled class="disabled-input" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户类型">
                <el-input v-model="userTypeText" disabled class="disabled-input" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      
      <!-- 修改密码卡片 -->
      <el-card class="password-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon"><Lock /></el-icon>
              <span class="header-title">修改密码</span>
            </div>
            <div class="header-actions">
              <el-button 
                v-if="!isChangingPassword" 
                type="warning" 
                size="small" 
                @click="startChangePassword"
                class="action-btn"
              >
                <el-icon><Key /></el-icon>
                修改密码
              </el-button>
              <div v-else class="edit-actions">
                <el-button type="success" size="small" @click="savePassword" :loading="changingPassword" class="action-btn">
                  <el-icon><Check /></el-icon>
                  确认修改
                </el-button>
                <el-button size="small" @click="cancelChangePassword" class="action-btn cancel-btn">
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </div>
            </div>
          </div>
        </template>
        
        <el-form 
          :model="passwordForm" 
          :rules="passwordRules" 
          ref="passwordFormRef" 
          label-width="120px"
          :disabled="!isChangingPassword"
          class="password-form"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input 
              v-model="passwordForm.currentPassword" 
              type="password" 
              show-password
              placeholder="请输入当前密码"
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword" 
              type="password" 
              show-password
              placeholder="请输入新密码"
            />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              show-password
              placeholder="请再次输入新密码"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Edit, Check, Close, Lock, Key } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserProfile, updateUserProfile, updateUserPassword } from '@/api/auth'
import { loadCompaniesMapping, getCompanyName } from '@/utils/companyMapping'

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
    
    // 如果用户信息中有公司ID，使用企业映射获取公司名称
    if (userData.companyId) {
      // 确保企业映射已加载
      await loadCompaniesMapping()
      profileForm.companyName = getCompanyName(userData.companyId)
    } else {
      profileForm.companyName = '未分配企业'
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
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.header-right {
  flex-shrink: 0;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* 主要内容区域 */
.main-content {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

.profile-card,
.password-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: none;
  overflow: hidden;
}

.profile-card :deep(.el-card__header),
.password-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 20px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* 表单样式 */
.profile-form,
.password-form {
  padding: 24px;
}

.profile-form :deep(.el-form-item),
.password-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.profile-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.profile-form :deep(.el-input__wrapper),
.password-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.profile-form :deep(.el-input__wrapper:hover),
.password-form :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
}

.profile-form :deep(.el-input__wrapper.is-focus),
.password-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.disabled-input :deep(.el-input__wrapper) {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
}

.disabled-input :deep(.el-input__inner) {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .user-avatar {
    align-self: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .profile-form,
  .password-form {
    padding: 16px;
  }
  
  .profile-form :deep(.el-col),
  .password-form :deep(.el-col) {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .edit-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style> 