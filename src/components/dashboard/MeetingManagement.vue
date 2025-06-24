<template>
  <div class="meeting-management">
    <el-card>
      <el-form :model="searchParams" inline>
        <el-form-item label="会议名称">
          <el-input v-model="searchParams.meetingName" placeholder="会议名称" clearable />
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="searchParams.creatorName" placeholder="创建人姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-bar">
        <el-button type="primary" @click="handleCreate">新建会议</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedMeetings.length === 0">
          批量删除
        </el-button>
      </div>

      <el-table
          v-loading="loading"
          :data="meetingList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="meetingName" label="会议名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">{{ formatDateTime(scope.row.startTime) }}</template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">{{ formatDateTime(scope.row.endTime) }}</template>
        </el-table-column>
        <el-table-column prop="creatorName" label="创建人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
            <el-button
                v-if="checkEditPermission(scope.row)"
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                v-if="checkEditPermission(scope.row)"
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-if="pagination.total > 0"
          class="pagination-container"
          :current-page="pagination.current"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </el-card>

    <MeetingForm
        v-model:visible="formDialogVisible"
        :meeting-data="currentMeeting"
        @success="onFormSuccess"
    />

    <el-dialog v-model="detailDialogVisible" title="会议详情" width="50%">
      <div v-if="currentMeeting" class="detail-content">
        <p><strong>会议名称:</strong> {{ currentMeeting.meetingName }}</p>
        <p><strong>会议地点:</strong> {{ currentMeeting.location }}</p>
        <p><strong>主办单位:</strong> {{ currentMeeting.organizer }}</p>
        <p><strong>开始时间:</strong> {{ formatDateTime(currentMeeting.startTime) }}</p>
        <p><strong>结束时间:</strong> {{ formatDateTime(currentMeeting.endTime) }}</p>
        <p><strong>创建人:</strong> {{ currentMeeting.creatorName }}</p>
        <p><strong>会议内容:</strong></p>
        <div class="content-box">{{ currentMeeting.content }}</div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getMeetingList, deleteMeeting } from '@/api/meeting'
import MeetingForm from '@/components/meeting/MeetingForm.vue'

const userStore = useUserStore()

const loading = ref(false)
const meetingList = ref([])
const searchParams = reactive({
  meetingName: '',
  creatorName: '',
})
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const selectedMeetings = ref([])

// 弹窗控制
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentMeeting = ref(null)

const fetchMeetings = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      ...searchParams,
    }
    const response = await getMeetingList(params)
    meetingList.value = response.data.records
    pagination.total = response.data.total
  } catch (error) {
    console.error('获取会议列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString()
}

const getStatusText = (status) => {
  // 0:待审核, 1:已发布/审核通过, 2:审核未通过
  switch (status) {
    case 0: return '待审核'
    case 1: return '已发布'
    case 2: return '未通过'
    default: return '未知'
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}


const handleSearch = () => {
  pagination.current = 1
  fetchMeetings()
}

const resetSearch = () => {
  searchParams.meetingName = ''
  searchParams.creatorName = ''
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedMeetings.value = selection
}

const handleCreate = () => {
  currentMeeting.value = null
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  currentMeeting.value = { ...row }
  formDialogVisible.value = true
}

const handleDetail = (row) => {
  currentMeeting.value = { ...row }
  detailDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除会议 "${row.meetingName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      await deleteMeeting(row.id)
      ElMessage.success('删除成功')
      fetchMeetings()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedMeetings.value.length === 0) {
    ElMessage.warning('请至少选择一个会议进行删除')
    return
  }
  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedMeetings.value.length} 个会议吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      const deletePromises = selectedMeetings.value.map(meeting => deleteMeeting(meeting.id))
      await Promise.all(deletePromises)
      ElMessage.success('批量删除成功')
      fetchMeetings()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const checkEditPermission = (meeting) => {
  const userInfo = userStore.userInfo
  if (!userInfo) return false
  // 1. 平台管理员
  if (userInfo.userType === 2) return true
  // 2. 会议创建者
  if (userInfo.id === meeting.creatorId) return true
  // 3. 对应公司的企业管理员
  if (userInfo.companyRole === 2 && userInfo.companyId === meeting.companyId) return true

  return false
}

const handleSizeChange = (size) => {
  pagination.size = size
  fetchMeetings()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  fetchMeetings()
}

const onFormSuccess = () => {
  fetchMeetings()
}

onMounted(() => {
  fetchMeetings()
})
</script>

<style scoped>
.meeting-management {
  padding: 20px;
}
.action-bar {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.detail-content p {
  margin-bottom: 12px;
  font-size: 16px;
}
.detail-content .content-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>