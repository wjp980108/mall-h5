import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/product/:id',
  name: 'ProductDetail',
  component: () => import('@/views/product/DetailPlaceholder.vue'),
  meta: { title: '商品详情' },
} satisfies RouteRecordRaw;
