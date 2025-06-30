<template>
  <div class="course-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">课程管理</h1>
          <p class="page-subtitle">管理和查看所有课程信息</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreate" :disabled="courseStore.loading" class="add-button">
            <el-icon><Plus /></el-icon>
            新建课程
          </el-button>
          <el-button @click="handleExport" :disabled="courseStore.loading" class="export-button">
            <el-icon><Download /></el-icon>
            导出课程
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ courseStore.total }}</div>
            <div class="stat-label">总课程数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ publishedCourses }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingCourses }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ rejectedCourses }}</div>
            <div class="stat-label">未通过</div>
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
              <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="课程名称">
                  <el-input v-model="searchForm.courseName" placeholder="请输入课程名称" clearable />
                </el-form-item>
                <el-form-item label="作者">
                  <el-input v-model="searchForm.authorName" placeholder="请输入作者名称" clearable />
                </el-form-item>
                <el-form-item label="企业">
                  <el-input v-model="searchForm.companyName" placeholder="请输入企业名称" clearable />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
                    <el-option label="全部" :value="''" />
                    <el-option label="待审核" :value="0" />
                    <el-option label="已发布" :value="1" />
                    <el-option label="未通过" :value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item label="排序方式">
                  <el-select v-model="sortOption" placeholder="请选择排序方式" style="width: 160px;">
                    <el-option label="默认排序" value="default" />
                    <el-option label="观看量升序" value="viewCountAsc" />
                    <el-option label="观看量降序" value="viewCountDesc" />
                    <el-option label="课程名升序" value="courseNameAsc" />
                    <el-option label="课程名降序" value="courseNameDesc" />
                  </el-select>
                </el-form-item>
                <el-form-item class="search-buttons">
                  <el-button type="primary" @click="handleSearch" :loading="courseStore.loading" class="search-btn">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSearch" class="reset-btn">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 课程列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>课程列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
          
          <el-table :data="courseStore.courseList" v-loading="courseStore.loading" class="course-table">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="封面" width="100">
              <template #default="scope">
                <el-image 
                  v-if="scope.row.coverImageUrl" 
                  :src="scope.row.coverImageUrl" 
                  class="course-cover"
                  fit="cover"
                  :preview-src-list="[scope.row.coverImageUrl]"
                />
                <div v-else class="no-cover">
                  <el-icon><Picture /></el-icon>
                  <span>无封面</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="courseName" label="课程名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="authorName" label="作者" width="120" />
            <el-table-column prop="companyName" label="企业" width="150" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="观看量" width="100" sortable="custom" />
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleView(scope.row)" class="action-btn">查看</el-button>
                <el-button size="small" type="primary" v-if="canEdit(scope.row)" @click="handleEdit(scope.row)" class="action-btn">编辑</el-button>
                <el-button size="small" type="danger" v-if="canDelete(scope.row)" @click="handleDelete(scope.row)" class="action-btn">删除</el-button>
                <el-button size="small" type="warning" v-if="canAudit(scope.row)" @click="handleAudit(scope.row)" class="action-btn">审核</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container" v-if="courseStore.total > 0">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :page-sizes="[10, 15, 20, 30]"
              :current-page="courseStore.pageNum"
              :page-size="courseStore.pageSize"
              :total="courseStore.total"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 审核弹窗 -->
    <el-dialog v-model="showAuditDialog" title="课程审核" width="400px" class="audit-dialog">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input type="textarea" v-model="auditForm.auditRemark" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAuditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useCourseStore } from '@/stores/course.js'
import { useUserStore } from '@/stores/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, VideoPlay, Check, Clock, Close, Search, Refresh, ArrowDown, ArrowUp, Picture } from '@element-plus/icons-vue'

const emit = defineEmits(['show-detail', 'show-edit', 'show-create'])

const courseStore = useCourseStore()
const userStore = useUserStore()

const searchForm = ref({
  courseName: '',
  authorName: '',
  companyName: '',
  status: ''
})
const showAuditDialog = ref(false)
const showSearchForm = ref(true)
const auditForm = ref({
  id: null,
  status: 1, // 1=通过, 2=驳回
  auditRemark: ''
})

// 排序规则
const sortOption = ref('default')

// 计算统计数据
const publishedCourses = computed(() => {
  return courseStore.courseList.filter(course => course.status === 1).length;
});

const pendingCourses = computed(() => {
  return courseStore.courseList.filter(course => course.status === 0).length;
});

const rejectedCourses = computed(() => {
  return courseStore.courseList.filter(course => course.status === 2).length;
});

// 角色判断
const isPlatformAdmin = () => userStore.userInfo.userType === 2
const isCompanyAdmin = () => userStore.userInfo.userType === 1 && userStore.userInfo.companyRole === 2
const isNormalUser = () => userStore.userInfo.userType === 1 && userStore.userInfo.companyRole === 1

// 权限判断
const canEdit = (row) => {
  console.log('row.authorId:', row.authorId, 'userStore.userInfo.id:', userStore.userInfo.id)
  console.log('row.companyId:', row.companyId, 'userStore.userInfo.companyId:', userStore.userInfo.companyId)
  if (isPlatformAdmin()) return true
  if (isCompanyAdmin() && row.companyId === userStore.userInfo.companyId) return true
  if (isNormalUser() && row.authorId == userStore.userInfo.id) return true // 注意用 == 兼容类型
  return false
}
const canDelete = canEdit
const canAudit = (row) => {
  // 平台管理员可审核所有，企业管理员可审核本企业待审核课程
  if (isPlatformAdmin() && row.status === 0) return true
  if (isCompanyAdmin() && row.companyId === userStore.userInfo.companyId && row.status === 0) return true
  return false
}

// 状态相关函数
const getStatusText = (status) => {
  const statusMap = { 0: '待审核', 1: '已发布', 2: '未通过' }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = { 0: 'warning', 1: 'success', 2: 'danger' }
  return typeMap[status] || 'info'
}

const handleSearch = () => {
  courseStore.pageNum = 1
  fetchCourses()
}
const resetSearch = () => {
  searchForm.value = { courseName: '', authorName: '', companyName: '', status: '' }
  courseStore.pageNum = 1
  fetchCourses()
}

const fetchCourses = () => {
  const params = { ...searchForm.value }
  if (params.status === '' || params.status === null || params.status === undefined) {
    delete params.status
  } else {
    params.status = Number(params.status)
  }
  // 排序参数
  let sortBy, sortOrder
  switch (sortOption.value) {
    case 'viewCountAsc':
      sortBy = 'viewCount'
      sortOrder = 'asc'
      break
    case 'viewCountDesc':
      sortBy = 'viewCount'
      sortOrder = 'desc'
      break
    case 'courseNameAsc':
      sortBy = 'courseName'
      sortOrder = 'asc'
      break
    case 'courseNameDesc':
      sortBy = 'courseName'
      sortOrder = 'desc'
      break
    default:
      sortBy = null
      sortOrder = null
  }
  courseStore.getCourseListAction({
    ...params,
    sortBy,
    sortOrder
  })
}

// 切换搜索表单显示
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 刷新数据
const handleRefresh = () => {
  fetchCourses();
};

// 操作
const handleView = (row) => {
  emit('show-detail', row.id)
}
const handleEdit = (row) => {
  emit('show-edit', row.id)
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该课程吗？', '提示', { type: 'warning' })
    .then(async () => {
      await courseStore.deleteCourseAction(row.id)
      ElMessage.success('删除成功')
      fetchCourses()
    })
    .catch(() => {})
}
const handleAudit = (row) => {
  auditForm.value.id = row.id
  auditForm.value.status = 1
  auditForm.value.auditRemark = ''
  showAuditDialog.value = true
}
const handleCreate = () => {
  emit('show-create')
}
const handleExport = () => {
  ElMessageBox.confirm(
    '确定要导出课程列表吗？',
    '确认导出',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    const params = { ...searchForm.value }
    if (params.status === '' || params.status === null || params.status === undefined) {
      delete params.status
    } else {
      params.status = Number(params.status)
    }
    courseStore.exportCoursesAction(params)
  }).catch(() => {
    // 用户取消导出
  })
}

const submitAudit = async () => {
  if (!auditForm.value.id) return
  try {
    await courseStore.auditCourseAction({
      id: auditForm.value.id,
      status: auditForm.value.status,
      auditRemark: auditForm.value.auditRemark
    })
    ElMessage.success('审核成功')
    showAuditDialog.value = false
    fetchCourses()
  } catch (err) {
    // 错误已在 store 处理
  }
}

const handlePageChange = (page) => {
  courseStore.pageNum = page
  fetchCourses()
}
const handlePageSizeChange = (size) => {
  courseStore.pageSize = size
  fetchCourses()
}

// 监听排序方式变化自动刷新
watch(sortOption, () => {
  fetchCourses()
})

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.course-list-page {
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
  display: flex;
  gap: 12px;
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

.export-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.export-button:hover {
  background: rgba(255, 255, 255, 0.2);
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

.course-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.course-table :deep(.el-table__header) {
  background: #f9fafb;
}

.course-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.course-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.course-table :deep(.el-table__row:hover) {
  background: #f8fafc;
}

.course-cover {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.course-cover:hover {
  transform: scale(1.05);
}

.no-cover {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 12px;
  gap: 4px;
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

/* 审核对话框 */
.audit-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.audit-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.audit-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.audit-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-list-page {
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
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-right {
    align-self: stretch;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-right {
    flex-direction: column;
    gap: 12px;
  }
  
  .add-button, .export-button {
    width: 100%;
  }
}
</style> 