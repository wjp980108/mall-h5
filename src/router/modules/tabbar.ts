import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      icon: 'wap-home-o',
      keepAlive: true,
    },
  },
  {
    path: '/flash-sale',
    name: 'FlashSale',
    component: () => import('@/views/flash-sale/index.vue'),
    meta: {
      title: '抢购',
      icon: 'fire-o',
      keepAlive: true,
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/index.vue'),
    meta: {
      title: '购物车',
      icon: 'cart-o',
      keepAlive: true,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: {
      title: '我的',
      icon: 'user-o',
      keepAlive: true,
    },
  },
] satisfies RouteRecordRaw[];
