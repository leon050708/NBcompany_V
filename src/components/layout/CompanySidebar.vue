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
      <el-icon><DataBoard /></el-icon>
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

    <el-menu-item index="members">
      <el-icon><UserFilled /></el-icon>
      <span>成员管理</span>
    </el-menu-item>
    
    <el-menu-item index="news">
      <el-icon><Document /></el-icon>
      <span>动态管理</span>
    </el-menu-item>

    <el-menu-item index="profile">
      <el-icon><User /></el-icon>
      <span>个人资料</span>
    </el-menu-item>

    <el-menu-item index="test">
      <el-icon><Tools /></el-icon>
      <span>系统测试</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { House, User, Tools, UserFilled, Document, DataBoard, OfficeBuilding, Suitcase } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

// 定义props
const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

// 定义emits
const emit = defineEmits(['menu-select'])

// 菜单选择处理
const handleSelect = (index) => {
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
.company-sidebar {
  height: calc(100vh - 60px);
  border-right: none;
}

.company-sidebar .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #3a4a5a;
}

.company-sidebar .el-menu-item:hover {
  background-color: #263445 !important;
}

.company-sidebar .el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff !important;
}

.company-sidebar .el-icon {
  margin-right: 10px;
  font-size: 16px;
}
</style>
