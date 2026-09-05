<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNavTitle } from '@/hooks/useNavTitle.ts';
import { isTabbarRoute } from '@/utils/tabbar.ts';

defineOptions({ name: 'AppNavBar' });

const route = useRoute();
const router = useRouter();
const { navCountdown, navTitle, setNavCountdown } = useNavTitle();

const title = computed(() => navTitle.value || route.meta.title);

function handleBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.replace('/');
}
</script>

<template>
  <van-nav-bar
    :title class="app-navbar" :left-arrow="!isTabbarRoute()" placeholder fixed
    @click-left="handleBack"
  >
    <template #title>
      <div class="app-navbar__title">
        <span class="app-navbar__title-text">{{ title }}</span>
        <span v-if="navCountdown" class="app-navbar__countdown">
          {{ navCountdown.label }}
          <van-count-down :time="navCountdown.time" format="HH:mm:ss" @finish="setNavCountdown()" />
        </span>
      </div>
    </template>
  </van-nav-bar>
</template>

<style scoped lang="scss">
.app-navbar {
  --van-nav-bar-background: var(--van-primary-color);
  --van-nav-bar-icon-color: #fff;
  --van-nav-bar-title-text-color: #fff;

  &__title,
  &__countdown {
    display: flex;
    align-items: center;
  }

  &__title {
    flex-direction: column;
    max-width: 100%;
    justify-content: center;
    gap: 1px;
  }

  &__title-text {
    max-width: 100%;
    overflow: hidden;
    font-size: 16px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__countdown {
    gap: 2px;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    white-space: nowrap;

    :deep(.van-count-down) {
      color: inherit;
      font-size: inherit;
      line-height: inherit;
    }
  }
}
</style>
