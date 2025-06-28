<template>
  <div class="course-detail-page">
    <el-card v-if="course">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <el-button @click="goBack">返回列表</el-button>
        </div>
        <div>
          <el-button type="primary" v-if="canEdit" @click="handleEdit">编辑</el-button>
          <el-button type="danger" v-if="canDelete" @click="handleDelete">删除</el-button>
          <el-button type="warning" v-if="canAudit" @click="showAuditDialog = true">审核</el-button>
        </div>
      </div>
      <el-descriptions title="课程详情" :column="2" border>
        <el-descriptions-item label="ID">{{ course.id }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ course.courseName }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ course.authorName }}</el-descriptions-item>
        <el-descriptions-item label="企业">{{ course.companyName }}</el-descriptions-item>
        <el-descriptions-item label="浏览量">{{ course.viewCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="course.status === 0" type="info">待审核</el-tag>
          <el-tag v-else-if="course.status === 1" type="success">已发布</el-tag>
          <el-tag v-else-if="course.status === 2" type="danger">未通过</el-tag>
          <el-tag v-else>未知</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ course.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ course.summary }}</el-descriptions-item>
        <el-descriptions-item label="封面">
          <el-image v-if="course.coverImageUrl" :src="course.coverImageUrl" style="width: 120px; height: 80px;" fit="cover" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="视频">
          <a v-if="course.courseVideoUrl" :href="course.courseVideoUrl" target="_blank">查看视频</a>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ course.auditRemark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-empty v-else description="未找到课程信息" />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useCourseStore } from '@/stores/course.js'
import { useUserStore } from '@/stores/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true
  }
})
const emit = defineEmits(['back', 'edit-course'])

const courseStore = useCourseStore()
const userStore = useUserStore()

const course = computed(() => courseStore.currentCourse)

// 角色判断
const isPlatformAdmin = computed(() => userStore.userInfo.userType === 2)
const isCompanyAdmin = computed(() => userStore.userInfo.userType === 1 && userStore.userInfo.companyRole === 2)
const isNormalUser = computed(() => userStore.userInfo.userType === 1 && userStore.userInfo.companyRole === 1)

// 权限判断
const canEdit = computed(() => {
  if (!course.value) return false
  if (isPlatformAdmin.value) return true
  if (isCompanyAdmin.value && course.value.companyId === userStore.userInfo.companyId) return true
  if (isNormalUser.value && course.value.authorId === userStore.userInfo.id) return true
  return false
})
const canDelete = canEdit
const canAudit = computed(() => {
  if (!course.value) return false
  if (isPlatformAdmin.value && course.value.status === 0) return true
  if (isCompanyAdmin.value && course.value.companyId === userStore.userInfo.companyId && course.value.status === 0) return true
  return false
})

const goBack = () => {
  emit('back')
}

const handleEdit = () => {
  emit('edit-course', props.courseId)
}
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该课程吗？', '提示', { type: 'warning' })
    .then(async () => {
      await courseStore.deleteCourseAction(course.value.id)
      ElMessage.success('删除成功')
      goBack()
    })
    .catch(() => {})
}

const showAuditDialog = ref(false)
const auditForm = ref({
  status: 1, // 1=通过, 2=驳回
  auditRemark: ''
})

const submitAudit = async () => {
  if (!course.value) return
  try {
    await courseStore.auditCourseAction({
      id: course.value.id,
      status: auditForm.value.status,
      auditRemark: auditForm.value.auditRemark
    })
    ElMessage.success('审核成功')
    showAuditDialog.value = false
    // 刷新详情
    courseStore.getCourseDetailAction(course.value.id)
  } catch (err) {
    // 错误已在 store 处理
  }
}

onMounted(() => {
  if (props.courseId) {
    courseStore.getCourseDetailAction(props.courseId)
  }
})

watch(() => props.courseId, (newId) => {
  if (newId) {
    courseStore.getCourseDetailAction(newId)
  }
})
</script>

<style scoped>
.course-detail-page {
  padding: 24px;
}
</style> 