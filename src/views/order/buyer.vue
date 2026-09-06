<script setup lang="ts">
import type { BuyerOrder, BuyerOrderStatus } from '@/api/buyerOrder';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchBuyerOrders } from '@/api/buyerOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'BuyerOrdersPage' });

type OrderTab = 0 | 1 | 2 | 5;

const route = useRoute();
const router = useRouter();
const activeTab = ref<OrderTab>(getInitialTab());
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const pageSize = 10;
const orders = ref<BuyerOrder[]>([]);

const tabs: Array<{ name: OrderTab; title: string }> = [
  { name: 0, title: '全部' },
  { name: 1, title: '待付款' },
  { name: 2, title: '已付款' },
  { name: 5, title: '已取消' },
];

function getInitialTab(): OrderTab {
  const status = Number(route.query.status);

  if ([1, 2, 5].includes(status))
    return status as OrderTab;

  return 0;
}

function statusLabel(status: BuyerOrderStatus) {
  return {
    1: '待付款',
    2: '已付款',
    3: '已确认',
    4: '已代售',
    5: '已取消',
  }[status];
}

async function loadOrders(reset = false) {
  if (loading.value || (finished.value && !reset))
    return;

  const currentPage = reset ? 1 : pageNum.value;
  loading.value = true;

  try {
    const { data } = await fetchBuyerOrders({
      pageNum: currentPage,
      pageSize,
      orderStatus: activeTab.value || undefined,
    });
    orders.value = currentPage === 1 ? data.list : [...orders.value, ...data.list];
    pageNum.value = currentPage + 1;
    finished.value = orders.value.length >= data.total;
  }
  finally {
    loading.value = false;
  }
}

async function refreshOrders() {
  finished.value = false;

  try {
    await loadOrders(true);
  }
  finally {
    refreshing.value = false;
  }
}

function handleTabChange() {
  void refreshOrders();
}

function payOrder(order: BuyerOrder) {
  router.push({ name: 'BuyerOrderPayment', params: { id: order.id } });
}

onMounted(() => loadOrders(true));
</script>

<template>
  <div class="buyer-orders-page">
    <van-tabs v-model:active="activeTab" class="buyer-orders-page__tabs" @change="handleTabChange">
      <van-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :title="tab.title" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" class="buyer-orders-page__refresh" @refresh="refreshOrders">
      <van-empty v-if="!orders.length && !loading" image="search" description="暂无相关订单" />

      <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多订单了" @load="loadOrders">
        <div class="buyer-order-list">
          <div v-for="order in orders" :key="order.id" class="buyer-order-card">
            <div class="buyer-order-card__header">
              <span>订单号：{{ order.orderNo }}</span>
              <strong :class="`is-${order.orderStatus}`">{{ order.orderStatusName || statusLabel(order.orderStatus) }}</strong>
            </div>

            <div class="buyer-order-card__item">
              <div class="buyer-order-card__image" aria-hidden="true">
                <van-icon name="goods-collect-o" />
              </div>
              <div class="buyer-order-card__product">
                <h2>{{ order.goodsName }}</h2>
                <p>卖家：{{ order.sellerName }} {{ order.sellerPhone }}</p>
                <div>
                  <span>¥{{ moneyThousand(order.rushPrice) }}</span>
                </div>
              </div>
            </div>

            <div class="buyer-order-card__footer">
              <span>下单时间：{{ order.createTime }}</span>
              <span v-if="order.orderStatus === 1 && order.payDeadline">付款截止：{{ order.payDeadline }}</span>
              <van-button v-if="order.orderStatus === 1" plain round size="small" type="primary" class="buyer-order-card__pay-button" @click="payOrder(order)">
                去付款
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
.buyer-orders-page {
  &__refresh {
    flex: 1;
    padding: 12px;
  }

  &__tabs {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fff;
  }

  :deep(.van-tabs__wrap) {
    background: #fff;
  }

  :deep(.van-pull-refresh__track) {
    min-height: 100%;
  }
}

.buyer-order-list {
  display: grid;
  gap: 12px;
}

.buyer-order-card {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;

  &__header,
  &__footer {
    display: flex;
    align-items: center;
    padding: 12px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }

  &__header {
    justify-content: space-between;
    border-bottom: 1px solid #f2f3f5;

    strong {
      font-size: 14px;
      font-weight: 500;
    }

    .is-1 {
      color: #ee0a24;
    }

    .is-2,
    .is-3,
    .is-4 {
      color: var(--van-primary-color);
    }
  }

  &__item {
    display: flex;
    gap: 10px;
    padding: 12px;
  }

  &__image {
    display: flex;
    width: 78px;
    height: 78px;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 8px;
    background: #f2f3f5;
    color: var(--van-primary-color);
    font-size: 34px;
  }

  &__product {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;

    h2,
    p {
      margin: 0;
    }

    h2 {
      display: -webkit-box;
      overflow: hidden;
      color: #323233;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    p {
      width: fit-content;
      max-width: 100%;
      margin-top: 6px;
      overflow: hidden;
      color: #969799;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > div {
      margin-top: auto;
      color: #ee0a24;
      font-size: 14px;
    }
  }

  &__footer {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 5px 12px;
    border-top: 1px solid #f2f3f5;

    > span {
      width: 100%;
    }
  }

  &__pay-button {
    min-width: 76px;
    border-color: #bfdbfe;
    background: #eff6ff;
    font-size: 13px;
  }
}
</style>
