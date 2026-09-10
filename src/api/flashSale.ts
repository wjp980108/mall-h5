import type { HomeBanner, HomeNotice } from '@/api/home.ts';
import request from '@/utils/axios';

export interface FlashSaleSession {
  id: number;
  sort: number;
  sessionName: string;
  sessionStatus: number;
  rushStartTime: string;
  rushEndTime: string;
  maxBuyCount: number;
  bgImg: string | null;
}

/** 抢购商品列表项，id 为场次商品关联 ID。 */
export interface FlashSaleGoods {
  id: number;
  sessionId: number;
  sessionName: string;
  goodsId: number;
  goodsName: string;
  categoryName: string | null;
  goodsSn: string | null;
  goodsThumb: string | null;
  goodsThumbPlatform: string | null;
  price: number;
  goodsStock: number | null;
  stock: number;
  sort: number;
  createTime: string;
  updateTime: string;
}

/** 抢购商品详情。 */
export interface FlashSaleGoodsDetail {
  sessionProductId: number;
  sessionId: number;
  sessionName: string;
  sessionStatus: number;
  sessionOpen: boolean;
  stock: number;
  soldOut: boolean;
  goodsId: number;
  goodsName: string;
  price: number;
  coverImg: string;
  coverImgPlatform: string;
  detailImg: string;
  detailImgPlatform: string;
  goodsDetail: string;
  saleTimes: number;
  goodsStatus: number;
  onlineStatus: number;
  goodsOnline: boolean;
  rushStartTime: string;
  rushEndTime: string;
  canPurchase: boolean;
  limitRule: number;
  limitRuleName: string;
  hasRushed: boolean;
}

export interface FlashSaleGoodsPage {
  list: FlashSaleGoods[];
  total: number;
  pages: number;
  current: number;
  size: number;
}

export interface FetchFlashSaleGoodsParams {
  sessionId?: number;
  pageNum: number;
  pageSize: number;
}

export interface PlaceFlashSaleOrderPayload {
  /** 场次商品关联 ID。 */
  sessionProductId: number;
  /** 收货地址 ID。 */
  addressId: number;
  /** 购买数量；抢购页面当前固定为 1。 */
  quantity: number;
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
    url: '/api/app/robOrder/sale-goods',
    method: 'get',
    params,
  });
}

/** 获取抢购商品详情。 */
export function fetchFlashSaleGoodsDetail(id: number) {
  return request<FlashSaleGoodsDetail | null>({
    url: `/api/app/robOrder/sale-goods/${id}`,
    method: 'get',
  });
}

/** 提交抢购订单。 */
export function placeFlashSaleOrder(data: PlaceFlashSaleOrderPayload) {
  return request<string>({
    url: '/api/app/robOrder/place',
    method: 'post',
    data,
  }, { loading: true });
}
