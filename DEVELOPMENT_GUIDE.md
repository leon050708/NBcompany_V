# 企业管理系统前端开发指南

## 项目概述

本项目是一个基于 Vue 3 的企业管理系统前端，支持三种用户角色：
- **普通用户** (userType=1, companyRole=1)
- **企业管理员** (userType=1, companyRole=2) 
- **平台管理员** (userType=2)

## 文件结构说明

### 1. 用户类型定义

在 `src/constants/index.js` 中定义了用户类型常量：

```javascript
// 用户类型
export const USER_TYPES = {
  NORMAL_USER: 1,    // 普通用户
  PLATFORM_ADMIN: 2  // 平台管理员
}

// 公司角色
export const COMPANY_ROLES = {
  NORMAL_USER: 1,    // 普通用户
  COMPANY_ADMIN: 2   // 企业管理员
}
```

### 2. 页面文件结构

#### 认证相关页面
```
src/views/auth/
├── Login.vue              # 登录页面
├── Register.vue           # 用户注册页面
└── CompanyRegister.vue    # 企业注册页面
```

#### 仪表板页面
```
src/views/dashboard/
├── UserDashboard.vue      # 普通用户仪表板
├── CompanyDashboard.vue   # 企业管理员仪表板
└── AdminDashboard.vue     # 平台管理员仪表板
```

#### 仪表板组件
```
src/components/dashboard/
├── UserOverview.vue       # 普通用户概览组件
├── CompanyOverview.vue    # 企业管理员概览组件
├── AdminOverview.vue      # 平台管理员概览组件
├── CompanyManagement.vue  # 企业管理组件
├── UserProfile.vue        # 个人资料组件
└── TestPage.vue          # 测试页面组件
```

#### 侧边栏组件
```
src/components/layout/
├── UserSidebar.vue        # 普通用户侧边栏
├── CompanySidebar.vue     # 企业管理员侧边栏
└── AdminSidebar.vue       # 平台管理员侧边栏
```

### 3. 路由配置

在 `src/router/index.js` 中配置了路由规则：

```javascript
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register', 
    component: () => import('@/views/auth/Register.vue')
  },
  {
    path: '/company-register',
    name: 'CompanyRegister',
    component: () => import('@/views/auth/CompanyRegister.vue')
  },
  {
    path: '/user-dashboard',
    name: 'UserDashboard',
    component: () => import('@/views/dashboard/UserDashboard.vue'),
    meta: { requiresAuth: true, userType: 1, companyRole: 1 }
  },
  {
    path: '/company-dashboard', 
    name: 'CompanyDashboard',
    component: () => import('@/views/dashboard/CompanyDashboard.vue'),
    meta: { requiresAuth: true, userType: 1, companyRole: 2 }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard', 
    component: () => import('@/views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true, userType: 2 }
  }
]
```

## 用户类型与页面对应关系

### 普通用户 (userType=1, companyRole=1)
- **登录后跳转页面**: `/user-dashboard`
- **主页面文件**: `src/views/dashboard/UserDashboard.vue`
- **侧边栏组件**: `src/components/layout/UserSidebar.vue`
- **概览组件**: `src/components/dashboard/UserOverview.vue`

### 企业管理员 (userType=1, companyRole=2)
- **登录后跳转页面**: `/company-dashboard`
- **主页面文件**: `src/views/dashboard/CompanyDashboard.vue`
- **侧边栏组件**: `src/components/layout/CompanySidebar.vue`
- **概览组件**: `src/components/dashboard/CompanyOverview.vue`

### 平台管理员 (userType=2)
- **登录后跳转页面**: `/admin-dashboard`
- **主页面文件**: `src/views/dashboard/AdminDashboard.vue`
- **侧边栏组件**: `src/components/layout/AdminSidebar.vue`
- **概览组件**: `src/components/dashboard/AdminOverview.vue`

## 开发规范

### 1. 添加新页面

#### 步骤1: 创建页面文件
在对应的目录下创建新的 Vue 组件文件。

#### 步骤2: 配置路由
在 `src/router/index.js` 中添加路由配置：

```javascript
{
  path: '/your-page',
  name: 'YourPage',
  component: () => import('@/views/your-path/YourPage.vue'),
  meta: { 
    requiresAuth: true, 
    userType: 1,        // 允许的用户类型
    companyRole: 1      // 允许的公司角色（可选）
  }
}
```

#### 步骤3: 添加菜单项
在对应的侧边栏组件中添加菜单项：

```vue
<template>
  <router-link to="/your-page" class="menu-item">
    <span>页面名称</span>
  </router-link>
</template>
```

### 2. 权限控制

#### 路由守卫
在 `src/router/index.js` 中已配置路由守卫，会根据用户类型和公司角色进行权限控制。

#### 组件内权限检查
在组件中使用以下方式检查权限：

```javascript
import { useUserStore } from '@/stores/user'
import { USER_TYPES, COMPANY_ROLES } from '@/constants'

const userStore = useUserStore()

// 检查是否为平台管理员
const isPlatformAdmin = userStore.userType === USER_TYPES.PLATFORM_ADMIN

// 检查是否为企业管理员
const isCompanyAdmin = userStore.userType === USER_TYPES.NORMAL_USER && 
                      userStore.companyRole === COMPANY_ROLES.COMPANY_ADMIN

// 检查是否为普通用户
const isNormalUser = userStore.userType === USER_TYPES.NORMAL_USER && 
                    userStore.companyRole === COMPANY_ROLES.NORMAL_USER
```

### 3. 状态管理

用户信息存储在 `src/stores/user.js` 中：

```javascript
// 用户信息结构
{
  id: number,
  username: string,
  email: string,
  phoneNumber: string,
  userType: number,      // 1=普通用户, 2=平台管理员
  companyRole: number,   // 1=普通用户, 2=企业管理员
  companyId: number,
  companyName: string
}
```

### 4. API 请求

API 请求统一通过 `src/utils/request.js` 处理，支持代理配置：

```javascript
// 使用代理的 API 请求
const response = await request.get('/api/v1/companies')

// 直接请求后端（测试用）
const response = await fetch('http://localhost:8080/api/v1/companies')
```

## 开发注意事项

### 1. 文件命名规范
- 页面文件使用 PascalCase: `UserDashboard.vue`
- 组件文件使用 PascalCase: `UserSidebar.vue`
- 工具文件使用 camelCase: `request.js`

### 2. 导入路径规范
- 使用 `@` 别名指向 `src` 目录
- 相对路径导入组件和工具

### 3. 组件开发规范
- 每个页面组件都应该包含对应的侧边栏
- 使用组合式 API (Composition API)
- 统一使用 Pinia 进行状态管理

### 4. 样式规范
- 使用 scoped 样式避免样式冲突
- 全局样式放在 `src/styles/index.css`
- 组件样式使用 CSS 变量保持一致性

## 测试和调试

### 1. 开发服务器
```bash
npm run dev
```

### 2. API 测试
- 使用测试页面 (`/test`) 进行 API 连接测试
- 支持代理和直接连接两种模式

### 3. 用户角色测试
- 使用不同的用户账号测试不同角色的功能
- 检查路由权限是否正确

## 常见问题

### 1. 登录后无法跳转
检查用户类型和公司角色是否正确设置，确保路由守卫逻辑正确。

### 2. API 请求失败
- 检查 Vite 代理配置是否正确
- 确认后端服务是否正常运行
- 查看浏览器控制台错误信息

### 3. 样式问题
- 检查 CSS 类名是否正确
- 确认样式文件是否正确导入
- 检查 scoped 样式是否生效

## 联系信息

如有问题，请联系项目负责人或查看项目 README.md 文件获取更多信息。 