<template>
  <el-dialog
      :model-value="visible"
      :title="isEditMode ? '编辑会议' : '新建会议'"
      width="60%"
      @close="handleClose"
      :close-on-click-modal="false"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
    >
      <el-form-item label="会议名称" prop="meetingName">
        <el-input v-model="form.meetingName" placeholder="请输入会议名称" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="封面图片URL" prop="coverImageUrl">
        <el-input v-model="form.coverImageUrl" placeholder="请输入封面图片URL（可选）" />
      </el-form-item>
      <el-form-item label="会议地点" prop="location">
        <el-input v-model="form.location" placeholder="请输入会议地点（可选）" />
      </el-form-item>
      <el-form-item label="主办单位" prop="organizer">
        <el-input v-model="form.organizer" placeholder="请输入主办单位（可选）" />
      </el-form-item>
      <el-form-item label="会议内容" prop="content">
        <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入会议内容（富文本内容）"
        />
      </el-form-item>
      <el-form-item label="会议议程" prop="agenda">
        <el-input
            v-model="form.agenda"
            type="textarea"
            :rows="3"
            placeholder="请输入会议议程（可选，富文本）"
        />
      </el-form-item>
      <el-form-item label="演讲者" prop="speakers">
        <el-input
            v-model="form.speakers"
            type="textarea"
            :rows="3"
            placeholder="请输入演讲者信息（可选，富文本）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEditMode ? '保存' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { createMeeting, updateMeeting } from '@/api/meeting'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  meetingData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const loading = ref(false)
const isEditMode = ref(false)

const form = reactive({
  id: null,
  meetingName: '',
  startTime: '',
  endTime: '',
  coverImageUrl: '',
  content: '',
  location: '',
  organizer: '',
  agenda: '',
  speakers: '',
})

const rules = reactive({
  meetingName: [{ required: true, message: '请输入会议名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入会议内容', trigger: 'blur' }],
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formRef.value?.resetFields()
    if (props.meetingData && props.meetingData.id) {
      isEditMode.value = true
      Object.assign(form, props.meetingData)
    } else {
      isEditMode.value = false
      Object.assign(form, {
        id: null,
        meetingName: '',
        startTime: '',
        endTime: '',
        coverImageUrl: '',
        content: '',
        location: '',
        organizer: '',
        agenda: '',
        speakers: '',
      })
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    
    // 构建提交数据，只包含有值的字段
    const submitData = {}
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
        submitData[key] = form[key]
      }
    })
    
    // 移除id字段，因为创建时不需要
    if (!isEditMode.value) {
      delete submitData.id
    }
    
    if (isEditMode.value) {
      await updateMeeting(form.id, submitData)
      ElMessage.success('会议更新成功')
    } else {
      await createMeeting(submitData)
      ElMessage.success('会议创建成功')
    }
    emit('success')
    handleClose()
  } catch (error) {
    console.error('操作失败:', error)
    // ElMessage.error(error.message || '操作失败') // request.js中已处理
  } finally {
    loading.value = false
  }
}
</script>