export interface ProductDetail {
  id: string;
  name: string;
  price: string;
  salesCount: number;
  summary: string;
  images: string[];
  detailHtml: string;
}

export interface SubmitProductOrderPayload {
  productId: string;
  quantity: number;
}

export interface SubmitProductOrderResult {
  orderId: string;
}

const mockProductDetails: ProductDetail[] = [
  {
    id: 'product-1',
    name: '轻盈缓震跑鞋',
    price: '699.00',
    salesCount: 2386,
    summary: '透气网面搭配回弹中底，日常通勤和跑步都舒适。',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=85',
    ],
    detailHtml: `
      <h2>舒适回弹，轻松开跑</h2>
      <p>鞋面采用透气织物，贴合脚型并保持干爽；回弹中底让每一步都更轻盈。</p>
      <img src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=85" alt="跑鞋细节">
      <h3>商品亮点</h3>
      <ul><li>轻量鞋身，减少日常穿着负担</li><li>柔韧橡胶外底，抓地稳定</li><li>适合通勤、健走及轻量跑步</li></ul>
    `,
  },
  {
    id: 'product-2',
    name: '简约智能手表',
    price: '1,299.00',
    salesCount: 965,
    summary: '全天候健康监测与消息提醒，轻松记录每一天。',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>重要信息，抬腕即见</h2><p>清晰屏幕与简洁界面，让运动数据、日程提醒和日常消息一目了然。</p><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85" alt="智能手表"><h3>商品亮点</h3><ul><li>全天活动与心率数据记录</li><li>支持常用消息提醒</li><li>简约外观，适配多种穿搭</li></ul>',
  },
  {
    id: 'product-3',
    name: '纯棉圆领短袖',
    price: '169.00',
    salesCount: 3560,
    summary: '柔软亲肤的纯棉面料，打造轻松自在的日常穿搭。',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>简约好穿的日常基础款</h2><p>选用柔软亲肤的棉质面料，版型利落舒适，单穿或内搭都合适。</p><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85" alt="纯棉短袖"><h3>商品亮点</h3><ul><li>亲肤透气，四季可穿</li><li>经典圆领，易于搭配</li><li>宽松舒适的日常版型</li></ul>',
  },
  {
    id: 'product-4',
    name: '大容量通勤双肩包',
    price: '259.00',
    salesCount: 1280,
    summary: '分区收纳设计，通勤出行所需物品井然有序。',
    images: ['https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>装得下忙碌，也装得下从容</h2><p>多分区收纳结合宽敞主袋，日常通勤、短途出行都能轻松应对。</p><img src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85" alt="双肩包"><h3>商品亮点</h3><ul><li>主袋空间充足，收纳更从容</li><li>独立分区，方便取放小物</li><li>加宽肩带，背负更舒适</li></ul>',
  },
  {
    id: 'product-5',
    name: '降噪蓝牙耳机',
    price: '899.00',
    salesCount: 786,
    summary: '沉浸聆听每一刻，通勤和办公都更专注。',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>沉浸式聆听体验</h2><p>柔软耳罩贴合佩戴，配合清晰音质，让音乐、通话和专注时光更自在。</p><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85" alt="蓝牙耳机"><h3>商品亮点</h3><ul><li>舒适包耳式设计</li><li>无线连接，使用更轻松</li><li>适合通勤、办公与居家聆听</li></ul>',
  },
  {
    id: 'product-6',
    name: '轻盈碎花连衣裙',
    price: '329.00',
    salesCount: 2145,
    summary: '灵动裙摆与细腻印花，为日常增添轻松优雅。',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>一件穿出轻盈感</h2><p>细腻碎花点缀柔和裙摆，穿着轻松舒适，适合日常约会与假日出游。</p><img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85" alt="碎花连衣裙"><h3>商品亮点</h3><ul><li>轻盈垂坠，活动自然</li><li>柔和印花，易于搭配</li><li>简约剪裁，日常百搭</li></ul>',
  },
  {
    id: 'product-7',
    name: '旗舰智能手机',
    price: '3,999.00',
    salesCount: 642,
    summary: '流畅性能与清晰影像，满足工作与生活的每一种需求。',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>流畅体验，随时在线</h2><p>简洁机身搭配清晰屏幕，处理日常沟通、拍摄记录与娱乐体验都游刃有余。</p><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85" alt="智能手机"><h3>商品亮点</h3><ul><li>清晰屏幕，视觉更舒适</li><li>流畅性能，应对多任务使用</li><li>高像素影像，方便记录生活</li></ul>',
  },
  {
    id: 'product-8',
    name: '简约随行保温杯',
    price: '89.00',
    salesCount: 4680,
    summary: '便携轻巧，随时为生活保留恰到好处的温度。',
    images: ['https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=1200&q=85'],
    detailHtml: '<h2>温度刚好，陪伴刚好</h2><p>简约杯身轻巧易携，适合通勤、运动和日常外出使用。</p><img src="https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=1200&q=85" alt="保温杯"><h3>商品亮点</h3><ul><li>轻巧便携，方便随身携带</li><li>简洁外观，适合多种场景</li><li>杯口圆润，饮用更舒适</li></ul>',
  },
];

/**
 * 获取商品详情。
 * 后端接口就绪后，保留函数签名并替换为 request 调用即可。
 */
export function fetchProductDetail(id: string): Promise<AppAxios.ResponseData<ProductDetail | null>> {
  const product = mockProductDetails.find(item => item.id === id) ?? null;

  return Promise.resolve({
    code: 200,
    data: product,
    msg: product ? '获取商品详情成功' : '商品不存在',
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
