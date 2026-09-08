import request from '@/utils/axios';

/** 积分账户余额。可用积分可以转让，购物券积分不可转让。 */
export interface PointsBalance {
  points: number;
  couponPoints: number;
}

export type PointsBizType = 1 | 2 | 3 | 4;

export interface PointsFlow {
  id: number;
  orderId: number | null;
  orderNo: string | null;
  bizType: PointsBizType;
  bizTypeName: string;
  flowType: 1 | 2 | 3 | 4;
  flowTypeName: string;
  accountType: 1 | 2;
  accountTypeName: string;
  amount: number;
  beforePoints: number;
  afterPoints: number;
  counterpartyUserId: number | null;
  counterpartyName: string | null;
  remark: string | null;
  createTime: string;
}

export interface FetchPointsFlowsParams {
  pageNum: number;
  pageSize: number;
  bizType?: PointsBizType;
}

export interface PointsTransferPayload {
  phone: string;
  amount: number;
}

/** 获取当前用户的积分余额。 */
export function fetchPointsBalance() {
  return request<PointsBalance>({
    url: '/api/app/assets/points',
  });
}

/** 分页获取当前用户的积分流水。 */
export function fetchPointsFlows(params: FetchPointsFlowsParams) {
  return request<AppAxios.PageData<PointsFlow>>({
    url: '/api/app/assets/points/flow',
    params,
  });
}

/** 将可用积分转让给已注册的用户。 */
export function transferPoints(data: PointsTransferPayload) {
  return request<null>({
    url: '/api/app/assets/points/transfer',
    method: 'post',
    data,
  }, {
    loading: '转让中...',
    successMessage: '积分转让成功',
  });
}
