<template>
  <div class="admin-overview">
    <h2>平台管理员仪表板</h2>
    <p>欢迎回来，{{ userStore.userInfo?.username || '管理员' }}</p>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalCompanies }}</div>
            <div class="stat-label">总企业数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.pendingCompanies }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon suspended">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.suspendedCompanies }}</div>
            <div class="stat-label">已禁用</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 快速操作 -->
    <el-card class="quick-actions">
      <template #header>
        <span>快速操作</span>
      </template>
      <div class="action-buttons">
        <el-button type="primary" @click="$emit('navigate', 'companies')">
          <el-icon><OfficeBuilding /></el-icon>
          管理企业
        </el-button>
        <el-button type="success" @click="$emit('navigate', 'profile')">
          <el-icon><User /></el-icon>
          个人资料
        </el-button>
        <el-button type="info" @click="$emit('navigate', 'test')">
          <el-icon><Tools /></el-icon>
          系统测试
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { OfficeBuilding, Clock, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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
  padding: 20px;
}

.admin-overview h2 {
  margin-bottom: 10px;
  color: #303133;
}

.admin-overview p {
  margin-bottom: 30px;
  color: #606266;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.suspended {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 