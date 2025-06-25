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

// 管理员获取所有企业列表
export function getAdminCompanyList(params) {
  return request({
    url: '/v1/companies',
    method: 'get',
    params
  })
}

// 管理员审核企业状态
export function updateCompanyStatus(companyId, status) {
  return request({
    url: `/v1/admin/companies/${companyId}/status`,
    method: 'put',
    data: { status }
  })
}

// ==================== 平台超级管理员接口 ====================

/**
 * 获取用户列表 (平台超级管理员)
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUsersList = (params = {}) => {
  return request({
    url: '/v1/admin/users',
    method: 'get',
    params
  })
}

/**
 * 修改用户信息 (平台超级管理员)
 * @param {number} userId - 用户ID
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const updateUser = (userId, data) => {
  return request({
    url: `/v1/admin/users/${userId}`,
    method: 'put',
    data
  })
}

// ==================== 企业管理员接口 ====================

/**
 * 获取企业成员列表
 * @param {number} companyId - 企业ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getCompanyMembers = (companyId, params = {}) => {
  return request({
    url: `/v1/company/${companyId}/members`,
    method: 'get',
    params
  })
}

/**
 * 创建企业成员
 * @param {number} companyId - 企业ID
 * @param {Object} data - 成员信息
 * @returns {Promise}
 */
export const createCompanyMember = (companyId, data) => {
  return request({
    url: `/v1/company/${companyId}/members`,
    method: 'post',
    data
  })
}

/**
 * 修改企业成员角色
 * @param {number} companyId - 企业ID
 * @param {number} memberId - 成员ID
 * @param {Object} data - 角色信息
 * @returns {Promise}
 */
export const updateMemberRole = (companyId, memberId, data) => {
  return request({
    url: `/v1/company/${companyId}/members/${memberId}/role`,
    method: 'put',
    data
  })
}

/**
 * 修改企业成员信息
 * @param {number} companyId - 企业ID
 * @param {number} memberId - 成员ID
 * @param {Object} data - 成员信息
 * @returns {Promise}
 */
export const updateCompanyMember = (companyId, memberId, data) => {
  return request({
    url: `/v1/company/${companyId}/members/${memberId}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业成员
 * @param {number} companyId - 企业ID
 * @param {number} memberId - 成员ID
 * @returns {Promise}
 */
export const deleteCompanyMember = (companyId, memberId) => {
  return request({
    url: `/v1/company/${companyId}/members/${memberId}`,
    method: 'delete'
  })
}

/**
 * 获取企业列表 (平台管理员)
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getCompaniesList = (params = {}) => {
  return request({
    url: '/v1/companies',
    method: 'get',
    params
  })
} 