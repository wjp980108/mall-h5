<script setup lang="ts">
import type { SellerOrder, SellerOrderStatus } from '@/api/sellerOrder';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { onMounted, ref } from 'vue';
import { commissionSellerOrderListing, fetchSellerOrders } from '@/api/sellerOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'SellerOrdersPage' });

type OrderTab = 'all' | SellerOrderStatus;

const activeTab = ref<OrderTab>('all');
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const initialLoading = ref(true);
const listingOrderId = ref<string | null>(null);
const page = ref(1);
const pageSize = 10;
const orders = ref<SellerOrder[]>([]);

const tabs: Array<{ name: OrderTab; title: string }> = [
  { name: 'all', title: '全部订单' },
  { name: 'unsold', title: '待售' },
  { name: 'sold', title: '已售出' },
  { name: 'cancelled', title: '已取消' },
];

function statusLabel(status: SellerOrderStatus) {
  return {
    unsold: '待售',
    sold: '已售出',
    cancelled: '已取消',
  }[status];
}

async function loadOrders(reset = false) {
  if (loading.value || (finished.value && !reset))
    return;

  const currentPage = reset ? 1 : page.value;
  loading.value = true;

  try {
    const { data } = await fetchSellerOrders({
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

async function commissionListing(order: SellerOrder) {
  if (listingOrderId.value || order.listedAt)
    return;

  try {
    await showConfirmDialog({
      title: '委托上架',
      message: '确认委托平台上架该商品吗？',
      confirmButtonText: '确认上架',
    });
  }
  catch {
    return;
  }

  listingOrderId.value = order.id;

  try {
    const { data } = await commissionSellerOrderListing(order.id);
    const index = orders.value.findIndex(item => item.id === data.id);

    if (index !== -1)
      orders.value[index] = data;

    showSuccessToast('已委托上架');
  }
  catch (error) {
    showToast(error instanceof Error ? error.message : '委托上架失败，请稍后重试');
  }
  finally {
    listingOrderId.value = null;
  }
}

onMounted(() => loadOrders(true));
</script>

<template>
  <section class="seller-orders-page">
    <van-tabs v-model:active="activeTab" class="seller-orders-page__tabs" @change="handleTabChange">
      <van-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :title="tab.title" />
    </van-tabs>

    <div class="seller-orders-page__content">
      <van-pull-refresh v-model="refreshing" @refresh="refreshOrders">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多订单了" @load="loadOrders">
          <van-skeleton v-if="initialLoading" title :row="12" />

          <van-empty v-else-if="!orders.length" image="search" description="暂无相关订单" />

          <div v-else class="seller-order-list">
            <article v-for="order in orders" :key="order.id" class="seller-order-card">
              <header class="seller-order-card__header">
                <span>订单号：{{ order.id }}</span>
                <strong :class="`is-${order.status}`">{{ statusLabel(order.status) }}</strong>
              </header>

              <div v-for="item in order.items" :key="item.id" class="seller-order-card__item">
                <van-image
                  class="seller-order-card__image"
                  lazy-load
                  :src="item.imageUrl"
                  :alt="item.name"
                  fit="cover"
                />
                <div class="seller-order-card__product">
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

              <footer class="seller-order-card__footer">
                <span>入库时间：{{ order.createdAt }}</span>
                <span v-if="order.soldAt">售出时间：{{ order.soldAt }}</span>
                <span v-else-if="order.listedAt">委托上架：{{ order.listedAt }}</span>
                <p>共 {{ order.items.reduce((total, item) => total + item.quantity, 0) }} 件，货值 <strong>¥{{ moneyThousand(order.totalAmount) }}</strong></p>
                <van-button
                  v-if="order.status === 'unsold'"
                  round
                  size="small"
                  type="primary"
                  :loading="listingOrderId === order.id"
                  :disabled="Boolean(order.listedAt)"
                  @click="commissionListing(order)"
                >
                  {{ order.listedAt ? '已委托上架' : '委托上架' }}
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
.seller-orders-page {
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

.seller-order-list {
  display: grid;
  gap: 12px;
}

.seller-order-card {
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

    .is-unsold {
      color: #ee0a24;
    }

    .is-sold {
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
