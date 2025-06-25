<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAddUser" :disabled="loading">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <el-table
        :data="userList"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phoneNumber" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? 'primary' : 'success'">
              {{ row.gender === 1 ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userType" label="用户类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.userType === 1 ? 'info' : 'danger'">
              {{ row.userType === 1 ? '企业用户' : '平台超级管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="companyName" label="企业名称" width="150">
          <template #default="{ row }">
            <span v-if="row.userType === 1">{{ getCompanyName(row.companyId) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="companyRole" label="企业角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 1" :type="row.companyRole === 1 ? 'warning' : 'success'">
              {{ row.companyRole === 1 ? '普通员工' : '企业管理员' }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
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
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
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
          <el-select v-model="userForm.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="企业用户" :value="1" />
            <el-option label="平台超级管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业" prop="companyId" v-if="userForm.userType === 1">
          <el-select v-model="userForm.companyId" placeholder="请选择企业" style="width: 100%">
            <el-option label="未设置" :value="null" />
            <el-option 
              v-for="[id, name] in companiesMap" 
              :key="id" 
              :label="name" 
              :value="id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="企业角色" prop="companyRole" v-if="userForm.userType === 1">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getUsersList, updateUser, getCompaniesList } from '@/api/auth'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const userFormRef = ref()

// 企业列表映射
const companiesMap = ref(new Map())

// 搜索表单
const searchForm = reactive({
  companyId: '',
  companyRole: '',
  userType: '',
  username: '',
  phoneNumber: '',
  status: '',
  page: 1,
  size: 10
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

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
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
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  companyRole: [
    { required: true, message: '请选择企业角色', trigger: 'change' }
  ]
}

// 用户列表
const userList = ref([])

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 初始化
onMounted(() => {
  console.log('=== UserManagement 组件初始化 ===')
  loadCompaniesList()
  loadUserList()
})

// 加载企业列表
const loadCompaniesList = async () => {
  try {
    console.log('开始加载企业列表')
    const response = await getCompaniesList()
    console.log('企业列表API响应:', response)
    
    if (response.code === 200) {
      // 创建企业ID到企业名称的映射
      const companies = response.data.records || response.data || []
      companiesMap.value.clear()
      
      companies.forEach(company => {
        companiesMap.value.set(company.id, company.name || company.companyName)
      })
      
      console.log('企业映射创建成功:', companiesMap.value)
    } else {
      console.error('获取企业列表失败:', response.message)
      ElMessage.error(response.message || '获取企业列表失败')
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败，请检查网络连接')
  }
}

// 获取企业名称
const getCompanyName = (companyId) => {
  if (!companyId) return '未设置'
  return companiesMap.value.get(companyId) || '未设置'
}

// 加载用户列表
const loadUserList = async () => {
  console.log('开始加载用户列表')
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    }
    
    console.log('请求参数:', params)
    
    const response = await getUsersList(params)
    
    console.log('API响应:', response)
    
    if (response.code === 200) {
      userList.value = response.data.records
      pagination.total = response.data.total
      pagination.current = response.data.current
      console.log('用户列表加载成功:', userList.value)
    } else {
      console.error('API返回错误:', response.message)
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
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 