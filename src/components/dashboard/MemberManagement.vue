<template>
  <div class="member-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">成员管理</h1>
          <p class="page-subtitle">管理企业成员和权限设置</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAddMember" :disabled="loading" class="add-button">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">总成员数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeMembers }}</div>
            <div class="stat-label">活跃成员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ inactiveMembers }}</div>
            <div class="stat-label">禁用成员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ adminMembers }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card class="content-card">
      <!-- 搜索表单 -->
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
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="企业角色">
          <el-select v-model="searchForm.companyRole" placeholder="请选择" clearable style="width: 150px">
            <el-option label="普通员工" :value="1" />
            <el-option label="企业管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="禁用" :value="0" />
            <el-option label="正常" :value="1" />
          </el-select>
        </el-form-item>
                <el-form-item class="search-buttons">
                  <el-button type="primary" @click="handleSearch" :loading="loading" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
                  <el-button @click="handleReset" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
            </div>
          </el-collapse-transition>
        </div>

      <!-- 成员表格 -->
        <div class="table-section">
          <div class="table-header">
            <h3>成员列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
          
      <el-table
        :data="memberList"
        v-loading="loading"
        style="width: 100%"
        border
            stripe
            class="member-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="companyRole" label="企业角色" width="200">
          <template #default="{ row }">
                <el-tag :type="row.companyRole === 1 ? 'warning' : 'success'" size="small">
              {{ row.companyRole === 1 ? '普通员工' : '企业管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)" class="action-btn">
              编辑
            </el-button>
            <el-button 
              v-if="row.companyRole === 1"
              type="success" 
              size="small" 
              @click="handlePromoteToAdmin(row)"
                  class="action-btn"
            >
              设为管理员
            </el-button>
            <el-button 
              v-if="row.companyRole === 2"
              type="warning" 
              size="small" 
              @click="handleDemoteToEmployee(row)"
                  class="action-btn"
            >
              取消管理员
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
                  class="action-btn"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
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

    <!-- 成员编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
      class="member-dialog"
    >
      <el-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username" v-if="!isEdit">
          <el-input v-model="memberForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="memberForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="memberForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="memberForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="memberForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="企业角色" prop="companyRole" v-if="!isEdit">
          <el-select v-model="memberForm.companyRole" placeholder="请选择企业角色" style="width: 100%">
            <el-option label="普通员工" :value="1" />
            <el-option label="企业管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="memberForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, User, UserFilled, Warning, Medal, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { 
  getCompanyMembers, 
  createCompanyMember, 
  updateCompanyMember, 
  updateMemberRole, 
  deleteCompanyMember,
  toggleMemberStatus
} from '@/api/auth'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const memberFormRef = ref()
const showSearchForm = ref(true)

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo?.id)

// 计算统计数据
const activeMembers = computed(() => {
  return memberList.value.filter(member => member.status === 1).length
})

const inactiveMembers = computed(() => {
  return memberList.value.filter(member => member.status === 0).length
})

const adminMembers = computed(() => {
  return memberList.value.filter(member => member.companyRole === 2).length
})

// 搜索表单
const searchForm = reactive({
  username: '',
  companyRole: '',
  status: '',
  page: 1,
  size: 10
})

// 成员表单
const memberForm = reactive({
  id: null,
  username: '',
  password: '',
  nickname: '',
  phoneNumber: '',
  email: '',
  gender: 1,
  companyRole: 1,
  status: 1
})

// 表单验证规则
const memberFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  companyRole: [
    { required: true, message: '请选择企业角色', trigger: 'change' }
  ]
}

// 成员列表
const memberList = ref([])

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 初始化
onMounted(() => {
  loadMemberList()
})

// 加载成员列表
const loadMemberList = async () => {
  loading.value = true
  try {
    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }

    const params = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    }
    
    const response = await getCompanyMembers(companyId, params)
    
    if (response.code === 200) {
      // 过滤掉当前用户，不显示自己
      const filteredRecords = response.data.records.filter(member => member.id !== currentUserId.value)
      
      memberList.value = filteredRecords
      pagination.total = response.data.total - 1 // 总数减1，因为过滤掉了自己
      pagination.current = response.data.current
    } else {
      ElMessage.error(response.message || '获取成员列表失败')
    }
  } catch (error) {
    ElMessage.error('获取成员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadMemberList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key !== 'page' && key !== 'size') {
      searchForm[key] = ''
    }
  })
  pagination.current = 1
  loadMemberList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadMemberList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  loadMemberList()
}

// 添加成员
const handleAddMember = () => {
  dialogTitle.value = '添加成员'
  isEdit.value = false
  resetMemberForm()
  dialogVisible.value = true
}

// 编辑成员
const handleEdit = (row) => {
  dialogTitle.value = '编辑成员'
  isEdit.value = true
  Object.assign(memberForm, row)
  dialogVisible.value = true
}

// 提升为管理员
const handlePromoteToAdmin = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将 "${row.username}" 提升为企业管理员吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }
    
    const response = await updateMemberRole(companyId, row.id, { companyRole: 2 })
    
    if (response.code === 200) {
      ElMessage.success('提升成功')
      loadMemberList()
    } else {
      ElMessage.error(response.message || '提升失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提升管理员失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 降级为普通员工
const handleDemoteToEmployee = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消 "${row.username}" 的管理员权限吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }
    
    const response = await updateMemberRole(companyId, row.id, { companyRole: 1 })
    
    if (response.code === 200) {
      ElMessage.success('操作成功')
      loadMemberList()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消管理员权限失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 切换成员状态
const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}成员 "${row.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }
    
    // 尝试不同的字段名称
    const updateData = {
      status: row.status === 1 ? 0 : 1
    }
    
    // 如果上面的格式不工作，尝试其他可能的字段名称
    const alternativeData = {
      userStatus: row.status === 1 ? 0 : 1
    }
    
    let response
    try {
      response = await updateCompanyMember(companyId, row.id, updateData)
    } catch (error) {
      console.log('尝试备用字段名称...')
      console.log('备用数据:', alternativeData)
      response = await updateCompanyMember(companyId, row.id, alternativeData)
    }
    
    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      loadMemberList()
    } else {
      console.error('API返回错误:', response)
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换成员状态失败:', error)
      console.error('错误详情:', error.response?.data)
      ElMessage.error('操作失败')
    }
  }
}

// 删除成员
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成员 "${row.username}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }
    
    const response = await deleteCompanyMember(companyId, row.id)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadMemberList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除成员失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!memberFormRef.value) return
  
  try {
    await memberFormRef.value.validate()
    submitLoading.value = true
    
    const companyId = userStore.userInfo?.companyId
    if (!companyId) {
      ElMessage.error('无法获取企业信息')
      return
    }
    
    let response
    
    if (isEdit.value) {
      // 编辑成员
      const updateData = {
        nickname: memberForm.nickname,
        phoneNumber: memberForm.phoneNumber,
        email: memberForm.email,
        gender: memberForm.gender,
        status: memberForm.status
      }
      response = await updateCompanyMember(companyId, memberForm.id, updateData)
    } else {
      // 创建成员
      response = await createCompanyMember(companyId, memberForm)
    }
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
      dialogVisible.value = false
      loadMemberList()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '保存失败' : '创建失败'))
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置成员表单
const resetMemberForm = () => {
  Object.assign(memberForm, {
    id: null,
    username: '',
    password: '',
    nickname: '',
    phoneNumber: '',
    email: '',
    gender: 1,
    companyRole: 1,
    status: 1
  })
}

// 对话框关闭
const handleDialogClose = () => {
  resetMemberForm()
  if (memberFormRef.value) {
    memberFormRef.value.resetFields()
  }
}

// 切换搜索表单显示
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value
}

// 刷新数据
const handleRefresh = () => {
  loadMemberList()
}
</script>

<style scoped>
.member-management {
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

.add-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.add-button:hover {
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

.stat-icon.admin {
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
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-form .el-form-item {
  margin-bottom: 0;
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

.member-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.member-table :deep(.el-table__header) {
  background: #f9fafb;
}

.member-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.member-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.member-table :deep(.el-table__row:hover) {
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

/* 对话框 */
.member-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.member-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.member-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.member-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.member-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .member-management {
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
  
  .add-button {
    width: 100%;
  }
}
</style> 