import request from '@/utils/request'

// 获取课程列表
export function getCourseList(params) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

// 获取课程详情
export function getCourseDetail(courseId) {
  return request({
    url: `/courses/${courseId}`,
    method: 'get'
  })
}


// 创建新课程
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

// 编辑课程
export function updateCourse(courseId, data) {
  return request({
    url: `/courses/${courseId}`,
    method: 'put',
    data
  })
}

// 删除课程
export function deleteCourse(courseId) {
  return request({
    url: `/courses/${courseId}`,
    method: 'delete'
  })
}

// 审核课程（企业管理员/平台管理员）
export function auditCourse(data) {
  return request({
    url: '/courses/audit',
    method: 'post',
    data
  })
}

// 导出课程列表
export function exportCourses(params) {
  return request({
    url: '/courses/export',
    method: 'get',
    params,
    responseType: 'blob' // 导出为文件
  })
}
