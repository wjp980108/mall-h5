import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/orders/:id',
    name: 'RobOrderDetail',
    component: () => import('@/views/order/detail.vue'),
    meta: { title: '订单详情' },
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => import('@/views/order/index.vue'),
    meta: { title: '我的订单' },
  },
] satisfies RouteRecordRaw[];
