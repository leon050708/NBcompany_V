<template>
  <div class="news-view">
    <h2>行业动态</h2>

    <!-- 筛选栏 -->
    <el-card class="filter-bar">
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
        <el-form-item label="标题">
          <el-input v-model="filters.title" placeholder="按标题搜索" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="filters.authorName" placeholder="按作者搜索" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
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
    </el-table>

    <!-- 分页 -->
    <el-pagination v-if="pagination.total > 0" class="pagination-container" v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <!-- 详情查看弹窗 -->
    <el-dialog v-model="detailsDialogVisible" title="动态详情" width="60%">
      <div v-if="selectedNews" class="news-details">
        <h2>{{ selectedNews.title }}</h2>
        <div class="meta">
          <span>作者: {{ selectedNews.authorName }}</span>
          <span>发布于: {{ formatDate(selectedNews.createdAt) }}</span>
          <span>浏览量: {{ selectedNews.viewCount }}</span>
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
import { getNewsList, getNewsDetails } from '@/api/news'

// 响应式数据
const loading = ref(false)
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

// 生命周期钩子
onMounted(() => {
  loadNewsList()
})
</script>

<style scoped>
.news-view { 
  padding: 20px; 
}

.news-view h2 { 
  margin-bottom: 20px; 
}

.filter-bar { 
  padding-top: 20px; 
}

.pagination-container { 
  margin-top: 20px; 
  display: flex; 
  justify-content: center; 
}

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

/* 封面图容器和图片样式 */
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