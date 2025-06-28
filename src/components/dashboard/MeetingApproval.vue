<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>会议审核</h2>
          <p>这里列出了所有等待您审核的会议。</p>
        </div>
      </template>

      <el-form :model="searchParams" inline>
        <el-form-item label="会议名称">
          <el-input v-model="searchParams.meetingName" placeholder="按会议名称搜索" clearable @keyup.enter="fetchPendingMeetings" />
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="searchParams.creatorName" placeholder="按申请人搜索" clearable @keyup.enter="fetchPendingMeetings" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPendingMeetings" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="pendingMeetings" v-loading="loading" style="width: 100%">
        <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="creatorName" label="申请人" width="120" />
        <el-table-column prop="companyName" label="所属公司" width="180" />
        <el-table-column label="申请时间" width="180">
          <template #default="scope">{{ new Date(scope.row.createdAt).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="isPlatformAdmin">
              <el-button size="small" type="success" @click="handleReview(scope.row, 1)" :loading="scope.row.reviewing">通过</el-button>
              <el-button size="small" type="danger" @click="handleReview(scope.row, 2)" :loading="scope.row.reviewing">驳回</el-button>
            </template>
            <span v-else>无操作权限</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="pagination.total > 0" style="margin-top: 20px; justify-content: center;"
                     :current-page="pagination.current"
                     :page-size="pagination.size"
                     :page-sizes="[10, 20, 50]"
                     :total="pagination.total"
                     layout="total, sizes, prev, pager, next, jumper"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,computed} from 'vue';
import { useUserStore } from '@/stores/user';
import { getMeetingList, updateMeetingStatus } from '@/api/meeting';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const userStore = useUserStore();
const isPlatformAdmin = computed(() => userStore.userInfo?.userType === 2);
const loading = ref(false);
const pendingMeetings = ref([]);
const searchParams = reactive({ meetingName: '', creatorName: '' });
const pagination = reactive({ current: 1, size: 10, total: 0 });

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

onMounted(fetchPendingMeetings);
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.card-header p {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
</style>