<template>
  <div class="course-list-page">
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-bar" style="margin-bottom: 16px;">
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right; margin-left: auto;">
          <el-button type="info" @click="handleDebug" size="small" class="debug-btn">
            <el-icon><Refresh /></el-icon>
            调试
          </el-button>
          <el-button type="primary" @click="handleCreate">新建课程</el-button>
          <el-button @click="handleExport">导出课程</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="courseStore.courseList" v-loading="courseStore.loading" style="width: 100%">
        <!-- 调试信息 -->
        <template #empty>
          <div class="empty-state">
            <el-empty description="暂无数据">
              <template #description>
                <div class="empty-info">
                  <p v-if="courseStore.loading" class="loading-text">正在加载中...</p>
                  <p v-else-if="courseStore.total === 0" class="no-data-text">暂无课程数据</p>
                  <p v-else class="data-info">数据加载完成，共 {{ courseStore.total }} 条记录</p>
                  <p class="debug-info">当前列表长度: {{ courseStore.courseList.length }}</p>
                  <p class="debug-info">当前页码: {{ courseStore.pageNum }}, 每页大小: {{ courseStore.pageSize }}</p>
                </div>
              </template>
              <template #extra>
                <el-button type="primary" @click="fetchCourses" :loading="courseStore.loading">
                  <el-icon><Refresh /></el-icon>
                  刷新数据
                </el-button>
              </template>
            </el-empty>
          </div>
        </template>
        
        <!-- <el-table-column prop="id" label="ID" width="60" /> -->
        <el-table-column label="封面" width="80">
          <template #default="scope">
            <el-image 
              v-if="scope.row.coverImageUrl" 
              :src="scope.row.coverImageUrl" 
              style="width: 60px; height: 40px; border-radius: 4px;" 
              fit="cover"
              :preview-src-list="[scope.row.coverImageUrl]"
            />
            <div v-else style="width: 60px; height: 40px; background-color: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
              无封面
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="companyName" label="企业" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="info">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已发布</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">未通过</el-tag>
            <el-tag v-else>未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" v-if="canEdit(scope.row)" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" v-if="canDelete(scope.row)" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="warning" v-if="canAudit(scope.row)" @click="handleAudit(scope.row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: center;">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 15, 20, 30]"
          :current-page="courseStore.pageNum"
          :page-size="courseStore.pageSize"
          :total="courseStore.total"
          :hide-on-single-page="false"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>
    <!-- 审核弹窗 -->
    <el-dialog v-model="showAuditDialog" title="课程审核" width="400px">
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
import { ref, onMounted, watch } from 'vue'
import { useCourseStore } from '@/stores/course.js'
import { useUserStore } from '@/stores/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'

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
const auditForm = ref({
  id: null,
  status: 1, // 1=通过, 2=驳回
  auditRemark: ''
})

// 排序规则
const sortOption = ref('default')

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
    pageNum: courseStore.pageNum,
    pageSize: courseStore.pageSize,
    sortBy,
    sortOrder
  })
}

const handlePageChange = (page) => {
  courseStore.pageNum = page
  fetchCourses()
}
const handlePageSizeChange = (size) => {
  courseStore.pageSize = size
  fetchCourses()
}

// 调试方法
const handleDebug = () => {
  console.log('=== 课程管理调试信息 ===');
  console.log('用户信息:', userStore.userInfo);
  console.log('当前数据:', {
    courseList: courseStore.courseList,
    total: courseStore.total,
    loading: courseStore.loading,
    pageNum: courseStore.pageNum,
    pageSize: courseStore.pageSize,
    searchForm: searchForm.value,
    sortOption: sortOption.value
  });
  
  ElMessage.info(`数据状态: ${courseStore.courseList.length} 条记录，总计 ${courseStore.total} 条`);
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
}

/* 空状态样式 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-info {
  margin-top: 16px;
}

.loading-text {
  color: #409eff;
  font-weight: 500;
}

.no-data-text {
  color: #909399;
  font-weight: 500;
}

.data-info {
  color: #67c23a;
  font-weight: 500;
}

.debug-info {
  color: #909399;
  font-size: 12px;
  margin: 4px 0;
}

/* 调试按钮样式 */
.debug-btn {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.debug-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.4);
}
</style> 