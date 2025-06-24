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
      console.log('登录响应:', response)
      
      // 根据实际返回的数据结构处理
      let newToken, newUserInfo
      
      if (response.data && response.data.data) {
        // 如果数据在 response.data.data 中
        newToken = response.data.data.token
        newUserInfo = response.data.data.userInfo || response.data.data
      } else if (response.data) {
        // 如果数据直接在 response.data 中
        newToken = response.data.token
        newUserInfo = response.data.userInfo || response.data
      } else {
        throw new Error('登录响应数据格式错误')
      }
      
      console.log('原始用户信息:', newUserInfo)
      
      // 确保所有字段都被保存，处理可能的字段名不匹配
      const completeUserInfo = {
        id: newUserInfo.id || newUserInfo.userId,
        username: newUserInfo.username || newUserInfo.userName,
        nickname: newUserInfo.nickname || newUserInfo.nickName || newUserInfo.name,
        phoneNumber: newUserInfo.phoneNumber || newUserInfo.phone || newUserInfo.mobile,
        email: newUserInfo.email || newUserInfo.mail,
        gender: newUserInfo.gender || newUserInfo.sex || 0,
        userType: newUserInfo.userType || newUserInfo.type || 0,
        companyId: newUserInfo.companyId || newUserInfo.company_id,
        companyName: newUserInfo.companyName || newUserInfo.company_name,
        companyRole: newUserInfo.companyRole || newUserInfo.company_role || 0,
        status: newUserInfo.status || 1,
        createdAt: newUserInfo.createdAt || newUserInfo.created_at,
        lastLoginTime: newUserInfo.lastLoginTime || newUserInfo.last_login_time
      }
      
      // 保存token和用户信息
      token.value = newToken
      userInfo.value = completeUserInfo
      
      // 保存到localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('userInfo', JSON.stringify(completeUserInfo))
      
      console.log('保存的用户信息:', completeUserInfo)
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await getUserProfile()
      console.log('获取用户信息响应:', response)
      
      // 根据实际返回的数据结构处理
      let userData
      if (response.data && response.data.data) {
        userData = response.data.data
      } else if (response.data) {
        userData = response.data
      } else {
        throw new Error('获取用户信息响应数据格式错误')
      }
      
      console.log('原始用户数据:', userData)
      
      // 确保所有字段都被保存，处理可能的字段名不匹配
      const completeUserInfo = {
        id: userData.id || userData.userId,
        username: userData.username || userData.userName,
        nickname: userData.nickname || userData.nickName || userData.name,
        phoneNumber: userData.phoneNumber || userData.phone || userData.mobile,
        email: userData.email || userData.mail,
        gender: userData.gender || userData.sex || 0,
        userType: userData.userType || userData.type || 0,
        companyId: userData.companyId || userData.company_id,
        companyName: userData.companyName || userData.company_name,
        companyRole: userData.companyRole || userData.company_role || 0,
        status: userData.status || 1,
        createdAt: userData.createdAt || userData.created_at,
        lastLoginTime: userData.lastLoginTime || userData.last_login_time
      }
      
      userInfo.value = completeUserInfo
      localStorage.setItem('userInfo', JSON.stringify(completeUserInfo))
      
      console.log('更新后的用户信息:', completeUserInfo)
      
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
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
    
    // 详细字段检查
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    console.log('=== 详细字段检查 ===')
    console.log('当前用户信息字段:')
    console.log('- id:', userInfo.value.id)
    console.log('- username:', userInfo.value.username)
    console.log('- nickname:', userInfo.value.nickname)
    console.log('- phoneNumber:', userInfo.value.phoneNumber)
    console.log('- email:', userInfo.value.email)
    console.log('- companyId:', userInfo.value.companyId)
    console.log('- companyName:', userInfo.value.companyName)
    
    console.log('localStorage中的用户信息字段:')
    console.log('- id:', storedUserInfo.id)
    console.log('- username:', storedUserInfo.username)
    console.log('- nickname:', storedUserInfo.nickname)
    console.log('- phoneNumber:', storedUserInfo.phoneNumber)
    console.log('- email:', storedUserInfo.email)
    console.log('- companyId:', storedUserInfo.companyId)
    console.log('- companyName:', storedUserInfo.companyName)
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