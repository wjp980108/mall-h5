import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/profile/settings',
  name: 'ProfileSettings',
  component: () => import('@/views/profile/settings.vue'),
  meta: { title: '个人中心' },
} satisfies RouteRecordRaw;
