<script setup lang="ts">
import { showToast } from 'vant';
import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'CartPage' });

const cartStore = useCartStore();

const selectedItems = computed(() => cartStore.items.filter(item => item.checked));
const selectedCount = computed(() => selectedItems.value.reduce((count, item) => count + item.quantity, 0));
const merchandiseAmount = computed(() => selectedItems.value.reduce(
  (total, item) => total + item.price * item.quantity,
  0,
));
// 优惠金额预留给优惠券、满减等后续规则。
const discountAmount = computed(() => 0);
const totalAmount = computed(() => Math.max(merchandiseAmount.value - discountAmount.value, 0));
const allSelected = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(item => item.checked),
  set: checked => cartStore.items.forEach((item) => {
    item.checked = checked;
  }),
});

function handleSubmit() {
  showToast('结算功能即将上线');
}
</script>

<template>
  <section class="cart-page">
    <div class="cart-page__content">
      <div v-if="cartStore.items.length" class="cart-list">
        <article v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <van-checkbox v-model="item.checked" class="cart-item__checkbox" />
          <van-image
            class="cart-item__image" fit="cover" :src="item.imageUrl"
            :alt="item.name"
          />
          <div class="cart-item__content">
            <h2 class="cart-item__name">
              {{ item.name }}
            </h2>
            <p v-if="item.specification" class="cart-item__specification">
              {{ item.specification }}
            </p>
            <div class="cart-item__bottom">
              <span class="cart-item__price">¥{{ moneyThousand(item.price) }}</span>
              <van-stepper v-model="item.quantity" :min="1" integer />
            </div>
          </div>
        </article>
      </div>

      <van-empty v-else description="购物车还是空的" />
    </div>

    <van-submit-bar
      v-if="cartStore.items.length"
      :price="Math.round(totalAmount * 100)"
      :button-text="`结算(${selectedCount})`"
      :disabled="selectedCount === 0"
      @submit="handleSubmit"
    >
      <template #tip>
        <div class="cart-summary">
          <span>商品金额 ¥{{ moneyThousand(merchandiseAmount) }}</span>
          <span class="cart-summary__discount">优惠 ¥{{ moneyThousand(discountAmount) }}</span>
        </div>
      </template>
      <van-checkbox v-model="allSelected">
        全选
      </van-checkbox>
    </van-submit-bar>
  </section>
</template>

<style scoped lang="scss">
.cart-page {
  min-height: 100%;

  &__content {
    padding: 12px 12px calc(110px + var(--van-tabbar-height) + env(safe-area-inset-bottom));
  }

  .cart-list {
    display: grid;
    gap: 12px;
  }

  .cart-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: #fff;

    &__checkbox {
      flex: none;
    }

    &__image {
      width: 92px;
      height: 92px;
      flex: none;
      overflow: hidden;
      border-radius: 8px;
      background: #f2f3f5;
    }

    &__content {
      display: flex;
      min-width: 0;
      height: 92px;
      flex: 1;
      flex-direction: column;
    }

    &__name {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      color: #323233;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    &__specification {
      width: fit-content;
      max-width: 100%;
      margin: 6px 0 auto;
      padding: 2px 6px;
      overflow: hidden;
      border-radius: 3px;
      color: #969799;
      background: #f7f8fa;
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    &__price {
      color: #ee0a24;
      font-size: 16px;
      font-weight: 600;
    }
  }

  :deep(.van-submit-bar) {
    bottom: calc(var(--van-tabbar-height) + env(safe-area-inset-bottom));
  }

  .cart-summary {
    display: flex;
    justify-content: space-between;
    color: #646566;
    font-size: 12px;

    &__discount {
      color: #ee0a24;
    }
  }
}
</style>
