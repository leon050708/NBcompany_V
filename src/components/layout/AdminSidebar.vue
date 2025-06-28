<template>
  <el-menu
    :default-active="currentView"
    class="admin-sidebar"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    @select="handleSelect"
  >
    <el-menu-item index="dashboard">
      <el-icon><DataBoard /></el-icon>
      <span>仪表板</span>
    </el-menu-item>
    
    <el-menu-item index="users">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
    
    <el-menu-item index="companies">
      <el-icon><OfficeBuilding /></el-icon>
      <span>企业管理</span>
    </el-menu-item>
    
    <el-menu-item index="news">
      <el-icon><Document /></el-icon>
      <span>动态管理</span>
    </el-menu-item>

    <el-menu-item index="profile">
      <el-icon><UserFilled /></el-icon>
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
import { House, User, Tools, OfficeBuilding, Document, DataBoard, User, OfficeBuilding, UserFilled } from '@element-plus/icons-vue'


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
</script>

<style scoped>
.admin-sidebar {
  height: calc(100vh - 60px);
  border-right: none;
}

.admin-sidebar .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #3a4a5a;
}

.admin-sidebar .el-menu-item:hover {
  background-color: #263445 !important;
}

.admin-sidebar .el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff !important;
}

.admin-sidebar .el-icon {
  margin-right: 10px;
  font-size: 16px;
}
</style> 