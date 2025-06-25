<template>
  <div class="news-management">
    <h2>行业动态管理</h2>

    <!-- 操作与筛选栏 -->
    <el-card class="action-bar">
      <el-row :gutter="20" align="middle">
        <el-col :span="16">
          <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
            <el-form-item label="标题">
              <el-input v-model="filters.title" placeholder="按标题搜索" clearable />
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model="filters.authorName" placeholder="按作者搜索" clearable />
            </el-form-item>
            <el-form-item v-if="isPlatformAdmin" label="状态">
              <el-select v-model="filters.status" placeholder="按状态筛选" clearable>
                <el-option label="待审核" :value="0" />
                <el-option label="已发布" :value="1" />
                <el-option label="未通过" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8" style="text-align: right;">
          <el-button v-if="canPublish" type="success" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            发布动态
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 动态列表 -->
    <el-table :data="newsList" v-loading="loading" style="width: 100%; margin-top: 20px;" @sort-change="handleSortChange">
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="scope">
          <el-link type="primary" @click="handleViewDetails(scope.row)">{{ scope.row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="120" />
      <el-table-column prop="companyName" label="所属企业" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="100" sortable="custom" />
      <el-table-column prop="createdAt" label="发布时间" width="180" sortable="custom">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button v-if="canEditOrDelete(scope.row)" size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="canEditOrDelete(scope.row)" size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button v-if="canAudit(scope.row)" size="small" type="warning" @click="handleAudit(scope.row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-if="pagination.total > 0" class="pagination-container" v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    
    <!-- 编辑/新建弹窗 -->
    <el-dialog v-model="editorDialogVisible" :title="editorDialogTitle" width="60%" :close-on-click-modal="false">
      <el-form ref="editorFormRef" :model="editorForm" :rules="editorRules" label-width="100px">
        <el-form-item label="标题" prop="title"><el-input v-model="editorForm.title" placeholder="请输入动态标题" /></el-form-item>
        <el-form-item label="封面图URL" prop="coverImageUrl"><el-input v-model="editorForm.coverImageUrl" placeholder="请输入封面图片地址" /></el-form-item>
        <el-form-item label="简介" prop="summary"><el-input type="textarea" v-model="editorForm.summary" placeholder="请输入动态简介" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input type="textarea" :rows="10" v-model="editorForm.content" placeholder="请输入动态的详细内容" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="editorDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saveLoading">{{ saveLoading ? '保存中...' : '保存' }}</el-button></template>
    </el-dialog>
    
    <!-- 独立审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="审核动态" width="30%" :close-on-click-modal="false">
        <el-form ref="auditFormRef" :model="auditForm" label-width="80px">
            <el-form-item label="审核状态" prop="status"><el-select v-model="auditForm.status" placeholder="请选择审核结果"><el-option label="审核通过" :value="1" /><el-option label="审核不通过" :value="2" /></el-select></el-form-item>
        </el-form>
        <template #footer><el-button @click="auditDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmAudit" :loading="saveLoading">确认审核</el-button></template>
    </el-dialog>


    <!-- 详情查看弹窗 -->
    <el-dialog v-model="detailsDialogVisible" title="动态详情" width="60%">
        <div v-if="selectedNews" class="news-details">
            <h2>{{ selectedNews.title }}</h2>
            <div class="meta">
                <span>作者: {{ selectedNews.authorName }}</span>
                <span>发布于: {{ formatDate(selectedNews.createdAt) }}</span>
                <span>浏览量: {{ selectedNews.viewCount }}</span>
            </div>

            <!-- **新增**: 封面图展示 -->
            <div v-if="selectedNews.coverImageUrl" class="cover-image-container">
                <img :src="selectedNews.coverImageUrl" alt="封面图片" class="cover-image" />
            </div>

            <el-divider />
            <div v-html="selectedNews.content" class="content-body"></div>
        </div>
        <template #footer>
            <el-button type="primary" @click="detailsDialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getNewsList, createNews, updateNews, deleteNews, auditNews, getNewsDetails } from '@/api/news'

// --- 通用响应式数据 ---
const userStore = useUserStore()
const loading = ref(false)
const saveLoading = ref(false)
const newsList = ref([])
const filters = reactive({ title: '', authorName: '', status: null })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// --- 编辑/新建弹窗数据 ---
const editorDialogVisible = ref(false)
const editorDialogTitle = ref('')
const editorFormRef = ref(null)
const editingNewsId = ref(null)
const editorForm = reactive({ title: '', coverImageUrl: '', summary: '', content: '' })
const editorRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

// --- 审核弹窗数据 ---
const auditDialogVisible = ref(false)
const auditFormRef = ref(null)
const auditForm = reactive({ newsId: null, status: 1 })

// --- 详情弹窗数据 ---
const detailsDialogVisible = ref(false)
const selectedNews = ref(null)


// --- 权限计算属性 ---
const userInfo = computed(() => userStore.userInfo)
const isPlatformAdmin = computed(() => userInfo.value?.userType === 2)
const isCompanyAdmin = computed(() => userInfo.value?.userType === 1 && userInfo.value?.companyRole === 2)
const canPublish = computed(() => isPlatformAdmin.value || isCompanyAdmin.value)
const canEditOrDelete = (newsItem) => {
  if (isPlatformAdmin.value) return true
  if (isCompanyAdmin.value) return newsItem.companyId === userInfo.value.companyId
  return false
}
const canAudit = (newsItem) => isPlatformAdmin.value && newsItem.status === 0

// --- 自定义排序方法 ---
const sortById = (a, b) => {
  return Number(a.id) - Number(b.id)
}


// --- 主要方法 ---
const loadNewsList = async () => {
  loading.value = true
  try {
    const params = { page: pagination.currentPage, size: pagination.pageSize, title: filters.title || null, authorName: filters.authorName || null, status: filters.status }
    const response = await getNewsList(params)
    let data = response.data.list || []
    data.sort((a, b) => Number(b.id) - Number(a.id));
    newsList.value = data;
    pagination.total = response.data.total || 0
  } catch (error) {
    console.error("加载动态列表失败:", error)
    ElMessage.error("加载动态列表失败")
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }) => {
    if (!order) {
        newsList.value.sort((a, b) => Number(b.id) - Number(a.id));
        return;
    }
    newsList.value.sort((a, b) => {
        let valA = a[prop];
        let valB = b[prop];
        if (prop === 'id' || prop === 'viewCount') {
            valA = Number(valA);
            valB = Number(valB);
        } else if (prop === 'createdAt') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        if (order === 'ascending') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });
}

const handleSearch = () => { pagination.currentPage = 1; loadNewsList() }
const handleReset = () => { Object.assign(filters, { title: '', authorName: '', status: null }); handleSearch() }
const handleSizeChange = (size) => { pagination.pageSize = size; loadNewsList() }
const handleCurrentChange = (page) => { pagination.currentPage = page; loadNewsList() }

const resetEditorForm = () => { Object.assign(editorForm, { title: '', coverImageUrl: '', summary: '', content: '' }); editingNewsId.value = null }
const handleCreate = () => { resetEditorForm(); editorDialogTitle.value = '发布新动态'; editorDialogVisible.value = true }
const handleEdit = (row) => { resetEditorForm(); Object.assign(editorForm, row); editingNewsId.value = row.id; editorDialogTitle.value = `编辑动态 (ID: ${row.id})`; editorDialogVisible.value = true }

const handleSave = async () => {
  try {
    await editorFormRef.value.validate()
    saveLoading.value = true
    if (editingNewsId.value) {
      await updateNews(editingNewsId.value, editorForm)
      ElMessage.success('动态更新成功')
    } else {
      await createNews(editorForm)
      ElMessage.success('动态发布成功，请等待审核')
    }
    editorDialogVisible.value = false
    loadNewsList()
  } catch(error) {
    if (error && error.message) ElMessage.error(error.message)
    console.error("保存失败:", error)
  } finally {
    saveLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除标题为 "${row.title}" 的动态吗？`, '警告', { type: 'warning' })
    await deleteNews(row.id)
    ElMessage.success('删除成功')
    loadNewsList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleAudit = (row) => {
  auditForm.newsId = row.id
  auditForm.status = 1
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
    if (!auditForm.newsId) return;
    saveLoading.value = true;
    try {
        await auditNews(auditForm.newsId, { status: auditForm.status });
        ElMessage.success('审核操作成功');
        auditDialogVisible.value = false;
        loadNewsList();
    } catch (error) {
        ElMessage.error('审核操作失败');
        console.error('审核失败:', error);
    } finally {
        saveLoading.value = false;
    }
}

const handleViewDetails = async (row) => {
    try {
        const response = await getNewsDetails(row.id);
        selectedNews.value = response.data;
        detailsDialogVisible.value = true;
    } catch (error) {
        ElMessage.error("获取动态详情失败");
        console.error("获取详情失败:", error);
    }
}


// --- 辅助函数 ---
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : '-'
const getStatusText = (status) => ({ 0: '待审核', 1: '已发布', 2: '未通过' })[status] || '未知'
const getStatusTagType = (status) => ({ 0: 'warning', 1: 'success', 2: 'danger' })[status] || 'info'


// --- 生命周期钩子 ---
onMounted(() => {
  loadNewsList()
})
</script>

<style scoped>
/* ... (其他样式无变化) ... */
.news-management { padding: 20px; }
.news-management h2 { margin-bottom: 20px; }
.action-bar { padding-top: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: center; }

/* 详情弹窗样式 */
.news-details h2 {
    font-size: 22px;
    margin-bottom: 15px;
}
.news-details .meta {
    display: flex;
    gap: 20px;
    color: #909399;
    margin-bottom: 20px;
    font-size: 14px;
}
.news-details .content-body {
    line-height: 1.8;
}

/* **新增**: 封面图容器和图片样式 */
.cover-image-container {
    margin-bottom: 20px;
    text-align: center;
}
.cover-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    object-fit: contain;
}
</style>
