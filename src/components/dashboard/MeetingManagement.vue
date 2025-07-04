<template>
  <div class="meeting-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">会议管理</h1>
          <p class="page-subtitle">管理和查看所有会议信息</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreate" :disabled="loading" class="add-button">
            <el-icon><Plus /></el-icon>
            新建会议
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">总会议数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ publishedMeetings }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingMeetings }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ rejectedMeetings }}</div>
            <div class="stat-label">未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card class="content-card">
    <div v-if="isPlatformAdmin">
          <!-- 平台管理员视图 -->
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
            <el-input v-model="searchParams.meetingName" placeholder="会议名称" clearable />
          </el-form-item>
          <el-form-item label="创建人">
            <el-input v-model="searchParams.creatorName" placeholder="创建人姓名" clearable />
          </el-form-item>
                  <el-form-item label="所属公司">
            <el-select v-model="searchParams.companyId" placeholder="按公司筛选" clearable filterable>
              <el-option v-for="company in companyList" :key="company.id" :label="company.companyName" :value="company.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="会议日期">
            <el-date-picker
                v-model="searchParams.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
                  <el-form-item label="状态">
            <el-select v-model="searchParams.status" placeholder="全部状态" clearable style="width: 120px;">
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
                    <el-button @click="resetSearch" class="reset-btn">
                      <el-icon><Refresh /></el-icon>
                      重置
                    </el-button>
          </el-form-item>
        </el-form>
              </div>
            </el-collapse-transition>
          </div>

          <div class="table-section">
            <div class="table-header">
              <h3>会议列表</h3>
              <div class="table-actions">
                <el-button type="danger" @click="handleBatchDelete(allSelectedMeetings)" :disabled="allSelectedMeetings.length === 0" class="batch-delete-btn">
                  <el-icon><Delete /></el-icon>
                  批量删除
                </el-button>
                <el-button type="text" @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
        </div>
            
            <el-table v-loading="loading" :data="meetingList" @selection-change="handleAllSelectionChange" class="meeting-table">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="companyName" label="所属公司" width="180" />
          <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
          <el-table-column prop="creatorName" label="创建人" width="120" />
          <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
          </el-table-column>
          <el-table-column prop="location" label="地点" width="150" />
          <el-table-column prop="organizer" label="主办单位" width="180" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
                  <el-button size="small" @click="handleDetail(scope.row)" class="action-btn">详情</el-button>
                  <el-button size="small" type="primary" @click="handleEdit(scope.row)" class="action-btn">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.row)" class="action-btn">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
          <div>调试输出：{{ meetingList }}</div>
          </div>
    </div>

    <div v-else>
          <!-- 企业用户视图 -->
          <el-tabs v-model="activeTab" type="border-card" class="meeting-tabs">
        <el-tab-pane label="我管理的会议" name="managed" v-if="canManage">
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
              <el-input v-model="searchParams.meetingName" placeholder="会议名称" clearable />
            </el-form-item>
            <el-form-item label="创建人">
              <el-input v-model="searchParams.creatorName" placeholder="创建人姓名" clearable />
            </el-form-item>
            <el-form-item label="会议日期">
              <el-date-picker
                  v-model="searchParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
              />
            </el-form-item>
                      <el-form-item class="search-buttons">
                        <el-button type="primary" @click="handleSearch" :loading="loading" class="search-btn">
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

              <div class="table-section">
                <div class="table-header">
                  <h3>我管理的会议</h3>
                  <div class="table-actions">
                    <el-button type="danger" @click="handleBatchDelete(managedSelectedMeetings)" :disabled="managedSelectedMeetings.length === 0" class="batch-delete-btn">
                      <el-icon><Delete /></el-icon>
                      批量删除
                    </el-button>
                    <el-button type="text" @click="handleRefresh">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-button>
                  </div>
          </div>
                
                <el-table v-loading="loading" :data="managedMeetings" @selection-change="handleManagedSelectionChange" class="meeting-table">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="location" label="地点" width="150" />
            <el-table-column prop="organizer" label="主办单位" width="180" />
            <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
            <el-table-column prop="creatorName" label="创建人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)" size="small">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
            </el-table-column>
                  <el-table-column label="操作" width="300" fixed="right">
                    <template #default="scope">
                      <el-button v-if="scope.row.status === 2" size="small" type="warning" @click="handleResubmit(scope.row)" class="action-btn">重传</el-button>
                      <el-button size="small" @click="handleDetail(scope.row)" class="action-btn">详情</el-button>
                      <el-button size="small" type="primary" @click="handleEdit(scope.row)" class="action-btn">编辑</el-button>
                      <el-button size="small" type="danger" @click="handleDelete(scope.row)" class="action-btn">删除</el-button>
            </template>
            </el-table-column>
          </el-table>
              </div>
        </el-tab-pane>

        <el-tab-pane label="全部会议" name="all">
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
              <el-input v-model="searchParams.meetingName" placeholder="会议名称" clearable />
            </el-form-item>
            <el-form-item label="创建人">
              <el-input v-model="searchParams.creatorName" placeholder="创建人姓名" clearable />
            </el-form-item>
            <el-form-item label="会议日期">
              <el-date-picker
                  v-model="searchParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchParams.status" placeholder="全部状态" clearable style="width: 120px;">
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
                        <el-button @click="resetSearch" class="reset-btn">
                          <el-icon><Refresh /></el-icon>
                          重置
                        </el-button>
            </el-form-item>
          </el-form>
                  </div>
                </el-collapse-transition>
              </div>

              <div class="table-section">
                <div class="table-header">
                  <h3>全部会议</h3>
                  <div class="table-actions">
                    <el-button type="text" @click="handleRefresh">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-button>
                  </div>
                </div>
                
                <el-table v-loading="loading" :data="meetingList" class="meeting-table">
            <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="companyName" label="所属公司" width="180" />
            <el-table-column prop="location" label="地点" width="150" />
            <el-table-column prop="organizer" label="主办单位" width="180" />
            <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
            <el-table-column prop="creatorName" label="创建人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)" size="small">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
                    <template #default="scope">
                      <el-button size="small" @click="handleDetail(scope.row)" class="action-btn">详情</el-button>
                    </template>
            </el-table-column>
          </el-table>
              </div>
        </el-tab-pane>
      </el-tabs>
    </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="pagination.total > 0">
          <el-pagination
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
                   layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <MeetingForm v-model:visible="formDialogVisible" :meeting-data="currentMeeting" @success="onFormSuccess" />

    <el-dialog v-model="detailDialogVisible" title="会议详情" width="50%" class="detail-dialog">
      <div v-if="currentMeeting" class="detail-content">
        <div class="detail-item">
          <span class="detail-label">会议名称:</span>
          <span class="detail-value">{{ currentMeeting.meetingName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">所属公司:</span>
          <span class="detail-value">{{ currentMeeting.companyName || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">会议地点:</span>
          <span class="detail-value">{{ currentMeeting.location }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">主办单位:</span>
          <span class="detail-value">{{ currentMeeting.organizer }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">开始时间:</span>
          <span class="detail-value">{{ formatDateTime(null, null, currentMeeting.startTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">结束时间:</span>
          <span class="detail-value">{{ formatDateTime(null, null, currentMeeting.endTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建人:</span>
          <span class="detail-value">{{ currentMeeting.creatorName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">会议内容:</span>
        <div class="content-box">{{ currentMeeting.content }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, ArrowDown, ArrowUp, Delete, Refresh, Calendar, Check, Clock, Close } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { getMeetingList, deleteMeeting } from '@/api/meeting';
import MeetingForm from '@/components/meeting/MeetingForm.vue';
import {getCompanyList} from "@/api/auth.js";
import { watch } from 'vue';
import { resubmitMeeting} from "@/api/meeting";

const userStore = useUserStore();
const isPlatformAdmin = computed(() => userStore.userInfo?.userType === 2);
const canManage = computed(() => userStore.userInfo?.userType === 2 || userStore.userInfo?.companyRole === 2);

// 响应式数据
const loading = ref(false);
const activeTab = ref('managed');
const showSearchForm = ref(true);
const formDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const currentMeeting = ref(null);
const companyList = ref([]);
const meetingList = ref([]);
const managedMeetings = ref([]);
const allSelectedMeetings = ref([]);
const managedSelectedMeetings = ref([]);

// 计算统计数据
const publishedMeetings = computed(() => {
  return meetingList.value.filter(meeting => meeting.status === 1).length;
});

const pendingMeetings = computed(() => {
  return meetingList.value.filter(meeting => meeting.status === 0).length;
});

const rejectedMeetings = computed(() => {
  return meetingList.value.filter(meeting => meeting.status === 2).length;
});

const searchParams = reactive({
  meetingName: '', creatorName: '', dateRange: [], status: '', companyId: null
});
const pagination = reactive({ current: 1, size: 10, total: 0 });

const fetchMeetings = async () => {
  loading.value = true;
  try {
    // 1. 从用户输入的搜索条件开始构建基础参数
    const baseParams = {
      page: pagination.current,
      size: pagination.size,
      meetingName: searchParams.meetingName || null,
      creatorName: searchParams.creatorName || null,
      startDate: searchParams.dateRange?.[0] || null,
      endDate: searchParams.dateRange?.[1] || null,
    };

    // 2. 根据当前视图和角色，应用特定的过滤规则
    if (isPlatformAdmin.value) {
      // 平台管理员：使用下拉框选择的状态和公司
      baseParams.status = searchParams.status === '' ? null : searchParams.status;
      baseParams.companyId = searchParams.companyId || null;
    } else if (activeTab.value === 'managed') {
      // 企业管理员的"我管理的会议"：查询所有状态，但只查自己公司的
      baseParams.status = searchParams.status === '' ? null : searchParams.status;
      baseParams.companyId = userStore.userInfo.companyId;
    } else { // activeTab.value === 'all'
      // "全部会议"视图：强制只显示已发布的，忽略状态下拉框
      baseParams.status = 1;
    }

    // 3. 清理空值参数后发送请求
    const finalParams = { ...baseParams };
    Object.keys(finalParams).forEach(key => {
      if (finalParams[key] === null || finalParams[key] === '') {
        delete finalParams[key];
      }
    });

    const response = await getMeetingList(finalParams);
    // 兼容单条对象和数组
    const records = response.data.records;
    meetingList.value = Array.isArray(records) ? records : (records ? [records] : []);
    console.log('会议列表数据', meetingList.value);
    pagination.total = response.data.total;
  } catch (error) {
    console.error('获取会议列表失败:', error);
  } finally {
    loading.value = false;
  }
};
const fetchCompanies = async () => {
  try {
    const res = await getCompanyList({ size: 1000 }); // 获取足够多的公司
    companyList.value = res.data.records;
  } catch (error) { console.error("获取公司列表失败", error); }
};
const resetSearch = () => { Object.assign(searchParams, { meetingName: '', creatorName: '', dateRange: [], status: '' }); handleSearch(); };
const formatDateTime = (row, column, cellValue) => cellValue ? new Date(cellValue).toLocaleString('zh-CN', { hour12: false }) : '';
const getStatusText = (status) => ({0: '待审核', 1: '已发布', 2: '未通过'}[status] || '未知');
const getStatusType = (status) => ({0: 'warning', 1: 'success', 2: 'danger'}[status] || 'info');
const handleSearch = () => { pagination.current = 1; fetchMeetings(); };
const handleAllSelectionChange = (selection) => { allSelectedMeetings.value = selection; };
const handleManagedSelectionChange = (selection) => { managedSelectedMeetings.value = selection; };
const handleCreate = () => { currentMeeting.value = null; formDialogVisible.value = true; };
const handleEdit = (row) => { currentMeeting.value = { ...row }; formDialogVisible.value = true; };
const handleDetail = (row) => { currentMeeting.value = { ...row }; detailDialogVisible.value = true; };
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除会议 "${row.meetingName}"?`, '确认删除', { type: 'warning' })
      .then(async () => { await deleteMeeting(row.id); ElMessage.success('删除成功'); fetchMeetings(); }).catch(() => {});
};
const handleBatchDelete = (selection) => {
  if (selection.length === 0) return;
  ElMessageBox.confirm(`确定删除选中的 ${selection.length} 个会议?`, '确认删除', { type: 'warning' })
      .then(async () => { await Promise.all(selection.map(m => deleteMeeting(m.id))); ElMessage.success('批量删除成功'); fetchMeetings(); }).catch(() => {});
};
const handleResubmit = async (meeting) => {
  await ElMessageBox.confirm(`确定要重新提交会议 [${meeting.meetingName}] 进行审核吗？`, '确认操作');
  try {
    await resubmitMeeting(meeting.id);
    ElMessage.success("已成功重新提交");
    fetchMeetings(); // 刷新列表
  } catch(error) { /* ... */ }
};
const handleSizeChange = (size) => { pagination.size = size; pagination.current = 1; fetchMeetings(); };
const handleCurrentChange = (page) => { pagination.current = page; fetchMeetings(); };
const onFormSuccess = () => { fetchMeetings(); };

// 切换搜索表单显示
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 刷新数据
const handleRefresh = () => {
  loadMeetingList();
};

watch(activeTab, () => {
  fetchMeetings();
});
onMounted(() => {
  fetchMeetings();
  fetchCompanies(); // 在组件加载时获取公司列表
});
</script>

<style scoped>
.meeting-management {
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

/* 标签页样式 */
.meeting-tabs :deep(.el-tabs__header) {
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
  margin: 0;
  padding: 0 20px;
}

.meeting-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
}

.meeting-tabs :deep(.el-tabs__item) {
  padding: 16px 24px;
  font-weight: 500;
  color: #6b7280;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

.meeting-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  background: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.meeting-tabs :deep(.el-tabs__content) {
  padding: 20px;
  background: white;
  border-radius: 0 0 12px 12px;
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

.batch-delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.batch-delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 详情对话框 */
.detail-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  color: #6b7280;
  flex: 1;
}

.content-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #374151;
  line-height: 1.6;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meeting-management {
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
  
  .detail-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
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
  
  .add-button {
    width: 100%;
  }
}
</style>