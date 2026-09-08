import request from '@/utils/axios';

export type RobOrderStatus = 1 | 2;

export interface RobOrder {
  id: number;
  orderNo: string;
  sessionProductId: number;
  sessionId: number;
  sessionName: string;
  rushStartTime: string;
  rushEndTime: string;
  goodsId: number;
  goodsName: string;
  goodsSn: string;
  goodsThumb: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  profitAmount: number;
  recommendAmount: number;
  selfBuyAmount: number;
  selfBuyBonusAmount: number;
  selfBuyCouponAmount: number;
  buyerId: number;
  buyerName: string;
  buyerPhone: string;
  buyerAvatar: string;
  inviterId: number | null;
  inviterName: string | null;
  orderStatus: RobOrderStatus;
  orderStatusName: string;
  createTime: string;
}

export interface FetchRobOrdersParams {
  pageNum: number;
  pageSize: number;
}

/** 分页获取当前用户的抢购订单。 */
export function fetchMyRobOrders(params: FetchRobOrdersParams) {
  return request<AppAxios.PageData<RobOrder>>({
    url: '/api/app/robOrder/my-list',
    params,
  }, {
    loading: true,
  });
}
