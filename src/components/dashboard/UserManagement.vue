<template>
  <div class="user-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">管理系统用户和权限设置</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAddUser" :disabled="loading" class="add-button">
            <el-icon><Plus /></el-icon>
            添加用户
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
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ inactiveUsers }}</div>
            <div class="stat-label">禁用用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ adminUsers }}</div>
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
                <el-form-item label="企业ID">
                  <el-input
                    v-model="searchForm.companyId"
                    placeholder="请输入企业ID"
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
                <el-form-item label="用户类型">
                  <el-select v-model="searchForm.userType" placeholder="请选择" clearable style="width: 150px">
                    <el-option label="企业用户" :value="1" />
                    <el-option label="平台超级管理员" :value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item label="用户名">
                  <el-input
                    v-model="searchForm.username"
                    placeholder="请输入用户名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input
                    v-model="searchForm.phoneNumber"
                    placeholder="请输入手机号"
                    clearable
                    style="width: 150px"
                  />
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

        <!-- 用户表格 -->
        <div class="table-section">
          <div class="table-header">
            <h3>用户列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="text" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
          
          <el-table
            :data="userList"
            v-loading="loading"
            style="width: 100%"
            border
            stripe
            class="user-table"
          >
            <!-- <el-table-column prop="id" label="ID" width="80" /> -->
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="nickname" label="昵称" width="120" />
            <el-table-column prop="phoneNumber" label="手机号" width="130" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="gender" label="性别" width="80">
              <template #default="{ row }">
                <el-tag :type="row.gender === 1 ? 'primary' : 'success'" size="small">
                  {{ row.gender === 1 ? '男' : '女' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="userType" label="用户类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.userType === 1 ? 'info' : 'danger'" size="small">
                  {{ row.userType === 1 ? '企业用户' : '平台超级管理员' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="companyName" label="企业名称" width="150">
              <template #default="{ row }">
                <span v-if="row.userType === 1">{{ getCompanyNameById(row.companyId) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="companyRole" label="企业角色" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.userType === 1" :type="row.companyRole === 1 ? 'warning' : 'success'" size="small">
                  {{ row.companyRole === 1 ? '普通员工' : '企业管理员' }}
                </el-tag>
                <span v-else>-</span>
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
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)" class="action-btn">
                  编辑
                </el-button>
                <el-button type="success" size="small" @click="handleManagePermission(row)" class="action-btn">
                  权限管理
                </el-button>
                <el-button 
                  :type="row.status === 1 ? 'warning' : 'success'" 
                  size="small" 
                  @click="handleToggleStatus(row)"
                  class="action-btn"
                >
                  {{ row.status === 1 ? '禁用' : '启用' }}
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
      class="user-dialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="userForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType" placeholder="请选择用户类型" style="width: 100%" @change="handleUserTypeChange">
            <el-option label="企业用户" :value="1" />
            <el-option label="平台超级管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业" prop="companyId" v-if="userForm.userType === 1">
          <el-select v-model="userForm.companyId" placeholder="请选择企业" style="width: 100%" @change="handleCompanyChange">
            <el-option 
              v-for="[id, name] in companiesMap" 
              :key="id" 
              :label="name" 
              :value="id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="企业角色" prop="companyRole" v-if="userForm.userType === 1 && userForm.companyId">
          <el-select v-model="userForm.companyRole" placeholder="请选择企业角色" style="width: 100%">
            <el-option label="普通员工" :value="1" />
            <el-option label="企业管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
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

    <!-- 权限管理对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限管理"
      width="500px"
      @close="handlePermissionDialogClose"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="120px"
      >
        <el-form-item label="用户名">
          <el-input v-model="permissionForm.username" disabled />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="permissionForm.userType" placeholder="请选择用户类型" style="width: 100%" @change="handlePermissionUserTypeChange">
            <el-option label="企业用户" :value="1" />
            <el-option label="平台超级管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业" prop="companyId" v-if="permissionForm.userType === 1">
          <el-select v-model="permissionForm.companyId" placeholder="请选择企业" style="width: 100%" @change="handlePermissionCompanyChange">
            <el-option 
              v-for="[id, name] in companiesMap" 
              :key="id" 
              :label="name" 
              :value="id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="企业角色" prop="companyRole" v-if="permissionForm.userType === 1 && permissionForm.companyId">
          <el-select v-model="permissionForm.companyRole" placeholder="请选择企业角色" style="width: 100%">
            <el-option label="普通员工" :value="1" />
            <el-option label="企业管理员" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit" :loading="permissionSubmitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  Plus, Search, Refresh, User, UserFilled, Warning, Medal,
  ArrowDown, ArrowUp, Download 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsersList, updateUser } from '@/api/auth'
import { loadCompaniesMapping, getCompanyName } from '@/utils/companyMapping'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const showSearchForm = ref(true)
const userFormRef = ref()
const companiesMap = ref(new Map())

// 权限管理相关变量
const permissionDialogVisible = ref(false)
const permissionFormRef = ref()
const permissionSubmitLoading = ref(false)
const currentEditUserId = ref(null)
const currentUserData = ref(null)

// 搜索表单
const searchForm = reactive({
  companyId: '',
  companyRole: '',
  userType: '',
  username: '',
  phoneNumber: '',
  status: ''
})

// 用户表单
const userForm = reactive({
  id: null,
  username: '',
  nickname: '',
  phoneNumber: '',
  email: '',
  gender: 1,
  userType: 1,
  companyId: '',
  companyRole: 1,
  status: 1
})

// 权限表单
const permissionForm = reactive({
  username: '',
  userType: 1,
  companyId: '',
  companyRole: 1
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
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
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  companyId: [
    { required: true, message: '请选择企业', trigger: 'change' }
  ],
  companyRole: [
    { required: true, message: '请选择企业角色', trigger: 'change' }
  ]
}

// 权限表单验证规则
const permissionFormRules = {
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  companyId: [
    { 
      required: true, 
      message: '请选择企业', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (permissionForm.userType === 1 && !value) {
          callback(new Error('企业用户必须选择企业'))
        } else {
          callback()
        }
      }
    }
  ],
  companyRole: [
    { 
      required: true, 
      message: '请选择企业角色', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (permissionForm.userType === 1 && permissionForm.companyId && !value) {
          callback(new Error('请选择企业角色'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 用户列表
const userList = ref([])

// 计算属性
const activeUsers = computed(() => {
  return userList.value.filter(user => user.status === 1).length
})

const inactiveUsers = computed(() => {
  return userList.value.filter(user => user.status === 0).length
})

const adminUsers = computed(() => {
  return userList.value.filter(user => user.userType === 2 || user.companyRole === 2).length
})

// 方法
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const handleRefresh = () => {
  loadUserList()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 初始化
onMounted(() => {
  initCompaniesMapping()
  loadUserList()
})

// 初始化企业映射
const initCompaniesMapping = async () => {
  try {
    await loadCompaniesMapping()
    // 模拟企业数据，实际应该从API获取
    companiesMap.value = new Map([
      [1, '企业A'],
      [2, '企业B'],
      [3, '企业C']
    ])
  } catch (error) {
    console.error('初始化企业映射失败:', error)
    // 设置默认的企业映射
    companiesMap.value = new Map([
      [1, '企业A'],
      [2, '企业B'],
      [3, '企业C']
    ])
  }
}

// 获取企业名称
const getCompanyNameById = (companyId) => {
  if (!companyId) return '未设置'
  return companiesMap.value.get(companyId) || '未设置'
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    }
    
    const response = await getUsersList(params)
    
    if (response.code === 200) {
      userList.value = response.data.records
      pagination.total = response.data.total
      pagination.current = response.data.current
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key !== 'page' && key !== 'size') {
      searchForm[key] = ''
    }
  })
  pagination.current = 1
  loadUserList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadUserList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  loadUserList()
}

// 添加用户
const handleAddUser = () => {
  dialogTitle.value = '添加用户'
  resetUserForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 权限管理
const handleManagePermission = (row) => {
  currentEditUserId.value = row.id
  
  // 保存完整的用户数据用于后续更新
  currentUserData.value = { ...row }
  
  // 确保数据类型正确
  const userData = {
    username: row.username,
    userType: Number(row.userType) || 1,
    companyId: row.companyId ? Number(row.companyId) : '',
    companyRole: Number(row.companyRole) || 1
  }
  
  Object.assign(permissionForm, userData)
  permissionDialogVisible.value = true
}

// 切换用户状态
const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const updateData = {
      ...row,
      status: row.status === 1 ? 0 : 1
    }
    
    const response = await updateUser(row.id, updateData)
    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      loadUserList()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    submitLoading.value = true
    
    const response = await updateUser(userForm.id, userForm)
    if (response.code === 200) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadUserList()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    nickname: '',
    phoneNumber: '',
    email: '',
    gender: 1,
    userType: 1,
    companyId: '',
    companyRole: 1,
    status: 1
  })
}

// 对话框关闭
const handleDialogClose = () => {
  resetUserForm()
  currentEditUserId.value = null
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 用户类型改变处理
const handleUserTypeChange = () => {
  if (userForm.userType === 2) {
    // 如果选择平台超级管理员，清空企业相关信息
    userForm.companyId = ''
    userForm.companyRole = 1
  }
}

// 企业改变处理
const handleCompanyChange = () => {
  if (!userForm.companyId) {
    userForm.companyRole = 1
  }
}

// 权限管理提交
const handlePermissionSubmit = async () => {
  if (!permissionFormRef.value) return
  
  try {
    await permissionFormRef.value.validate()
    permissionSubmitLoading.value = true
    
    // 构建完整的更新数据，包含所有必需字段
    const updateData = {
      // 保持原有用户信息不变
      username: currentUserData.value.username,
      nickname: currentUserData.value.nickname,
      phoneNumber: currentUserData.value.phoneNumber,
      email: currentUserData.value.email,
      gender: currentUserData.value.gender,
      status: currentUserData.value.status,
      
      // 更新权限相关字段
      userType: Number(permissionForm.userType),
      companyRole: Number(permissionForm.companyRole)
    }
    
    // 企业相关字段
    if (permissionForm.userType === 1) {
      // 企业用户
      if (permissionForm.companyId) {
        updateData.companyId = Number(permissionForm.companyId)
      } else {
        updateData.companyId = null
      }
    } else {
      // 平台超级管理员
      updateData.companyId = null
      updateData.companyRole = null
    }
    
    const response = await updateUser(currentEditUserId.value, updateData)
    
    // 如果到这里说明请求成功
    ElMessage.success('权限管理保存成功')
    permissionDialogVisible.value = false
    loadUserList()
    
  } catch (error) {
    console.error('权限管理保存失败:', error)
    
    // 显示详细的错误信息
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误响应数据:', error.response.data)
      
      // 显示后端返回的具体错误信息
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `请求失败 (${error.response.status})`
      ElMessage.error(errorMessage)
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('权限管理保存失败')
    }
  } finally {
    permissionSubmitLoading.value = false
  }
}

// 权限管理对话框关闭
const handlePermissionDialogClose = () => {
  resetPermissionForm()
  currentEditUserId.value = null
  currentUserData.value = null
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
}

// 重置权限表单
const resetPermissionForm = () => {
  Object.assign(permissionForm, {
    username: '',
    userType: 1,
    companyId: '',
    companyRole: 1
  })
}

// 权限用户类型改变处理
const handlePermissionUserTypeChange = () => {
  if (permissionForm.userType === 2) {
    // 如果选择平台超级管理员，清空企业相关信息
    permissionForm.companyId = ''
    permissionForm.companyRole = 1
  }
}

// 权限企业改变处理
const handlePermissionCompanyChange = () => {
  if (!permissionForm.companyId) {
    permissionForm.companyRole = 1
  }
}
</script>

<style scoped>
.user-management {
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
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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
  margin-left: auto;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
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
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
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
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-actions .el-button {
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
}

.table-actions .el-button:hover {
  color: #667eea;
  transform: translateY(-1px);
}

.user-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-table :deep(.el-table__header) {
  background: #f9fafb;
}

.user-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.user-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.user-table :deep(.el-table__row:hover) {
  background: #f8fafc;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 4px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: #f9fafb;
  border-radius: 12px;
  margin-top: 16px;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #6b7280;
  --el-pagination-border-radius: 8px;
  --el-pagination-button-color: #6b7280;
  --el-pagination-button-bg-color: white;
  --el-pagination-button-disabled-color: #d1d5db;
  --el-pagination-button-disabled-bg-color: #f3f4f6;
  --el-pagination-hover-color: #667eea;
}

.pagination-container :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pagination-container :deep(.el-pagination .el-pager li:hover) {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.pagination-container :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 对话框 */
.user-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.user-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.user-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.user-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.user-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-buttons {
    margin-left: 0;
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
  }
}
</style> 