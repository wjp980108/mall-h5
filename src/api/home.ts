export interface HomeBanner {
  id: string;
  imageUrl: string;
}

export interface HomeNotice {
  id: string;
  content: string;
}

export interface HomeProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  salesCount: number;
}

export interface HomeProductPage {
  list: HomeProduct[];
  total: number;
}

export interface HomePageData {
  banners: HomeBanner[];
  notices: HomeNotice[];
  products: HomeProductPage;
}

export interface FetchHomePageParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

const mockHomeBanners: HomeBanner[] = [
  {
    id: 'banner-1',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'banner-2',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'banner-3',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85',
  },
];

const mockHomeNotices: HomeNotice[] = [
  { id: 'notice-1', content: '新人专享礼，注册即领优惠券' },
  { id: 'notice-2', content: '全场商品满 99 元包邮' },
  { id: 'notice-3', content: '每日 10 点限时秒杀，爆款好物低至 5 折' },
];

const mockHomeProducts: (HomeProduct & { searchText: string })[] = [
  { id: 'product-1', name: '轻盈缓震跑鞋', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=85', price: '699.00', salesCount: 2386, searchText: '运动鞋 跑鞋' },
  { id: 'product-2', name: '简约智能手表', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=720&q=85', price: '1,299.00', salesCount: 965, searchText: '智能 手表' },
  { id: 'product-3', name: '纯棉圆领短袖', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=85', price: '169.00', salesCount: 3560, searchText: '短袖 T恤' },
  { id: 'product-4', name: '大容量通勤双肩包', imageUrl: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=720&q=85', price: '259.00', salesCount: 1280, searchText: '双肩包 背包' },
  { id: 'product-5', name: '降噪蓝牙耳机', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=720&q=85', price: '899.00', salesCount: 786, searchText: '耳机 蓝牙耳机' },
  { id: 'product-6', name: '轻盈碎花连衣裙', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=720&q=85', price: '329.00', salesCount: 2145, searchText: '连衣裙 女装' },
  { id: 'product-7', name: '旗舰智能手机', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=720&q=85', price: '3,999.00', salesCount: 642, searchText: '手机 智能手机' },
  { id: 'product-8', name: '简约随行保温杯', imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=720&q=85', price: '89.00', salesCount: 4680, searchText: '杯子 保温杯' },
];

/**
 * 获取首页轮播、公告及商品数据。
 * 后端接口就绪后，保留函数签名并替换为 request 调用即可。
 */
export function fetchHomePage(params: FetchHomePageParams = {}): Promise<AppAxios.ResponseData<HomePageData>> {
  const keyword = params.keyword?.trim().toLowerCase() ?? '';
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 6, 1);
  const products = mockHomeProducts
    .filter(product => !keyword || product.searchText.toLowerCase().includes(keyword))
    .map(({ searchText: _, ...product }) => product);
  const start = (page - 1) * pageSize;

  return Promise.resolve({
    code: 200,
    data: {
      banners: mockHomeBanners,
      notices: mockHomeNotices,
      products: {
        list: products.slice(start, start + pageSize),
        total: products.length,
      },
    },
    msg: '获取首页数据成功',
  });
}
