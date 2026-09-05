<script setup lang="ts">
import type { FlashSaleGoods, FlashSaleSession } from '@/api/flashSale.ts';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchFlashSaleGoods, fetchFlashSaleSessions } from '@/api/flashSale.ts';
import { useNavTitle } from '@/hooks/useNavTitle.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'FlashSaleGoodsPage' });

const route = useRoute();
const { setNavCountdown, setNavTitle } = useNavTitle();
const sessionId = Number(route.params.sessionId);
const validSessionId = Number.isSafeInteger(sessionId) && sessionId > 0;
const session = ref<FlashSaleSession>();
const goods = ref<FlashSaleGoods[]>([]);
const nextPage = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const loadError = ref(false);
const finished = ref(false);
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
  loadError.value = false;
  try {
    const { data } = await fetchFlashSaleGoods({ sessionId, pageNum: targetPage, pageSize: 10 });
    goods.value = targetPage === 1 ? data.list : [...goods.value, ...data.list];
    nextPage.value = targetPage + 1;
    finished.value = goods.value.length >= data.total;
  }
  catch {
    loadError.value = true;
    finished.value = false;
  }
  finally {
    requesting = false;
    loading.value = false;
  }
}

async function handleRefresh() {
  try {
    await Promise.all([loadSession(), loadGoods(1)]);
  }
  finally {
    refreshing.value = false;
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
  <section class="flash-sale-goods">
    <van-empty v-if="!validSessionId" description="场次不存在" />
    <van-pull-refresh v-else v-model="refreshing" :disabled="loading" @refresh="handleRefresh">
      <van-list
        v-model:loading="loading" v-model:error="loadError"
        :disabled="refreshing" :finished="finished"
        :finished-text="goods.length ? '没有更多了' : ''"
        error-text="加载失败，点击重试" @load="loadGoods(nextPage)"
      >
        <div v-if="goods.length" class="waterfall-list flash-sale-goods__list">
          <router-link
            v-for="item in goods" :key="item.id" class="waterfall-list__item goods-card"
            :to="{ name: 'FlashSaleGoodsDetail', params: { id: item.id } }"
          >
            <van-image
              class="goods-card__image"
              lazy-load
              :src="item.coverImg || undefined"
              fit="cover"
            >
              <template #error>
                <van-icon name="photo-o" />
              </template>
            </van-image>
            <div class="goods-card__content">
              <span class="goods-card__session">{{ item.sessionName || title }}</span>
              <h2 class="goods-card__name">
                {{ item.goodsName }}
              </h2>
              <div class="goods-card__footer">
                <span class="goods-card__price">¥{{ moneyThousand(item.goodsPrice) }}</span>
                <span class="goods-card__action">
                  {{ item.onlineStatus ? '去抢购' : '已下架' }}
                  <van-icon name="arrow" />
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </van-list>
      <van-empty
        v-if="finished && !goods.length && !loadError"
        description="暂无可抢购商品，请稍后刷新"
      />
    </van-pull-refresh>
  </section>
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
    display: block;
    overflow: hidden;
    color: inherit;
    text-decoration: none;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 4px 12px rgb(31 35 41 / 6%);

    &__image {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      background: #f2f3f5;

      :deep(.van-image__error) {
        color: #c8c9cc;
        font-size: 28px;
        background: #f2f3f5;
      }
    }

    &__content {
      padding: 8px 9px 10px;
    }

    &__session {
      display: inline-flex;
      max-width: 100%;
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
      margin: 5px 0 7px;
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
      justify-content: space-between;
      gap: 6px;
    }

    &__price {
      overflow: hidden;
      color: #ee0a24;
      font-size: 16px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__action {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      color: #ee0a24;
      font-size: 11px;
      line-height: 18px;

      .van-icon {
        margin-left: 1px;
      }
    }
  }
}
</style>
