<template>
  <div class="admin-overview">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回来，{{ userStore.userInfo?.username || '管理员' }}</h1>
          <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="welcome-icon">
          <div class="icon-container">
            <el-icon><Medal /></el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <h2 class="section-title">平台概览</h2>
    <div class="stats-grid">
        <div class="stat-card total" @click="$emit('navigate', 'companies')">
        <div class="stat-content">
            <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalCompanies }}</div>
            <div class="stat-label">总企业数</div>
              <div class="stat-trend">
                <el-icon><TrendCharts /></el-icon>
                <span>较上月 +12%</span>
              </div>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
      
        <div class="stat-card pending" @click="$emit('navigate', 'companies')">
        <div class="stat-content">
            <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.pendingCompanies }}</div>
            <div class="stat-label">待审核</div>
              <div class="stat-trend urgent">
                <el-icon><Warning /></el-icon>
                <span>需要处理</span>
              </div>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
      
        <div class="stat-card suspended" @click="$emit('navigate', 'companies')">
        <div class="stat-content">
            <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.suspendedCompanies }}</div>
            <div class="stat-label">已禁用</div>
              <div class="stat-trend">
                <el-icon><TrendCharts /></el-icon>
                <span>较上月 -5%</span>
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
        <div class="action-card" @click="$emit('navigate', 'companies')">
          <div class="action-icon">
          <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="action-content">
            <h3>企业管理</h3>
            <p>审核企业申请，管理企业状态</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div class="action-card" @click="$emit('navigate', 'users')">
          <div class="action-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="action-content">
            <h3>用户管理</h3>
            <p>管理系统用户和权限设置</p>
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
            <h3>新闻管理</h3>
            <p>发布和管理平台新闻公告</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        
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
      </div>
    </div>
    
    <!-- 系统状态 -->
    <div class="status-section">
      <h2 class="section-title">系统状态</h2>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-header">
            <el-icon class="status-icon online"><CircleCheck /></el-icon>
            <span class="status-text">系统运行正常</span>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span>CPU使用率</span>
              <span class="status-value">23%</span>
            </div>
            <div class="status-item">
              <span>内存使用率</span>
              <span class="status-value">45%</span>
            </div>
            <div class="status-item">
              <span>在线用户</span>
              <span class="status-value">1,234</span>
            </div>
          </div>
        </div>
        
        <div class="status-card">
          <div class="status-header">
            <el-icon class="status-icon warning"><Warning /></el-icon>
            <span class="status-text">待处理事项</span>
          </div>
          <div class="status-details">
            <div class="status-item">
              <span>待审核企业</span>
              <span class="status-value">{{ stats.pendingCompanies }}</span>
            </div>
            <div class="status-item">
              <span>待处理反馈</span>
              <span class="status-value">8</span>
            </div>
            <div class="status-item">
              <span>系统通知</span>
              <span class="status-value">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  OfficeBuilding, Clock, Warning, Medal, TrendCharts, 
  ArrowRight, UserFilled, Document, User, CircleCheck 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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

defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalCompanies: 0,
      pendingCompanies: 0,
      suspendedCompanies: 0
    })
  }
})

defineEmits(['navigate'])
</script>

<style scoped>
.admin-overview {
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

.stat-card.total {
  border-left: 4px solid #667eea;
}

.stat-card.pending {
  border-left: 4px solid #f59e0b;
}

.stat-card.suspended {
  border-left: 4px solid #ef4444;
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

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.stat-card.suspended .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

.stat-trend.urgent {
  color: #f59e0b;
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

/* 系统状态 */
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

.status-icon.warning {
  color: #f59e0b;
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
  .admin-overview {
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