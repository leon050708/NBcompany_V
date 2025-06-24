// 用户类型常量
export const USER_TYPES = {
  NORMAL: 1,      // 普通用户
  ADMIN: 2        // 平台管理员
}

// 公司角色常量
export const COMPANY_ROLES = {
  NORMAL: 1,      // 普通员工
  ADMIN: 2        // 企业管理员
}

// 用户角色常量
export const USER_ROLES = {
  USER: 'user',           // 普通用户
  COMPANY_ADMIN: 'company_admin',  // 企业管理员
  ADMIN: 'admin'          // 平台管理员
}

// 企业状态常量
export const COMPANY_STATUS = {
  PENDING: 0,     // 待审核
  ACTIVE: 1,      // 正常
  SUSPENDED: 2    // 禁用
}

// API 基础路径
export const API_BASE_URL = '/api'

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} 