import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/address',
    name: 'AddressList',
    component: () => import('@/views/address/index.vue'),
    meta: { title: '我的地址' },
  },
  {
    path: '/address/add',
    name: 'AddressCreate',
    component: () => import('@/views/address/edit.vue'),
    meta: { title: '新增地址' },
  },
  {
    path: '/address/edit/:id',
    name: 'AddressEdit',
    component: () => import('@/views/address/edit.vue'),
    meta: { title: '编辑地址' },
  },
] satisfies RouteRecordRaw[];
