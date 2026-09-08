import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/assets',
  name: 'MyAssets',
  component: () => import('@/views/profile/assets.vue'),
  meta: { title: '我的资产' },
} satisfies RouteRecordRaw;
