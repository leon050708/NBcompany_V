<template>
  <div class="profile-container">
    <el-container class="full-container">
      <el-header class="header">
        <div class="header-left">
          <el-button @click="goBack" text>
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
                  <el-button 
                    v-if="!isEditing" 
                    type="primary" 
                    size="small"
                    @click="startEdit"
                  >
                    修改信息
                  </el-button>
                  <div v-else style="display: flex; gap: 10px;">
                    <el-button 
                      type="success" 
                      size="small"
                      :loading="profileLoading"
                      @click="handleUpdateProfile"
                    >
                      保存
                    </el-button>
                    <el-button 
                      type="info" 
                      size="small"
                      @click="cancelEdit"
                    >
                      取消
                    </el-button>
                  </div>
                </div>
              </template>
              
              <!-- 显示模式 -->
              <div v-if="!isEditing" class="info-display">
                <div class="info-section">
                  <h3 class="section-title">基本信息</h3>
                  <div class="info-grid">
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><User /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">用户名</div>
                        <div class="info-value">{{ userInfo.username }}</div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><Avatar /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">昵称</div>
                        <div class="info-value">{{ userInfo.nickname || '未设置' }}</div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><Phone /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">手机号码</div>
                        <div class="info-value">{{ userInfo.phoneNumber || '未设置' }}</div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><Message /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">邮箱</div>
                        <div class="info-value">{{ userInfo.email || '未设置' }}</div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><UserFilled /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">性别</div>
                        <div class="info-value">{{ userInfo.gender === 1 ? '女' : '男' }}</div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><OfficeBuilding /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">所属企业</div>
                        <div class="info-value">
                          <span>{{ companyName || '加载中...' }}</span>
                          <el-button 
                            type="primary" 
                            size="small" 
                            @click="getCompanyName"
                            :loading="companyLoading"
                            style="margin-left: 10px;"
                          >
                            刷新
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 编辑模式 -->
              <el-form
                v-else
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
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="profile-card">
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
                  <div v-else style="display: flex; gap: 10px;">
                    <el-button 
                      type="success" 
                      size="small"
                      :loading="passwordLoading"
                      @click="handleUpdatePassword"
                    >
                      确认修改
                    </el-button>
                    <el-button 
                      type="info" 
                      size="small"
                      @click="cancelChangePassword"
                    >
                      取消
                    </el-button>
                  </div>
                </div>
              </template>
              
              <!-- 显示模式 -->
              <div v-if="!isChangingPassword" class="password-display">
                <div class="info-section">
                  <h3 class="section-title">密码信息</h3>
                  <div class="info-grid">
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><Lock /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">密码状态</div>
                        <div class="info-value">
                          <el-tag type="success">已设置</el-tag>
                        </div>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-icon">
                        <el-icon><Clock /></el-icon>
                      </div>
                      <div class="info-content">
                        <div class="info-label">最后修改</div>
                        <div class="info-value">{{ lastPasswordChange || '未知' }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="password-tip">
                    <el-icon><InfoFilled /></el-icon>
                    <span>为了账户安全，建议定期修改密码</span>
                  </div>
                </div>
              </div>
              
              <!-- 编辑模式 -->
              <el-form
                v-else
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
                
                <el-form-item label="确认密码" prop="confirmNewPassword">
                  <el-input
                    v-model="passwordForm.confirmNewPassword"
                    type="password"
                    show-password
                    placeholder="请再次输入新密码"
                  />
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, User, Avatar, Phone, Message, UserFilled, OfficeBuilding, Lock, Clock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserProfile, updateUserPassword, getCompanyList } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const profileFormRef = ref()
const passwordFormRef = ref()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const companyName = ref('')
const companyLoading = ref(false)
const isEditing = ref(false)
const isChangingPassword = ref(false)
const lastPasswordChange = ref('')

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

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  // 初始化表单数据
  profileForm.nickname = userInfo.value.nickname || ''
  profileForm.phoneNumber = userInfo.value.phoneNumber || ''
  profileForm.email = userInfo.value.email || ''
  profileForm.gender = userInfo.value.gender || 0
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 重置表单
  profileForm.nickname = ''
  profileForm.phoneNumber = ''
  profileForm.email = ''
  profileForm.gender = 0
}

const handleUpdateProfile = async () => {
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true
    
    await updateUserProfile(profileForm)
    ElMessage.success('个人信息修改成功')
    
    // 更新本地用户信息
    userStore.updateUserInfo(profileForm)
    
    // 退出编辑模式
    isEditing.value = false
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
    
    // 更新最后修改时间
    lastPasswordChange.value = new Date().toLocaleString()
    
    // 退出修改模式
    isChangingPassword.value = false
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

// 返回上一页
const goBack = () => {
  const userRole = getUserRole(userInfo.value)
  const targetRoute = getTargetRouteByRole(userRole)
  router.push(targetRoute)
}

// 获取用户角色
function getUserRole(userInfo) {
  if (userInfo.userType === 2) {
    return 'admin' // 平台超级管理员
  } else if (userInfo.companyRole === 2) {
    return 'company_admin' // 企业管理员
  } else {
    return 'user' // 普通企业用户
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

// 开始修改密码
const startChangePassword = () => {
  isChangingPassword.value = true
  // 初始化表单数据
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
}

// 取消修改密码
const cancelChangePassword = () => {
  isChangingPassword.value = false
  // 重置表单
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
}

onMounted(async () => {
  // 主动获取最新的用户信息
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  // 获取公司名称
  await getCompanyName()
  
  // 初始化密码修改时间
  lastPasswordChange.value = '2024-01-15 14:30:00'
})

watch(() => userInfo.value, (newValue) => {
  if (newValue.id) {
    // 如果正在编辑，更新表单数据
    if (isEditing.value) {
      profileForm.nickname = newValue.nickname || ''
      profileForm.phoneNumber = newValue.phoneNumber || ''
      profileForm.email = newValue.email || ''
      profileForm.gender = newValue.gender || 0
    }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #303133;
}

.info-display {
  padding: 20px 0;
}

.info-section {
  padding: 20px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.info-icon {
  margin-right: 15px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #409eff;
  font-size: 20px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #909399;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.password-display {
  padding: 20px 0;
}

.password-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  color: #606266;
  font-size: 14px;
}

.password-tip .el-icon {
  color: #409eff;
  font-size: 16px;
}
</style> 