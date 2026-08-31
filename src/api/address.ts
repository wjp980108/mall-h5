import request from '@/utils/axios';

export interface UserAddress {
  id: number;
  receiverName: string;
  receiverPhone: string;
  address: string;
  isDefault: boolean;
}

export interface SaveAddressPayload {
  receiverName: string;
  receiverPhone: string;
  address: string;
  isDefault: 0 | 1;
}

export interface UpdateAddressPayload extends SaveAddressPayload {
  id: number;
}

export function fetchAddressList() {
  return request<UserAddress[]>({
    url: '/api/app/address',
  });
}

export function fetchAddressDetail(id: number) {
  return request<UserAddress>({
    url: `/api/app/address/${id}`,
  });
}

export function createAddress(data: SaveAddressPayload) {
  return request<null>({
    url: '/api/app/address',
    method: 'post',
    data,
  });
}

export function updateAddress(data: UpdateAddressPayload) {
  return request<null>({
    url: '/api/app/address',
    method: 'put',
    data,
  });
}

export function deleteAddress(id: number) {
  return request<null>({
    url: `/api/app/address/${id}`,
    method: 'delete',
  });
}

export function setDefaultAddress(id: number) {
  return request<null>({
    url: `/api/app/address/default/${id}`,
    method: 'patch',
  });
}
