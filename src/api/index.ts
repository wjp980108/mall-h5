import request from '@/utils/axios';

export interface LoginReq {
  account: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  nickname: string;
  inviteCode: string;
  phone: string;
  avatar: string;
  avatarPlatform: string | null;
}

export interface UpdateCurrentUserInfo {
  nickname?: string;
  avatar?: string;
  avatarPlatform?: string;
}

export interface ChangePasswordPayload {
  phone: string;
  password: string;
}

export interface ForgotPasswordPayload {
  phone: string;
  password: string;
}

export interface RegisterReq {
  username: string;
  password: string;
  phone?: string;
  nickname?: string;
  email?: string;
  inviteCode?: string;
}

export interface SiteSettings {
  siteLogo: string;
  siteName: string;
}

// 登录
export function login(data: LoginReq) {
  return request<LoginResult>({
    url: '/api/app/auth/login',
    method: 'post',
    data,
  }, {
    loading: '登录中...',
  });
}

// 注册
export function register(data: RegisterReq) {
  return request<unknown>({
    url: '/api/app/auth/register',
    method: 'post',
    data,
  }, {
    loading: '注册中...',
  });
}

// 获取用户信息
export function fetchUserInfo() {
  return request<CurrentUser>({
    url: '/api/app/user/info',
  });
}

// 更新用户信息
export function updateUserInfo(data: UpdateCurrentUserInfo) {
  return request({
    url: '/api/app/user/info',
    method: 'put',
    data,
  }, {
    loading: '保存中...',
    successMessage: '资料已保存',
  });
}

// 修改密码
export function changePassword(data: ChangePasswordPayload) {
  return request({
    url: '/api/app/user/password',
    method: 'put',
    data,
  }, {
    loading: '修改中...',
    successMessage: '密码已修改，请重新登录',
  });
}

// 找回密码
export function forgotPassword(data: ForgotPasswordPayload) {
  return request({
    url: '/api/app/user/forgot-password',
    method: 'put',
    data,
  }, {
    loading: '重置中...',
    successMessage: '密码已重置，请重新登录',
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
    url: '/api/app/file/upload',
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

/** 获取公开的站点名称与 Logo。 */
export function fetchSiteSettings() {
  return request<SiteSettings>({
    url: '/api/app/settings',
    method: 'get',
  }, {
    errorMessage: false,
  });
}
