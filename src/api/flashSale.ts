export interface FlashSaleBanner {
  id: string;
  imageUrl: string;
}

export interface FlashSaleNotice {
  id: string;
  content: string;
}

export interface FlashSaleSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  imageUrl: string;
}

export interface FlashSalePageData {
  banners: FlashSaleBanner[];
  notices: FlashSaleNotice[];
  sessions: FlashSaleSession[];
}

const mockFlashSaleData: FlashSalePageData = {
  banners: [
    {
      id: 'flash-sale-banner-1',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85',
    },
    {
      id: 'flash-sale-banner-2',
      imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=85',
    },
  ],
  notices: [
    { id: 'flash-sale-notice-1', content: '抢购商品数量有限，售完即止' },
    { id: 'flash-sale-notice-2', content: '活动商品不支持与其他优惠叠加使用' },
  ],
  sessions: [
    {
      id: 'flash-sale-session-1',
      name: '早间好物专场',
      startTime: '09:00',
      endTime: '11:00',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'flash-sale-session-2',
      name: '午间精选专场',
      startTime: '12:00',
      endTime: '14:00',
      imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'flash-sale-session-3',
      name: '晚间爆款专场',
      startTime: '20:00',
      endTime: '22:00',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
    },
  ],
};

/**
 * 获取抢购页轮播、公告与活动场次数据。
 * 后端接口就绪后，保留函数签名并替换为 request 调用即可。
 */
export function fetchFlashSalePage(): Promise<AppAxios.ResponseData<FlashSalePageData>> {
  return Promise.resolve({
    code: 200,
    data: mockFlashSaleData,
    msg: '获取抢购活动成功',
  });
}
