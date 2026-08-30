import { closeToast, showLoadingToast } from 'vant';

let requestCount = 0;

// 创建 Loading（引用计数，并发请求共用同一个遮罩，最后一个请求结束时才关闭）
export function createLoading(text?: string) {
  if (requestCount === 0) {
    showLoadingToast({
      message: text,
      duration: 0,
      forbidClick: true,
    });
  }
  requestCount++;
}

// 关闭 Loading
export function closeLoading() {
  requestCount--;
  if (requestCount <= 0) {
    requestCount = 0;
    closeToast();
  }
}
