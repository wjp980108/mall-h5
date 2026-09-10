<script setup lang="ts">
import type { RobOrder, RobOrderStatus } from '@/api/robOrder';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchRobOrder } from '@/api/robOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'RobOrderDetailPage' });

const route = useRoute();
const order = ref<RobOrder | null>(null);
const loading = ref(true);

const hasReceiverInfo = computed(() => Boolean(
  order.value?.receiverName
  || order.value?.receiverPhone
  || order.value?.receiveAddress,
));

function statusLabel(status: RobOrderStatus) {
  return {
    1: '订单正常',
    2: '订单已取消',
  }[status];
}

async function loadOrder() {
  loading.value = true;

  try {
    const { data } = await fetchRobOrder(String(route.params.id));
    order.value = data;
  }
  finally {
    loading.value = false;
  }
}

onMounted(loadOrder);
</script>

<template>
  <div class="rob-order-detail-page">
    <van-skeleton v-if="loading" title :row="12" class="rob-order-detail-page__skeleton" />

    <van-empty v-else-if="!order" image="error" description="订单不存在或已删除" />

    <template v-else>
      <section class="rob-order-detail-page__status">
        <van-icon :name="order.orderStatus === 1 ? 'checked' : 'warning-o'" />
        <div>
          <h1>{{ order.orderStatusName || statusLabel(order.orderStatus) }}</h1>
          <p>{{ order.orderStatus === 1 ? '订单已创建，请留意后续订单状态。' : '该订单已取消。' }}</p>
        </div>
      </section>

      <main class="rob-order-detail-page__content">
        <section v-if="hasReceiverInfo" class="detail-card receiver-card">
          <div class="receiver-card__icon" aria-hidden="true">
            <van-icon name="location-o" />
          </div>
          <div class="receiver-card__content">
            <div v-if="order.receiverName || order.receiverPhone" class="receiver-card__contact">
              <strong>{{ order.receiverName }}</strong>
              <span>{{ order.receiverPhone }}</span>
            </div>
            <p>{{ order.receiveAddress }}</p>
          </div>
        </section>

        <section class="detail-card goods-card">
          <div class="goods-card__header">
            <span>商品信息</span>
            <span v-if="order.sessionName">{{ order.sessionName }}</span>
          </div>
          <div class="goods-card__item">
            <van-image v-if="order.goodsThumb" class="goods-card__image" :src="order.goodsThumb" fit="cover" />
            <div v-else class="goods-card__image" aria-hidden="true">
              <van-icon name="goods-collect-o" />
            </div>
            <div class="goods-card__details">
              <h2>{{ order.goodsName }}</h2>
              <p v-if="order.goodsSn">
                商品编号：{{ order.goodsSn }}
              </p>
              <div>
                <strong>¥{{ moneyThousand(order.unitPrice) }}</strong>
                <span>×{{ order.quantity }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-card amount-card">
          <h2>订单金额</h2>
          <dl>
            <div>
              <dt>商品单价</dt>
              <dd>¥{{ moneyThousand(order.unitPrice) }}</dd>
            </div>
            <div>
              <dt>商品数量</dt>
              <dd>×{{ order.quantity }}</dd>
            </div>
            <div class="amount-card__total">
              <dt>订单合计</dt>
              <dd>¥{{ moneyThousand(order.totalAmount) }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-card info-card">
          <h2>订单信息</h2>
          <dl>
            <div>
              <dt>订单编号</dt>
              <dd>{{ order.orderNo }}</dd>
            </div>
            <div>
              <dt>下单时间</dt>
              <dd>{{ order.createTime }}</dd>
            </div>
            <div v-if="order.rushStartTime || order.rushEndTime">
              <dt>抢购时间</dt>
              <dd>
                {{ order.rushStartTime }}<template v-if="order.rushStartTime && order.rushEndTime">
                  至
                </template>{{ order.rushEndTime }}
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </template>
  </div>
</template>

<style scoped lang="scss">
.rob-order-detail-page {
  &__skeleton {
    margin: 16px;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 18px 28px;
    background: linear-gradient(135deg, var(--van-primary-color), #5e9cff);
    color: #fff;

    > .van-icon {
      font-size: 34px;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: 19px;
      font-weight: 600;
      line-height: 28px;
    }

    p {
      margin-top: 2px;
      color: rgb(255 255 255 / 80%);
      font-size: 12px;
      line-height: 18px;
    }
  }

  &__content {
    display: grid;
    gap: 12px;
    padding: 0 12px 20px;
    margin-top: -12px;
  }
}

.detail-card {
  border-radius: 12px;
  background: #fff;
}

.receiver-card {
  display: flex;
  gap: 10px;
  padding: 16px;

  &__icon {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    background: #eff6ff;
    color: var(--van-primary-color);
    font-size: 19px;
  }

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__contact {
    display: flex;
    gap: 12px;
    align-items: center;
    color: #323233;
    line-height: 20px;

    strong {
      font-size: 15px;
    }

    span {
      color: #646566;
    }
  }

  p {
    margin: 5px 0 0;
    color: #646566;
    font-size: 13px;
    line-height: 20px;
  }
}

.goods-card {
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f2f3f5;
    color: #323233;
    font-size: 15px;
    font-weight: 600;

    span:last-child {
      overflow: hidden;
      color: #969799;
      font-size: 12px;
      font-weight: 400;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__item {
    display: flex;
    gap: 12px;
    padding: 16px;
  }

  &__image {
    display: flex;
    width: 84px;
    height: 84px;
    align-items: center;
    justify-content: center;
    flex: none;
    overflow: hidden;
    border-radius: 8px;
    background: #f2f3f5;
    color: var(--van-primary-color);
    font-size: 34px;
  }

  &__details {
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
      font-size: 15px;
      font-weight: 500;
      line-height: 21px;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    p {
      margin-top: 5px;
      overflow: hidden;
      color: #969799;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > div {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: baseline;
      margin-top: auto;

      strong {
        color: #ee0a24;
        font-size: 16px;
      }

      span {
        color: #969799;
        font-size: 12px;
      }
    }
  }
}

.amount-card,
.info-card {
  padding: 16px;

  h2 {
    margin: 0 0 10px;
    color: #323233;
    font-size: 15px;
    line-height: 22px;
  }

  dl {
    margin: 0;
  }

  dl > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 6px 0;
    color: #646566;
    font-size: 13px;
    line-height: 20px;
  }

  dt,
  dd {
    margin: 0;
  }

  dd {
    min-width: 0;
    color: #323233;
    text-align: right;
    overflow-wrap: anywhere;
  }
}

.amount-card {
  &__total {
    margin-top: 5px;
    padding-top: 12px !important;
    border-top: 1px solid #f2f3f5;

    dd {
      color: #ee0a24;
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>
