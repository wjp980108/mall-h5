<script setup lang="ts">
import type { AddressListAddress } from 'vant';
import type { UserAddress } from '@/api/address';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAddressList } from '@/api/address';
import { useNavTitle } from '@/hooks/useNavTitle.ts';

defineOptions({ name: 'AddressListPage' });

const route = useRoute();
const router = useRouter();
const { setNavTitle } = useNavTitle();
const addresses = ref<UserAddress[]>([]);
const loading = ref(true);
const loadError = ref(false);

const isSelecting = computed(() => route.query.select === '1');
const returnTo = computed(() => {
  const path = route.query.returnTo;
  return typeof path === 'string' && path.startsWith('/') ? path : null;
});

const selectedAddressId = computed(() => {
  const id = Number(route.query.addressId);
  if (isSelecting.value && Number.isSafeInteger(id) && id > 0)
    return id;

  return addresses.value.find(address => address.isDefault)?.id;
});

const addressList = computed<AddressListAddress[]>(() =>
  addresses.value.map(address => ({
    id: address.id,
    name: address.receiverName,
    tel: address.receiverPhone,
    address: address.address,
    isDefault: address.isDefault,
  })),
);

async function loadAddresses() {
  loading.value = true;
  loadError.value = false;

  try {
    const { data } = await fetchAddressList();
    addresses.value = data;
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}

function addAddress() {
  router.push({
    name: 'AddressCreate',
    query: isSelecting.value ? route.query : undefined,
  });
}

function editAddress(address: AddressListAddress) {
  router.push({
    name: 'AddressEdit',
    params: { id: address.id },
    query: isSelecting.value ? route.query : undefined,
  });
}

function selectAddress(address: AddressListAddress) {
  if (!isSelecting.value || !returnTo.value)
    return;

  const target = router.resolve(returnTo.value);
  router.replace({
    path: target.path,
    query: {
      ...target.query,
      addressId: String(address.id),
    },
  });
}

onMounted(() => {
  if (isSelecting.value)
    setNavTitle('选择收货地址');

  loadAddresses();
});

onUnmounted(() => {
  setNavTitle();
});
</script>

<template>
  <section class="address-list-page">
    <van-loading v-if="loading" vertical class="address-list-page__loading">
      加载中...
    </van-loading>

    <van-empty v-else-if="loadError" image="error" description="地址加载失败">
      <van-button round type="primary" size="small" @click="loadAddresses">
        重新加载
      </van-button>
    </van-empty>

    <van-address-list
      v-else
      :model-value="selectedAddressId"
      :list="addressList"
      :switchable="isSelecting"
      add-button-text="新增地址"
      default-tag-text="默认"
      @add="addAddress"
      @edit="editAddress"
      @select="selectAddress"
    >
      <template v-if="!addresses.length" #top>
        <van-empty image="default" :description="isSelecting ? '暂无收货地址，请先新增' : '暂无收货地址'" />
      </template>
    </van-address-list>
  </section>
</template>

<style scoped lang="scss">
.address-list-page {
  &__loading {
    margin-top: 64px;
  }

  :deep(.van-address-list) {
    --van-address-list-padding: 12px 12px 84px;
  }

  :deep(.van-address-item) {
    border-radius: 12px;
  }
}
</style>
