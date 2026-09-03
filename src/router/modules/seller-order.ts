import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/seller-orders',
  name: 'SellerOrders',
  component: () => import('@/views/seller-order/index.vue'),
  meta: { title: '我的仓库' },
} satisfies RouteRecordRaw;
