<script setup lang="ts">
import type { UserAddress } from '@/api/address.ts';
import type { FlashSaleGoods } from '@/api/flashSale.ts';
import { showConfirmDialog, showToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAddressList } from '@/api/address.ts';
import { fetchFlashSaleGoodsDetail, placeFlashSaleOrder } from '@/api/flashSale.ts';
import { moneyThousand } from '@/utils/money.ts';

defineOptions({ name: 'FlashSaleGoodsDetailPage' });

const route = useRoute();
const router = useRouter();
const goodsId = Number(route.params.id);
const goods = ref<FlashSaleGoods | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const loadError = ref(false);
const addresses = ref<UserAddress[]>([]);
const addressId = ref<number>();
const addressError = ref(false);
const submitting = ref(false);
const orderNo = ref('');
const selectedAddress = computed(() => addresses.value.find(item => item.id === addressId.value));
const canBuy = computed(() => goods.value?.canPurchase && goods.value.onlineStatus && goods.value.goodsStatus === 1 && !orderNo.value);
const addressIdFromQuery = computed(() => {
  const id = Number(route.query.addressId);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
});

async function loadGoods(showLoading = true) {
  if (!Number.isSafeInteger(goodsId) || goodsId < 1) {
    loading.value = false;
    loadError.value = true;
    return;
  }
  if (showLoading)
    loading.value = true;
  loadError.value = false;
  try {
    const { data } = await fetchFlashSaleGoodsDetail(goodsId);
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
    if (addressIdFromQuery.value && data.some(item => item.id === addressIdFromQuery.value))
      addressId.value = addressIdFromQuery.value;
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
      message: `${goods.value.goodsName}\n¥${moneyThousand(goods.value.goodsPrice)}`,
      confirmButtonText: '确认下单',
    });
  }
  catch {
    submitting.value = false;
    return;
  }

  try {
    const { data } = await placeFlashSaleOrder({ goodsId, addressId: address.id });
    orderNo.value = data;
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
  <section class="flash-sale-detail">
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
        <section class="goods-info">
          <div class="goods-price">
            ¥{{ moneyThousand(goods.goodsPrice) }}
          </div>
          <h1>{{ goods.goodsName }}</h1>
          <van-tag v-if="goods.sessionName" plain type="danger">
            {{ goods.sessionName }}
          </van-tag>
          <p v-if="!goods.onlineStatus">
            商品已下架
          </p>
          <p v-else-if="goods.goodsStatusName">
            {{ goods.goodsStatusName }}
          </p>
        </section>
        <section v-if="orderNo" class="order-result" role="status">
          <h2>下单成功，待付款</h2>
          <p>订单号：{{ orderNo }}</p>
          <p>请在下单后 30 分钟内完成付款。</p>
        </section>
        <van-cell
          v-else title="收货地址" is-link :disabled="submitting"
          :label="selectedAddress ? `${selectedAddress.receiverName} ${selectedAddress.receiverPhone} ${selectedAddress.address}` : '请选择收货地址'"
          @click="openAddresses"
        />
        <section class="goods-description">
          <h2>商品详情</h2>
          <article v-if="goods.goodsDetail" v-html="goods.goodsDetail" />
          <van-empty v-else description="暂无商品详情" />
        </section>
      </van-pull-refresh>
      <footer class="detail-actions">
        <van-button round block type="danger" :disabled="!canBuy" :loading="submitting" @click="handleBuy">
          {{ orderNo ? '已下单' : !goods.canPurchase ? '未到抢购时间' : canBuy ? '立即抢购' : '暂不可抢购' }}
        </van-button>
      </footer>
    </template>
  </section>
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
  .goods-description,
  .order-result {
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

  .order-result {
    background: #fff7e8;
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
