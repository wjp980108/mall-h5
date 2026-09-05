import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
      requiresAuth: false,
      hideInMenu: true,
      hideInTag: true,
    },
    component: () => import('@/views/auth/login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    meta: {
      title: '注册',
      requiresAuth: false,
    },
    component: () => import('@/views/auth/register.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    meta: {
      title: '找回密码',
      requiresAuth: false,
    },
    component: () => import('@/views/auth/forgotPassword.vue'),
  },
  {
    path: '/user-agreement',
    name: 'UserAgreement',
    meta: {
      title: '用户协议',
      requiresAuth: false,
    },
    component: () => import('@/views/legal/userAgreement.vue'),
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    meta: {
      title: '隐私协议',
      requiresAuth: false,
    },
    component: () => import('@/views/legal/privacyPolicy.vue'),
  },
  // {
  //   // 全屏 404：无匹配路由时的兜底目标，不套后台布局、不进菜单
  //   path: '/404',
  //   name: 'NotFound',
  //   component: () => import('@/views/error/404.vue'),
  //   meta: {
  //     title: '404',
  //     hideInMenu: true,
  //     hideInTag: true,
  //   },
  // },
  // {
  //   // 全屏 403：无权限访问的兜底目标，不套后台布局、不进菜单
  //   path: '/403',
  //   name: 'Forbidden',
  //   component: () => import('@/views/error/403.vue'),
  //   meta: {
  //     title: '403',
  //     hideInMenu: true,
  //     hideInTag: true,
  //   },
  // },
  // {
  //   // 全屏 500：服务端异常的兜底目标，不套后台布局、不进菜单
  //   path: '/500',
  //   name: 'ServerError',
  //   component: () => import('@/views/error/500.vue'),
  //   meta: {
  //     title: '500',
  //     hideInMenu: true,
  //     hideInTag: true,
  //   },
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'PathMatch',
    redirect: '/404',
    meta: {
      title: 'pathMatch',
      hideInMenu: true,
      hideInTag: true,
    },
  },
] satisfies Array<RouteRecordRaw>;
