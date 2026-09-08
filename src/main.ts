import Vant, { Lazyload } from 'vant';
import { createApp } from 'vue';
import initVersionRocket from '@/config/versionRocket';
import { installRouter, router } from '@/router';
import { installPinia } from '@/stores';
import { useAppStore } from '@/stores/app';
import { setDocumentTitle } from '@/utils/common';
import App from './App.vue';
import '@/styles/index';

async function setupApp() {
  // 创建vue实例
  const app = createApp(App);
  // 注册模块 Pinia
  installPinia(app);
  // 获取站点配置，失败时继续使用环境变量和本地 Logo，不阻塞应用启动。
  const settingsReady = useAppStore().fetchSettings().catch(() => undefined);
  // 初始化版本检测
  initVersionRocket();
  // 注册模块 Vue-router
  await installRouter(app);

  void settingsReady.then(() => {
    setDocumentTitle(router.currentRoute.value.meta.title);
  });

  app.use(Vant);
  app.use(Lazyload);

  app.mount('#app');
}

setupApp().catch((error) => {
  console.error('应用初始化失败:', error);
});
