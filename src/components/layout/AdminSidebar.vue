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
    
    <el-menu-item index="profile">
      <el-icon><User /></el-icon>
      <span>个人资料</span>
    </el-menu-item>
    
    <el-menu-item index="test">
      <el-icon><Tools /></el-icon>
      <span>测试页面</span>
    </el-menu-item>

    <el-menu-item index="meetings">
      <el-icon><Suitcase /></el-icon>
      <span>会议管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { House, User, Tools, OfficeBuilding } from '@element-plus/icons-vue'

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