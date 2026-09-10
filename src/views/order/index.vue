<script setup lang="ts">
import type { RobOrder, RobOrderStatus } from '@/api/robOrder';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMyRobOrders } from '@/api/robOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'MyOrdersPage' });

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const pageSize = 10;
const orders = ref<RobOrder[]>([]);
const router = useRouter();

function statusLabel(status: RobOrderStatus) {
  return {
    1: '正常',
    2: '已取消',
  }[status];
}

async function loadOrders(reset = false) {
  if (loading.value || (finished.value && !reset))
    return;

  const currentPage = reset ? 1 : pageNum.value;
  loading.value = true;

  try {
    const { data } = await fetchMyRobOrders({
      pageNum: currentPage,
      pageSize,
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

function viewOrderDetail(order: RobOrder) {
  router.push({ name: 'RobOrderDetail', params: { id: order.id } });
}

onMounted(() => loadOrders(true));
</script>

<template>
  <div class="my-orders-page">
    <van-pull-refresh v-model="refreshing" class="my-orders-page__refresh" @refresh="refreshOrders">
      <van-empty v-if="!orders.length && !loading" image="search" description="暂无订单" />

      <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多订单了" @load="loadOrders">
        <div class="my-order-list">
          <button v-for="order in orders" :key="order.id" type="button" class="my-order-card" @click="viewOrderDetail(order)">
            <div class="my-order-card__header">
              <span>订单号：{{ order.orderNo }}</span>
              <strong :class="`is-${order.orderStatus}`">{{ order.orderStatusName || statusLabel(order.orderStatus) }}</strong>
            </div>

            <div class="my-order-card__item">
              <van-image v-if="order.goodsThumb" class="my-order-card__image" :src="order.goodsThumb" fit="cover" />
              <div v-else class="my-order-card__image" aria-hidden="true">
                <van-icon name="goods-collect-o" />
              </div>
              <div class="my-order-card__product">
                <h2>{{ order.goodsName }}</h2>
                <p v-if="order.sessionName">
                  抢购场次：{{ order.sessionName }}
                </p>
                <div>
                  <span>¥{{ moneyThousand(order.unitPrice) }}</span>
                  <small>×{{ order.quantity }}</small>
                </div>
              </div>
            </div>

            <div class="my-order-card__footer">
              <span>下单时间：{{ order.createTime }}</span>
              <p>
                共 {{ order.quantity }} 件，合计 <strong>¥{{ moneyThousand(order.totalAmount) }}</strong>
                <van-icon name="arrow" />
              </p>
            </div>
          </button>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
.my-orders-page {
  &__refresh {
    flex: 1;
    padding: 12px;
  }

  :deep(.van-pull-refresh__track) {
    min-height: 100%;
  }
}

.my-order-list {
  display: grid;
  gap: 12px;
}

.my-order-card {
  width: 100%;
  padding: 0;
  border: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;

  &:active {
    background: #fafafa;
  }

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
      color: var(--van-primary-color);
    }

    .is-2 {
      color: #969799;
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
      display: flex;
      gap: 8px;
      align-items: baseline;
      margin-top: auto;
      color: #ee0a24;
      font-size: 14px;

      small {
        color: #969799;
        font-size: 12px;
      }
    }
  }

  &__footer {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 12px;
    border-top: 1px solid #f2f3f5;

    p {
      margin: 0;
      color: #646566;

      strong {
        color: #ee0a24;
        font-size: 14px;
      }

      .van-icon {
        margin-left: 4px;
        color: #c8c9cc;
      }
    }
  }
}
</style>
