import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCourseList,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  auditCourse,
  exportCourses
} from '@/api/course'
import { ElMessage } from 'element-plus'

export const useCourseStore = defineStore('course', () => {
  // 状态
  const courseList = ref([])
  const pageNum = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const currentCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 获取课程列表
  const getCourseListAction = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await getCourseList({
        pageNum: params.pageNum || pageNum.value,
        pageSize: params.pageSize || pageSize.value,
        ...params
      })
      // 兼容后端返回格式
      if (response.data) {
        courseList.value = response.data.records || response.data.list || response.data.rows || []
        total.value = response.data.total || response.data.count || 0
      } else {
        courseList.value = []
        total.value = 0
      }
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 获取课程详情
  const getCourseDetailAction = async (courseId) => {
    loading.value = true
    error.value = null
    try {
      const response = await getCourseDetail(courseId)
      currentCourse.value = response.data || null
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 创建课程
  const createCourseAction = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await createCourse(data)
      return response
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // 编辑课程
  const updateCourseAction = async (courseId, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await updateCourse(courseId, data)
      return response
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除课程
  const deleteCourseAction = async (courseId) => {
    loading.value = true
    error.value = null
    try {
      const response = await deleteCourse(courseId)
      return response
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // 审核课程
  const auditCourseAction = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await auditCourse(data)
      return response
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // 导出课程
  const exportCoursesAction = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await exportCourses(params)
      
      // 检查响应状态
      if (response.status !== 200) {
        throw new Error('导出失败')
      }
      
      // 从响应头中获取文件名
      const contentDisposition = response.headers['content-disposition']
      let filename = '课程列表.xlsx'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
        }
      }
      
      // 处理文件下载（excel）
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('导出成功')
    } catch (err) {
      error.value = err
      console.error('导出失败:', err)
      ElMessage.error('导出失败，请重试')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    courseList,
    pageNum,
    pageSize,
    total,
    currentCourse,
    loading,
    error,
    getCourseListAction,
    getCourseDetailAction,
    createCourseAction,
    updateCourseAction,
    deleteCourseAction,
    auditCourseAction,
    exportCoursesAction
  }
})
