<template>
  <div class="user-sidebar-container">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="logo-text">
            <h3>用户中心</h3>
            <p>User Center</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="user-sidebar"
      background-color="transparent"
      text-color="#94a3b8"
      active-text-color="#667eea"
      @select="handleSelect"
    >
      <el-menu-item index="dashboard" class="menu-item">
        <div class="menu-icon">
          <el-icon><DataBoard /></el-icon>
        </div>
        <span class="menu-text">仪表板</span>
        <div class="menu-indicator"></div>
      </el-menu-item>
      
      <el-menu-item index="news" class="menu-item">
        <div class="menu-icon">
          <el-icon><Document /></el-icon>
        </div>
        <span class="menu-text">新闻资讯</span>
        <div class="menu-indicator"></div>
      </el-menu-item>

      <el-sub-menu index="meetings-group" class="submenu">
        <template #title>
          <div class="menu-icon">
            <el-icon><Suitcase /></el-icon>
          </div>
          <span class="menu-text">会议管理</span>
        </template>
        <el-menu-item index="meetings/list" class="submenu-item">会议列表</el-menu-item>
        <el-menu-item v-if="canManageMeetings" index="meetings/approval" class="submenu-item">
          会议审核
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="courses" class="menu-item">
        <div class="menu-icon">
          <el-icon><Tools /></el-icon>
        </div>
        <span class="menu-text">课程学习</span>
        <div class="menu-indicator"></div>
      </el-menu-item>
      
      <el-menu-item index="profile" class="menu-item">
        <div class="menu-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <span class="menu-text">个人资料</span>
        <div class="menu-indicator"></div>
      </el-menu-item>
      
      <el-menu-item index="test" class="menu-item">
        <div class="menu-icon">
          <el-icon><Tools /></el-icon>
        </div>
        <span class="menu-text">系统测试</span>
        <div class="menu-indicator"></div>
      </el-menu-item>
    </el-menu>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <div class="footer-content">
        <div class="system-status">
          <div class="status-indicator online"></div>
          <span>系统正常</span>
        </div>
        <div class="version-info">
          v1.0.0
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  DataBoard, Document, Suitcase, Tools, 
  UserFilled, User 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 获取 userStore 实例
const userStore = useUserStore()

// 定义props
const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

// 定义emits
const emit = defineEmits(['menu-select'])

const activeMenu = computed(() => props.currentView)

// 菜单选择处理
const handleSelect = (index) => {
  emit('menu-select', index)
}

// 计算用户角色
const userRole = computed(() => {
  const userInfo = userStore.userInfo
  if (!userInfo) return '未知'
  
  if (userInfo.userType === 2) {
    return '平台超级管理员'
  } else if (userInfo.companyRole === 2) {
    return '企业管理员'
  } else {
    return '普通员工'
  }
})

// 添加权限判断的计算属性
const canManageMeetings = computed(() => {
  const userInfo = userStore.userInfo;
  // 平台管理员(userType=2) 或 企业管理员(companyRole=2) 才有审核权限
  return userInfo?.userType === 2 || userInfo?.companyRole === 2;
})
</script>

<style scoped>
.user-sidebar-container {
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.user-sidebar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.05"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.logo-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.logo-text p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

/* 用户信息 */
.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

/* 导航菜单 */
.user-sidebar {
  flex: 1;
  border: none;
  padding: 16px 0;
  position: relative;
  z-index: 1;
}

.menu-item {
  margin: 4px 12px;
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 12px !important;
  border: none !important;
  background: transparent !important;
  position: relative;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(4px);
}

.menu-item.is-active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.menu-item.is-active .menu-text {
  color: white !important;
}

.menu-item.is-active .menu-icon {
  color: white !important;
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  font-size: 16px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.menu-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #f59e0b;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.menu-item.is-active .menu-indicator {
  opacity: 1;
}

/* 子菜单 */
.submenu {
  margin: 4px 12px;
}

.submenu :deep(.el-sub-menu__title) {
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 12px !important;
  border: none !important;
  background: transparent !important;
  color: #94a3b8 !important;
  transition: all 0.3s ease;
}

.submenu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.submenu :deep(.el-sub-menu__title .menu-icon) {
  color: #94a3b8;
  transition: all 0.3s ease;
}

.submenu :deep(.el-sub-menu__title:hover .menu-icon) {
  color: white;
}

.submenu-item {
  margin: 2px 12px 2px 32px !important;
  height: 40px !important;
  line-height: 40px !important;
  border-radius: 8px !important;
  border: none !important;
  background: transparent !important;
  color: #94a3b8 !important;
  font-size: 13px !important;
  transition: all 0.3s ease;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.submenu-item.is-active {
  background: rgba(245, 158, 11, 0.2) !important;
  color: #f59e0b !important;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.version-info {
  font-size: 12px;
  color: #64748b;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-sidebar-container {
    width: 100%;
    height: auto;
  }
  
  .sidebar-header {
    padding: 16px;
  }
  
  .user-info {
    padding: 16px;
  }
  
  .menu-item {
    margin: 2px 8px;
  }
  
  .submenu {
    margin: 2px 8px;
  }
  
  .submenu-item {
    margin: 1px 8px 1px 24px !important;
  }
}
</style>