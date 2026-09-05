<script setup lang="ts">
import type { HomeBanner, HomeNotice, HomeProduct } from '@/api/home.ts';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchHomeBanners, fetchHomeNotices, fetchHomeProducts } from '@/api/home.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'HomePage' });

const router = useRouter();
const keyword = ref('');
const banners = ref<HomeBanner[]>([]);
const notices = ref<HomeNotice[]>([]);
const products = ref<HomeProduct[]>([]);
const page = ref(0);
const refreshing = ref(false);
const loading = ref(false);
const loadError = ref(false);
const finished = ref(false);

async function loadPromotions() {
  await Promise.allSettled([
    fetchHomeBanners().then(({ data }) => {
      banners.value = data;
    }),
    fetchHomeNotices().then(({ data }) => {
      notices.value = data;
    }),
  ]);
}

async function loadHomeData(targetPage: number) {
  const { data } = await fetchHomeProducts({ pageNum: targetPage, pageSize: 10 });
  products.value = targetPage === 1 ? data.list : [...products.value, ...data.list];
  page.value = targetPage;
  finished.value = products.value.length >= data.total;
}

async function handleRefresh() {
  loadError.value = false;

  try {
    await Promise.all([loadPromotions(), loadHomeData(1)]);
  }
  catch {
    loadError.value = true;
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

function openProductDetail(productId: number) {
  router.push({ name: 'ProductDetail', params: { id: productId } });
}

onMounted(loadPromotions);
</script>

<template>
  <div class="home-page">
    <div class="home-page__search">
      <van-search v-model="keyword" clearable placeholder="搜索商品" shape="round" />
    </div>

    <van-pull-refresh v-model="refreshing" class="home-page__refresh" @refresh="handleRefresh">
      <div class="home-page__content">
        <van-swipe
          v-if="banners.length" class="banner-swipe" :autoplay="3500" indicator-color="#fff"
        >
          <van-swipe-item v-for="banner in banners" :key="banner.id">
            <van-image :src="banner.imgUrl" fit="cover" width="100%" height="100%" />
          </van-swipe-item>
        </van-swipe>

        <van-notice-bar
          v-if="notices.length"
          class="home-notice"
          background="#fff7e8"
          color="#9a6519"
          left-icon="volume-o"
          :scrollable="false"
        >
          <van-swipe vertical class="notice-swipe" :autoplay="3000" :show-indicators="false">
            <van-swipe-item v-for="notice in notices" :key="notice.id">
              <router-link
                class="notice-item"
                :to="{ name: 'NoticeDetail', params: { id: notice.id } }"
              >
                {{ notice.title }}
              </router-link>
            </van-swipe-item>
          </van-swipe>
        </van-notice-bar>

        <div class="product-section">
          <van-list
            v-model:error="loadError"
            v-model:loading="loading"
            :disabled="refreshing"
            :finished="finished"
            error-text="加载失败，点击重试"
            :finished-text="products.length ? '没有更多了' : ''"
            @load="handleLoad"
          >
            <div v-if="products.length" class="waterfall-list">
              <div
                v-for="product in products" :key="product.id"
                class="waterfall-list__item product-card"
                role="button"
                tabindex="0"
                @click="openProductDetail(product.id)"
                @keydown.enter="openProductDetail(product.id)"
              >
                <van-image
                  class="product-card__image"
                  :src="product.goodsThumb"
                  fit="cover"
                  width="100%"
                />
                <div class="product-card__info">
                  <h2 class="product-card__name">
                    {{ product.goodsName }}
                  </h2>
                  <span class="product-card__price">¥{{ moneyThousand(product.price) }}</span>
                  <span class="product-card__sales">已售 {{ product.sales }}</span>
                </div>
              </div>
            </div>
          </van-list>

          <van-empty
            v-if="page > 0 && !products.length"
            description="暂无推荐商品"
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
  }

  &__refresh {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;

    :deep(.van-pull-refresh__track) {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 12px;

    .banner-swipe {
      height: 160px;
      border-radius: 10px;
      background: #e9edf3;

      :deep(.van-image) {
        display: block;
      }
    }

    .home-notice {
      margin-top: 12px;
      border-radius: 8px;

      :deep(.van-notice-bar__content) {
        width: 100%;
      }

      .notice-swipe {
        height: 40px;
        line-height: 40px;
      }

      .notice-item {
        display: block;
        overflow: hidden;
        color: inherit;
        text-decoration: none;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .product-section {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
      margin-top: 12px;

      :deep(.van-empty) {
        flex: 1;
      }

      .product-card {
        overflow: hidden;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 2px 8px rgb(0 0 0 / 3%);

        &__image {
          display: block;

          :deep(.van-image__img) {
            height: auto;
          }
        }

        &__info {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 8px;
          padding: 10px;
        }

        &__name {
          width: 100%;
          margin: 0;
          overflow: hidden;
          color: #323233;
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
          text-overflow: ellipsis;
          white-space: nowrap;
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
