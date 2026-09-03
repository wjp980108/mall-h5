export type BuyerOrderStatus = 'pending-payment' | 'paid' | 'cancelled';

export interface BuyerOrderItem {
  id: string;
  name: string;
  imageUrl: string;
  specification?: string;
  price: number;
  quantity: number;
}

export interface BuyerOrder {
  id: string;
  status: BuyerOrderStatus;
  createdAt: string;
  items: BuyerOrderItem[];
  totalAmount: number;
  paymentProofUrl?: string;
  paidAt?: string;
}

export interface ConfirmBuyerOrderPaymentPayload {
  paymentProofUrl: string;
}

export interface FetchBuyerOrdersParams {
  page: number;
  pageSize: number;
  status?: BuyerOrderStatus;
}

const mockBuyerOrders: BuyerOrder[] = [
  {
    id: 'MOCK-202609030001',
    status: 'pending-payment',
    createdAt: '2026-09-03 10:28:16',
    items: [
      {
        id: 'product-1',
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
    id: 'MOCK-202609020002',
    status: 'paid',
    createdAt: '2026-09-02 16:05:42',
    paidAt: '2026-09-02 16:12:09',
    items: [
      {
        id: 'product-2',
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
    id: 'MOCK-202609010003',
    status: 'cancelled',
    createdAt: '2026-09-01 09:36:28',
    items: [
      {
        id: 'product-3',
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
 * 买方订单 mock 接口。后端就绪后保留导出函数和类型，替换为 request 调用即可。
 */
export function fetchBuyerOrders({ page, pageSize, status }: FetchBuyerOrdersParams) {
  const filteredOrders = status
    ? mockBuyerOrders.filter(order => order.status === status)
    : mockBuyerOrders;
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

export function fetchBuyerOrder(id: string) {
  const order = mockBuyerOrders.find(item => item.id === id) ?? null;

  return mockResponse(order
    ? {
        ...order,
        items: [...order.items],
      }
    : null, order ? '获取订单成功' : '订单不存在');
}

export function confirmBuyerOrderPayment(id: string, data: ConfirmBuyerOrderPaymentPayload) {
  const order = mockBuyerOrders.find(item => item.id === id);

  if (!order)
    return Promise.reject(new Error('订单不存在'));

  if (order.status !== 'pending-payment')
    return Promise.reject(new Error('该订单当前不可付款'));

  order.status = 'paid';
  order.paymentProofUrl = data.paymentProofUrl;
  order.paidAt = new Date().toLocaleString('sv-SE').replace('T', '');

  return mockResponse({ ...order, items: [...order.items] }, '付款成功');
}
