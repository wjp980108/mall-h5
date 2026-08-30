<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Tbabar from '@/router/modules/tabbar.ts';
import { useCartStore } from '@/stores/cart';
import { isTabbarRoute } from '@/utils/tabbar.ts';

defineOptions({ name: 'AppTabbar' });

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const active = computed({
  get: () => typeof route.name === 'string' ? route.name : '',
  set: (routeName) => {
    if (typeof routeName === 'string')
      router.push({ name: routeName });
  },
});
</script>

<template>
  <van-tabbar v-if="isTabbarRoute()" v-model="active" placeholder safe-area-inset-bottom>
    <van-tabbar-item
      v-for="tab in Tbabar" :key="tab.name" :name="tab.name" :icon="tab.meta.icon"
      :badge="tab.name === 'Cart' && cartStore.itemCount ? cartStore.itemCount : undefined"
    >
      {{ tab.meta.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>
