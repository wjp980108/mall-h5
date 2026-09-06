<script setup lang="ts">
import type { NoticeDetail } from '@/api/home.ts';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchNoticeDetail } from '@/api/home.ts';

defineOptions({ name: 'NoticeDetailPage' });

const route = useRoute();
const notice = ref<NoticeDetail | null>(null);
const loading = ref(true);
const loadError = ref(false);
const noticeId = computed(() => Number(route.params.id));

async function loadNoticeDetail() {
  if (!Number.isSafeInteger(noticeId.value) || noticeId.value < 1) {
    loading.value = false;
    loadError.value = true;
    return;
  }

  loading.value = true;
  loadError.value = false;

  try {
    const { data } = await fetchNoticeDetail(noticeId.value);
    notice.value = data;
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}

onMounted(loadNoticeDetail);
</script>

<template>
  <div class="notice-detail-page">
    <van-skeleton v-if="loading" title :row="10" class="notice-detail-page__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="公告加载失败">
      <van-button round type="primary" size="small" @click="loadNoticeDetail">
        重新加载
      </van-button>
    </van-empty>

    <van-empty v-else-if="!notice" description="公告不存在" />

    <div v-else class="notice-detail-page__content">
      <div class="notice-detail-page__header">
        <h1>{{ notice.title }}</h1>
        <p class="notice-detail-page__meta">
          <span><van-icon name="clock-o" />{{ notice.createTime }}</span>
          <span><van-icon name="eye-o" />{{ notice.readCount }} 阅读</span>
        </p>
      </div>
      <div class="notice-detail-page__divider" />
      <div class="notice-detail-page__body" v-html="notice.content" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.notice-detail-page {
  background: #fff;

  &__skeleton {
    margin: 24px 20px;
  }

  &__content {
    padding: 28px 20px calc(40px + env(safe-area-inset-bottom));
  }

  &__header {
    h1 {
      margin: 0;
      color: #1f2329;
      font-size: 24px;
      font-weight: 600;
      line-height: 34px;
      word-break: break-word;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin: 14px 0 0;
    color: #969799;
    font-size: 13px;
    line-height: 20px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  &__divider {
    height: 1px;
    margin: 24px 0;
    background: #ebedf0;
  }

  &__body {
    color: #323233;
    font-size: 16px;
    line-height: 1.9;
    word-break: break-word;

    :deep(img) {
      display: block;
      width: 100%;
      height: auto;
      margin: 20px 0;
      border-radius: 8px;
    }

    :deep(p) {
      margin: 0 0 18px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 18px;
      padding-left: 24px;
    }

    :deep(a) {
      color: var(--van-primary-color);
      text-decoration: underline;
    }
  }
}
</style>
