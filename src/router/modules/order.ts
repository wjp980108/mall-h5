import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/orders',
  name: 'MyOrders',
  component: () => import('@/views/order/index.vue'),
  meta: { title: '我的订单' },
} satisfies RouteRecordRaw;
