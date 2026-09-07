import request from '@/utils/axios';

export enum AgreementType {
  User = 1,
  Privacy = 2,
}

export interface Agreement {
  id: number;
  title: string;
  type: AgreementType;
  content: string;
  createBy: string;
  updateBy: string;
  createTime: string;
  updateTime: string;
}

/** 获取指定类型的最新协议。 */
export function fetchAgreement(type: AgreementType) {
  return request<Agreement>({
    url: '/api/app/agreement',
    method: 'get',
    params: { type },
  });
}
