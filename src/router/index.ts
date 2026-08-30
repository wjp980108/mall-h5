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

    // 未登录，处理非登录页面重定向
    if (!userStore.accessToken) {
      if (to.path !== '/login') {
        return '/login';
      }
      return;
    }

    // 已登录，访问登录页重定向到首页
    if (to.path === '/login') {
      return { path: VITE_HOME_PATH };
    }
  });

  router.afterEach((to) => {
    // 修改网页标题
    setDocumentTitle(to.meta.title);
  });

  app.use(router);

  await router.isReady();
}
