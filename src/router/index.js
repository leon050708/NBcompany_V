import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/company-register',
    name: 'CompanyRegister',
    component: () => import('@/views/auth/CompanyRegister.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: () => import('@/views/dashboard/UserDashboard.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/company-dashboard',
    name: 'CompanyDashboard',
    component: () => import('@/views/dashboard/CompanyDashboard.vue'),
    meta: { requiresAuth: true, roles: ['company_admin'] }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/dashboard/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/dashboard/Test.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/test-page',
    name: 'TestPage',
    component: () => import('@/views/TestPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: () => import('@/components/course/CourseList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: () => import('@/components/course/CourseDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/create',
    name: 'CourseCreate',
    component: () => import('@/components/course/CourseEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/edit/:id',
    name: 'CourseEdit',
    component: () => import('@/components/course/CourseEdit.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  
  console.log('=== 路由守卫调试信息 ===')
  console.log('目标路由:', to.path)
  console.log('是否已登录:', isLoggedIn)
  console.log('用户信息:', userStore.userInfo)
  
  // 不需要认证的页面
  if (!to.meta.requiresAuth) {
    console.log('不需要认证的页面，直接通过')
    next()
    return
  }
  
  // 需要认证但未登录
  if (!isLoggedIn) {
    console.log('未登录，跳转到登录页')
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles) {
    const userRole = getUserRole(userStore.userInfo)
    console.log('用户角色:', userRole)
    console.log('页面要求角色:', to.meta.roles)
    
    if (!to.meta.roles.includes(userRole)) {
      // 角色不匹配，重定向到对应的首页
      const targetRoute = getTargetRouteByRole(userRole)
      console.log('角色不匹配，重定向到:', targetRoute)
      next(targetRoute)
      return
    }
  }
  
  console.log('权限检查通过，允许访问')
  next()
})

// 获取用户角色
function getUserRole(userInfo) {
  if (!userInfo) return 'user'
  
  if (userInfo.userType === 2) {
    return 'admin' // 平台管理员
  } else if (userInfo.userType === 1 && userInfo.companyRole === 2) {
    return 'company_admin' // 企业管理员
  } else if (userInfo.userType === 1 && userInfo.companyRole === 1) {
    return 'user' // 普通用户
  } else {
    return 'user' // 默认普通用户
  }
}

// 根据角色获取目标路由
function getTargetRouteByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin-dashboard'
    case 'company_admin':
      return '/company-dashboard'
    case 'user':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}

export default router 