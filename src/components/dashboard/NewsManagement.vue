<template>
  <div class="news-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">行业动态管理</h1>
          <p class="page-subtitle">管理和发布行业动态信息</p>
        </div>
        <div class="header-right">
          <el-button type="warning" @click="openScrapeDialog" :disabled="loading" class="scrape-button">
            <el-icon><Scissor /></el-icon>
            抓取动态
          </el-button>
          <el-button v-if="canPublish" type="primary" @click="handleCreate" :disabled="loading" class="add-button">
            <el-icon><Plus /></el-icon>
            发布动态
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">总动态数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ publishedNews }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingNews }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ rejectedNews }}</div>
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
              <el-form :inline="true" :model="filters" @submit.prevent="handleSearch" class="search-form">
                <el-form-item label="标题">
                  <el-input v-model="filters.title" placeholder="按标题搜索" clearable />
                </el-form-item>
                <el-form-item label="作者">
                  <el-input v-model="filters.authorName" placeholder="按作者搜索" clearable />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px;">
                    <el-option label="待审核" :value="0" />
                    <el-option label="已发布" :value="1" />
                    <el-option label="未通过" :value="2" />
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

        <!-- 动态列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>动态列表</h3>
            <div class="table-actions">
              <el-button type="info" @click="handleDebug" size="small" class="debug-btn">
                <el-icon><Refresh /></el-icon>
                调试
              </el-button>
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-table :data="newsList" v-loading="loading" class="news-table" @sort-change="handleSortChange">
            <!-- 调试信息 -->
            <template #empty>
              <div class="empty-state">
                <el-empty description="暂无数据">
                  <template #description>
                    <div class="empty-info">
                      <p v-if="loading" class="loading-text">正在加载中...</p>
                      <p v-else-if="pagination.total === 0" class="no-data-text">暂无动态数据</p>
                      <p v-else class="data-info">数据加载完成，共 {{ pagination.total }} 条记录</p>
                      <p class="debug-info">当前列表长度: {{ newsList.length }}</p>
                      <p class="debug-info">当前页码: {{ pagination.currentPage }}, 每页大小: {{ pagination.pageSize }}</p>
                    </div>
                  </template>
                  <template #extra>
                    <el-button type="primary" @click="handleRefresh" :loading="loading">
                      <el-icon><Refresh /></el-icon>
                      刷新数据
                    </el-button>
                  </template>
                </el-empty>
              </div>
            </template>
            
            <el-table-column prop="id" label="ID" width="100" sortable="custom" />
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="scope">
                <el-link type="primary" @click="handleViewDetails(scope.row)" class="news-title-link">
                  {{ scope.row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="authorName" label="作者" width="120" />
            <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" :formatter="formatDate" />
            <el-table-column prop="viewCount" label="浏览量" width="100" sortable="custom" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="scope">
                <el-button v-if="canEditOrDelete(scope.row)" size="small" type="primary" @click="handleEdit(scope.row)" class="action-btn">
                  编辑
                </el-button>
                <el-button v-if="canEditOrDelete(scope.row)" size="small" type="danger" @click="handleDelete(scope.row)" class="action-btn">
                  删除
                </el-button>
                <el-button v-if="canAudit(scope.row)" size="small" type="warning" @click="handleAudit(scope.row)" class="action-btn">
                  审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :hide-on-single-page="false"
            />
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 编辑/新建弹窗 -->
    <el-dialog v-model="editorDialogVisible" :title="editorDialogTitle" width="60%" :close-on-click-modal="false" class="editor-dialog">
      <el-form ref="editorFormRef" :model="editorForm" :rules="editorRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editorForm.title" placeholder="请输入动态标题" />
        </el-form-item>
        <el-form-item label="封面图URL" prop="coverImageUrl">
          <el-input v-model="editorForm.coverImageUrl" placeholder="请输入封面图片地址" />
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input type="textarea" v-model="editorForm.summary" placeholder="请输入动态简介" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" :rows="10" v-model="editorForm.content" placeholder="请输入动态的详细内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          {{ saveLoading ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 独立审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="审核动态" width="30%" :close-on-click-modal="false" class="audit-dialog">
      <el-form ref="auditFormRef" :model="auditForm" label-width="80px">
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="auditForm.status" placeholder="请选择审核结果">
            <el-option label="审核通过" :value="1" />
            <el-option label="审核不通过" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="saveLoading">确认审核</el-button>
      </template>
    </el-dialog>

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

        <div class="content-body" v-html="selectedNews.content"></div>
      </div>
      <template #footer>
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scrapeDialogVisible" title="抓取网络动态" width="40%" :close-on-click-modal="false" class="scrape-dialog">
      <el-form label-width="100px">
        <el-form-item label="新闻URL">
          <el-input v-model="scrapeUrl" placeholder="请在此处粘贴新闻页面的网址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleScrape" :loading="scrapeLoading">
          {{ scrapeLoading ? '抓取中...' : '开始抓取' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Scissor, Document, Check, Clock, Close, ArrowDown, ArrowUp, Search, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getNewsList, createNews, updateNews, deleteNews, auditNews, getNewsDetails, scrapeNews } from '@/api/news'

// --- 通用响应式数据 ---
const userStore = useUserStore()
const loading = ref(false)
const saveLoading = ref(false)
const showSearchForm = ref(true)
const newsList = ref([])
const filters = reactive({ title: '', authorName: '', status: null })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// 计算统计数据
const publishedNews = computed(() => {
  return newsList.value.filter(news => news.status === 1).length;
});

const pendingNews = computed(() => {
  return newsList.value.filter(news => news.status === 0).length;
});

const rejectedNews = computed(() => {
  return newsList.value.filter(news => news.status === 2).length;
});

// --- 编辑/新建弹窗数据 ---
const editorDialogVisible = ref(false)
const editorDialogTitle = ref('新建动态')
const editorFormRef = ref()
const editorForm = reactive({
  id: null,
  title: '',
  coverImageUrl: '',
  summary: '',
  content: ''
})
const editorRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// --- 审核弹窗数据 ---
const auditDialogVisible = ref(false)
const auditFormRef = ref()
const auditForm = reactive({ status: null })
const currentAuditNews = ref(null)

// --- 详情弹窗数据 ---
const detailsDialogVisible = ref(false)
const selectedNews = ref(null)

// --- 【新增】抓取功能相关数据 ---
const scrapeDialogVisible = ref(false)
const scrapeLoading = ref(false)
const scrapeUrl = ref('')

// --- 权限计算属性 ---
const isPlatformAdmin = computed(() => userStore.userInfo?.userType === 2)
const canPublish = computed(() => isPlatformAdmin.value || userStore.userInfo?.companyRole === 2)
const canEditOrDelete = (newsItem) => isPlatformAdmin.value || (userStore.userInfo?.companyRole === 2 && newsItem.authorId === userStore.userInfo.id)
const canAudit = (newsItem) => isPlatformAdmin.value && newsItem.status === 0

// --- 主要方法 (保持不变) ---
const loadNewsList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      title: filters.title || undefined,
      authorName: filters.authorName || undefined,
      status: filters.status !== null ? filters.status : undefined
    }
    
    // 清理空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });
    
    console.log('请求参数:', params)
    console.log('当前分页状态:', {
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      total: pagination.total
    })
    const response = await getNewsList(params)
    console.log('API响应:', response)
    console.log('API响应data:', response.data)
    console.log('API响应data类型:', typeof response.data)
    console.log('API响应data是否为数组:', Array.isArray(response.data))
    if (response.data && typeof response.data === 'object') {
      console.log('API响应data的keys:', Object.keys(response.data))
    }
    
    // 处理不同的数据结构
    if (response.data && response.data.records) {
      // 如果返回的是 { data: { records: [], total: number } }
      newsList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else if (response.data && response.data.list) {
      // 如果返回的是 { data: { list: [], total: number, pageNum: number, pageSize: number } }
      newsList.value = response.data.list || []
      pagination.total = response.data.total || 0
      // 注意：不要同步后端返回的pageNum，因为后端可能没有正确处理分页
      // 保持前端的分页状态
      console.log('使用list数据结构，保持前端分页状态:', {
        frontendPage: pagination.currentPage,
        backendPageNum: response.data.pageNum,
        pageSize: response.data.pageSize,
        total: response.data.total,
        listLength: response.data.list?.length
      })
    } else if (response.data && Array.isArray(response.data)) {
      // 如果返回的是 { data: [] }
      newsList.value = response.data
      pagination.total = response.data.length
    } else {
      // 默认处理
      newsList.value = response.data || []
      pagination.total = response.total || response.data?.length || 0
    }
    
    console.log('处理后的数据:', {
      newsList: newsList.value,
      total: pagination.total,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    })
  } catch (error) {
    console.error('获取动态列表失败:', error)
    ElMessage.error('获取动态列表失败')
    // 设置默认值
    newsList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadNewsList()
}

const handleReset = () => {
  Object.assign(filters, { title: '', authorName: '', status: null })
  pagination.currentPage = 1
  loadNewsList()
}

const handleSizeChange = (size) => {
  console.log('页面大小变化:', size)
  pagination.pageSize = size
  pagination.currentPage = 1
  loadNewsList()
}

const handleCurrentChange = (page) => {
  console.log('当前页变化:', page)
  pagination.currentPage = page
  loadNewsList()
}

const handleSortChange = ({ prop, order }) => {
  // 这里可以添加排序逻辑
  console.log('排序变化:', prop, order)
}

const resetEditorForm = () => {
  Object.assign(editorForm, {
    id: null,
    title: '',
    coverImageUrl: '',
    summary: '',
    content: ''
  })
  editorFormRef.value?.clearValidate()
}

const handleCreate = () => {
  resetEditorForm()
  editorDialogTitle.value = '新建动态'
  editorDialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(editorForm, { ...row })
  editorDialogTitle.value = '编辑动态'
  editorDialogVisible.value = true
}

const handleSave = async () => {
  try {
    await editorFormRef.value.validate()
    saveLoading.value = true
    
    if (editorForm.id) {
      await updateNews(editorForm.id, editorForm)
      ElMessage.success('更新成功')
    } else {
      await createNews(editorForm)
      ElMessage.success('创建成功')
    }
    
    editorDialogVisible.value = false
    loadNewsList()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除动态 "${row.title}"?`, '确认删除', { type: 'warning' })
    await deleteNews(row.id)
    ElMessage.success('删除成功')
    loadNewsList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleAudit = (row) => {
  currentAuditNews.value = row
  auditForm.status = null
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  try {
    if (auditForm.status === null) {
      ElMessage.warning('请选择审核结果')
      return
    }
    
    saveLoading.value = true
    await auditNews(currentAuditNews.value.id, { status: auditForm.status })
    ElMessage.success('审核完成')
    auditDialogVisible.value = false
    loadNewsList()
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  } finally {
    saveLoading.value = false
  }
}

const handleViewDetails = async (row) => {
  try {
    const response = await getNewsDetails(row.id)
    selectedNews.value = response.data
    detailsDialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// --- 【新增】抓取功能相关方法 ---
const openScrapeDialog = () => {
  scrapeUrl.value = ''; // 清空上次的URL
  scrapeDialogVisible.value = true;
}

const handleScrape = async () => {
  if (!scrapeUrl.value.trim()) {
    ElMessage.warning('请输入要抓取的URL');
    return;
  }
  scrapeLoading.value = true;
  try {
    const response = await scrapeNews(scrapeUrl.value);
    // 检查后端返回的code是否为成功状态（例如200）
    if (response.code === 200 && response.data) {
      // 抓取成功，自动填充到新建表单中
      resetEditorForm(); // 清空表单，确保是新建状态
      Object.assign(editorForm, response.data); // 将抓取到的数据填充到表单
      editorDialogTitle.value = '抓取结果预览 (可编辑)'; // 修改弹窗标题
      editorDialogVisible.value = true; // 打开编辑/新建弹窗
      scrapeDialogVisible.value = false; // 关闭抓取弹窗
      ElMessage.success('抓取成功！请预览并保存。');
    } else {
      // 处理后端返回的业务错误信息
      ElMessage.error(response.message || '抓取失败');
    }
  } catch (error) {
    console.error("抓取失败:", error);
    // error.message通常是axios拦截器处理过的错误信息
    ElMessage.error(error.message || '抓取失败，请检查URL或联系管理员');
  } finally {
    scrapeLoading.value = false;
  }
}

// --- 辅助函数 ---
const formatDate = (row, column, cellValue) => cellValue ? new Date(cellValue).toLocaleString() : '-'
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

// 调试方法
const handleDebug = () => {
  console.log('=== 调试信息 ===');
  console.log('用户信息:', userStore.userInfo);
  console.log('当前数据:', {
    newsList: newsList.value,
    total: pagination.total,
    loading: loading.value,
    filters: filters,
    pagination: pagination
  });
  
  ElMessage.info(`数据状态: ${newsList.value.length} 条记录，总计 ${pagination.total} 条`);
};

// --- 生命周期钩子 ---
onMounted(() => {
  loadNewsList()
})
</script>

<style scoped>
.news-management {
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

.scrape-button {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  backdrop-filter: blur(10px);
  color: #ffc107;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.scrape-button:hover {
  background: rgba(255, 193, 7, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
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

/* 对话框样式 */
.editor-dialog :deep(.el-dialog),
.audit-dialog :deep(.el-dialog),
.details-dialog :deep(.el-dialog),
.scrape-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.editor-dialog :deep(.el-dialog__header),
.audit-dialog :deep(.el-dialog__header),
.details-dialog :deep(.el-dialog__header),
.scrape-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.editor-dialog :deep(.el-dialog__title),
.audit-dialog :deep(.el-dialog__title),
.details-dialog :deep(.el-dialog__title),
.scrape-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.editor-dialog :deep(.el-dialog__body),
.audit-dialog :deep(.el-dialog__body),
.details-dialog :deep(.el-dialog__body),
.scrape-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.editor-dialog :deep(.el-dialog__footer),
.audit-dialog :deep(.el-dialog__footer),
.details-dialog :deep(.el-dialog__footer),
.scrape-dialog :deep(.el-dialog__footer) {
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
  .news-management {
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
  
  .meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .news-title {
    font-size: 20px;
  }
  
  .header-right {
    flex-direction: column;
    gap: 8px;
  }
  
  .scrape-button,
  .add-button {
    width: 100%;
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