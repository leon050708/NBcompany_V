import { ref } from 'vue'
import { getCompaniesList } from '@/api/auth'
import { ElMessage } from 'element-plus'

// 企业列表映射
const companiesMap = ref(new Map())

/**
 * 加载企业列表并创建映射
 */
export const loadCompaniesMapping = async () => {
  try {
    console.log('开始加载企业列表映射')
    const response = await getCompaniesList()
    console.log('企业列表API响应:', response)
    
    if (response.code === 200) {
      // 创建企业ID到企业名称的映射
      const companies = response.data.records || response.data || []
      companiesMap.value.clear()
      
      companies.forEach(company => {
        companiesMap.value.set(company.id, company.name || company.companyName)
      })
      
      console.log('企业映射创建成功:', companiesMap.value)
      return true
    } else {
      console.error('获取企业列表失败:', response.message)
      ElMessage.error(response.message || '获取企业列表失败')
      return false
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败，请检查网络连接')
    return false
  }
}

/**
 * 根据企业ID获取企业名称
 * @param {number|string} companyId - 企业ID
 * @returns {string} 企业名称
 */
export const getCompanyName = (companyId) => {
  if (!companyId) return '未设置'
  return companiesMap.value.get(companyId) || '未设置'
}

/**
 * 获取企业映射Map
 * @returns {Map} 企业映射Map
 */
export const getCompaniesMap = () => {
  return companiesMap.value
}

/**
 * 检查企业映射是否已加载
 * @returns {boolean} 是否已加载
 */
export const isCompaniesMappingLoaded = () => {
  return companiesMap.value.size > 0
}

/**
 * 重新加载企业映射
 */
export const reloadCompaniesMapping = async () => {
  return await loadCompaniesMapping()
} 