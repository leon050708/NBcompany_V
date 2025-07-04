<template>
  <div class="floating-ai-container">
    <!-- 悬浮按钮 -->
    <div 
      class="floating-button"
      @click="toggleChat"
      :class="{ 'active': isOpen }"
    >
      <i class="el-icon-chat-dot-round" v-if="!isOpen">🤖</i>
      <i class="el-icon-close" v-else>✕</i>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="isOpen" :class="{ 'slide-in': isOpen }">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="ai-avatar">🤖</div>
        <div class="chat-title">
          <h3>AI 助手</h3>
          <span class="status" :class="{ 'online': isConnected }">
            {{ isConnected ? '在线' : '离线' }}
          </span>
        </div>
        <button class="close-btn" @click="toggleChat">✕</button>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message"
          :class="message.type"
        >
          <div class="message-avatar">
            {{ message.type === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 快捷问题 -->
        <div v-if="messages.length === 1 && !isLoading" class="quick-questions">
          <div class="quick-title">💡 您可以问我：</div>
          <div class="quick-buttons">
            <button 
              v-for="question in quickQuestions" 
              :key="question"
              @click="sendQuickQuestion(question)"
              class="quick-btn"
            >
              {{ question }}
            </button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message ai">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <textarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            placeholder="输入您的问题..."
            rows="1"
            ref="inputArea"
            class="message-input"
          ></textarea>
          <button 
            @click="sendMessage" 
            class="send-btn"
            :disabled="!userInput.trim() || isLoading"
          >
            <i class="el-icon-s-promotion">📤</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { callAIWorkflow, checkAIServiceStatus, formatAIMessage } from '../api/ai.js'

// 响应式数据
const isOpen = ref(false)
const userInput = ref('')
const messages = ref([
  {
    type: 'ai',
    content: '您好！我是您的AI助手，有什么可以帮助您的吗？',
    timestamp: new Date()
  }
])
const isLoading = ref(false)
const isConnected = ref(true)
const messagesContainer = ref(null)
const inputArea = ref(null)

// 快捷问题
const quickQuestions = ref([
  '有什么公司（消息）',
  '查看所有企业信息',
  '最新的公司动态',
  '企业联系方式'
])

// 切换聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputArea.value?.focus()
    })
  }
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message,
    timestamp: new Date()
  })

  userInput.value = ''
  isLoading.value = true

  try {
    // 调用AI API
    const result = await callAIWorkflow(message)
    
    if (result.success) {
      // 格式化AI响应
      const formattedMessage = formatAIMessage(result.message)
      messages.value.push({
        type: 'ai',
        content: formattedMessage,
        timestamp: new Date()
      })
    } else {
      throw new Error(result.error || 'AI服务调用失败')
    }

  } catch (error) {
    console.error('AI API调用失败:', error)
    messages.value.push({
      type: 'ai',
      content: '抱歉，我暂时无法回答您的问题。请稍后再试。',
      timestamp: new Date()
    })
    ElMessage.error('AI服务暂时不可用')
  } finally {
    isLoading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化消息内容
const formatMessage = (content) => {
  // 将换行符转换为HTML
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 发送快捷问题
const sendQuickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

// 组件挂载后初始化
onMounted(async () => {
  // 检查AI服务状态
  try {
    const status = await checkAIServiceStatus()
    isConnected.value = status
    if (!status) {
      ElMessage.warning('AI服务暂时不可用')
    }
  } catch (error) {
    console.error('AI服务状态检查失败:', error)
    isConnected.value = false
  }
})
</script>

<style scoped>
.floating-ai-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.floating-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  font-size: 24px;
  user-select: none;
}

.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.floating-button.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scale(1.1);
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title {
  flex: 1;
}

.chat-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  opacity: 0.8;
}

.status.online {
  color: #4ade80;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fafc;
}

.quick-questions {
  margin: 16px 0;
  animation: fadeIn 0.5s ease-out;
}

.quick-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
  font-weight: 500;
}

.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.message.ai .message-content {
  background: white;
  color: #374151;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #e5e7eb;
}

.message-content {
  max-width: 280px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  max-height: 100px;
  min-height: 44px;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 40px);
    right: -10px;
  }
  
  .message-content {
    max-width: calc(100% - 60px);
  }
}
</style> 