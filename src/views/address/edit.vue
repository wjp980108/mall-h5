<script setup lang="ts">
import type { AddressEditInfo } from 'vant';
import { showConfirmDialog, showSuccessToast } from 'vant';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createAddress,
  deleteAddress,
  fetchAddressDetail,
  updateAddress,
} from '@/api/address';

defineOptions({ name: 'AddressEditPage' });

const route = useRoute();
const router = useRouter();
const addressInfo = ref<Partial<AddressEditInfo>>({});
const loading = ref(route.name === 'AddressEdit');
const loadError = ref(false);
const saving = ref(false);
const deleting = ref(false);

const addressId = computed(() => {
  const id = Number(route.params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const isEditing = computed(() => route.name === 'AddressEdit' && addressId.value !== null);

async function loadAddress() {
  if (!isEditing.value) {
    if (route.name === 'AddressEdit') {
      loadError.value = true;
      loading.value = false;
    }
    return;
  }

  loading.value = true;
  loadError.value = false;

  try {
    const { data } = await fetchAddressDetail(addressId.value!);
    addressInfo.value = {
      name: data.receiverName,
      tel: data.receiverPhone,
      addressDetail: data.address,
      isDefault: data.isDefault,
    };
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}

async function saveAddress(info: AddressEditInfo) {
  if (saving.value)
    return;

  saving.value = true;
  const data = {
    receiverName: info.name,
    receiverPhone: info.tel,
    address: info.addressDetail,
    isDefault: info.isDefault ? 1 : 0,
  } as const;

  try {
    if (isEditing.value) {
      await updateAddress({
        id: addressId.value!,
        ...data,
      });
      showSuccessToast('地址已更新');
    }
    else {
      await createAddress(data);
      showSuccessToast('地址已新增');
    }

    router.replace({ name: 'AddressList' });
  }
  finally {
    saving.value = false;
  }
}

async function removeAddress() {
  if (!isEditing.value || deleting.value)
    return;

  try {
    await showConfirmDialog({
      title: '删除地址',
      message: '删除后不可恢复，确定删除该地址吗？',
    });
  }
  catch {
    return;
  }

  deleting.value = true;

  try {
    await deleteAddress(addressId.value!);
    showSuccessToast('地址已删除');
    router.replace({ name: 'AddressList' });
  }
  finally {
    deleting.value = false;
  }
}

onMounted(loadAddress);
</script>

<template>
  <section class="address-edit-page">
    <van-skeleton v-if="loading" title :row="8" class="address-edit-page__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="地址加载失败">
      <van-button round type="primary" size="small" @click="loadAddress">
        重新加载
      </van-button>
    </van-empty>

    <van-address-edit
      v-else
      :address-info="addressInfo"
      :is-saving="saving"
      :is-deleting="deleting"
      :show-area="false"
      :show-delete="isEditing"
      show-set-default
      save-button-text="保存地址"
      delete-button-text="删除地址"
      @save="saveAddress"
      @delete="removeAddress"
    />
  </section>
</template>

<style scoped lang="scss">
.address-edit-page {
  min-height: 100%;
  background: #f7f8fa;

  &__skeleton {
    padding: 16px;
  }

  :deep(.van-address-edit) {
    --van-address-edit-padding: 12px;
  }
}
</style>
