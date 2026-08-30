import { isString } from 'lodash-es';

const STATUS_MESSAGES: Record<number, string> = {
  302: '请求被重定向，请稍后重试',
  400: '请求参数有误',
  401: '登录状态已失效',
  403: '没有访问权限',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  409: '请求冲突，请稍后重试',
  500: '服务异常，请稍后重试',
  501: '服务暂不支持该请求',
  502: '服务暂时不可用',
  503: '服务暂时不可用',
  504: '服务响应超时',
  505: 'HTTP 版本不受支持',
};

// 由 HTTP 状态码 / 网络异常推导出的通用提示，作为后端未返回具体 msg 时的兜底文案
function resolveGenericMessage(error: any): string {
  const status = error?.response?.status;
  if (status) {
    return STATUS_MESSAGES[status] ?? '请求失败，请稍后重试';
  }
  if (error?.message?.includes('timeout'))
    return '请求超时，请稍后重试';
  if (error?.message?.includes('Network'))
    return window.navigator.onLine ? '网络异常，请稍后重试' : '网络连接已断开';
  return '请求失败，请稍后重试';
}

/**
 * 解析最终展示给用户的错误文案，优先级：
 * 1. 调用方显式传入的覆盖文案（options.errorMessage 为字符串时）
 * 2. 后端返回的具体错误信息（error.response.data.msg）
 * 3. 按 HTTP 状态码 / 网络异常归类的通用文案
 */
export function resolveErrorMessage(error: any, override?: string): string {
  if (override)
    return override;

  const backendMessage = error?.response?.data?.msg;
  if (isString(backendMessage) && backendMessage)
    return backendMessage;

  return resolveGenericMessage(error);
}
