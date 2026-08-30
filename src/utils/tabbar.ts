import { useRoute } from 'vue-router';
import tabbarRoutes from '@/router/modules/tabbar.ts';

// 是否是 tabbar 页
export function isTabbarRoute() {
  const route = useRoute();
  return tabbarRoutes.some(item => item.path === route.path);
}
