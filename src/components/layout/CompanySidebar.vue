<template>
  <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleMenuSelect"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
  >
    <el-menu-item index="dashboard">
      <el-icon><House /></el-icon>
      <span>仪表板</span>
    </el-menu-item>

    <el-menu-item index="companies">
      <el-icon><OfficeBuilding /></el-icon>
      <span>企业管理</span>
    </el-menu-item>

    <el-sub-menu index="meetings-group">
      <template #title>
        <el-icon><Suitcase /></el-icon>
        <span>会议管理</span>
      </template>
      <el-menu-item index="meetings/list">会议列表</el-menu-item>
      <el-menu-item v-if="canManageMeetings" index="meetings/approval">
        会议审核
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="profile">
      <el-icon><User /></el-icon>
      <span>个人资料</span>
    </el-menu-item>

    <el-menu-item index="test">
      <el-icon><Tools /></el-icon>
      <span>测试页面</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
// vvv 1. 导入新图标和用户状态管理 vvv
import { House, User, Tools, OfficeBuilding, Suitcase } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
// ^^^ 导入结束 ^^^

// vvv 2. 获取 userStore 实例 vvv
const userStore = useUserStore()
// ^^^ 获取结束 ^^^

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['menu-select'])

const activeMenu = computed(() => props.currentView)

const handleMenuSelect = (index) => {
  emit('menu-select', index)
}

// vvv 3. 添加权限判断的计算属性 vvv
const canManageMeetings = computed(() => {
  const userInfo = userStore.userInfo;
  // 平台管理员(userType=2) 或 企业管理员(companyRole=2) 才有审核权限
  return userInfo?.userType === 2 || userInfo?.companyRole === 2;
})
// ^^^ 添加结束 ^^^
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #1890ff;
}
</style>
