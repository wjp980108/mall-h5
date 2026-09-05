import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/flash-sale/session/:sessionId',
    name: 'FlashSaleGoods',
    component: () => import('@/views/activity/flashSaleGoods.vue'),
    meta: { title: '抢购商品' },
  },
  {
    path: '/flash-sale/goods/:id',
    name: 'FlashSaleGoodsDetail',
    component: () => import('@/views/activity/flashSaleGoodsDetail.vue'),
    meta: { title: '抢购商品详情' },
  },
] satisfies RouteRecordRaw[];
