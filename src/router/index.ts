import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { isEmpty } from 'lodash-es';
import { createRouter, createWebHashHistory } from 'vue-router';
import { fetchUserInfo } from '@/api';
import remainingRouter from '@/router/modules/remainingRouter.ts';
import tabbar from '@/router/modules/tabbar.ts';
import { useUserStore } from '@/stores/user';
import { setDocumentTitle } from '@/utils/common';

const { BASE_URL, VITE_HOME_PATH } = import.meta.env;

// 业务路由模块：自动挂载到 Layout 下（排除 tabbar 与 remaining）
const businessModules = import.meta.glob<{ default: RouteRecordRaw | RouteRecordRaw[] }>(
  ['./modules/*.ts', '!./modules/tabbar.ts', '!./modules/remainingRouter.ts'],
  { eager: true },
);
const businessRoutes = Object.values(businessModules).flatMap(({ default: routes }) =>
  Array.isArray(routes) ? routes : [routes],
);

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
  router.beforeEach(async (to) => {
    const userStore = useUserStore();

    // 未登录，处理非登录页面重定向
    if (!userStore.accessToken) {
      // 如果访问的不是登录且是需登录的页面，跳转登录页
      if (to.path !== '/login' && to.meta.requiresAuth !== false) {
        return '/login';
      }
      return;
    }

    // 已登录，访问登录页重定向到首页
    if (to.path === '/login') {
      return { path: import.meta.env.VITE_HOME_PATH };
    }

    if (isEmpty(userStore.userInfo)) {
      // 用户信息为空，初始化路由
      try {
        // 获取当前用户信息
        const infoRes = await fetchUserInfo();
        userStore.userInfo = infoRes.data;
        return { path: to.redirectedFrom?.fullPath ?? to.fullPath, replace: true };
      }
      catch (error) {
        console.error('初始化路由失败', error);
        userStore.handleLogout();
        return '/login';
      }
    }
  });

  router.afterEach((to) => {
    // 修改网页标题
    setDocumentTitle(to.meta.title);
  });

  app.use(router);

  await router.isReady();
}
