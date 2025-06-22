import request from '@/utils/request'

// 企业注册
export function registerCompany(data) {
  return request({
    url: '/v1/auth/register/company',
    method: 'post',
    data
  })
}

// 获取企业列表
export function getCompanyList(params) {
  return request({
    url: '/v1/companies',
    method: 'get',
    params
  })
}

// 用户注册
export function registerUser(data) {
  return request({
    url: '/v1/auth/register/user',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/v1/auth/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getUserProfile() {
  return request({
    url: '/v1/user/profile',
    method: 'get'
  })
}

// 修改用户基本资料
export function updateUserProfile(data) {
  return request({
    url: '/v1/user/profile',
    method: 'put',
    data
  })
}

// 修改用户密码
export function updateUserPassword(data) {
  return request({
    url: '/v1/user/password',
    method: 'put',
    data
  })
} 