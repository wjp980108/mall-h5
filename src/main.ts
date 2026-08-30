import Vant from 'vant';
import { createApp } from 'vue';
import initVersionRocket from '@/config/versionRocket';
import { installRouter } from '@/router';
import { installPinia } from '@/stores';
import App from './App.vue';
import '@/styles/index';

async function setupApp() {
  // 初始化版本检测
  initVersionRocket();
  // 创建vue实例
  const app = createApp(App);
  // 注册模块 Pinia
  installPinia(app);
  // 注册模块 Vue-router
  await installRouter(app);

  app.use(Vant);

  app.mount('#app');
}

setupApp().catch((error) => {
  console.error('应用初始化失败:', error);
});
