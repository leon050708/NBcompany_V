<template>
  <div class="dashboard-container">
    <el-container class="full-container">
      <el-header class="header">
        <div class="header-left">
          <h2>企业管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar">
                {{ userInfo.nickname?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="debug">调试信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-container class="main-container">
        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item v-if="userStore.hasPermission('company_admin')" index="members">
              <el-icon><UserFilled /></el-icon>
              <span>成员管理</span>
            </el-menu-item>
            <el-menu-item index="test">
              <el-icon><Tools /></el-icon>
              <span>Token测试</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main class="main-content">
          <div class="welcome-section">
            <h1>欢迎回来，{{ userInfo.nickname || userInfo.username }}！</h1>
            <p>您当前的身份是：{{ getUserTypeText() }}</p>
          </div>
          
          <el-row :gutter="20" class="info-cards">
            <el-col :span="8">
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <span>用户信息</span>
                  </div>
                </template>
                <div class="card-content">
                  <p><strong>用户名：</strong>{{ userInfo.username }}</p>
                  <p><strong>昵称：</strong>{{ userInfo.nickname }}</p>
                  <p><strong>手机：</strong>{{ userInfo.phoneNumber || '未设置' }}</p>
                  <p><strong>邮箱：</strong>{{ userInfo.email || '未设置' }}</p>
                  <p><strong>状态：</strong>
                    <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
                      {{ userInfo.status === 1 ? '正常' : '禁用' }}
                    </el-tag>
                  </p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <span>企业信息</span>
                  </div>
                </template>
                <div class="card-content">
                  <p><strong>企业名称：</strong>{{ userInfo.companyName || '未分配企业' }}</p>
                  <p><strong>企业角色：</strong>{{ getCompanyRoleText() }}</p>
                  <p><strong>用户类型：</strong>{{ getUserTypeText() }}</p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <span>系统信息</span>
                  </div>
                </template>
                <div class="card-content">
                  <p><strong>注册时间：</strong>{{ formatDate(userInfo.createdAt) }}</p>
                  <p><strong>最后登录：</strong>{{ formatDate(userInfo.lastLoginTime) || '首次登录' }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, House, User, UserFilled, Tools } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('dashboard')
const userInfo = computed(() => userStore.userInfo)

const getUserTypeText = () => {
  switch (userInfo.value.userType) {
    case 1:
      return '企业用户'
    case 2:
      return '平台超级管理员'
    default:
      return '未知'
  }
}

const getCompanyRoleText = () => {
  switch (userInfo.value.companyRole) {
    case 1:
      return '普通员工'
    case 2:
      return '企业管理员'
    default:
      return '未分配'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  switch (index) {
    case 'profile':
      router.push('/profile')
      break
    case 'members':
      // 跳转到成员管理页面
      break
    case 'test':
      router.push('/test')
      break
  }
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'debug':
      userStore.debugInfo()
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}

onMounted(async () => {
  // 如果用户信息不完整，重新获取
  if (!userInfo.value.id) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style scoped>
.dashboard-container {
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

.main-container {
  height: calc(100vh - 60px);
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

.header-left h2 {
  margin: 0;
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  height: 100%;
  margin: 0;
  padding: 0;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  margin: 0;
}

.welcome-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  margin: 0 0 10px 0;
  color: #303133;
}

.welcome-section p {
  margin: 0;
  color: #606266;
}

.info-cards {
  margin-top: 20px;
}

.info-card {
  height: 100%;
}

.card-header {
  font-weight: bold;
  color: #303133;
}

.card-content p {
  margin: 8px 0;
  color: #606266;
}

.card-content strong {
  color: #303133;
}
</style> 