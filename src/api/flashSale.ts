import type { HomeBanner, HomeNotice } from '@/api/home.ts';
import request from '@/utils/axios';

export interface FlashSaleSession {
  id: number;
  sessionName: string;
  sessionStatus: boolean;
  rushStartTime: string;
  rushEndTime: string;
  maxBuyCount: number;
  bgImg: string | null;
}

export interface FlashSaleGoods {
  id: number;
  goodsName: string;
  goodsPrice: number;
  sessionId: number;
  sessionName: string | null;
  coverImg: string | null;
  detailImg: string | null;
  goodsDetail: string | null;
  goodsStatus: number;
  goodsStatusName: string | null;
  onlineStatus: boolean;
  canPurchase: boolean;
}

export interface FlashSaleGoodsPage {
  list: FlashSaleGoods[];
  total: number;
}

export interface FetchFlashSaleGoodsParams {
  sessionId?: number;
  pageNum: number;
  pageSize: number;
}

export interface PlaceFlashSaleOrderPayload {
  goodsId: number;
  addressId: number;
}

/** 获取抢购专区轮播图。 */
export function fetchFlashSaleBanners() {
  return request<HomeBanner[]>({
    url: '/api/app/banner/enabled',
    method: 'get',
    params: { position: 'seckill' },
  });
}

/** 获取抢购专区展示的公告。 */
export function fetchHomeNotices() {
  return request<HomeNotice[]>({
    url: '/api/app/notice/enabled',
    method: 'get',
    params: { position: 'seckill' },
  });
}

/** 获取已启用的抢购场次。 */
export function fetchFlashSaleSessions() {
  return request<FlashSaleSession[]>({
    url: '/api/app/session/enabled',
    method: 'get',
  });
}

/** 分页获取指定抢购场次的商品。 */
export function fetchFlashSaleGoods(params: FetchFlashSaleGoodsParams) {
  return request<FlashSaleGoodsPage>({
    url: '/api/app/session/sale-goods',
    method: 'get',
    params,
  });
}

/** 获取抢购商品详情。 */
export function fetchFlashSaleGoodsDetail(id: number) {
  return request<FlashSaleGoods | null>({
    url: `/api/app/consign-goods/${id}`,
    method: 'get',
  });
}

/** 提交抢购订单。 */
export function placeFlashSaleOrder(data: PlaceFlashSaleOrderPayload) {
  return request<string>({
    url: '/api/app/order/place',
    method: 'post',
    data,
  }, { loading: true });
}
