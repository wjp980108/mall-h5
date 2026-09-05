import request from '@/utils/axios';

export interface HomeBanner {
  id: number;
  imgUrl: string;
  linkValue: string;
}

export interface HomeNotice {
  id: number;
  title: string;
  content: string;
  createTime: string;
}

export interface NoticeDetail extends HomeNotice {
  readCount: number;
}

export interface HomeProduct {
  id: number;
  goodsName: string;
  price: number;
  goodsThumb: string;
  sales: number;
}

export interface HomeProductPage {
  list: HomeProduct[];
  total: number;
}

export interface FetchHomeProductsParams {
  pageNum: number;
  pageSize: number;
}

/** 获取首页启用的轮播图。 */
export function fetchHomeBanners() {
  return request<HomeBanner[]>({
    url: '/api/app/banner/enabled',
    method: 'get',
    params: { position: 'home' },
  });
}

/** 获取首页展示的公告。 */
export function fetchHomeNotices() {
  return request<HomeNotice[]>({
    url: '/api/app/notice/enabled',
    method: 'get',
    params: { position: 'home' },
  });
}

/** 获取首页推荐商品。 */
export function fetchHomeProducts(params: FetchHomeProductsParams) {
  return request<HomeProductPage>({
    url: '/api/app/home/recommend',
    method: 'get',
    params,
  });
}

/** 获取公告详情，接口会同时返回阅读次数。 */
export function fetchNoticeDetail(id: number) {
  return request<NoticeDetail>({
    url: `/api/app/notice/${id}`,
    method: 'get',
  });
}
