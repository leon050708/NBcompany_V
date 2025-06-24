# 企业管理系统前端

基于 Vue 3 + Element Plus 的企业管理系统前端项目。

## 项目结构

```
src/
├── api/                    # API 接口
│   └── auth.js            # 认证相关接口
├── assets/                 # 静态资源
├── components/             # 组件
│   ├── common/            # 通用组件
│   ├── dashboard/         # 仪表板组件
│   │   ├── AdminOverview.vue
│   │   ├── CompanyManagement.vue
│   │   ├── CompanyOverview.vue
│   │   ├── TestPage.vue
│   │   ├── UserOverview.vue
│   │   └── UserProfile.vue
│   ├── forms/             # 表单组件
│   └── layout/            # 布局组件
│       ├── AdminSidebar.vue
│       ├── CompanySidebar.vue
│       └── UserSidebar.vue
├── constants/              # 常量定义
│   └── index.js
├── router/                 # 路由配置
│   └── index.js
├── stores/                 # 状态管理
│   └── user.js
├── styles/                 # 样式文件
│   └── index.css
├── types/                  # 类型定义
├── utils/                  # 工具函数
│   └── request.js
├── views/                  # 页面
│   ├── auth/              # 认证页面
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── CompanyRegister.vue
│   └── dashboard/         # 仪表板页面
│       ├── AdminDashboard.vue
│       ├── CompanyDashboard.vue
│       ├── UserDashboard.vue
│       ├── Profile.vue
│       └── Test.vue
├── App.vue
└── main.js
```

## 功能特性

- 🔐 用户认证（登录/注册）
- 🏢 企业注册
- 👥 多角色权限管理
  - 普通用户 (userType=1, companyRole=1)
  - 企业管理员 (userType=1, companyRole=2)
  - 平台管理员 (userType=2)
- 📊 仪表板
- 👤 个人资料管理
- 🧪 系统测试功能

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite
