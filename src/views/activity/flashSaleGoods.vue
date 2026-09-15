<script setup lang="ts">
import type { FlashSaleGoods, FlashSaleSession } from '@/api/flashSale.ts';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAddressList } from '@/api/address.ts';
import { fetchFlashSaleGoods, fetchFlashSaleGoodsDetail, fetchFlashSaleSessions, placeFlashSaleOrder } from '@/api/flashSale.ts';
import { useNavTitle } from '@/hooks/useNavTitle.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'FlashSaleGoodsPage' });

const route = useRoute();
const router = useRouter();
const { setNavCountdown, setNavTitle } = useNavTitle();
const sessionId = Number(route.params.sessionId);
const validSessionId = Number.isSafeInteger(sessionId) && sessionId > 0;
const session = ref<FlashSaleSession>();
const goods = ref<FlashSaleGoods[]>([]);
const nextPage = ref(1);
const loading = ref(false);
const loadError = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const orderingGoodsId = ref<number>();
let requesting = false;
let countdownTimer: ReturnType<typeof window.setTimeout> | undefined;
const title = computed(() => session.value?.sessionName || '抢购商品');

function getTodayTimestamp(time: string, dayOffset = 0) {
  const matched = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!matched)
    return;

  const hour = Number(matched[1]);
  const minute = Number(matched[2]);
  if (hour > 23 || minute > 59)
    return;

  const start = new Date();
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hour, minute, 0, 0);
  return start.getTime();
}

function updateCountdown() {
  if (countdownTimer)
    window.clearTimeout(countdownTimer);

  const currentSession = session.value;
  const startTime = currentSession && getTodayTimestamp(currentSession.rushStartTime);
  const endTime = currentSession && getTodayTimestamp(currentSession.rushEndTime);
  const nextStartTime = currentSession && getTodayTimestamp(currentSession.rushStartTime, 1);
  if (!startTime || !endTime || !nextStartTime) {
    setNavCountdown();
    return;
  }

  const now = Date.now();
  const countdown = now < startTime
    ? { label: '距开场', time: startTime - now }
    : now < endTime
      ? { label: '距结束', time: endTime - now }
      : { label: '距开场', time: nextStartTime - now };
  setNavCountdown(countdown);

  if (countdown)
    countdownTimer = window.setTimeout(updateCountdown, countdown.time + 100);
}

async function loadSession() {
  try {
    const { data } = await fetchFlashSaleSessions();
    session.value = data.find(item => item.id === sessionId);
    setNavTitle(session.value?.sessionName);
    updateCountdown();
  }
  catch {
    // 场次说明加载失败不影响商品列表独立重试。
  }
}

async function loadGoods(targetPage: number) {
  if (requesting)
    return;

  requesting = true;
  loading.value = true;
  nextPage.value = targetPage;
  try {
    const { data } = await fetchFlashSaleGoods({ sessionId, pageNum: targetPage, pageSize: 10 });
    goods.value = targetPage === 1 ? data.list : [...goods.value, ...data.list];
    nextPage.value = targetPage + 1;
    finished.value = goods.value.length >= data.total;
    loadError.value = false;
  }
  catch {
    loadError.value = true;
  }
  finally {
    requesting = false;
    loading.value = false;
  }
}

async function handleRefresh() {
  loadError.value = false;
  try {
    await Promise.all([loadSession(), loadGoods(1)]);
  }
  finally {
    refreshing.value = false;
  }
}

function getUnavailableMessage(detail: Awaited<ReturnType<typeof fetchFlashSaleGoodsDetail>>['data']) {
  if (!detail)
    return '商品不存在';
  if (detail.soldOut || detail.stock <= 0)
    return '商品已售罄';
  return '暂不可抢购';
}

function canPlaceOrder(detail: Exclude<Awaited<ReturnType<typeof fetchFlashSaleGoodsDetail>>['data'], null>) {
  return detail.sessionProductId > 0
    && detail.stock > 0
    && !detail.soldOut
    && detail.canPurchase
    && detail.goodsOnline
    && detail.goodsStatus === 1;
}

async function placeOrder(item: FlashSaleGoods) {
  if (orderingGoodsId.value)
    return;

  orderingGoodsId.value = item.id;
  try {
    // 列表展示的库存可能已变化，下单前重新读取商品与地址，沿用详情页的校验规则。
    const [{ data: detail }, { data: addresses }] = await Promise.all([
      fetchFlashSaleGoodsDetail(item.id),
      fetchAddressList(),
    ]);
    if (!detail || !canPlaceOrder(detail)) {
      showToast(getUnavailableMessage(detail));
      return;
    }

    const address = addresses.find(item => item.isDefault) ?? addresses[0];
    if (!address) {
      showToast({
        message: '请先选择收货地址',
        forbidClick: true,
        onClose: () => {
          router.push({
            name: 'AddressList',
            query: {
              select: '1',
              returnTo: route.fullPath,
            },
          });
        },
      });
      return;
    }

    try {
      await showConfirmDialog({
        title: '确认抢购',
        message: `${detail.goodsName}\n¥${moneyThousand(detail.price)}\n收货地址：${address.receiverName} ${address.receiverPhone} ${address.address}`,
        confirmButtonText: '确认下单',
      });
    }
    catch {
      return;
    }

    await placeFlashSaleOrder({
      sessionProductId: detail.sessionProductId,
      addressId: address.id,
      quantity: 1,
    });
    showSuccessToast({
      message: '抢购成功',
      forbidClick: true,
      onClose: () => {
        router.replace({ name: 'MyOrders' });
      },
    });
  }
  catch {
    // 请求层负责展示获取商品、地址或下单失败的具体原因。
  }
  finally {
    orderingGoodsId.value = undefined;
  }
}

onMounted(() => {
  if (validSessionId)
    loadSession();
});

onUnmounted(() => {
  if (countdownTimer)
    window.clearTimeout(countdownTimer);
  setNavTitle();
  setNavCountdown();
});
</script>

<template>
  <div class="flash-sale-goods">
    <van-empty v-if="!validSessionId" description="场次不存在" />
    <van-pull-refresh v-else v-model="refreshing" :disabled="loading" @refresh="handleRefresh">
      <van-list
        v-model:error="loadError"
        v-model:loading="loading"
        :disabled="refreshing" :finished="finished"
        error-text="加载失败，点击重试"
        :finished-text="goods.length ? '没有更多了' : ''"
        @load="loadGoods(nextPage)"
      >
        <div v-if="goods.length" class="waterfall-list flash-sale-goods__list">
          <div v-for="item in goods" :key="item.id" class="waterfall-list__item goods-card">
            <router-link
              class="goods-card__detail"
              :to="{
                name: 'FlashSaleGoodsDetail',
                params: { id: item.id },
              }"
            >
              <van-image
                class="goods-card__image"
                lazy-load
                :src="item.goodsThumb || undefined"
                fit="cover"
              >
                <template #error>
                  <van-icon name="photo-o" />
                </template>
              </van-image>
              <span class="goods-card__session">{{ item.sessionName || title }}</span>
              <h2 class="goods-card__name">
                {{ item.goodsName }}
              </h2>
            </router-link>
            <div class="goods-card__content">
              <div class="goods-card__footer">
                <div>
                  <span class="goods-card__price">¥{{ moneyThousand(item.price) }}</span>
                  <p class="goods-card__stock">
                    库存：{{ item.stock }}
                  </p>
                </div>
              </div>
              <div class="goods-card__actions">
                <van-button
                  round
                  size="small"
                  type="danger"
                  class="goods-card__action"
                  :loading="orderingGoodsId === item.id"
                  :disabled="Boolean(orderingGoodsId)"
                  @click="placeOrder(item)"
                >
                  抢购
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-list>
      <van-empty
        v-if="finished && !goods.length"
        description="暂无可抢购商品，请稍后刷新"
      />
    </van-pull-refresh>
  </div>
</template>

<style scoped lang="scss">
.flash-sale-goods {
  padding: 12px;

  .van-pull-refresh {
    flex: 1;
  }

  &__list {
    margin-top: 4px;
  }

  .goods-card {
    overflow: hidden;
    color: inherit;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 4px 12px rgb(31 35 41 / 6%);

    &__detail {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    &__image {
      display: block;
      width: 100%;
      background: #f2f3f5;

      :deep(.van-image__img) {
        height: auto;
      }

      :deep(.van-image__error) {
        color: #c8c9cc;
        font-size: 28px;
        background: #f2f3f5;
      }
    }

    &__content {
      padding: 0 9px 10px;
    }

    &__session {
      display: inline-flex;
      max-width: 100%;
      margin: 8px 9px 0;
      padding: 1px 5px;
      overflow: hidden;
      color: #ee0a24;
      font-size: 10px;
      line-height: 14px;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 4px;
      background: #fff1f1;
    }

    &__name {
      min-height: 20px;
      margin: 5px 9px 7px;
      overflow: hidden;
      color: #323233;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__footer {
      display: flex;
      align-items: baseline;
    }

    &__price {
      overflow: hidden;
      color: #ee0a24;
      font-size: 16px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__stock {
      margin: 3px 0 0;
      color: #969799;
      font-size: 11px;
      line-height: 16px;
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 6px;
    }

    &__action {
      width: 78px;
      --van-button-small-height: 26px;
      --van-button-small-font-size: 11px;

      background: linear-gradient(100deg, #ff5f63, #ee0a24);
      border: 0;
      box-shadow: 0 2px 6px rgb(238 10 36 / 16%);

      &.van-button--disabled {
        opacity: 0.55;
      }
    }
  }
}
</style>
