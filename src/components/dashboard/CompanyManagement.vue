<template>
  <div class="company-management">
    <h2>企业管理</h2>
    
    <!-- 搜索栏 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入企业名称关键词搜索"
        style="width: 300px; margin-right: 10px;"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      <el-button @click="clearSearch" type="info" size="small" style="margin-right: 10px;">清空搜索</el-button>
      <el-button @click="showAllCompanies" type="primary" size="small">显示全部</el-button>
    </div>
    
    <el-table 
      :data="companyList" 
      style="width: 100%"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column prop="name" label="企业名称" min-width="200" />
      <el-table-column prop="adminName" label="管理员" width="120" />
      <el-table-column prop="email" label="联系邮箱" width="180" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="createdAt" label="注册时间" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
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
          >
            审核通过
          </el-button>
          <el-button 
            v-if="scope.row.status === 1" 
            type="warning" 
            size="small" 
            @click="suspendCompany(scope.row)"
            :loading="scope.row.updating"
          >
            禁用
          </el-button>
          <el-button 
            v-if="scope.row.status === 2" 
            type="success" 
            size="small" 
            @click="activateCompany(scope.row)"
            :loading="scope.row.updating"
          >
            激活
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div style="margin-top: 20px; text-align: center;">
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getAdminCompanyList, updateCompanyStatus } from '@/api/auth'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const companyList = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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

// 状态更新操作
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
  padding: 20px;
}

.company-management h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style> 