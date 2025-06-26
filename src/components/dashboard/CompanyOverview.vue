<template>
  <div class="company-overview">
    <h2>企业管理员仪表板</h2>
    <p>欢迎回来，{{ userStore.userInfo?.username || '管理员' }}</p>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalEmployees }}</div>
            <div class="stat-label">总员工数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ activeEmployees }}</div>
            <div class="stat-label">在职员工</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon company">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              <span v-if="companyLoading">加载中...</span>
              <span v-else>{{ companyName }}</span>
            </div>
            <div class="stat-label">企业名称</div>
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
        <el-button type="primary" @click="$emit('navigate', 'members')">
          <el-icon><UserFilled /></el-icon>
          成员管理
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
import { ref, onMounted } from 'vue'
import { UserFilled, User, OfficeBuilding, Tools } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { loadCompaniesMapping, getCompanyName } from '@/utils/companyMapping'
import { getCompanyMembers } from '@/api/auth'

const userStore = useUserStore()

// 响应式数据
const companyName = ref('加载中...')
const companyLoading = ref(false)
const totalEmployees = ref(0)
const activeEmployees = ref(0)

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

// 加载员工统计数据
const loadEmployeeStats = async () => {
  const userInfo = userStore.userInfo
  
  if (!userInfo || !userInfo.companyId) {
    return
  }
  
  try {
    // 获取企业成员列表
    const response = await getCompanyMembers(userInfo.companyId, {
      page: 1,
      size: 1000 // 获取所有成员
    })
    
    if (response.code === 200) {
      const members = response.data.records || []
      
      // 计算总员工数（排除当前管理员自己）
      totalEmployees.value = members.filter(member => member.id !== userInfo.id).length
      
      // 计算在职员工数（状态为1的成员，排除当前管理员自己）
      activeEmployees.value = members.filter(member => 
        member.id !== userInfo.id && member.status === 1
      ).length
    }
  } catch (error) {
    console.error('获取员工统计数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadCompanyName()
  await loadEmployeeStats()
})

defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalEmployees: 0,
      activeEmployees: 0
    })
  }
})

defineEmits(['navigate'])
</script>

<style scoped>
.company-overview {
  padding: 20px;
}

.company-overview h2 {
  margin-bottom: 10px;
  color: #303133;
}

.company-overview p {
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

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.company {
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