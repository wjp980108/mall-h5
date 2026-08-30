import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import remainingRouter from '@/router/modules/remainingRouter.ts';
import tabbar from '@/router/modules/tabbar.ts';
import { useUserStore } from '@/stores/user';
import { setDocumentTitle } from '@/utils/common';

const { BASE_URL, VITE_HOME_PATH } = import.meta.env;

// 业务路由模块：自动挂载到 Layout 下（排除 tabbar 与 remaining）
const businessModules = import.meta.glob<{ default: RouteRecordRaw }>(
  ['./modules/*.ts', '!./modules/tabbar.ts', '!./modules/remainingRouter.ts'],
  { eager: true },
);
const businessRoutes = Object.values(businessModules).map(mod => mod.default);

// Layout 作为容器，业务路由挂载到其 children 下
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    redirect: VITE_HOME_PATH,
    component: () => import('@/layout/index.vue'),
    children: [...tabbar, ...businessRoutes],
  },
];

export const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes: routes.concat(remainingRouter),
});

export async function installRouter(app: App) {
  router.beforeEach((to) => {
    const userStore = useUserStore();

    // 未登录时，默认跳转登录页；公开页面通过路由元信息声明。
    if (!userStore.accessToken && to.meta.requiresAuth !== false) {
      return '/login';
    }
  });

  router.afterEach((to) => {
    // 修改网页标题
    setDocumentTitle(to.meta.title);
  });

  app.use(router);

  await router.isReady();
}
