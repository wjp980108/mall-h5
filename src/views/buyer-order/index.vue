<script setup lang="ts">
import type { BuyerOrder, BuyerOrderStatus } from '@/api/buyerOrder';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchBuyerOrders } from '@/api/buyerOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'BuyerOrdersPage' });

type OrderTab = 'all' | BuyerOrderStatus;

const route = useRoute();
const router = useRouter();
const activeTab = ref<OrderTab>(getInitialTab());
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const initialLoading = ref(true);
const page = ref(1);
const pageSize = 10;
const orders = ref<BuyerOrder[]>([]);

const tabs: Array<{ name: OrderTab; title: string }> = [
  { name: 'all', title: '全部订单' },
  { name: 'pending-payment', title: '待付款' },
  { name: 'paid', title: '已付款' },
  { name: 'cancelled', title: '已取消' },
];

function getInitialTab(): OrderTab {
  const status = route.query.status;

  if (status === 'pending-payment' || status === 'paid' || status === 'cancelled')
    return status;

  return 'all';
}

function statusLabel(status: BuyerOrderStatus) {
  return {
    'pending-payment': '待付款',
    'paid': '已付款',
    'cancelled': '已取消',
  }[status];
}

async function loadOrders(reset = false) {
  if (loading.value || (finished.value && !reset))
    return;

  const currentPage = reset ? 1 : page.value;
  loading.value = true;

  try {
    const { data } = await fetchBuyerOrders({
      page: currentPage,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value,
    });
    orders.value = currentPage === 1 ? data.list : [...orders.value, ...data.list];
    page.value = currentPage + 1;
    finished.value = orders.value.length >= data.total;
  }
  finally {
    loading.value = false;
    initialLoading.value = false;
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
  initialLoading.value = true;
  void refreshOrders();
}

function payOrder(order: BuyerOrder) {
  router.push({ name: 'BuyerOrderPayment', params: { id: order.id } });
}

onMounted(() => loadOrders(true));
</script>

<template>
  <section class="buyer-orders-page">
    <van-tabs v-model:active="activeTab" class="buyer-orders-page__tabs" @change="handleTabChange">
      <van-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :title="tab.title" />
    </van-tabs>

    <div class="buyer-orders-page__content">
      <van-pull-refresh v-model="refreshing" @refresh="refreshOrders">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多订单了" @load="loadOrders">
          <van-skeleton v-if="initialLoading" title :row="12" />

          <van-empty v-else-if="!orders.length" image="search" description="暂无相关订单" />

          <div v-else class="buyer-order-list">
            <article v-for="order in orders" :key="order.id" class="buyer-order-card">
              <header class="buyer-order-card__header">
                <span>订单号：{{ order.id }}</span>
                <strong :class="`is-${order.status}`">{{ statusLabel(order.status) }}</strong>
              </header>

              <div v-for="item in order.items" :key="item.id" class="buyer-order-card__item">
                <van-image class="buyer-order-card__image" :src="item.imageUrl" :alt="item.name" fit="cover" />
                <div class="buyer-order-card__product">
                  <h2>{{ item.name }}</h2>
                  <p v-if="item.specification">
                    {{ item.specification }}
                  </p>
                  <div>
                    <span>¥{{ moneyThousand(item.price) }}</span>
                    <small>×{{ item.quantity }}</small>
                  </div>
                </div>
              </div>

              <footer class="buyer-order-card__footer">
                <span>下单时间：{{ order.createdAt }}</span>
                <p>共 {{ order.items.reduce((total, item) => total + item.quantity, 0) }} 件，实付款 <strong>¥{{ moneyThousand(order.totalAmount) }}</strong></p>
                <van-button v-if="order.status === 'pending-payment'" round size="small" type="primary" @click="payOrder(order)">
                  付款
                </van-button>
              </footer>
            </article>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </section>
</template>

<style scoped lang="scss">
.buyer-orders-page {
  &__content {
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

    .is-pending-payment {
      color: #ee0a24;
    }

    .is-paid {
      color: var(--van-primary-color);
    }

    .is-cancelled {
      color: #969799;
    }
  }

  &__item {
    display: flex;
    gap: 10px;
    padding: 12px;
  }

  &__image {
    width: 78px;
    height: 78px;
    flex: none;
    overflow: hidden;
    border-radius: 8px;
    background: #f2f3f5;
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
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      color: #323233;
      font-size: 14px;

      small {
        color: #969799;
        font-size: 12px;
      }
    }
  }

  &__footer {
    position: relative;
    min-height: 70px;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 5px 12px;
    border-top: 1px solid #f2f3f5;

    > span {
      width: 100%;
    }

    p {
      margin: 0;

      strong {
        color: #ee0a24;
        font-size: 15px;
      }
    }
  }
}
</style>
