import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/payment-management',
  name: 'PaymentManagement',
  component: () => import('@/views/payment-management/index.vue'),
  meta: { title: '收款管理' },
} satisfies RouteRecordRaw;
