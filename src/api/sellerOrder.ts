export type SellerOrderStatus = 'unsold' | 'sold' | 'cancelled';

export interface SellerOrderItem {
  id: string;
  name: string;
  imageUrl: string;
  specification?: string;
  price: number;
  quantity: number;
}

export interface SellerOrder {
  id: string;
  status: SellerOrderStatus;
  createdAt: string;
  items: SellerOrderItem[];
  totalAmount: number;
  listedAt?: string;
  soldAt?: string;
}

export interface FetchSellerOrdersParams {
  page: number;
  pageSize: number;
  status?: SellerOrderStatus;
}

const mockSellerOrders: SellerOrder[] = [
  {
    id: 'SELL-202609030001',
    status: 'unsold',
    createdAt: '2026-09-03 09:18:32',
    items: [
      {
        id: 'seller-product-1',
        name: '轻盈缓震跑鞋',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=85',
        specification: '白色 · 42 码',
        price: 699,
        quantity: 1,
      },
    ],
    totalAmount: 699,
  },
  {
    id: 'SELL-202609020002',
    status: 'sold',
    createdAt: '2026-09-02 14:36:17',
    soldAt: '2026-09-02 17:08:46',
    items: [
      {
        id: 'seller-product-2',
        name: '简约智能手表',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=85',
        specification: '曜石黑',
        price: 1299,
        quantity: 1,
      },
    ],
    totalAmount: 1299,
  },
  {
    id: 'SELL-202609010003',
    status: 'cancelled',
    createdAt: '2026-09-01 11:42:08',
    items: [
      {
        id: 'seller-product-3',
        name: '纯棉圆领短袖',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=240&q=85',
        specification: '深灰色 · L',
        price: 169,
        quantity: 2,
      },
    ],
    totalAmount: 338,
  },
];

function mockResponse<T>(data: T, msg: string): Promise<AppAxios.ResponseData<T>> {
  return Promise.resolve({ code: 200, data, msg });
}

/**
 * 卖方订单 mock 接口。后端就绪后保留导出函数和类型，替换为 request 调用即可。
 */
export function fetchSellerOrders({ page, pageSize, status }: FetchSellerOrdersParams) {
  const filteredOrders = status
    ? mockSellerOrders.filter(order => order.status === status)
    : mockSellerOrders;
  const start = (page - 1) * pageSize;
  const list = filteredOrders.slice(start, start + pageSize).map(order => ({
    ...order,
    items: [...order.items],
  }));

  return mockResponse({
    list,
    total: filteredOrders.length,
  }, '获取订单成功');
}

export function commissionSellerOrderListing(id: string) {
  const order = mockSellerOrders.find(item => item.id === id);

  if (!order)
    return Promise.reject(new Error('订单不存在'));

  if (order.status !== 'unsold')
    return Promise.reject(new Error('该订单当前不可委托上架'));

  if (!order.listedAt)
    order.listedAt = new Date().toLocaleString('sv-SE').replace('T', '');

  return mockResponse({ ...order, items: [...order.items] }, '委托上架成功');
}
