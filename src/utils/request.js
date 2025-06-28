import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 使用相对路径，通过Vite代理转发
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 在请求头中添加token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果是文件下载（blob响应），直接返回原始响应
    if (response.config.responseType === 'blob') {
      return response
    }
    
    const { code, message, data } = response.data
    
    // 如果响应成功
    if (code === 200) {
      return response.data
    } else {
      // 业务错误
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 如果是文件下载错误，特殊处理
    if (error.config?.responseType === 'blob') {
      ElMessage.error('文件下载失败，请重试')
      return Promise.reject(error)
    }
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // token过期或无效
          ElMessage.error('登录已过期，请重新登录')
          // 清除用户信息和token
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          // 跳转到登录页
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service 