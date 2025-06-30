<template>
  <div class="company-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">企业管理</h1>
          <p class="page-subtitle">管理平台所有企业信息</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="showAllCompanies" :disabled="loading" class="refresh-button">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">总企业数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeCompanies }}</div>
            <div class="stat-label">正常企业</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingCompanies }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ suspendedCompanies }}</div>
            <div class="stat-label">已禁用</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card class="content-card">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-header">
            <h3>搜索筛选</h3>
            <el-button type="text" @click="toggleSearchForm">
              {{ showSearchForm ? '收起' : '展开' }}
              <el-icon><ArrowDown v-if="!showSearchForm" /><ArrowUp v-else /></el-icon>
            </el-button>
          </div>
          
          <el-collapse-transition>
            <div v-show="showSearchForm" class="search-form-container">
              <div class="search-form">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索企业名称、管理员姓名或邮箱"
                  style="width: 300px;"
        clearable
        @keyup.enter="handleSearch"
                  class="search-input"
      >
        <template #append>
                    <el-button @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
                <div class="search-buttons">
                  <el-button @click="clearSearch" class="reset-btn">
                    <el-icon><Refresh /></el-icon>
                    清空搜索
                  </el-button>
                  <el-button @click="showAllCompanies" type="primary" class="search-btn">
                    <el-icon><Search /></el-icon>
                    显示全部
                  </el-button>
                </div>
              </div>
            </div>
          </el-collapse-transition>
    </div>
    
    <!-- 企业列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>企业列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
          
    <el-table
      :data="companyList"
      v-loading="loading"
            class="company-table"
      border
            stripe
    >
      <el-table-column prop="name" label="企业名称" min-width="150" />
      <el-table-column prop="adminName" label="管理员姓名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="phone" label="电话" min-width="120" />
      <el-table-column prop="createdAt" label="注册时间" min-width="150">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button 
            v-if="scope.row.status === 0" 
            type="success" 
            size="small" 
            @click="approveCompany(scope.row)"
            :loading="scope.row.updating"
                  class="action-btn"
          >
            审核通过
          </el-button>
          <el-button 
            v-if="scope.row.status === 1" 
            type="warning" 
            size="small" 
            @click="suspendCompany(scope.row)"
            :loading="scope.row.updating"
                  class="action-btn"
          >
            禁用
          </el-button>
          <el-button 
            v-if="scope.row.status === 2" 
            type="success" 
            size="small" 
            @click="activateCompany(scope.row)"
            :loading="scope.row.updating"
                  class="action-btn"
          >
            激活
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
          <div class="pagination-container" v-if="pagination.total > 0">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, OfficeBuilding, Check, Clock, Close, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { getAdminCompanyList, updateCompanyStatus } from '@/api/auth'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const showSearchForm = ref(true)
const companyList = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 计算统计数据
const activeCompanies = computed(() => {
  return companyList.value.filter(company => company.status === 1).length;
});

const pendingCompanies = computed(() => {
  return companyList.value.filter(company => company.status === 0).length;
});

const suspendedCompanies = computed(() => {
  return companyList.value.filter(company => company.status === 2).length;
});

// 状态定义
const STATUS = {
  PENDING: 0,    // 待审核
  ACTIVE: 1,     // 正常
  SUSPENDED: 2   // 禁用
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case STATUS.PENDING: return 'warning'
    case STATUS.ACTIVE: return 'success'
    case STATUS.SUSPENDED: return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case STATUS.PENDING: return '待审核'
    case STATUS.ACTIVE: return '正常'
    case STATUS.SUSPENDED: return '禁用'
    default: return '未知'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 加载企业列表
const loadCompanyList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      size: pagination.value.pageSize
    }
    
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    
    const response = await getAdminCompanyList(params)
    
    let data
    if (response.data && response.data.data) {
      data = response.data.data
    } else if (response.data) {
      data = response.data
    } else {
      throw new Error('响应数据格式错误')
    }
    
    companyList.value = data.records || data.list || data.companies || []
    pagination.value.total = data.total || data.totalCount || 0
    
    companyList.value.forEach(company => {
      company.updating = false
      if (company.companyName && !company.name) {
        company.name = company.companyName
      }
      if (company.contactPerson && !company.adminName) {
        company.adminName = company.contactPerson
      }
      if (company.contactEmail && !company.email) {
        company.email = company.contactEmail
      }
      if (company.contactPhone && !company.phone) {
        company.phone = company.contactPhone
      }
      if (company.status === undefined) {
        company.status = 1
      }
    })
  } catch (error) {
    console.error('加载企业列表失败:', error)
    ElMessage.error('加载企业列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索功能
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  pagination.value.currentPage = 1
  await loadCompanyList()
  ElMessage.success(`搜索完成，找到 ${companyList.value.length} 家企业`)
}

const clearSearch = async () => {
  searchKeyword.value = ''
  pagination.value.currentPage = 1
  await loadCompanyList()
}

const showAllCompanies = async () => {
  searchKeyword.value = ''
  pagination.value.currentPage = 1
  await loadCompanyList()
  ElMessage.success('已显示全部企业')
}

// 分页处理
const handleCurrentChange = async (page) => {
  pagination.value.currentPage = page
  await loadCompanyList()
}

const handleSizeChange = async (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await loadCompanyList()
}

// 审核通过操作
const approveCompany = async (company) => {
  try {
    await ElMessageBox.confirm(
      `确定要审核通过企业"${company.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    company.updating = true
    await updateCompanyStatus(company.id, STATUS.ACTIVE)
    company.status = STATUS.ACTIVE
    ElMessage.success('审核通过成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error('审核失败，请重试')
    }
  } finally {
    company.updating = false
  }
}

const suspendCompany = async (company) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用企业"${company.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    company.updating = true
    await updateCompanyStatus(company.id, STATUS.SUSPENDED)
    company.status = STATUS.SUSPENDED
    ElMessage.success('禁用成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用失败:', error)
      ElMessage.error('禁用失败，请重试')
    }
  } finally {
    company.updating = false
  }
}

const activateCompany = async (company) => {
  try {
    await ElMessageBox.confirm(
      `确定要激活企业"${company.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    company.updating = true
    await updateCompanyStatus(company.id, STATUS.ACTIVE)
    company.status = STATUS.ACTIVE
    ElMessage.success('激活成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('激活失败:', error)
      ElMessage.error('激活失败，请重试')
    }
  } finally {
    company.updating = false
  }
}

// 切换搜索表单显示
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 刷新数据
const handleRefresh = () => {
  loadCompanyList();
};

// 暴露方法给父组件
defineExpose({
  loadCompanyList
})

onMounted(() => {
  loadCompanyList()
})
</script>

<style scoped>
.company-management {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.header-right {
  flex-shrink: 0;
}

.refresh-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.stat-icon.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-bottom: 24px;
}

.content-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: none;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 24px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.search-form-container {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex-shrink: 0;
}

.search-buttons {
  display: flex;
  gap: 8px;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.reset-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* 表格区域 */
.table-section {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.company-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.company-table :deep(.el-table__header) {
  background: #f9fafb;
}

.company-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.company-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.company-table :deep(.el-table__row:hover) {
  background: #f8fafc;
}

.action-btn {
  margin-right: 8px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .company-management {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100% !important;
  }
  
  .search-buttons {
    justify-content: flex-end;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .table-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-right {
    align-self: stretch;
  }
  
  .refresh-button {
    width: 100%;
  }
}
</style> 