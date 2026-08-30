import request from '@/utils/axios';

export interface LoginReq {
  account: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface RegisterReq {
  username: string;
  password: string;
  phone: string;
  inviteCode?: string;
}

// 登录
export function login(data: LoginReq) {
  return request<LoginResult>({
    url: '/api/auth/login',
    method: 'post',
    data,
  });
}

// 注册
export function register(data: RegisterReq) {
  return request<unknown>({
    url: '/api/auth/register',
    method: 'post',
    data,
  }, {
    loading: '注册中...',
  });
}

// 获取用户信息
export function fetchUserInfo() {
  return request<unknown>({
    url: '/api/users/user-info',
  });
}

// 获取企业级 JsSdk 签名参数
export function fetchCorpJsSdkParams(url: string) {
  return request({
    url: '/common/generateCorpJssdkParams',
    method: 'post',
    data: {
      url,
    },
  });
}

// 获取应用 JsSdk 签名参数
export function fetchAgentJsSdkParams(url: string) {
  return request({
    url: '/common/generateAgentJssdkParams',
    method: 'post',
    data: {
      url,
    },
  });
}

// 上传文件
export function uploadFile(params: FormData) {
  return request({
    url: '/common/acceptUpload',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }, {
    cancelDuplicateRequest: false,
    loading: '上传中...',
  });
}

// 上传图片
export function uploadImage(data: FormData) {
  return request({
    url: '/api/file/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }, {
    cancelDuplicateRequest: false,
    loading: '上传中...',
  });
}
