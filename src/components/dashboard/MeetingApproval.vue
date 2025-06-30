<template>
  <div class="meeting-approval">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">会议审核</h1>
          <p class="page-subtitle">审核待处理的会议申请</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="fetchPendingMeetings" :disabled="loading" class="refresh-button">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">待审核会议</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ approvedCount }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ rejectedCount }}</div>
            <div class="stat-label">已驳回</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ todayCount }}</div>
            <div class="stat-label">今日申请</div>
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
              <el-form :model="searchParams" inline class="search-form">
        <el-form-item label="会议名称">
                  <el-input 
                    v-model="searchParams.meetingName" 
                    placeholder="按会议名称搜索" 
                    clearable 
                    @keyup.enter="fetchPendingMeetings"
                    style="width: 200px;"
                  />
        </el-form-item>
        <el-form-item label="申请人">
                  <el-input 
                    v-model="searchParams.creatorName" 
                    placeholder="按申请人搜索" 
                    clearable 
                    @keyup.enter="fetchPendingMeetings"
                    style="width: 200px;"
                  />
        </el-form-item>
                <el-form-item class="search-buttons">
                  <el-button type="primary" @click="fetchPendingMeetings" :loading="loading" class="search-btn">
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

        <!-- 会议列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>待审核会议列表</h3>
            <div class="table-actions">
              <el-button type="text" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-table :data="pendingMeetings" v-loading="loading" class="meeting-table">
        <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="creatorName" label="申请人" width="120" />
        <el-table-column prop="companyName" label="所属公司" width="180" />
        <el-table-column label="申请时间" width="180">
              <template #default="scope">
                {{ new Date(scope.row.createdAt).toLocaleString() }}
              </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="isPlatformAdmin">
                  <el-button 
                    size="small" 
                    type="success" 
                    @click="handleReview(scope.row, 1)" 
                    :loading="scope.row.reviewing"
                    class="action-btn"
                  >
                    通过
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="handleReview(scope.row, 2)" 
                    :loading="scope.row.reviewing"
                    class="action-btn"
                  >
                    驳回
                  </el-button>
            </template>
                <span v-else class="no-permission">无操作权限</span>
          </template>
        </el-table-column>
      </el-table>

          <!-- 分页 -->
          <div class="pagination-container" v-if="pagination.total > 0">
            <el-pagination
                     :current-page="pagination.current"
                     :page-size="pagination.size"
                     :page-sizes="[10, 20, 50]"
                     :total="pagination.total"
                     layout="total, sizes, prev, pager, next, jumper"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
      />
          </div>
        </div>
    </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,computed} from 'vue';
import { useUserStore } from '@/stores/user';
import { getMeetingList, updateMeetingStatus } from '@/api/meeting';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Clock, Check, Close, Calendar, ArrowDown, ArrowUp } from '@element-plus/icons-vue';

const userStore = useUserStore();
const isPlatformAdmin = computed(() => userStore.userInfo?.userType === 2);
const loading = ref(false);
const pendingMeetings = ref([]);
const searchParams = reactive({ meetingName: '', creatorName: '' });
const pagination = reactive({ current: 1, size: 10, total: 0 });
const showSearchForm = ref(true);

// 计算统计数据
const approvedCount = computed(() => {
  // 这里可以根据实际需求从API获取已通过的会议数量
  return 0;
});

const rejectedCount = computed(() => {
  // 这里可以根据实际需求从API获取已驳回的会议数量
  return 0;
});

const todayCount = computed(() => {
  // 计算今日申请的会议数量
  const today = new Date().toDateString();
  return pendingMeetings.value.filter(meeting => 
    new Date(meeting.createdAt).toDateString() === today
  ).length;
});

const fetchPendingMeetings = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      status: 0, // 关键：只查询状态为0（待审核）的会议
      meetingName: searchParams.meetingName || null,
      creatorName: searchParams.creatorName || null,
    };

    // 如果是企业管理员，则只查询自己公司下的待审核会议
    // 在调用 getMeetingList 之前
    const userInfo = userStore.userInfo;
    console.log('=== 会议审核页面调试信息 ===');
    console.log('当前用户信息:', userInfo);
    console.log('用户类型:', userInfo.userType);
    console.log('公司角色:', userInfo.companyRole);
    console.log('公司ID:', userInfo.companyId);
    
// 只有企业管理员(userType=1, companyRole=2)才自动按公司筛选
    if (userInfo.userType === 1 && userInfo.companyRole === 2) {
      params.companyId = userInfo.companyId;
      console.log('企业管理员模式，添加公司ID筛选:', userInfo.companyId);
    }
// 对于平台管理员(userType=2)，不添加 companyId，从而查询所有公司的
    if (userInfo.userType === 2) {
      console.log('平台管理员模式，查询所有公司的会议');
    }

    console.log('请求参数:', params);
    const response = await getMeetingList(params);
    console.log('API响应:', response);
    
    // 为每一行数据增加一个独立的加载状态，防止点击一个按钮所有按钮都加载
    pendingMeetings.value = response.data.records.map(item => ({...item, reviewing: false}));
    pagination.total = response.data.total;
    
    console.log('处理后的会议列表:', pendingMeetings.value);
    console.log('总数:', pagination.total);
  } catch (error) {
    console.error("加载待审核会议失败:", error);
    ElMessage.error("加载待审核会议列表失败");
  }
  finally {
    loading.value = false;
  }
};

const handleReview = async (meeting, newStatus) => {
  const actionText = newStatus === 1 ? '通过' : '驳回'; // 1=通过, 2=驳回
  try {
    await ElMessageBox.confirm(`确定要"${actionText}"会议 [${meeting.meetingName}] 吗？`, '确认操作', { type: 'warning' });

    meeting.reviewing = true; // 触发单个按钮的加载状态

    // 调用我们之前在 api/meeting.js 中定义的接口
    await updateMeetingStatus(meeting.id, { status: newStatus });

    ElMessage.success(`操作成功`);
    fetchPendingMeetings(); // 刷新列表，移除已处理的会议
  } catch (error) {
    if (error !== 'cancel') {
      // request.js 中已经有全局的错误提示，这里只在控制台打印
      console.error(`${actionText}失败:`, error);
    }
  } finally {
    if(meeting) meeting.reviewing = false; // 无论成功失败，都取消加载状态
  }
};

const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.current = 1;
  fetchPendingMeetings();
};
const handleCurrentChange = (page) => {
  pagination.current = page;
  fetchPendingMeetings();
};

const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

const handleReset = () => {
  searchParams.meetingName = '';
  searchParams.creatorName = '';
  fetchPendingMeetings();
};

const handleRefresh = () => {
  fetchPendingMeetings();
};

onMounted(fetchPendingMeetings);
</script>

<style scoped>
.meeting-approval {
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

.meeting-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.meeting-table :deep(.el-table__header) {
  background: #f9fafb;
}

.meeting-table :deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.meeting-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.meeting-table :deep(.el-table__row:hover) {
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

.no-permission {
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meeting-approval {
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
  
  .refresh-button {
    width: 100%;
  }
}
</style>