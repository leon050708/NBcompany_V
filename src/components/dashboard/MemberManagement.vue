<template>
  <div class="member-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成员管理</span>
          <el-button type="primary" @click="handleAddMember" :disabled="loading">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
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

      <!-- 成员表格 -->
      <el-table
        :data="memberList"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="companyRole" label="企业角色" width="200">
          <template #default="{ row }">
            <el-tag :type="row.companyRole === 1 ? 'warning' : 'success'">
              {{ row.companyRole === 1 ? '普通员工' : '企业管理员' }}
            </el-tag>
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
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              v-if="row.companyRole === 1"
              type="success" 
              size="small" 
              @click="handlePromoteToAdmin(row)"
            >
              设为管理员
            </el-button>
            <el-button 
              v-if="row.companyRole === 2"
              type="warning" 
              size="small" 
              @click="handleDemoteToEmployee(row)"
            >
              取消管理员
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
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
    </el-card>

    <!-- 成员编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
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
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { 
  getCompanyMembers, 
  createCompanyMember, 
  updateCompanyMember, 
  updateMemberRole, 
  deleteCompanyMember 
} from '@/api/auth'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const memberFormRef = ref()

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo?.id)

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
    
    console.log('请求企业成员列表，企业ID:', companyId, '参数:', params)
    const response = await getCompanyMembers(companyId, params)
    console.log('企业成员API响应:', response)
    
    if (response.code === 200) {
      // 过滤掉当前用户，不显示自己
      const filteredRecords = response.data.records.filter(member => member.id !== currentUserId.value)
      
      memberList.value = filteredRecords
      pagination.total = response.data.total - 1 // 总数减1，因为过滤掉了自己
      pagination.current = response.data.current
      console.log('企业成员列表加载成功（已过滤当前用户）:', memberList.value)
    } else {
      console.error('API返回错误:', response.message)
      ElMessage.error(response.message || '获取成员列表失败')
    }
  } catch (error) {
    console.error('获取成员列表失败:', error)
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
    
    console.log('提升成员为管理员，企业ID:', companyId, '成员ID:', row.id)
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
    
    console.log('取消成员管理员权限，企业ID:', companyId, '成员ID:', row.id)
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
    
    const updateData = {
      nickname: row.nickname,
      phoneNumber: row.phoneNumber,
      email: row.email,
      gender: row.gender,
      status: row.status === 1 ? 0 : 1
    }
    
    console.log('切换成员状态，企业ID:', companyId, '成员ID:', row.id, '新状态:', updateData.status)
    const response = await updateCompanyMember(companyId, row.id, updateData)
    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      loadMemberList()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换成员状态失败:', error)
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
    
    console.log('删除成员，企业ID:', companyId, '成员ID:', row.id)
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
      console.log('编辑成员，企业ID:', companyId, '成员ID:', memberForm.id, '数据:', updateData)
      response = await updateCompanyMember(companyId, memberForm.id, updateData)
    } else {
      // 创建成员
      console.log('创建成员，企业ID:', companyId, '数据:', memberForm)
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
</script>

<style scoped>
.member-management {
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