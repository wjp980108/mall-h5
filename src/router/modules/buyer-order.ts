import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/buyer-orders',
    name: 'BuyerOrders',
    component: () => import('@/views/buyer-order/index.vue'),
    meta: { title: '我的仓库' },
  },
  {
    path: '/buyer-orders/:id/payment',
    name: 'BuyerOrderPayment',
    component: () => import('@/views/buyer-order/payment.vue'),
    meta: { title: '付款' },
  },
] satisfies RouteRecordRaw[];
