<script setup lang="ts">
import type { Agreement } from '@/api/agreement';
import { onMounted, ref } from 'vue';
import { fetchAgreement } from '@/api/agreement';
import AppNavBar from '@/components/AppNavBar/index.vue';

const props = defineProps<{
  type: Agreement['type'];
  fallbackTitle: string;
}>();

const agreement = ref<Agreement | null>(null);

async function loadAgreement() {
  const res = await fetchAgreement(props.type);
  agreement.value = res.data;
}

onMounted(loadAgreement);
</script>

<template>
  <div class="agreement-page">
    <AppNavBar />
    <main class="agreement-page__main">
      <van-empty v-if="!agreement?.content" :description="`暂无${fallbackTitle}`" />
      <article v-else class="agreement-page__content" v-html="agreement.content" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.agreement-page {
  min-height: 100%;

  .agreement-page__main {
    padding: 16px;
    box-sizing: border-box;
  }

  .agreement-page__skeleton {
    padding-top: 8px;
  }

  .agreement-page__content {
    color: var(--van-text-color);
    font-size: 15px;
    line-height: 1.85;
    overflow-wrap: anywhere;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 24px 0 12px;
      color: var(--van-text-color);
      font-weight: 600;
      line-height: 1.5;
    }

    :deep(h1) {
      margin-top: 0;
      font-size: 24px;
    }

    :deep(h2) {
      font-size: 20px;
    }

    :deep(h3) {
      font-size: 18px;
    }

    :deep(p) {
      margin: 0 0 16px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 16px;
      padding-left: 24px;
    }

    :deep(li + li) {
      margin-top: 6px;
    }

    :deep(a) {
      color: var(--van-primary-color);
      text-decoration: underline;
    }

    :deep(img) {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 16px 0;
    }

    :deep(table) {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
    }

    :deep(th),
    :deep(td) {
      padding: 8px;
      border: 1px solid var(--van-border-color);
    }
  }
}
</style>
