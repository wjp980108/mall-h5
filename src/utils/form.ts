import { showNotify } from 'vant';

interface FormValidationFailure {
  errors: Array<{
    message: string;
  }>;
}

/**
 * 以顶部 Notify 呈现表单校验失败信息，避免在字段下方显示行内错误。
 */
export function notifyFormValidationFailed({ errors }: FormValidationFailure) {
  const message = errors[0]?.message;

  if (message) {
    showNotify({ type: 'danger', message });
  }
}
