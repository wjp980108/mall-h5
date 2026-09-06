import request from '@/utils/axios';

export interface ProductDetail {
  id: number;
  goodsName: string;
  categoryName: string;
  goodsSn: string;
  goodsThumb: string;
  goodsThumbPlatform: string;
  price: number;
  stock: number;
  sales: number;
  status: number;
  createTime: string;
  updateTime: string;
  createBy: number;
  updateBy: number;
}

export interface SubmitProductOrderPayload {
  productId: string;
  quantity: number;
}

export interface SubmitProductOrderResult {
  orderId: string;
}

/** 获取首页商品详情。 */
export function fetchProductDetail(id: number) {
  return request<ProductDetail>({
    url: `/api/app/home/goods/${id}`,
    method: 'get',
  });
}

/**
 * 立即购买并创建订单。
 * 后端接口就绪后，保留函数签名并替换为 request 调用即可。
 */
export function submitProductOrder(data: SubmitProductOrderPayload): Promise<AppAxios.ResponseData<SubmitProductOrderResult>> {
  return Promise.resolve({
    code: 200,
    data: {
      orderId: `MOCK-${data.productId}-${Date.now()}`,
    },
    msg: '下单成功',
  });
}
