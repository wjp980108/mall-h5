<script setup lang="ts">
import type { AddressListAddress } from 'vant';
import type { UserAddress } from '@/api/address';
import { showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAddressList, setDefaultAddress } from '@/api/address';

defineOptions({ name: 'AddressListPage' });

const router = useRouter();
const addresses = ref<UserAddress[]>([]);
const loading = ref(true);
const loadError = ref(false);
const settingDefault = ref(false);

const selectedAddressId = computed(() =>
  addresses.value.find(address => address.isDefault)?.id,
);

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
  router.push({ name: 'AddressCreate' });
}

function editAddress(address: AddressListAddress) {
  router.push({ name: 'AddressEdit', params: { id: address.id } });
}

async function selectAddress(address: AddressListAddress) {
  if (settingDefault.value || address.id === selectedAddressId.value)
    return;

  settingDefault.value = true;

  try {
    await setDefaultAddress(Number(address.id));
    addresses.value = addresses.value.map(item => ({
      ...item,
      isDefault: item.id === Number(address.id),
    }));
    showSuccessToast('已设为默认地址');
  }
  finally {
    settingDefault.value = false;
  }
}

onMounted(loadAddresses);
</script>

<template>
  <section class="address-list-page">
    <van-skeleton v-if="loading" title :row="8" class="address-list-page__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="地址加载失败">
      <van-button round type="primary" size="small" @click="loadAddresses">
        重新加载
      </van-button>
    </van-empty>

    <van-address-list
      v-else
      :model-value="selectedAddressId"
      :list="addressList"
      add-button-text="新增地址"
      default-tag-text="默认"
      @add="addAddress"
      @edit="editAddress"
      @select="selectAddress"
    />
  </section>
</template>

<style scoped lang="scss">
.address-list-page {
  min-height: 100%;
  background: #f7f8fa;

  &__skeleton {
    padding: 16px;
  }

  :deep(.van-address-list) {
    --van-address-list-padding: 12px 12px 84px;
  }

  :deep(.van-address-item) {
    border-radius: 12px;
  }
}
</style>
