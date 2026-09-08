import { fmt } from 'a-calc';
import { useAppStore } from '@/stores/app';

/**
 * 设置文档标题
 *
 * @param title - 标题
 */
export function setDocumentTitle(title: string) {
  const { siteName } = useAppStore();
  document.title = title ? `${title} - ${siteName}` : siteName;
}

/**
 * 格式化数字为千分位显示
 * @param num - 需要格式化的数字或字符串
 */
export function numberFormat(num: number | string) {
  const numValue = Number(num);

  if (Number.isNaN(numValue))
    return '0';

  return fmt(numValue, ',');
}
