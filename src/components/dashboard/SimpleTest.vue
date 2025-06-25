<template>
  <div class="simple-test">
    <h2>简单测试组件</h2>
    <p>如果您能看到这个组件，说明组件系统正常工作。</p>
    <el-button type="primary" @click="testClick">测试按钮</el-button>
    <p v-if="clicked">按钮点击成功！</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clicked = ref(false)

const testClick = () => {
  clicked.value = true
  console.log('按钮被点击了')
}
</script>

<style scoped>
.simple-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 20px;
}
</style> 