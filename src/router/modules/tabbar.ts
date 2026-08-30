import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/PlaceholderView.vue'),
    meta: {
      title: '首页',
      icon: 'wap-home-o',
      keepAlive: true,
    },
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/PlaceholderView.vue'),
    meta: {
      title: '分类',
      icon: 'apps-o',
      keepAlive: true,
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/PlaceholderView.vue'),
    meta: {
      title: '购物车',
      icon: 'cart-o',
      keepAlive: true,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/PlaceholderView.vue'),
    meta: {
      title: '我的',
      icon: 'user-o',
      keepAlive: true,
    },
  },
] satisfies RouteRecordRaw[];
