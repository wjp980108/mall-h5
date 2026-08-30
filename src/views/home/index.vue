<script setup lang="ts">
import type { HomePageData } from '@/api/home.ts';
import { ref } from 'vue';
import { fetchHomePage } from '@/api/home.ts';

defineOptions({ name: 'HomePage' });

const keyword = ref('');
const homeData = ref<HomePageData>({
  banners: [],
  notices: [],
  products: {
    list: [],
    total: 0,
  },
});
const page = ref(0);
const refreshing = ref(false);
const loading = ref(false);
const loadError = ref(false);
const finished = ref(false);

async function loadHomeData(targetPage: number) {
  const { data } = await fetchHomePage({
    keyword: keyword.value,
    page: targetPage,
  });
  const products = targetPage === 1
    ? data.products.list
    : [...homeData.value.products.list, ...data.products.list];

  homeData.value = {
    ...data,
    products: {
      list: products,
      total: data.products.total,
    },
  };
  page.value = targetPage;
  finished.value = products.length >= data.products.total;
}

async function reloadHomeData() {
  loading.value = true;
  loadError.value = false;
  finished.value = false;

  try {
    await loadHomeData(1);
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}

async function handleRefresh() {
  try {
    await reloadHomeData();
  }
  finally {
    refreshing.value = false;
  }
}

async function handleLoad() {
  try {
    await loadHomeData(page.value + 1);
    loadError.value = false;
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="home-page">
    <div class="home-page__search">
      <van-search
        v-model="keyword"
        clearable
        placeholder="搜索商品"
        shape="round"
        @clear="reloadHomeData"
        @search="reloadHomeData"
      >
        <template #action>
          <button class="search-action" type="button" @click="reloadHomeData">
            搜索
          </button>
        </template>
      </van-search>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <div class="home-page__content">
        <van-swipe
          v-if="homeData.banners.length" class="banner-swipe" :autoplay="3500"
          indicator-color="#fff"
        >
          <van-swipe-item v-for="banner in homeData.banners" :key="banner.id">
            <van-image :src="banner.imageUrl" fit="cover" width="100%" height="100%" />
          </van-swipe-item>
        </van-swipe>

        <van-notice-bar
          v-if="homeData.notices.length"
          class="home-notice"
          background="#fff7e8"
          color="#9a6519"
          left-icon="volume-o"
          :scrollable="false"
        >
          <van-swipe vertical class="notice-swipe" :autoplay="3000" :show-indicators="false">
            <van-swipe-item v-for="notice in homeData.notices" :key="notice.id">
              {{ notice.content }}
            </van-swipe-item>
          </van-swipe>
        </van-notice-bar>

        <div class="product-section">
          <van-list
            v-model:error="loadError"
            v-model:loading="loading"
            :finished="finished"
            error-text="加载失败，点击重试"
            finished-text="没有更多了"
            @load="handleLoad"
          >
            <div v-if="homeData.products.list.length" class="waterfall-list">
              <div
                v-for="product in homeData.products.list" :key="product.id"
                class="waterfall-list__item product-card"
              >
                <van-image
                  class="product-card__image"
                  :src="product.imageUrl"
                  fit="cover"
                  width="100%"
                />
                <div class="product-card__info">
                  <span class="product-card__price">¥{{ product.price }}</span>
                  <span class="product-card__sales">已售 {{ product.salesCount }}</span>
                </div>
              </div>
            </div>
          </van-list>

          <van-empty
            v-if="finished && !homeData.products.list.length"
            description="未找到相关商品"
          />
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  &__search {
    position: sticky;
    z-index: 1;
    top: 0;
    background: #fff;

    .search-action {
      padding: 0;
      border: 0;
      background: transparent;
      color: #323233;
      font-size: 14px;
    }
  }

  &__content {
    padding: 12px;

    .banner-swipe {
      height: 160px;
      overflow: hidden;
      border-radius: 10px;
      background: #e9edf3;

      :deep(.van-image) {
        display: block;
      }
    }

    .home-notice {
      margin-top: 12px;
      border-radius: 8px;

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

    .product-section {
      margin-top: 12px;

      .product-card {
        overflow: hidden;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 2px 8px rgb(0 0 0 / 3%);

        &__image {
          display: block;

          :deep(.van-image__img) {
            display: block;
            height: auto;
          }
        }

        &__info {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          padding: 10px;
        }

        &__price {
          color: #ee0a24;
          font-size: 16px;
          font-weight: 600;
        }

        &__sales {
          overflow: hidden;
          color: #969799;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
