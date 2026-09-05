import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/invite-code',
  name: 'InviteCode',
  component: () => import('@/views/profile/inviteCode.vue'),
  meta: { title: '我的邀请码' },
} satisfies RouteRecordRaw;
