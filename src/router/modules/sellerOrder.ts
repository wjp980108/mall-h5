import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/seller-orders',
  name: 'SellerOrders',
  component: () => import('@/views/order/seller.vue'),
  meta: { title: '我的仓库' },
} satisfies RouteRecordRaw;
