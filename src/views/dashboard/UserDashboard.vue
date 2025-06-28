<template>
  <div class="user-dashboard">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="250px" style="background-color: #304156;">
        <div class="sidebar-header">
          <h3>用户系统</h3>
        </div>
        <UserSidebar 
          :current-view="currentView" 
          @menu-select="handleMenuSelect"
        />
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between;">
          <div class="header-left">
            <h2>{{ getPageTitle() }}</h2>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                {{ userStore.userInfo?.username || '用户' }}
                <el-icon><ArrowDown /></el-icon>
              </span>
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
          <UserOverview 
            v-if="currentView === 'dashboard'"
            @navigate="handleMenuSelect"
          />
          
          <!-- 行业动态 -->
          <NewsView 
            v-else-if="currentView === 'news'"
          />
          
          <!-- 会议列表 -->
          <MeetingManagement 
            v-else-if="currentView === 'meetings/list'"
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
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 导入组件
import UserSidebar from '@/components/layout/UserSidebar.vue'
import UserOverview from '@/components/dashboard/UserOverview.vue'
import NewsView from '@/components/dashboard/NewsView.vue'
import MeetingManagement from '@/components/dashboard/MeetingManagement.vue'
import UserProfile from '@/components/dashboard/UserProfile.vue'
import TestPage from '@/components/dashboard/TestPage.vue'
import CourseList from '@/components/course/CourseList.vue'
import CourseDetail from '@/components/course/CourseDetail.vue'
import CourseEdit from '@/components/course/CourseEdit.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const currentView = ref('dashboard')
const selectedCourseId = ref(null)

// 获取页面标题
const getPageTitle = () => {
  switch (currentView.value) {
    case 'dashboard': return '仪表板'
    case 'news': return '行业动态'
    case 'meetings/list': return '会议列表'
    case 'profile': return '个人资料'
    case 'test': return '系统测试'
    case 'courses': return '课程管理'
    case 'courseDetail': return '课程详情'
    case 'courseEdit': return '编辑课程'
    default: return '用户系统'
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
  selectedCourseId.value = null
  currentView.value = 'courseEdit'
}

// 初始化
onMounted(() => {
  console.log('=== 用户仪表板初始化 ===')
  console.log('用户信息:', userStore.userInfo)
  console.log('用户类型:', userStore.userInfo?.userType)
  console.log('公司角色:', userStore.userInfo?.companyRole)
  console.log('是否已登录:', userStore.isLoggedIn)
  
  // 检查用户权限 - 只允许普通用户(userType=1, companyRole=1)访问
  if (userStore.userInfo?.userType !== 1 || userStore.userInfo?.companyRole !== 1) {
    console.log('权限检查失败 - 用户类型:', userStore.userInfo?.userType, '公司角色:', userStore.userInfo?.companyRole)
    console.log('期望: userType=1, companyRole=1 (普通用户)')
    ElMessage.error('权限不足，需要普通用户权限')
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
    // 这里可以调用API获取统计数据
    // UserOverview组件现在自己处理企业名称显示
    console.log('统计数据加载完成')
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}
</script>

<style scoped>
.user-dashboard {
  height: 100vh;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
  color: white;
  border-bottom: 1px solid #3a4a5a;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-dropdown .el-icon {
  margin-left: 8px;
  font-size: 12px;
}
</style> 