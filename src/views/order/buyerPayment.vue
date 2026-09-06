<script setup lang="ts">
import type { UploaderFileListItem } from 'vant';
import type { BuyerOrder } from '@/api/buyerOrder';
import { showSuccessToast, showToast } from 'vant';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { uploadImage } from '@/api';
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

async function afterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const uploadedFile = Array.isArray(file) ? file[0] : file;

  if (!uploadedFile?.file) {
    showToast('图片读取失败，请重新上传');
    return;
  }

  uploadedFile.status = 'uploading';
  uploadedFile.message = '上传中...';

  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.file);
    const { data } = await uploadImage(formData);
    paymentProofUrl.value = data;
    uploadedFile.status = 'done';
  }
  catch {
    uploadedFile.status = 'failed';
    uploadedFile.message = '上传失败';
    showToast('支付凭证上传失败，请重试');
  }
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
    await confirmBuyerOrderPayment(order.value.id, {
      payVoucherUrl: paymentProofUrl.value,
      payVoucherPlatform: 'local-1',
    });
    showSuccessToast('付款成功');
    router.replace({ name: 'BuyerOrders', query: { status: '2' } });
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
  <div class="buyer-payment-page">
    <van-skeleton v-if="loading" title :row="10" class="buyer-payment-page__skeleton" />

    <van-empty v-else-if="!order" image="error" description="订单不存在" />

    <template v-else-if="order.orderStatus === 1">
      <div class="buyer-payment-page__content">
        <div class="payment-order-card">
          <div class="payment-order-card__header">
            <span>订单号：{{ order.orderNo }}</span>
            <strong>{{ order.orderStatusName || '待付款' }}</strong>
          </div>
          <div class="payment-order-card__item">
            <div class="payment-order-card__icon" aria-hidden="true">
              <van-icon name="bag-o" />
            </div>
            <div class="payment-order-card__details">
              <h2>{{ order.goodsName }}</h2>
              <p><van-icon name="user-o" /> 卖家：{{ order.sellerName }} {{ order.sellerPhone }}</p>
            </div>
            <strong class="payment-order-card__price">¥{{ moneyThousand(order.rushPrice) }}</strong>
          </div>
          <div class="payment-order-card__address">
            <span><van-icon name="location-o" /> 收货地址</span>
            <p>{{ order.receiveAddress }}</p>
          </div>
          <div class="payment-order-card__total">
            <span>订单应付</span>
            <strong>¥{{ moneyThousand(order.rushPrice) }}</strong>
          </div>
        </div>

        <div class="payment-proof-card">
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
        </div>
      </div>

      <div class="buyer-payment-page__footer">
        <span>应付：<strong>¥{{ moneyThousand(order.rushPrice) }}</strong></span>
        <van-button round type="primary" :loading="submitting" @click="confirmPayment">
          确认付款
        </van-button>
      </div>
    </template>

    <van-empty v-else description="该订单当前无需付款" />
  </div>
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
    align-items: center;
    gap: 10px;
    padding: 16px;
  }

  &__icon {
    display: flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 12px;
    background: #eff6ff;
    color: var(--van-primary-color);
    font-size: 25px;
  }

  &__details {
    min-width: 0;
    flex: 1;

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: #323233;
      font-size: 15px;
      line-height: 22px;
    }

    p {
      margin-top: 5px;
      color: #969799;
      font-size: 12px;

      .van-icon {
        margin-right: 2px;
      }
    }
  }

  &__price {
    flex: none;
    color: #323233;
    font-size: 15px;
    font-weight: 500;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    padding: 16px;
    border-top: 1px solid #f2f3f5;
    color: #646566;
    font-size: 14px;

    strong {
      color: #ee0a24;
      font-size: 18px;
    }
  }

  &__address {
    padding: 12px 16px;
    border-top: 1px solid #f7f8fa;
    background: #fafcff;
    color: #646566;
    font-size: 12px;
    line-height: 18px;

    > span {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #969799;
    }

    p {
      margin: 4px 0 0;
      color: #323233;
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
