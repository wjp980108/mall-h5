import type { RouteRecordRaw } from 'vue-router';

export default {
  path: '/notice/:id',
  name: 'NoticeDetail',
  component: () => import('@/views/notice/detail.vue'),
  meta: { title: '公告详情' },
} satisfies RouteRecordRaw;
