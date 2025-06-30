<template>
  <div class="user-overview">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回来，{{ userStore.userInfo?.username || '用户' }}</h1>
          <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="welcome-icon">
          <div class="icon-container">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <h2 class="section-title">个人信息</h2>
      <div class="stats-grid">
        <div class="stat-card user">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStore.userInfo?.username || '用户' }}</div>
              <div class="stat-label">用户名</div>
              <div class="stat-trend">
                <el-icon><CircleCheck /></el-icon>
                <span>在线状态</span>
              </div>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
        
        <div class="stat-card company">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                <span v-if="companyLoading">加载中...</span>
                <span v-else>{{ companyName }}</span>
              </div>
              <div class="stat-label">所属企业</div>
              <div class="stat-trend">
                <el-icon><CircleCheck /></el-icon>
                <span>已加入</span>
              </div>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
        
        <div class="stat-card role">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userRole }}</div>
              <div class="stat-label">用户角色</div>
              <div class="stat-trend">
                <el-icon><Lock /></el-icon>
                <span>权限正常</span>
              </div>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="actions-section">
      <h2 class="section-title">快速操作</h2>
      <div class="actions-grid">
        <div class="action-card" @click="$emit('navigate', 'profile')">
          <div class="action-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="action-content">
            <h3>个人资料</h3>
            <p>查看和编辑个人信息</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div class="action-card" @click="$emit('navigate', 'news')">
          <div class="action-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="action-content">
            <h3>新闻资讯</h3>
            <p>查看企业新闻和公告</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div class="action-card" @click="$emit('navigate', 'meetings')">
          <div class="action-icon">
            <el-icon><Suitcase /></el-icon>
          </div>
          <div class="action-content">
            <h3>会议管理</h3>
            <p>查看和参与企业会议</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div class="action-card" @click="$emit('navigate', 'courses')">
          <div class="action-icon">
            <el-icon><Tools /></el-icon>
          </div>
          <div class="action-content">
            <h3>课程学习</h3>
            <p>参与企业培训课程</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div class="action-card" @click="$emit('navigate', 'test')">
          <div class="action-icon">
            <el-icon><Tools /></el-icon>
          </div>
          <div class="action-content">
            <h3>系统测试</h3>
            <p>测试系统功能和性能</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 用户状态 -->
    <div class="status-section">
      <h2 class="section-title">账户状态</h2>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-header">
            <el-icon class="status-icon online"><CircleCheck /></el-icon>
            <span class="status-text">账户状态正常</span>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span>账户状态</span>
              <span class="status-value">正常</span>
            </div>
            <div class="status-item">
              <span>登录时间</span>
              <span class="status-value">{{ loginTime }}</span>
            </div>
            <div class="status-item">
              <span>在线时长</span>
              <span class="status-value">{{ onlineDuration }}</span>
            </div>
          </div>
        </div>
        
        <div class="status-card">
          <div class="status-header">
            <el-icon class="status-icon info"><InfoFilled /></el-icon>
            <span class="status-text">今日活动</span>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span>查看新闻</span>
              <span class="status-value">3</span>
            </div>
            <div class="status-item">
              <span>参与会议</span>
              <span class="status-value">1</span>
            </div>
            <div class="status-item">
              <span>学习课程</span>
              <span class="status-value">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  User, OfficeBuilding, UserFilled, CircleCheck, Lock,
  ArrowRight, Document, Suitcase, Tools, InfoFilled 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { loadCompaniesMapping, getCompanyName } from '@/utils/companyMapping'

const userStore = useUserStore()

// 响应式数据
const companyName = ref('加载中...')
const companyLoading = ref(false)
const loginTime = ref('')
const onlineDuration = ref('')

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

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

// 初始化登录时间和在线时长
const initUserStatus = () => {
  const now = new Date()
  loginTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // 模拟在线时长（实际项目中应该从登录时间计算）
  onlineDuration.value = '2小时30分钟'
}

// 加载企业名称
const loadCompanyName = async () => {
  const userInfo = userStore.userInfo
  
  if (!userInfo || !userInfo.companyId) {
    companyName.value = '未分配企业'
    return
  }
  
  try {
    companyLoading.value = true
    
    // 确保企业映射已加载
    await loadCompaniesMapping()
    
    // 使用通用映射工具获取企业名称
    companyName.value = getCompanyName(userInfo.companyId)
    
    if (companyName.value === '未设置') {
      companyName.value = '企业信息获取失败'
    }
  } catch (error) {
    console.error('获取企业信息失败:', error)
    companyName.value = '企业信息获取失败'
  } finally {
    companyLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCompanyName()
  initUserStatus()
})

defineEmits(['navigate'])
</script>

<style scoped>
.user-overview {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.welcome-icon {
  margin-left: 24px;
}

.icon-container {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.icon-container .el-icon {
  font-size: 40px;
  color: white;
}

/* 通用样式 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-card.user {
  border-left: 4px solid #667eea;
}

.stat-card.company {
  border-left: 4px solid #10b981;
}

.stat-card.role {
  border-left: 4px solid #f59e0b;
}

.stat-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-card.user .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.company .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.role .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #10b981;
}

.stat-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
  border-radius: 0 16px 0 100px;
}

/* 快速操作 */
.actions-section {
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.action-arrow {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* 用户状态 */
.status-section {
  margin-bottom: 32px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 20px;
}

.status-icon.online {
  color: #10b981;
}

.status-icon.info {
  color: #3b82f6;
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item span:first-child {
  color: #6b7280;
  font-size: 14px;
}

.status-value {
  font-weight: 600;
  color: #1f2937;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-overview {
    padding: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-icon {
    margin-left: 0;
    margin-top: 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .stats-grid,
  .actions-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-arrow {
    display: none;
  }
}
</style> 