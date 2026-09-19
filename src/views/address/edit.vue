<script setup lang="ts">
import { showConfirmDialog, showSuccessToast } from 'vant';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createAddress,
  deleteAddress,
  fetchAddressDetail,
  updateAddress,
} from '@/api/address';
import { notifyFormValidationFailed } from '@/utils/form';

defineOptions({ name: 'AddressEditPage' });

const route = useRoute();
const router = useRouter();
const loading = ref(route.name === 'AddressEdit');
const loadError = ref(false);
const saving = ref(false);
const deleting = ref(false);
const addressForm = reactive({
  name: '',
  tel: '',
  addressDetail: '',
  isDefault: false,
});

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
    Object.assign(addressForm, {
      name: data.receiverName,
      tel: data.receiverPhone,
      addressDetail: data.address,
      isDefault: data.isDefault,
    });
  }
  catch {
    loadError.value = true;
  }
  finally {
    loading.value = false;
  }
}

function phoneValidator(value: string) {
  const normalizedValue = value.replace(/[^-|\d]/g, '');
  return /^(?:\+86|86)?1\d{10}$/.test(normalizedValue) || /^0[0-9-]{10,13}$/.test(normalizedValue) || '请输入正确的手机号码';
}

async function saveAddress() {
  if (saving.value)
    return;

  saving.value = true;
  const data = {
    receiverName: addressForm.name,
    receiverPhone: addressForm.tel,
    address: addressForm.addressDetail,
    isDefault: addressForm.isDefault ? 1 : 0,
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

    router.back();
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
  <div class="address-edit-page">
    <van-skeleton v-if="loading" title :row="8" class="address-edit-page__skeleton" />

    <van-empty v-else-if="loadError" image="error" description="地址加载失败">
      <van-button round type="primary" size="small" @click="loadAddress">
        重新加载
      </van-button>
    </van-empty>

    <van-form
      v-else
      :show-error="false"
      :show-error-message="false"
      validate-trigger="onSubmit"
      @failed="notifyFormValidationFailed"
      @submit="saveAddress"
    >
      <van-cell-group inset>
        <van-field
          v-model.trim="addressForm.name"
          name="name"
          label="收货人"
          clearable
          placeholder="收货人姓名"
          :rules="[{ required: true, message: '请填写收货人姓名' }]"
        />
        <van-field
          v-model.trim="addressForm.tel"
          name="tel"
          type="tel"
          label="手机号"
          clearable
          placeholder="收货人手机号"
          :rules="[{ required: true, message: '请填写收货人手机号' }, { validator: phoneValidator }]"
        />
        <van-field
          v-model.trim="addressForm.addressDetail"
          name="addressDetail"
          type="textarea"
          rows="1"
          autosize
          maxlength="200"
          label="详细地址"
          placeholder="如街道、门牌号等"
          clearable
          :rules="[{ required: true, message: '请填写详细地址' }]"
        />
      </van-cell-group>
      <van-cell-group class="!mt-16px" inset>
        <van-cell center title="设为默认收货地址">
          <template #right-icon>
            <van-switch v-model="addressForm.isDefault" />
          </template>
        </van-cell>
      </van-cell-group>
      <div class="address-edit-page__actions">
        <van-button round block type="primary" native-type="submit" :loading="saving">
          保存地址
        </van-button>
        <van-button
          v-if="isEditing"
          round
          block
          :loading="deleting"
          native-type="button"
          @click="removeAddress"
        >
          删除地址
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped lang="scss">
.address-edit-page {
  padding-top: 16px;

  &__skeleton {
    padding: 16px;
  }

  &__actions {
    display: grid;
    gap: 12px;
    margin: 24px 16px;
  }
}
</style>
