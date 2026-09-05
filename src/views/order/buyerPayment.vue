<script setup lang="ts">
import type { UploaderFileListItem } from 'vant';
import type { BuyerOrder } from '@/api/buyerOrder';
import { showSuccessToast, showToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { confirmBuyerOrderPayment, fetchBuyerOrder } from '@/api/buyerOrder';
import { moneyThousand } from '@/utils/money';

defineOptions({ name: 'BuyerOrderPaymentPage' });

const route = useRoute();
const router = useRouter();
const order = ref<BuyerOrder | null>(null);
const loading = ref(true);
const paymentProofUrl = ref('');
const paymentProofFiles = ref<UploaderFileListItem[]>([]);
const submitting = ref(false);

async function loadOrder() {
  loading.value = true;

  try {
    const { data } = await fetchBuyerOrder(String(route.params.id));
    order.value = data;
  }
  finally {
    loading.value = false;
  }
}

function afterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const uploadedFile = Array.isArray(file) ? file[0] : file;
  const url = typeof uploadedFile?.content === 'string' ? uploadedFile.content : uploadedFile?.url;

  if (!url) {
    showToast('图片读取失败，请重新上传');
    return;
  }

  paymentProofUrl.value = url;
}

function deletePaymentProof() {
  paymentProofUrl.value = '';
}

async function confirmPayment() {
  if (!order.value || submitting.value)
    return;

  if (!paymentProofUrl.value) {
    showToast('请先上传支付凭证');
    return;
  }

  submitting.value = true;

  try {
    await confirmBuyerOrderPayment(order.value.id, { paymentProofUrl: paymentProofUrl.value });
    showSuccessToast('付款成功');
    router.replace({ name: 'BuyerOrders', query: { status: 'paid' } });
  }
  catch (error) {
    showToast(error instanceof Error ? error.message : '付款失败，请稍后重试');
  }
  finally {
    submitting.value = false;
  }
}

onMounted(loadOrder);
</script>

<template>
  <section class="buyer-payment-page">
    <van-skeleton v-if="loading" title :row="10" class="buyer-payment-page__skeleton" />

    <van-empty v-else-if="!order" image="error" description="订单不存在" />

    <template v-else-if="order.status === 'pending-payment'">
      <div class="buyer-payment-page__content">
        <section class="payment-order-card">
          <div class="payment-order-card__header">
            <span>订单号：{{ order.id }}</span>
            <strong>待付款</strong>
          </div>
          <div v-for="item in order.items" :key="item.id" class="payment-order-card__item">
            <van-image lazy-load :src="item.imageUrl" :alt="item.name" fit="cover" />
            <div>
              <h2>{{ item.name }}</h2>
              <p v-if="item.specification">
                {{ item.specification }}
              </p>
              <span>¥{{ moneyThousand(item.price) }} × {{ item.quantity }}</span>
            </div>
          </div>
          <p class="payment-order-card__total">
            应付金额 <strong>¥{{ moneyThousand(order.totalAmount) }}</strong>
          </p>
        </section>

        <section class="payment-proof-card">
          <h2>上传支付凭证</h2>
          <p>请上传清晰的支付截图，确认付款后订单将更新为已付款。</p>
          <van-uploader
            v-model="paymentProofFiles"
            :max-count="1"
            :after-read="afterRead"
            @delete="deletePaymentProof"
          >
            <div class="payment-proof-card__uploader">
              <van-icon name="photograph" />
              <span>上传支付凭证</span>
            </div>
          </van-uploader>
        </section>
      </div>

      <footer class="buyer-payment-page__footer">
        <span>应付：<strong>¥{{ moneyThousand(order.totalAmount) }}</strong></span>
        <van-button round type="primary" :loading="submitting" @click="confirmPayment">
          确认付款
        </van-button>
      </footer>
    </template>

    <van-empty v-else description="该订单当前无需付款" />
  </section>
</template>

<style scoped lang="scss">
.buyer-payment-page {
  &__skeleton {
    margin: 16px;
  }

  &__content {
    padding: 12px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: auto;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -1px 8px rgb(0 0 0 / 5%);

    span {
      color: #646566;
    }

    strong {
      color: #ee0a24;
      font-size: 18px;
    }

    .van-button {
      min-width: 130px;
    }
  }
}

.payment-order-card,
.payment-proof-card {
  border-radius: 12px;
  background: #fff;
}

.payment-order-card {
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #f2f3f5;
    color: #969799;
    font-size: 12px;

    strong {
      color: #ee0a24;
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__item {
    display: flex;
    gap: 10px;
    padding: 12px;

    .van-image {
      width: 76px;
      height: 76px;
      flex: none;
      overflow: hidden;
      border-radius: 8px;
      background: #f2f3f5;
    }

    > div {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: #323233;
      font-size: 14px;
      line-height: 20px;
    }

    p {
      margin-top: 5px;
      color: #969799;
      font-size: 12px;
    }

    span {
      margin-top: auto;
      color: #323233;
      font-size: 13px;
    }
  }

  &__total {
    margin: 0;
    padding: 12px;
    border-top: 1px solid #f2f3f5;
    color: #646566;
    text-align: right;

    strong {
      color: #ee0a24;
      font-size: 18px;
    }
  }
}

.payment-proof-card {
  margin-top: 12px;
  padding: 16px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: #323233;
    font-size: 16px;
    line-height: 24px;
  }

  p {
    margin-top: 6px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }

  &__uploader {
    display: flex;
    width: 104px;
    height: 104px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    margin-top: 14px;
    border: 1px dashed #c8c9cc;
    border-radius: 8px;
    color: #969799;
    font-size: 12px;

    .van-icon {
      color: var(--van-primary-color);
      font-size: 30px;
    }
  }
}
</style>
