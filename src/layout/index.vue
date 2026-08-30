<script setup lang="ts">
import AppNavBar from '@/components/AppNavBar/index.vue';
import AppTabbar from '@/components/AppTabbar/index.vue';

defineOptions({ name: 'Layout' });
</script>

<template>
  <section>
    <AppNavBar />
    <main>
      <router-view />
    </main>
    <AppTabbar />
  </section>
</template>
