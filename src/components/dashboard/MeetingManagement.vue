<template>
  <div class="page-container">
    <div v-if="isPlatformAdmin">
      <el-card>
        <template #header><h2>会议列表 (平台管理员)</h2></template>
        <el-form :model="searchParams" inline>
          <el-form-item label="会议名称">
            <el-input v-model="searchParams.meetingName" placeholder="会议名称" clearable />
          </el-form-item>
          <el-form-item label="创建人">
            <el-input v-model="searchParams.creatorName" placeholder="创建人姓名" clearable />
          </el-form-item>
          <el-form-item label="所属公司" v-if="isPlatformAdmin">
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
          <el-form-item label="状态" v-if="isPlatformAdmin || activeTab === 'managed'">
            <el-select v-model="searchParams.status" placeholder="全部状态" clearable style="width: 120px;">
              <el-option label="待审核" :value="0" />
              <el-option label="已发布" :value="1" />
              <el-option label="未通过" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="action-bar">
          <el-button type="primary" @click="handleCreate">新建会议</el-button>
          <el-button type="danger" @click="handleBatchDelete(allSelectedMeetings)" :disabled="allSelectedMeetings.length === 0">批量删除</el-button>
        </div>
        <el-table v-loading="loading" :data="meetingList" @selection-change="handleAllSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="companyName" label="所属公司" width="180" />
          <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
          <el-table-column prop="creatorName" label="创建人" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="location" label="地点" width="150" />
          <el-table-column prop="organizer" label="主办单位" width="180" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="我管理的会议" name="managed" v-if="canManage">
          <el-form :model="searchParams" inline>
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
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          <div class="action-bar">
            <el-button type="primary" @click="handleCreate">新建会议</el-button>
            <el-button type="danger" @click="handleBatchDelete(managedSelectedMeetings)" :disabled="managedSelectedMeetings.length === 0">批量删除</el-button>
          </div>
          <el-table v-loading="loading" :data="managedMeetings" @selection-change="handleManagedSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="location" label="地点" width="150" />
            <el-table-column prop="organizer" label="主办单位" width="180" />
            <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
            <el-table-column prop="creatorName" label="创建人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right"> <template #default="scope">
              <el-button v-if="scope.row.status === 2" size="small" type="warning" @click="handleResubmit(scope.row)">重传</el-button>
              <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="全部会议" name="all">
          <el-form :model="searchParams" inline>
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
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table v-loading="loading" :data="meetingList">
            <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="companyName" label="所属公司" width="180" />
            <el-table-column prop="location" label="地点" width="150" />
            <el-table-column prop="organizer" label="主办单位" width="180" />
            <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDateTime" />
            <el-table-column prop="creatorName" label="创建人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope"><el-button size="small" @click="handleDetail(scope.row)">详情</el-button></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-pagination v-if="pagination.total > 0" class="pagination-container"
                   :current-page="pagination.current" :page-size="pagination.size" :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                   layout="total, sizes, prev, pager, next, jumper"
                   @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <MeetingForm v-model:visible="formDialogVisible" :meeting-data="currentMeeting" @success="onFormSuccess" />

    <el-dialog v-model="detailDialogVisible" title="会议详情" width="50%">
      <div v-if="currentMeeting" class="detail-content">
        <p><strong>会议名称:</strong> {{ currentMeeting.meetingName }}</p>
        <p><strong>所属公司:</strong> {{ currentMeeting.companyName || 'N/A' }}</p>
        <p><strong>会议地点:</strong> {{ currentMeeting.location }}</p>
        <p><strong>主办单位:</strong> {{ currentMeeting.organizer }}</p>
        <p><strong>开始时间:</strong> {{ formatDateTime(null, null, currentMeeting.startTime) }}</p>
        <p><strong>结束时间:</strong> {{ formatDateTime(null, null, currentMeeting.endTime) }}</p>
        <p><strong>创建人:</strong> {{ currentMeeting.creatorName }}</p>
        <p><strong>会议内容:</strong></p>
        <div class="content-box">{{ currentMeeting.content }}</div>
      </div>
      <template #footer><el-button @click="detailDialogVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { getMeetingList, deleteMeeting } from '@/api/meeting';
import MeetingForm from '@/components/meeting/MeetingForm.vue';
import {getCompanyList} from "@/api/auth.js";
import { watch } from 'vue';
import { resubmitMeeting} from "@/api/meeting";

const userStore = useUserStore();
const isPlatformAdmin = computed(() => userStore.userInfo?.userType === 2);
const canManage = computed(() => userStore.userInfo?.userType === 2 || userStore.userInfo?.companyRole === 2);
const activeTab = ref(canManage.value ? 'managed' : 'all');
const loading = ref(false);
const meetingList = ref([]);
const searchParams = reactive({
  meetingName: '', creatorName: '', dateRange: [], status: '', companyId: null
});
const pagination = reactive({ current: 1, size: 10, total: 0 });
const allSelectedMeetings = ref([]);
const managedSelectedMeetings = ref([]);
const formDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const currentMeeting = ref(null);
const companyList = ref([]);
const managedMeetings = computed(() => {
  if (isPlatformAdmin.value) return [];
  return meetingList.value.filter(meeting => checkEditPermission(meeting));
});
const handleResubmit = async (meeting) => {
  await ElMessageBox.confirm(`确定要重新提交会议 [${meeting.meetingName}] 进行审核吗？`, '确认操作');
  try {
    await resubmitMeeting(meeting.id);
    ElMessage.success("已成功重新提交");
    fetchMeetings(); // 刷新列表
  } catch(error) { /* ... */ }
};

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
      // 企业管理员的“我管理的会议”：查询所有状态，但只查自己公司的
      baseParams.status = searchParams.status === '' ? null : searchParams.status;
      baseParams.companyId = userStore.userInfo.companyId;
    } else { // activeTab.value === 'all'
      // “全部会议”视图：强制只显示已发布的，忽略状态下拉框
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
    meetingList.value = response.data.records;
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
const checkEditPermission = (meeting) => {
  const userInfo = userStore.userInfo;
  if (!userInfo) return false;
  if (userInfo.userType === 2) return true;
  if (userInfo.id === meeting.creatorId) return true;
  if (userInfo.companyRole === 2 && userInfo.companyId === meeting.companyId) return true;
  return false;
};
const handleSizeChange = (size) => { pagination.size = size; pagination.current = 1; fetchMeetings(); };
const handleCurrentChange = (page) => { pagination.current = page; fetchMeetings(); };
const onFormSuccess = () => { fetchMeetings(); };

watch(activeTab, () => {
  fetchMeetings();
});
onMounted(() => {
  fetchMeetings();
  fetchCompanies(); // 在组件加载时获取公司列表
});
</script>

<style scoped>
.page-container { padding: 20px; }
.action-bar { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: center; }
.detail-content p { margin-bottom: 12px; font-size: 16px; }
.detail-content .content-box { background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 4px; white-space: pre-wrap; word-break: break-all; }
</style>