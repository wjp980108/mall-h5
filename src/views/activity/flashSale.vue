<script setup lang="ts">
import type { FlashSaleSession } from '@/api/flashSale.ts';
import type { HomeBanner, HomeNotice } from '@/api/home.ts';
import { onActivated, ref } from 'vue';
import { fetchFlashSaleBanners, fetchFlashSaleSessions, fetchHomeNotices } from '@/api/flashSale.ts';

defineOptions({ name: 'FlashSalePage' });

const banners = ref<HomeBanner[]>([]);
const notices = ref<HomeNotice[]>([]);
const sessions = ref<FlashSaleSession[]>([]);
const refreshing = ref(false);
const loading = ref(false);
const loadError = ref(false);

async function loadFlashSalePage() {
  if (loading.value)
    return;

  loading.value = true;
  loadError.value = false;

  try {
    const [, , sessionResult] = await Promise.allSettled([
      fetchFlashSaleBanners().then(({ data }) => { banners.value = data; }),
      fetchHomeNotices().then(({ data }) => { notices.value = data; }),
      fetchFlashSaleSessions().then(({ data }) => { sessions.value = data; }),
    ]);
    loadError.value = sessionResult.status === 'rejected';
  }
  finally {
    loading.value = false;
  }
}

async function handleRefresh() {
  try {
    await loadFlashSalePage();
  }
  finally {
    refreshing.value = false;
  }
}

onActivated(loadFlashSalePage);
</script>

<template>
  <div class="flash-sale-page">
    <van-pull-refresh v-model="refreshing" :disabled="loading" @refresh="handleRefresh">
      <div class="flash-sale-page__content">
        <van-swipe
          v-if="banners.length"
          class="banner-swipe"
          :autoplay="3500"
          indicator-color="#fff"
        >
          <van-swipe-item v-for="banner in banners" :key="banner.id">
            <van-image :src="banner.imgUrl" fit="cover" width="100%" height="100%" />
          </van-swipe-item>
        </van-swipe>

        <van-notice-bar
          v-if="notices.length"
          class="flash-sale-notice"
          background="#fff4f0"
          color="#e85032"
          left-icon="volume-o"
          :scrollable="false"
        >
          <van-swipe vertical class="notice-swipe" :autoplay="3000" :show-indicators="false">
            <van-swipe-item v-for="notice in notices" :key="notice.id">
              <router-link class="notice-item" :to="{ name: 'NoticeDetail', params: { id: notice.id } }">
                {{ notice.title }}
              </router-link>
            </van-swipe-item>
          </van-swipe>
        </van-notice-bar>

        <section class="session-section">
          <div class="session-section__header">
            <h1>抢购场次</h1>
            <span>限时开抢，先到先得</span>
          </div>

          <van-loading v-if="loading && !sessions.length" class="page-loading" />

          <van-empty v-else-if="loadError" image="error" description="加载失败">
            <van-button round type="danger" size="small" @click="loadFlashSalePage">
              重新加载
            </van-button>
          </van-empty>

          <div v-else-if="sessions.length" class="session-list">
            <router-link
              v-for="session in sessions" :key="session.id" class="session-card"
              :to="{ name: 'FlashSaleGoods', params: { sessionId: session.id } }"
            >
              <van-image
                v-if="session.bgImg"
                lazy-load
                class="session-card__image"
                :src="session.bgImg"
                fit="cover"
              />
              <div class="session-card__mask" />
              <div class="session-card__content">
                <span class="session-card__eyebrow">FLASH SALE</span>
                <h2>{{ session.sessionName }}</h2>
                <p>{{ session.rushStartTime }} - {{ session.rushEndTime }}</p>
              </div>
              <van-icon class="session-card__arrow" name="arrow" color="#fff" size="20" />
            </router-link>
          </div>

          <van-empty v-else description="暂未开放抢购场次" />
        </section>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
.flash-sale-page {
  .van-pull-refresh {
    flex: 1;
  }

  &__content {
    padding: 12px;
  }

  .banner-swipe {
    height: 160px;
    overflow: hidden;
    border-radius: 12px;
    background: #f2d7d0;

    :deep(.van-image) {
      display: block;
    }
  }

  .flash-sale-notice {
    margin-top: 12px;
    border-radius: 8px;

    :deep(.van-notice-bar__content) {
      width: 100%;
    }

    .notice-item {
      display: block;
      overflow: hidden;
      color: inherit;
      text-decoration: none;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notice-swipe {
      height: 40px;
      line-height: 40px;

      :deep(.van-swipe-item) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .session-section {
    margin-top: 20px;

    &__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 12px;

      h1 {
        margin: 0;
        color: #323233;
        font-size: 20px;
        line-height: 28px;
      }

      span {
        color: #969799;
        font-size: 12px;
      }
    }
  }

  .page-loading {
    display: block;
    margin: 36px auto;
  }

  .session-list {
    display: grid;
    gap: 12px;
  }

  .session-card {
    position: relative;
    height: 118px;
    overflow: hidden;
    border-radius: 12px;
    background: #4b1d19;
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);

    &__image,
    &__mask {
      position: absolute;
      inset: 0;
    }

    &__image {
      width: 100%;
      height: 100%;
    }

    &__mask {
      background: linear-gradient(90deg, rgb(42 14 12 / 86%) 0%, rgb(42 14 12 / 58%) 52%, rgb(42 14 12 / 18%) 100%);
    }

    &__content {
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 18px;
      transform: translateY(-50%);
      color: #fff;

      h2,
      p {
        margin: 0;
      }

      h2 {
        margin-top: 4px;
        font-size: 20px;
        line-height: 28px;
      }

      p {
        margin-top: 6px;
        color: rgb(255 255 255 / 88%);
        font-size: 13px;
      }
    }

    &__eyebrow {
      color: #ffd7c6;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.8px;
    }

    &__arrow {
      position: absolute;
      z-index: 1;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
    }
  }
}
</style>
