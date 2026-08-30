<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => route.meta.title);
</script>

<template>
  <section class="placeholder">
    <van-icon name="shop-o" size="52" color="#ff5a1f" />
    <h1>{{ title }}</h1>
    <p>页面内容即将上线</p>
  </section>
</template>

<style scoped lang="scss">
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #969799;

  h1 {
    margin: 16px 0 8px;
    color: #323233;
    font-size: 20px;
  }

  p {
    margin: 0;
  }
}
</style>
