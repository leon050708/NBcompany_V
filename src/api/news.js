import request from '@/utils/request'

/**
 * 获取行业动态列表
 * @param {object} params 查询参数，例如 { page, size, title, status, ... }
 */
export function getNewsList(params) {
  // 修正：移除了 '/v1'
  return request({
    url: '/news',
    method: 'get',
    params
  })
}

/**
 * 获取单个行业动态详情
 * @param {number} newsId 动态ID
 */
export function getNewsDetails(newsId) {
  // 修正：移除了 '/v1'
  return request({
    url: `/news/${newsId}`,
    method: 'get'
  })
}

/**
 * 发布新的行业动态
 * @param {object} data 动态数据，例如 { title, content, summary, ... }
 */
export function createNews(data) {
  // 修正：移除了 '/v1'
  return request({
    url: '/news',
    method: 'post',
    data
  })
}

/**
 * 编辑行业动态
 * @param {number} newsId 动态ID
 * @param {object} data 动态数据
 */
export function updateNews(newsId, data) {
  // 修正：移除了 '/v1'
  return request({
    url: `/news/${newsId}`,
    method: 'put',
    data
  })
}

/**
 * 删除行业动态
 * @param {number} newsId 动态ID
 */
export function deleteNews(newsId) {
  // 修正：移除了 '/v1'
  return request({
    url: `/news/${newsId}`,
    method: 'delete'
  })
}

/**
 * 审核行业动态 (仅限平台管理员)
 * @param {number} newsId 动态ID
 * @param {object} data 审核状态，例如 { status: 1 }
 */
export function auditNews(newsId, data) {
  // 修正：根据你的SecurityConfig，管理员路径没有/v1前缀
  // 并且，原始文档路径为 /api/v1/admin/news/{newsId}/status，但你的SecurityConfig中是/api/admin/**
  // 所以我们使用 /admin/news/...
  return request({
    url: `/admin/news/${newsId}/status`,
    method: 'put',
    data
  })
}