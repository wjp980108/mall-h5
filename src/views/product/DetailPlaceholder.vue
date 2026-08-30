<script setup lang="ts">
import type { ProductDetail } from '@/api/product.ts';
import type { AddCartItem } from '@/stores/cart';
import { showSuccessToast, showToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProductDetail, submitProductOrder } from '@/api/product.ts';
import { useCartStore } from '@/stores/cart';

defineOptions({ name: 'ProductDetailPage' });

const route = useRoute();
const cartStore = useCartStore();
const product = ref<ProductDetail | null>(null);
const loading = ref(true);
const loadError = ref(false);
const submitting = ref(false);
const productId = computed(() => String(route.params.id ?? ''));

async function loadProductDetail() {
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
    loading.value = false;
  }
}

onMounted(loadProductDetail);

function toCartItem(product: ProductDetail): AddCartItem {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.images[0] ?? '',
    price: Number(product.price.replaceAll(',', '')),
  };
}

function handleAddToCart() {
  if (!product.value)
    return;

  cartStore.addItem(toCartItem(product.value));
  showToast('已加入购物车');
}

async function handleBuyNow() {
  if (!product.value || submitting.value)
    return;

  submitting.value = true;

  try {
    const { data } = await submitProductOrder({
      productId: product.value.id,
      quantity: 1,
    });
    showSuccessToast(`下单成功：${data.orderId}`);
  }
  finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="product-detail">
    <van-skeleton v-if="loading" title :row="12" class="product-detail__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="商品加载失败">
      <van-button round type="primary" size="small" @click="loadProductDetail">
        重新加载
      </van-button>
    </van-empty>

    <van-empty v-else-if="!product" description="商品不存在" />

    <template v-else>
      <van-swipe v-if="product.images.length > 1" class="product-detail__gallery" :autoplay="3500">
        <van-swipe-item v-for="image in product.images" :key="image">
          <van-image :src="image" fit="cover" width="100%" height="100%" />
        </van-swipe-item>
      </van-swipe>
      <van-image
        v-else
        class="product-detail__gallery"
        :src="product.images[0]"
        fit="cover"
        width="100%"
        height="100%"
      />

      <section class="product-detail__info">
        <div class="product-detail__price">
          ¥{{ product.price }}
        </div>
        <h1>{{ product.name }}</h1>
        <p>{{ product.summary }}</p>
        <span>已售 {{ product.salesCount }}</span>
      </section>

      <section class="product-detail__description">
        <h2>商品详情</h2>
        <article v-html="product.detailHtml" />
      </section>

      <footer class="product-detail__actions">
        <van-button round plain type="primary" @click="handleAddToCart">
          加入购物车
        </van-button>
        <van-button round type="danger" :loading="submitting" @click="handleBuyNow">
          立即购买
        </van-button>
      </footer>
    </template>
  </section>
</template>

<style scoped lang="scss">
.product-detail {
  min-height: 100%;
  background: #f7f8fa;

  &__skeleton {
    margin: 16px;
  }

  &__gallery {
    display: block;
    height: min(100vw, 480px);
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
    padding-bottom: calc(76px + env(safe-area-inset-bottom));

    > h2 {
      margin: 0 0 16px;
      color: #323233;
      font-size: 16px;
      line-height: 24px;
    }

    :deep(article) {
      color: #323233;
      font-size: 14px;
      line-height: 1.7;

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        font-size: 18px;
        line-height: 26px;
      }

      h3 {
        margin-top: 20px;
        font-size: 16px;
        line-height: 24px;
      }

      p,
      ul {
        margin-top: 12px;
      }

      ul {
        margin-bottom: 0;
        padding-left: 20px;
      }

      img {
        display: block;
        width: 100%;
        height: auto;
        margin-top: 16px;
      }
    }
  }

  &__actions {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid #ebedf0;
    background: #fff;
  }
}

@media (min-width: 480px) {
  .product-detail__actions {
    right: auto;
    left: 50%;
    width: var(--mall-content-width);
    transform: translateX(-50%);
  }
}
</style>
