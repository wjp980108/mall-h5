<script setup lang="ts">
import type { PointsFlow } from '@/api/assets';
import { showToast } from 'vant';
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchPointsBalance, fetchPointsFlows, transferPoints } from '@/api/assets';

defineOptions({ name: 'MyAssetsPage' });

interface PointsBalanceState {
  points: number;
  couponPoints: number;
}

const balance = reactive<PointsBalanceState>({
  points: 0,
  couponPoints: 0,
});
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const pageSize = 10;
const flows = ref<PointsFlow[]>([]);
const transferVisible = ref(false);
const transferSubmitting = ref(false);
let requestingFlows = false;
const transferForm = reactive({
  phone: '',
  amount: '',
});

const totalPoints = computed(() => balance.points + balance.couponPoints);
const transferAmount = computed(() => Number(transferForm.amount));

function formatPoints(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
  }).format(value);
}

function isIncome(flow: PointsFlow) {
  return flow.flowType === 1 || flow.flowType === 4;
}

async function loadBalance() {
  const { data } = await fetchPointsBalance();
  balance.points = data.points;
  balance.couponPoints = data.couponPoints;
}

async function loadFlows(reset = false) {
  if (requestingFlows || (finished.value && !reset))
    return;

  const currentPage = reset ? 1 : pageNum.value;
  requestingFlows = true;
  loading.value = true;

  try {
    const { data } = await fetchPointsFlows({
      pageNum: currentPage,
      pageSize,
    });
    flows.value = currentPage === 1 ? data.list : [...flows.value, ...data.list];
    pageNum.value = currentPage + 1;
    finished.value = flows.value.length >= data.total;
  }
  finally {
    requestingFlows = false;
    loading.value = false;
  }
}

async function refreshPage() {
  finished.value = false;

  try {
    await Promise.all([loadBalance(), loadFlows(true)]);
  }
  finally {
    refreshing.value = false;
  }
}

function openTransfer() {
  transferForm.phone = '';
  transferForm.amount = '';
  transferVisible.value = true;
}

function useAllPoints() {
  transferForm.amount = String(balance.points);
}

function validateTransfer() {
  if (!/^1\d{10}$/.test(transferForm.phone)) {
    showToast('请输入正确的对方手机号');
    return false;
  }

  if (!Number.isFinite(transferAmount.value) || transferAmount.value <= 0) {
    showToast('请输入大于 0 的转让积分');
    return false;
  }

  if (transferAmount.value > balance.points) {
    showToast('转让积分不能超过可用积分');
    return false;
  }

  return true;
}

async function submitTransfer() {
  if (transferSubmitting.value || !validateTransfer())
    return;

  transferSubmitting.value = true;

  try {
    await transferPoints({
      phone: transferForm.phone,
      amount: transferAmount.value,
    });
    transferVisible.value = false;
    await Promise.all([loadBalance(), loadFlows(true)]);
  }
  finally {
    transferSubmitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadBalance(), loadFlows(true)]);
});
</script>

<template>
  <div class="my-assets-page">
    <van-pull-refresh v-model="refreshing" class="my-assets-page__refresh" :disabled="loading" @refresh="refreshPage">
      <section class="points-summary" aria-label="积分汇总">
        <div class="points-summary__halo points-summary__halo--one" aria-hidden="true" />
        <div class="points-summary__halo points-summary__halo--two" aria-hidden="true" />
        <p>我的积分</p>
        <strong>{{ formatPoints(totalPoints) }}</strong>
        <span>可用积分与购物券积分总计</span>

        <div class="points-summary__accounts">
          <div>
            <small>可用积分</small>
            <b>{{ formatPoints(balance.points) }}</b>
          </div>
          <div>
            <small>购物券积分</small>
            <b>{{ formatPoints(balance.couponPoints) }}</b>
          </div>
        </div>

        <van-button round class="points-summary__transfer" @click="openTransfer">
          <van-icon name="share-o" />
          转让积分
        </van-button>
      </section>

      <section class="points-guide">
        <van-icon name="info-o" />
        <span>仅可转让可用积分，购物券积分不可转让。</span>
      </section>

      <section class="points-detail" aria-labelledby="points-detail-title">
        <h2 id="points-detail-title">
          积分明细
        </h2>
        <van-list
          v-model:loading="loading"
          :disabled="refreshing"
          :finished="finished"
          :finished-text="flows.length ? '没有更多明细了' : ''"
          @load="loadFlows"
        >
          <van-empty v-if="finished && !flows.length" image="search" description="暂无积分明细" />
          <div v-else class="points-flow-list">
            <article v-for="flow in flows" :key="flow.id" class="points-flow-item">
              <div class="points-flow-item__icon" :class="{ 'is-income': isIncome(flow) }">
                <van-icon :name="isIncome(flow) ? 'plus' : 'minus'" />
              </div>
              <div class="points-flow-item__content">
                <strong>{{ flow.flowTypeName || flow.bizTypeName }}</strong>
                <p>
                  {{ flow.remark || flow.accountTypeName }}
                  <template v-if="flow.counterpartyName">
                    · {{ flow.counterpartyName }}
                  </template>
                </p>
                <time>{{ flow.createTime }}</time>
              </div>
              <div class="points-flow-item__amount" :class="{ 'is-income': isIncome(flow) }">
                {{ isIncome(flow) ? '+' : '-' }}{{ formatPoints(flow.amount) }}
                <small>余额 {{ formatPoints(flow.afterPoints) }}</small>
              </div>
            </article>
          </div>
        </van-list>
      </section>
    </van-pull-refresh>

    <van-popup v-model:show="transferVisible" position="bottom" round closeable :style="{ maxHeight: '86%' }">
      <section class="points-transfer">
        <h2>转让积分</h2>
        <p class="points-transfer__available">
          可转让积分 <strong>{{ formatPoints(balance.points) }}</strong>
        </p>
        <van-cell-group inset>
          <van-field v-model="transferForm.phone" type="tel" label="对方手机号" placeholder="请输入已注册的手机号" maxlength="11" />
          <van-field v-model="transferForm.amount" type="number" label="转让积分" placeholder="请输入转让数量">
            <template #button>
              <button type="button" class="points-transfer__all" @click="useAllPoints">
                全部
              </button>
            </template>
          </van-field>
        </van-cell-group>
        <p class="points-transfer__tip">
          转让成功后将无法撤回，请确认对方手机号和积分数量。
        </p>
        <van-button round block type="primary" :loading="transferSubmitting" @click="submitTransfer">
          确认转让
        </van-button>
      </section>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.my-assets-page {
  &__refresh {
    min-height: 100%;
    padding: 16px 12px 28px;
  }

  :deep(.van-pull-refresh__track) {
    min-height: 100%;
  }
}

.points-summary {
  position: relative;
  overflow: hidden;
  padding: 22px 20px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2862d8, #5797fa);
  box-shadow: 0 8px 18px rgb(47 103 216 / 20%);
  color: #fff;

  > p,
  > strong,
  > span,
  &__accounts,
  &__transfer {
    position: relative;
  }

  > p {
    margin: 0;
    color: rgb(255 255 255 / 78%);
    font-size: 13px;
    line-height: 18px;
  }

  > strong {
    display: block;
    margin-top: 4px;
    font-size: 32px;
    line-height: 42px;
  }

  > span {
    display: block;
    margin-top: 2px;
    color: rgb(255 255 255 / 70%);
    font-size: 12px;
    line-height: 18px;
  }

  &__halo {
    position: absolute;
    width: 150px;
    height: 150px;
    border: 28px solid rgb(255 255 255 / 9%);
    border-radius: 50%;

    &--one {
      top: -93px;
      right: -56px;
    }

    &--two {
      right: 65px;
      bottom: -120px;
    }
  }

  &__accounts {
    display: flex;
    gap: 10px;
    margin-top: 18px;

    > div {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      gap: 3px;
      padding: 9px 10px;
      border-radius: 10px;
      background: rgb(255 255 255 / 13%);
    }

    small {
      color: rgb(255 255 255 / 70%);
      font-size: 11px;
      line-height: 16px;
    }

    b {
      overflow: hidden;
      font-size: 16px;
      line-height: 22px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__transfer {
    width: 100%;
    height: 40px;
    margin-top: 16px;
    border: 0;
    background: #fff;
    color: var(--van-primary-color);
    font-size: 14px;

    .van-icon {
      margin-right: 4px;
      font-size: 17px;
    }
  }
}

.points-guide {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 12px 2px 0;
  color: #8a6d3b;
  font-size: 12px;
  line-height: 18px;

  .van-icon {
    margin-top: 1px;
    color: #d49c3d;
    font-size: 16px;
  }
}

.points-detail {
  margin-top: 18px;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;

  h2 {
    margin: 0;
    padding: 16px 16px 4px;
    color: #323233;
    font-size: 17px;
    line-height: 24px;
  }
}

.points-flow-list {
  padding: 0 16px;
}

.points-flow-item {
  display: flex;
  min-width: 0;
  gap: 10px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;

  &:last-child {
    border-bottom: 0;
  }

  &__icon {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    background: #fff1f3;
    color: #ee0a24;

    &.is-income {
      background: #edf8f2;
      color: #07a45d;
    }
  }

  &__content {
    min-width: 0;
    flex: 1;

    strong,
    p,
    time {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #323233;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
    }

    p,
    time {
      margin: 2px 0 0;
      color: #969799;
      font-size: 11px;
      line-height: 16px;
    }
  }

  &__amount {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    color: #ee0a24;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;

    &.is-income {
      color: #07a45d;
    }

    small {
      margin-top: 2px;
      color: #969799;
      font-size: 10px;
      font-weight: 400;
      line-height: 16px;
    }
  }
}

.points-transfer {
  padding: 22px 0 calc(22px + env(safe-area-inset-bottom));

  h2 {
    margin: 0 48px 6px 16px;
    color: #323233;
    font-size: 18px;
    line-height: 26px;
  }

  &__available {
    margin: 0 16px 16px;
    color: #969799;
    font-size: 13px;
    line-height: 20px;

    strong {
      margin-left: 4px;
      color: var(--van-primary-color);
      font-size: 16px;
    }
  }

  :deep(.van-cell-group) {
    margin: 0 12px;
  }

  &__all {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--van-primary-color);
    font-size: 13px;
  }

  &__tip {
    margin: 12px 16px 18px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }

  :deep(.van-button) {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
}
</style>
