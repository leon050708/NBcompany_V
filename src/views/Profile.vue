<template>
  <div class="profile-container">
    <el-container class="full-container">
      <el-header class="header">
        <div class="header-left">
          <el-button @click="$router.push('/dashboard')" text>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2>个人资料</h2>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="100px"
              >
                <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" disabled />
                </el-form-item>
                
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="profileForm.nickname" />
                </el-form-item>
                
                <el-form-item label="手机号码" prop="phoneNumber">
                  <el-input v-model="profileForm.phoneNumber" />
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="profileForm.gender">
                    <el-radio :label="0">男</el-radio>
                    <el-radio :label="1">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="所属企业">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <el-input v-model="companyName" disabled style="flex: 1;" />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="getCompanyName"
                      :loading="companyLoading"
                    >
                      刷新
                    </el-button>
                  </div>
                </el-form-item>
                
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="profileLoading"
                    @click="handleUpdateProfile"
                  >
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <span>修改密码</span>
                </div>
              </template>
              
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
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
                
                <el-form-item label="确认密码" prop="confirmNewPassword">
                  <el-input
                    v-model="passwordForm.confirmNewPassword"
                    type="password"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="passwordLoading"
                    @click="handleUpdatePassword"
                  >
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserProfile, updateUserPassword, getCompanyList } from '@/api/auth'

const userStore = useUserStore()

const profileFormRef = ref()
const passwordFormRef = ref()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const companyName = ref('')
const companyLoading = ref(false)

const userInfo = computed(() => userStore.userInfo)

const profileForm = reactive({
  nickname: '',
  phoneNumber: '',
  email: '',
  gender: 0
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' }
  ],
  confirmNewPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true
    
    await updateUserProfile(profileForm)
    ElMessage.success('个人信息修改成功')
    
    // 更新本地用户信息
    userStore.updateUserInfo(profileForm)
  } catch (error) {
    console.error('修改个人信息失败:', error)
    ElMessage.error(error.message || '修改个人信息失败')
  } finally {
    profileLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await updateUserPassword(passwordForm)
    ElMessage.success('密码修改成功')
    
    // 清空密码表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmNewPassword = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 获取公司名称
const getCompanyName = async () => {
  if (!userInfo.value.companyId) {
    companyName.value = '未分配企业'
    return
  }
  
  try {
    companyLoading.value = true
    const response = await getCompanyList({ id: userInfo.value.companyId })
    if (response.data.records && response.data.records.length > 0) {
      companyName.value = response.data.records[0].companyName
    } else {
      companyName.value = '企业信息获取失败'
    }
  } catch (error) {
    console.error('获取公司信息失败:', error)
    companyName.value = '企业信息获取失败'
  } finally {
    companyLoading.value = false
  }
}

onMounted(async () => {
  console.log('=== 个人资料页面加载 ===')
  console.log('初始用户信息:', userInfo.value)
  
  // 如果用户信息不完整，重新获取
  if (!userInfo.value.id) {
    console.log('用户信息不完整，重新获取...')
    try {
      await userStore.getUserInfo()
      console.log('重新获取后的用户信息:', userInfo.value)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 初始化表单数据
  profileForm.nickname = userInfo.value.nickname || ''
  profileForm.phoneNumber = userInfo.value.phoneNumber || ''
  profileForm.email = userInfo.value.email || ''
  profileForm.gender = userInfo.value.gender || 0
  
  // 获取公司名称
  await getCompanyName()
  
  // 调试信息
  console.log('=== 个人资料页面用户信息 ===')
  console.log('用户信息:', userInfo.value)
  console.log('表单数据:', profileForm)
  console.log('============================')
})

watch(() => userInfo.value, (newValue) => {
  if (newValue.id) {
    profileForm.nickname = newValue.nickname || ''
    profileForm.phoneNumber = newValue.phoneNumber || ''
    profileForm.email = newValue.email || ''
    profileForm.gender = newValue.gender || 0
  }
})
</script>

<style scoped>
.profile-container {
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

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  color: #303133;
}
</style> 