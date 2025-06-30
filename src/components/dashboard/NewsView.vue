<template>
  <div class="news-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">行业动态</h1>
          <p class="page-subtitle">浏览和搜索行业最新动态信息</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleRefresh" :disabled="loading" class="refresh-button">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
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
              <el-form :inline="true" :model="filters" @submit.prevent="handleSearch" class="search-form">
                <el-form-item label="标题">
                  <el-input v-model="filters.title" placeholder="按标题搜索" clearable />
                </el-form-item>
                <el-form-item label="作者">
                  <el-input v-model="filters.authorName" placeholder="按作者搜索" clearable />
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

        <!-- 动态列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>动态列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
          
          <el-table :data="newsList" v-loading="loading" class="news-table" @sort-change="handleSortChange">
            <el-table-column prop="id" label="ID" width="100" sortable="custom" />
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="scope">
                <el-link type="primary" @click="handleViewDetails(scope.row)" class="news-title-link">
                  {{ scope.row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="authorName" label="作者" width="120" />
            <el-table-column prop="companyName" label="所属企业" width="180" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
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

    <!-- 详情查看弹窗 -->
    <el-dialog v-model="detailsDialogVisible" title="动态详情" width="60%" class="details-dialog">
      <div v-if="selectedNews" class="news-details">
        <h2 class="news-title">{{ selectedNews.title }}</h2>
        <div class="meta">
          <span class="meta-item">作者: {{ selectedNews.authorName }}</span>
          <span class="meta-item">发布于: {{ formatDate(selectedNews.createdAt) }}</span>
          <span class="meta-item">浏览量: {{ selectedNews.viewCount }}</span>
        </div>

        <!-- 封面图展示 -->
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { getNewsList, getNewsDetails } from '@/api/news'

// 响应式数据
const loading = ref(false)
const showSearchForm = ref(true)
const newsList = ref([])
const filters = reactive({ title: '', authorName: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// 详情弹窗数据
const detailsDialogVisible = ref(false)
const selectedNews = ref(null)

// 主要方法
const loadNewsList = async () => {
  loading.value = true
  try {
    const params = { 
      page: pagination.currentPage, 
      size: pagination.pageSize, 
      title: filters.title || null, 
      authorName: filters.authorName || null,
      status: 1 // 只显示已发布的新闻
    }
    const response = await getNewsList(params)
    let data = response.data.list || []
    data.sort((a, b) => Number(b.id) - Number(a.id))
    newsList.value = data
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
    newsList.value.sort((a, b) => Number(b.id) - Number(a.id))
    return
  }
  newsList.value.sort((a, b) => {
    let valA = a[prop]
    let valB = b[prop]
    if (prop === 'id' || prop === 'viewCount') {
      valA = Number(valA)
      valB = Number(valB)
    } else if (prop === 'createdAt') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    if (order === 'ascending') {
      return valA > valB ? 1 : -1
    } else {
      return valA < valB ? 1 : -1
    }
  })
}

const handleSearch = () => { 
  pagination.currentPage = 1
  loadNewsList() 
}

const handleReset = () => { 
  Object.assign(filters, { title: '', authorName: '' })
  handleSearch() 
}

const handleSizeChange = (size) => { 
  pagination.pageSize = size
  loadNewsList() 
}

const handleCurrentChange = (page) => { 
  pagination.currentPage = page
  loadNewsList() 
}

const handleViewDetails = async (row) => {
  try {
    const response = await getNewsDetails(row.id)
    selectedNews.value = response.data
    detailsDialogVisible.value = true
  } catch (error) {
    ElMessage.error("获取动态详情失败")
    console.error("获取详情失败:", error)
  }
}

// 辅助函数
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : '-'
const getStatusText = (status) => ({ 0: '待审核', 1: '已发布', 2: '未通过' })[status] || '未知'
const getStatusTagType = (status) => ({ 0: 'warning', 1: 'success', 2: 'danger' })[status] || 'info'

// 切换搜索表单显示
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 刷新数据
const handleRefresh = () => {
  loadNewsList();
};

// 生命周期钩子
onMounted(() => {
  loadNewsList()
})
</script>

<style scoped>
.news-view {
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

.news-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.news-table :deep(.el-table__header) {
  background: #f9fafb;
}

.news-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.news-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.news-table :deep(.el-table__row:hover) {
  background: #f8fafc;
}

.news-title-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.news-title-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 对话框样式 */
.details-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.details-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.details-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.details-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.details-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* 详情页面样式 */
.news-details {
  padding: 0;
}

.news-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.meta-item {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.cover-image-container {
  margin: 20px 0;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-body {
  line-height: 1.8;
  color: #374151;
  font-size: 16px;
}

.content-body :deep(p) {
  margin-bottom: 16px;
}

.content-body :deep(h1, h2, h3, h4, h5, h6) {
  color: #1f2937;
  font-weight: 600;
  margin: 24px 0 16px 0;
}

.content-body :deep(ul, ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.content-body :deep(li) {
  margin-bottom: 8px;
}

.content-body :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 16px;
  margin: 16px 0;
  color: #6b7280;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-view {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
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
  
  .meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .news-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
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