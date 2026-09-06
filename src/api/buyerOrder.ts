import request from '@/utils/axios';

export type BuyerOrderStatus = 1 | 2 | 3 | 4 | 5;

export interface BuyerOrder {
  id: number;
  orderNo: string;
  goodsId: number;
  goodsName: string;
  sellerId: number;
  sellerName: string;
  sellerPhone: string;
  buyerId: number;
  buyerName: string;
  buyerPhone: string;
  rushPrice: string;
  receiveAddress: string;
  orderStatus: BuyerOrderStatus;
  orderStatusName: string;
  putCommission: string | null;
  couponAmount: string | null;
  payVoucherUrl: string | null;
  payVoucherPlatform: string | null;
  payDeadline: string | null;
  createTime: string;
  updateTime: string;
}

export interface ConfirmBuyerOrderPaymentPayload {
  payVoucherUrl: string;
  payVoucherPlatform: string;
}

export interface FetchBuyerOrdersParams {
  pageNum: number;
  pageSize: number;
  orderStatus?: BuyerOrderStatus;
}

/** 获取当前用户的买方仓库订单。 */
export function fetchBuyerOrders(params: FetchBuyerOrdersParams) {
  return request<AppAxios.PageData<BuyerOrder>>({
    url: '/api/app/order/my-list',
    params,
  }, {
    loading: true,
  });
}

/** 获取当前用户的订单详情。 */
export function fetchBuyerOrder(id: number | string) {
  return request<BuyerOrder>({
    url: `/api/app/order/${id}`,
  }, {
    loading: true,
  });
}

/** 上传付款凭证，并将订单更新为已付款。 */
export function confirmBuyerOrderPayment(id: number, data: ConfirmBuyerOrderPaymentPayload) {
  return request<null>({
    url: '/api/app/order/uploadVoucher',
    method: 'post',
    data: {
      id,
      ...data,
    },
  }, {
    loading: '提交中...',
  });
}
