<script setup lang="ts">
import type { UserAddress } from '@/api/address.ts';
import type { FlashSaleGoodsDetail } from '@/api/flashSale.ts';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAddressList } from '@/api/address.ts';
import { fetchFlashSaleGoodsDetail, placeFlashSaleOrder } from '@/api/flashSale.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'FlashSaleGoodsDetailPage' });

const route = useRoute();
const router = useRouter();
const sessionProductId = Number(route.params.id);
const validSessionProductId = Number.isSafeInteger(sessionProductId) && sessionProductId > 0;
const goods = ref<FlashSaleGoodsDetail | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const loadError = ref(false);
const addresses = ref<UserAddress[]>([]);
const addressId = ref<number>();
const addressError = ref(false);
const submitting = ref(false);
const selectedAddress = computed(() => addresses.value.find(item => item.id === addressId.value));
const canBuy = computed(() => {
  const detail = goods.value;
  return Boolean(detail && detail.sessionProductId > 0 && detail.stock > 0 && !detail.soldOut && detail.canPurchase && detail.goodsOnline && detail.goodsStatus === 1);
});
const purchaseButtonText = computed(() => {
  const detail = goods.value;
  if (canBuy.value)
    return '立即抢购';
  return detail && (detail.soldOut || detail.stock <= 0) ? '商品已售罄' : '暂不可抢购';
});

async function loadGoods(showLoading = true) {
  if (!validSessionProductId) {
    loading.value = false;
    loadError.value = true;
    return;
  }
  if (showLoading)
    loading.value = true;
  loadError.value = false;
  try {
    const { data } = await fetchFlashSaleGoodsDetail(sessionProductId);
    goods.value = data;
  }
  catch {
    loadError.value = true;
  }
  finally {
    if (showLoading)
      loading.value = false;
  }
}

async function handleRefresh() {
  try {
    await loadGoods(false);
  }
  finally {
    refreshing.value = false;
  }
}

async function loadAddresses() {
  addressError.value = false;
  try {
    const { data } = await fetchAddressList();
    addresses.value = data;
    const addressIdFromQuery = Number(route.query.addressId);
    if (Number.isSafeInteger(addressIdFromQuery) && addressIdFromQuery > 0 && data.some(item => item.id === addressIdFromQuery))
      addressId.value = addressIdFromQuery;
    else if (!data.some(item => item.id === addressId.value))
      addressId.value = data.find(item => item.isDefault)?.id ?? data[0]?.id;
  }
  catch {
    addressError.value = true;
  }
}

function openAddresses() {
  if (submitting.value)
    return;

  router.push({
    name: 'AddressList',
    query: {
      select: '1',
      returnTo: route.fullPath,
      addressId: addressId.value?.toString(),
    },
  });
}

async function handleBuy() {
  if (!goods.value || !canBuy.value || submitting.value)
    return;
  const address = selectedAddress.value;
  if (!address || addressError.value) {
    showToast('请先选择收货地址');
    openAddresses();
    return;
  }

  submitting.value = true;
  try {
    await showConfirmDialog({
      title: '确认抢购',
      message: `${goods.value.goodsName}\n¥${moneyThousand(goods.value.price)}`,
      confirmButtonText: '确认下单',
    });
  }
  catch {
    submitting.value = false;
    return;
  }

  try {
    await placeFlashSaleOrder({
      sessionProductId: goods.value.sessionProductId,
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
    // 请求层展示后端的时段、限购或商品状态错误，刷新详情避免继续展示过期状态。
    await loadGoods();
  }
  finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadGoods();
  loadAddresses();
});
</script>

<template>
  <div class="flash-sale-detail">
    <van-skeleton v-if="loading" title :row="10" class="detail-skeleton" />
    <van-empty v-else-if="loadError" image="error" description="商品加载失败">
      <van-button round type="primary" size="small" @click="loadGoods">
        重新加载
      </van-button>
    </van-empty>
    <van-empty v-else-if="!goods" description="商品不存在" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" :disabled="submitting" @refresh="handleRefresh">
        <van-image v-if="goods.detailImg" class="goods-cover" :src="goods.detailImg" fit="cover" />
        <div class="goods-info">
          <div class="goods-price">
            ¥{{ moneyThousand(goods.price) }}
          </div>
          <h1>{{ goods.goodsName }}</h1>
          <van-tag v-if="goods.sessionName" plain type="danger">
            {{ goods.sessionName }}
          </van-tag>
          <p>
            库存：{{ goods.stock }}
          </p>
          <p v-if="!goods.goodsOnline">
            商品已下架
          </p>
        </div>
        <van-cell
          title="收货地址" is-link :disabled="submitting"
          :label="selectedAddress ? `${selectedAddress.receiverName} ${selectedAddress.receiverPhone} ${selectedAddress.address}` : '请选择收货地址'"
          @click="openAddresses"
        />
        <div class="goods-description">
          <h2>商品详情</h2>
          <div v-if="goods.goodsDetail" v-html="goods.goodsDetail" />
          <van-empty v-else description="暂无商品详情" />
        </div>
      </van-pull-refresh>
      <div class="detail-actions">
        <van-button round block type="danger" :disabled="!canBuy" :loading="submitting" @click="handleBuy">
          {{ purchaseButtonText }}
        </van-button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.flash-sale-detail {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));

  .detail-skeleton {
    margin: 16px;
  }
  .goods-cover {
    width: 100%;
    height: min(60vw, 280px);
  }

  .goods-info,
  .goods-description {
    padding: 16px;
    margin-bottom: 12px;
    background: #fff;
    overflow-wrap: anywhere;
  }

  h1 {
    margin: 10px 0;
    font-size: 20px;
  }
  h2 {
    margin: 0 0 12px;
    font-size: 17px;
  }
  p {
    color: #646566;
    font-size: 14px;
  }
  .goods-price {
    color: #ee0a24;
    font-size: 24px;
    font-weight: 600;
  }

  .goods-description {
    margin-top: 12px;
    line-height: 1.7;
    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }

  .detail-actions {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    max-width: var(--mall-content-width);
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    margin: 0 auto;
    border-top: 1px solid #ebedf0;
    background: #fff;
  }
}
</style>
