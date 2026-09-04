<script setup lang="ts">
import AppNavBar from '@/components/AppNavBar/index.vue';
import AppTabbar from '@/components/AppTabbar/index.vue';

defineOptions({ name: 'Layout' });
</script>

<template>
  <section class="app-layout">
    <AppNavBar />
    <main id="app-layout-main" class="app-layout__main">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component" v-if="route.meta.keepAlive" :key="route.fullPath"
            class="app-layout__page"
          />
        </keep-alive>
        <component
          :is="Component" v-if="!route.meta.keepAlive" :key="route.fullPath"
          class="app-layout__page"
        />
      </router-view>
    </main>
    <AppTabbar />
    <van-back-top target="#app-layout-main" :bottom="80" :offset="200" />
  </section>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;

  .app-layout__main {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;

    :deep(.app-layout__page) {
      min-height: 100%;
      flex: none;
    }
  }
}
</style>
