<template>
  <div class="course-edit-page">
    <el-card>
      <div style="margin-bottom: 16px;">
        <el-button @click="goBack">返回</el-button>
        <span style="font-size: 18px; font-weight: bold; margin-left: 16px;">{{ isEdit ? '编辑课程' : '新建课程' }}</span>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 600px;">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input v-model="form.summary" type="textarea" placeholder="请输入课程简介" />
        </el-form-item>
        <el-form-item label="封面链接" prop="coverImageUrl">
          <el-input v-model="form.coverImageUrl" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="视频链接" prop="courseVideoUrl">
          <el-input v-model="form.courseVideoUrl" placeholder="请输入课程视频URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ isEdit ? '保存修改' : '创建课程' }}</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<!--修改表单-->
<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useCourseStore } from '@/stores/course.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  courseId: {
    type: [String, Number],
    default: null
  }
})
const emit = defineEmits(['back'])

const courseStore = useCourseStore()

const isEdit = computed(() => !!props.courseId)
const formRef = ref()

const form = reactive({
  courseName: '',
  summary: '',
  coverImageUrl: '',
  courseVideoUrl: '',
  sortOrder: 1
})

const rules = {
  courseName: [ { required: true, message: '请输入课程名称', trigger: 'blur' } ],
  summary: [ { required: true, message: '请输入简介', trigger: 'blur' } ],
  coverImageUrl: [ { required: false } ],
  courseVideoUrl: [ { required: false } ],
  sortOrder: [ { required: true, type: 'number', message: '请输入排序', trigger: 'blur' } ]
}

const goBack = () => {
  emit('back')
}

const loadCourse = async () => {
  if (isEdit.value) {
    await courseStore.getCourseDetailAction(props.courseId)
    const c = courseStore.currentCourse
    if (c) {
      form.courseName = c.courseName || ''
      form.summary = c.summary || ''
      form.coverImageUrl = c.coverImageUrl || ''
      form.courseVideoUrl = c.courseVideoUrl || ''
      form.sortOrder = c.sortOrder || 1
    }
  } else {
    // 新建时重置表单
    form.courseName = ''
    form.summary = ''
    form.coverImageUrl = ''
    form.courseVideoUrl = ''
    form.sortOrder = 1
  }
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        await courseStore.updateCourseAction(props.courseId, { ...form })
        ElMessage.success('修改成功')
      } else {
        await courseStore.createCourseAction({ ...form })
        ElMessage.success('创建成功')
      }
      emit('back')
    } catch (err) {
      // 错误已在 store 处理
    }
  })
}

onMounted(() => {
  loadCourse()
})

watch(() => props.courseId, () => {
  loadCourse()
})
</script>

<style scoped>
.course-edit-page {
  padding: 24px;
}
</style> 