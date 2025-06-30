<template>
  <div class="company-dashboard">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="250px" style="background-color: #304156;">
        
        <CompanySidebar 
          :current-view="currentView" 
          @menu-select="handleMenuSelect"
        />
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <el-header class="dashboard-header">
          <div class="header-left">
            <h2>{{ getPageTitle() }}</h2>
          </div>
          <div class="header-right">
            <!-- 用户信息下拉菜单 -->
            <el-dropdown @command="handleCommand" class="user-dropdown-container">
              <div class="user-info">
                <div class="user-avatar">
                  <el-avatar :size="40" :src="userStore.userInfo?.avatar">
                    {{ userStore.userInfo?.username?.charAt(0)?.toUpperCase() || 'A' }}
                  </el-avatar>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ userStore.userInfo?.username || '管理员' }}</div>
                  <div class="user-role">{{ getUserRole() }}</div>
                </div>
                <div class="dropdown-arrow">
                <el-icon><ArrowDown /></el-icon>
                </div>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main style="background-color: #f0f2f5; padding: 0;">
          <!-- 仪表板概览 -->
          <CompanyOverview 
            v-if="currentView === 'dashboard'"
            @navigate="handleMenuSelect"
          />
          
          <!-- 员工管理 -->
          <MemberManagement 
            v-else-if="currentView === 'members'"
            ref="memberManagementRef"
          />
          
          <!-- 新闻管理 -->
          <NewsManagement 
            v-else-if="currentView === 'news'"
            ref="newsManagementRef"
          />
          
          <!-- 会议管理 -->
          <MeetingManagement 
            v-else-if="currentView === 'meetings/list'"
            ref="meetingManagementRef"
          />
          
          <!-- 会议审核 -->
          <MeetingApproval 
            v-else-if="currentView === 'meetings/approval'"
            ref="meetingApprovalRef"
          />
          
          <!-- 课程管理 -->
          <CourseList
              v-else-if="currentView === 'courses'"
              @show-detail="showCourseDetail"
              @show-edit="showCourseEdit"
              @show-create="showCourseCreate"
          />
          <CourseDetail
              v-else-if="currentView === 'courseDetail'"
              :courseId="selectedCourseId"
              @back="currentView = 'courses'"
              @edit-course="showCourseEdit"
          />
          <CourseEdit
              v-else-if="currentView === 'courseEdit'"
              :courseId="selectedCourseId"
              @back="currentView = 'courses'"
          />
          
          <!-- 个人资料 -->
          <UserProfile 
            v-else-if="currentView === 'profile'"
          />
          
          <!-- 测试页面 -->
          <TestPage 
            v-else-if="currentView === 'test'"
          />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 导入组件
import CompanySidebar from '@/components/layout/CompanySidebar.vue'
import CompanyOverview from '@/components/dashboard/CompanyOverview.vue'
import UserProfile from '@/components/dashboard/UserProfile.vue'
import TestPage from '@/components/dashboard/TestPage.vue'
import MeetingManagement from '@/components/dashboard/MeetingManagement.vue'
import MeetingApproval from '@/components/dashboard/MeetingApproval.vue'
import CourseList from '@/components/course/CourseList.vue'
import CourseDetail from '@/components/course/CourseDetail.vue'
import CourseEdit from '@/components/course/CourseEdit.vue'
import NewsManagement from '@/components/dashboard/NewsManagement.vue'
import MemberManagement from '@/components/dashboard/MemberManagement.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const currentView = ref('dashboard')
const meetingManagementRef = ref()
const meetingApprovalRef = ref()
const selectedCourseId = ref(null)
const newsManagementRef = ref()
const memberManagementRef = ref()

// 获取页面标题
const getPageTitle = () => {
  switch (currentView.value) {
    case 'dashboard': return '仪表板'
    case 'members': return '员工管理'
    case 'profile': return '个人资料'
    case 'test': return '系统测试'
    case 'meetings/list': return '会议管理'
    case 'meetings/approval': return '会议审核'
    case 'courses': return '课程管理'
    case 'courseDetail': return '课程详情'
    case 'courseEdit': return '编辑课程'
    case 'news': return '新闻管理'
    default: return '企业管理系统'
  }
}

// 菜单选择处理
const handleMenuSelect = (view) => {
  currentView.value = view
}

// 用户下拉菜单处理
const handleCommand = async (command) => {
  if (command === 'profile') {
    currentView.value = 'profile'
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确定要退出登录吗？',
        '确认退出',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    } catch (error) {
      // 用户取消退出
    }
  }
}

// 初始化
onMounted(() => {
  console.log('=== 企业管理员仪表板初始化 ===')
  console.log('用户信息:', userStore.userInfo)
  console.log('用户类型:', userStore.userInfo?.userType)
  console.log('公司角色:', userStore.userInfo?.companyRole)
  console.log('是否已登录:', userStore.isLoggedIn)
  
  // 检查用户权限 - 只允许企业管理员(userType=1, companyRole=2)访问
  if (userStore.userInfo?.userType !== 1 || userStore.userInfo?.companyRole !== 2) {
    console.log('权限检查失败 - 用户类型:', userStore.userInfo?.userType, '公司角色:', userStore.userInfo?.companyRole)
    console.log('期望: userType=1, companyRole=2 (企业管理员)')
    ElMessage.error('权限不足，需要企业管理员权限')
    router.push('/login')
    return
  }
  
  console.log('权限检查通过，开始加载统计数据')
  // 加载统计数据
  loadStats()
})

// 加载统计数据
const loadStats = async () => {
  try {
    // CompanyOverview组件现在自己处理员工统计数据
    console.log('统计数据加载完成')
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 课程管理相关处理
const showCourseDetail = (id) => {
  selectedCourseId.value = id
  currentView.value = 'courseDetail'
}

const showCourseEdit = (id) => {
  selectedCourseId.value = id
  currentView.value = 'courseEdit'
}

const showCourseCreate = () => {
  currentView.value = 'courseEdit'
}

// 获取用户角色
const getUserRole = () => {
  const userInfo = userStore.userInfo
  if (!userInfo) return '未知角色'
  
  if (userInfo.userType === 2) {
    return '平台超级管理员'
  } else if (userInfo.userType === 1) {
    if (userInfo.companyRole === 2) {
      return '企业管理员'
    } else if (userInfo.companyRole === 1) {
      return '普通员工'
    }
  }
  return '未知角色'
}
</script>

<style scoped>
.company-dashboard {
  height: 100vh;
  background: #f0f2f5;
}

/* 头部样式 */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-left {
  position: relative;
  z-index: 1;
}

.header-left h2 {
  margin: 0;
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

/* 用户信息区域 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-info:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.user-info:hover .dropdown-arrow {
  color: white;
  transform: translateY(1px);
}

/* 用户下拉菜单容器 */
.user-dropdown-container {
  margin-left: 0;
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar :deep(.el-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: white;
}

.user-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-right {
    gap: 12px;
  }
  
  .user-info {
    padding: 6px 12px;
  }
  
  .user-avatar :deep(.el-avatar) {
    width: 32px;
    height: 32px;
  }
  
  .user-name {
  font-size: 12px;
}

  .user-role {
    font-size: 10px;
  }
}
</style> 