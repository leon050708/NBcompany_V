// AI API服务
const API_BASE_URL = 'http://localhost/v1/workflows/run'
const API_TOKEN = 'app-CdeqFc8qUBSyNGfRl28ktWcD'

/**
 * 调用AI工作流接口
 * @param {string} userQuery - 用户查询内容
 * @param {string} user - 用户标识
 * @returns {Promise<Object>} AI响应数据
 */
export const callAIWorkflow = async (userQuery, user = 'leon0') => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        inputs: {
          user_query: userQuery
        },
        response_mode: 'blocking',
        user: user
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // 验证响应格式
    if (!data.data || !data.data.outputs || !data.data.outputs.out) {
      throw new Error('无效的API响应格式')
    }

    return {
      success: true,
      data: data.data,
      message: data.data.outputs.out,
      taskId: data.task_id,
      workflowRunId: data.workflow_run_id
    }

  } catch (error) {
    console.error('AI API调用失败:', error)
    return {
      success: false,
      error: error.message,
      message: '抱歉，AI服务暂时不可用，请稍后再试。'
    }
  }
}

/**
 * 检查AI服务状态
 * @returns {Promise<boolean>} 服务是否可用
 */
export const checkAIServiceStatus = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    })
    return response.ok
  } catch (error) {
    console.error('AI服务状态检查失败:', error)
    return false
  }
}

/**
 * 格式化AI响应消息
 * @param {string} message - 原始消息
 * @returns {string} 格式化后的消息
 */
export const formatAIMessage = (message) => {
  if (!message) return ''
  
  // 移除think标签内容（如果存在）
  let formattedMessage = message.replace(/<think>[\s\S]*?<\/think>/g, '')
  
  // 清理多余的空行
  formattedMessage = formattedMessage.replace(/\n\s*\n\s*\n/g, '\n\n')
  
  // 移除开头和结尾的空白
  formattedMessage = formattedMessage.trim()
  
  return formattedMessage
}

/**
 * 解析AI响应中的结构化数据
 * @param {string} message - AI响应消息
 * @returns {Object} 解析后的数据
 */
export const parseAIResponse = (message) => {
  const result = {
    companies: [],
    contacts: [],
    summary: '',
    rawMessage: message
  }

  // 简单的解析逻辑，可以根据实际AI响应格式调整
  if (message.includes('公司') || message.includes('企业')) {
    // 提取公司信息
    const companyMatches = message.match(/\*\*([^*]+)\*\*/g)
    if (companyMatches) {
      result.companies = companyMatches.map(match => match.replace(/\*\*/g, ''))
    }
  }

  // 提取联系人信息
  const contactMatches = message.match(/负责人：([^\n]+)/g)
  if (contactMatches) {
    result.contacts = contactMatches.map(match => match.replace('负责人：', ''))
  }

  // 提取摘要信息
  const summaryMatch = message.match(/我们目前有\s*\*\*(\d+)\*\*\s*条相关的/)
  if (summaryMatch) {
    result.summary = `共找到 ${summaryMatch[1]} 条相关记录`
  }

  return result
} 