<script setup lang="ts">
import type { ProductDetail } from '@/api/product.ts';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProductDetail } from '@/api/product.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'ProductDetailPage' });

const route = useRoute();
const product = ref<ProductDetail | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const loadError = ref(false);
const productId = computed(() => Number(route.params.id));

async function loadProductDetail(showLoading = true) {
  if (!Number.isSafeInteger(productId.value) || productId.value < 1) {
    loadError.value = true;
    loading.value = false;
    return;
  }

  if (showLoading)
    loading.value = true;
  loadError.value = false;

  try {
    const { data } = await fetchProductDetail(productId.value);
    product.value = data;
  }
  catch {
    loadError.value = true;
  }
  finally {
    if (showLoading)
      loading.value = false;
  }
}

onMounted(loadProductDetail);

async function handleRefresh() {
  try {
    await loadProductDetail(false);
  }
  finally {
    refreshing.value = false;
  }
}
</script>

<template>
  <div class="product-detail">
    <van-skeleton v-if="loading" title :row="12" class="product-detail__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="商品加载失败">
      <van-button round type="primary" size="small" @click="loadProductDetail">
        重新加载
      </van-button>
    </van-empty>

    <van-empty v-else-if="!product" description="商品不存在" />

    <template v-else>
      <van-pull-refresh v-model="refreshing" class="product-detail__refresh" @refresh="handleRefresh">
        <div class="product-detail__content">
          <van-image class="product-detail__gallery" :src="product.goodsThumb" fit="cover" />

          <div class="product-detail__info">
            <div class="product-detail__price">
              ¥{{ moneyThousand(product.price) }}
            </div>
            <h1>{{ product.goodsName }}</h1>
            <p>已售 {{ product.sales }}</p>
          </div>

          <div class="product-detail__description">
            <h2>商品详情</h2>
            <van-cell-group inset>
              <van-cell v-if="product.categoryName" title="商品分类" :value="product.categoryName" />
              <van-cell v-if="product.goodsSn" title="商品货号" :value="product.goodsSn" />
              <van-cell title="库存" :value="String(product.stock)" />
            </van-cell-group>
          </div>
        </div>
      </van-pull-refresh>
    </template>
  </div>
</template>

<style scoped lang="scss">
.product-detail {
  &__refresh,
  &__content {
    min-height: 100%;
  }

  &__refresh {
    flex: 1;
  }

  &__skeleton {
    margin: 16px;
  }

  &__gallery {
    display: block;
    width: 100%;
    height: min(60vw, 280px);
    background: #f2f3f5;

    :deep(.van-image__img) {
      display: block;
    }
  }

  &__info,
  &__description {
    margin-top: 12px;
    padding: 16px;
    background: #fff;
  }

  &__price {
    color: #ee0a24;
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
  }

  &__info {
    h1,
    p {
      margin: 0;
    }

    h1 {
      margin-top: 10px;
      color: #323233;
      font-size: 18px;
      line-height: 26px;
    }

    p {
      margin-top: 8px;
      color: #646566;
      font-size: 14px;
      line-height: 20px;
    }

    span {
      display: block;
      margin-top: 12px;
      color: #969799;
      font-size: 12px;
    }
  }

  &__description {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));

    > h2 {
      margin: 0 0 16px;
      color: #323233;
      font-size: 16px;
      line-height: 24px;
    }

    :deep(.van-cell-group--inset) {
      margin: 0;
    }
  }
}
</style>
