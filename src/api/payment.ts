export type PaymentMethod = 'wechat' | 'alipay';

export interface BankCard {
  id: string;
  accountName: string;
  reservedPhone: string;
  bankName: string;
  cardNumber: string;
}

export interface SaveBankCardPayload {
  accountName: string;
  reservedPhone: string;
  bankName: string;
  cardNumber: string;
  verificationCode: string;
}

export interface PaymentCode {
  method: PaymentMethod;
  imageUrl: string;
  phone: string;
}

export interface SavePaymentCodePayload {
  imageUrl: string;
  phone: string;
  verificationCode: string;
}

const mockBankCards: BankCard[] = [
  {
    id: 'bank-card-1',
    accountName: '张三',
    reservedPhone: '13800138000',
    bankName: '招商银行',
    cardNumber: '6225888888881234',
  },
];

const mockPaymentCodes: Record<PaymentMethod, PaymentCode | null> = {
  wechat: null,
  alipay: null,
};

function mockResponse<T>(data: T, msg: string): Promise<AppAxios.ResponseData<T>> {
  return Promise.resolve({ code: 200, data, msg });
}

/**
 * 收款方式 mock 接口。后端就绪后保留导出函数与类型，替换为 request 调用即可。
 */
export function fetchBankCards() {
  return mockResponse([...mockBankCards], '获取银行卡成功');
}

export function createBankCard(data: SaveBankCardPayload) {
  const bankCard: BankCard = {
    id: `bank-card-${Date.now()}`,
    accountName: data.accountName,
    reservedPhone: data.reservedPhone,
    bankName: data.bankName,
    cardNumber: data.cardNumber,
  };
  mockBankCards.unshift(bankCard);

  return mockResponse(bankCard, '银行卡已添加');
}

export function updateBankCard(id: string, data: SaveBankCardPayload) {
  const index = mockBankCards.findIndex(item => item.id === id);
  const bankCard = mockBankCards[index];

  if (!bankCard)
    return Promise.reject(new Error('银行卡不存在'));

  const updatedBankCard: BankCard = {
    ...bankCard,
    accountName: data.accountName,
    reservedPhone: data.reservedPhone,
    bankName: data.bankName,
    cardNumber: data.cardNumber,
  };
  mockBankCards.splice(index, 1, updatedBankCard);

  return mockResponse(updatedBankCard, '银行卡已更新');
}

export function deleteBankCard(id: string) {
  const index = mockBankCards.findIndex(item => item.id === id);

  if (index < 0)
    return Promise.reject(new Error('银行卡不存在'));

  mockBankCards.splice(index, 1);
  return mockResponse(null, '银行卡已删除');
}

export function fetchPaymentCode(method: PaymentMethod) {
  return mockResponse(mockPaymentCodes[method], '获取收款码成功');
}

export function savePaymentCode(method: PaymentMethod, data: SavePaymentCodePayload) {
  const paymentCode: PaymentCode = {
    method,
    imageUrl: data.imageUrl,
    phone: data.phone,
  };
  mockPaymentCodes[method] = paymentCode;

  return mockResponse(paymentCode, '收款码已保存');
}

export function sendPaymentVerificationCode(phone: string) {
  return mockResponse({ phone }, '验证码已发送');
}
