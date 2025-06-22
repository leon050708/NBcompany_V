import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserProfile } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const loginAction = async (loginData) => {
    try {
      const response = await login(loginData)
      const { token: newToken, userInfo: newUserInfo } = response.data
      
      // 保存token和用户信息
      token.value = newToken
      userInfo.value = newUserInfo
      
      // 保存到localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
      
      return response
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await getUserProfile()
      userInfo.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      return response
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  // 检查权限
  const hasPermission = (permission) => {
    if (!isLoggedIn.value) return false
    
    // 平台超级管理员拥有所有权限
    if (userInfo.value.userType === 2) return true
    
    // 企业管理员权限检查
    if (permission === 'company_admin') {
      return userInfo.value.companyRole === 2
    }
    
    return false
  }

  // 调试方法：在控制台查看token和用户信息
  const debugInfo = () => {
    console.log('=== 用户状态调试信息 ===')
    console.log('Token:', token.value)
    console.log('Token (localStorage):', localStorage.getItem('token'))
    console.log('用户信息:', userInfo.value)
    console.log('用户信息 (localStorage):', JSON.parse(localStorage.getItem('userInfo') || '{}'))
    console.log('是否已登录:', isLoggedIn.value)
    console.log('========================')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    getUserInfo,
    logout,
    updateUserInfo,
    hasPermission,
    debugInfo
  }
}) 