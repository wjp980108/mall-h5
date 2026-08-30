<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isTabbarRoute } from '@/utils/tabbar.ts';

defineOptions({ name: 'AppNavBar' });

const route = useRoute();
const router = useRouter();

const title = computed(() => route.meta.title);

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
  />
</template>
