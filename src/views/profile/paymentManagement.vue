<script setup lang="ts">
import type { UploaderFileListItem } from 'vant';
import type {
  BankCard,
  PaymentCode,
  PaymentMethod,
  SaveBankCardPayload,
} from '@/api/payment';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { computed, onMounted, reactive, ref } from 'vue';
import {
  createBankCard,
  deleteBankCard,
  fetchBankCards,
  fetchPaymentCode,
  savePaymentCode,
  sendPaymentVerificationCode,
  updateBankCard,
} from '@/api/payment';

defineOptions({ name: 'PaymentManagementPage' });

interface BankCardForm extends SaveBankCardPayload {}

interface PaymentCodeForm {
  imageUrl: string;
  phone: string;
  verificationCode: string;
}

const activeTab = ref<PaymentMethod | 'bank'>('bank');
const bankCards = ref<BankCard[]>([]);
const bankLoading = ref(true);
const bankFormVisible = ref(false);
const editingBankCardId = ref<string>();
const bankSaving = ref(false);
const bankForm = reactive<BankCardForm>(createEmptyBankForm());
const paymentCodes = reactive<Record<PaymentMethod, PaymentCode | null>>({
  wechat: null,
  alipay: null,
});
const paymentCodeLoading = reactive<Record<PaymentMethod, boolean>>({
  wechat: false,
  alipay: false,
});
const paymentCodeForms = reactive<Record<PaymentMethod, PaymentCodeForm>>({
  wechat: createEmptyPaymentCodeForm(),
  alipay: createEmptyPaymentCodeForm(),
});
const paymentCodeFiles = reactive<Record<PaymentMethod, UploaderFileListItem[]>>({
  wechat: [],
  alipay: [],
});
const paymentCodeSaving = reactive<Record<PaymentMethod, boolean>>({
  wechat: false,
  alipay: false,
});

const currentPaymentMethod = computed<PaymentMethod | null>(() =>
  activeTab.value === 'bank' ? null : activeTab.value,
);

const currentPaymentForm = computed(() =>
  currentPaymentMethod.value ? paymentCodeForms[currentPaymentMethod.value] : null,
);

function createEmptyBankForm(): BankCardForm {
  return {
    accountName: '',
    reservedPhone: '',
    bankName: '',
    cardNumber: '',
    verificationCode: '',
  };
}

function createEmptyPaymentCodeForm(): PaymentCodeForm {
  return {
    imageUrl: '',
    phone: '',
    verificationCode: '',
  };
}

function isPhoneNumber(phone: string) {
  return /^1\d{10}$/.test(phone);
}

function isVerificationCode(code: string) {
  return /^\d{6}$/.test(code);
}

function maskCardNumber(cardNumber: string) {
  return cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
}

async function loadBankCards() {
  bankLoading.value = true;

  try {
    const { data } = await fetchBankCards();
    bankCards.value = data;
  }
  finally {
    bankLoading.value = false;
  }
}

async function loadPaymentCode(method: PaymentMethod) {
  paymentCodeLoading[method] = true;

  try {
    const { data } = await fetchPaymentCode(method);
    paymentCodes[method] = data;
    paymentCodeForms[method].imageUrl = data?.imageUrl ?? '';
    paymentCodeForms[method].phone = data?.phone ?? '';
    paymentCodeFiles[method] = data ? [{ url: data.imageUrl, isImage: true }] : [];
  }
  finally {
    paymentCodeLoading[method] = false;
  }
}

function openCreateBankCard() {
  editingBankCardId.value = undefined;
  Object.assign(bankForm, createEmptyBankForm());
  bankFormVisible.value = true;
}

function openEditBankCard(bankCard: BankCard) {
  editingBankCardId.value = bankCard.id;
  Object.assign(bankForm, {
    ...bankCard,
    verificationCode: '',
  });
  bankFormVisible.value = true;
}

function validateBankForm() {
  if (!bankForm.accountName.trim() || !bankForm.bankName.trim()) {
    showToast('请填写持卡人姓名和开户行');
    return false;
  }

  if (!/^\d{12,24}$/.test(bankForm.cardNumber.replace(/\s/g, ''))) {
    showToast('请输入正确的银行卡号');
    return false;
  }

  if (!isPhoneNumber(bankForm.reservedPhone)) {
    showToast('请输入正确的预留手机号');
    return false;
  }

  if (!isVerificationCode(bankForm.verificationCode)) {
    showToast('请输入 6 位验证码');
    return false;
  }

  return true;
}

async function saveBankCard() {
  if (bankSaving.value || !validateBankForm())
    return;

  bankSaving.value = true;
  const payload: SaveBankCardPayload = {
    ...bankForm,
    accountName: bankForm.accountName.trim(),
    bankName: bankForm.bankName.trim(),
    cardNumber: bankForm.cardNumber.replace(/\s/g, ''),
  };

  try {
    if (editingBankCardId.value)
      await updateBankCard(editingBankCardId.value, payload);
    else
      await createBankCard(payload);

    await loadBankCards();
    bankFormVisible.value = false;
    showSuccessToast(editingBankCardId.value ? '银行卡已更新' : '银行卡已添加');
  }
  finally {
    bankSaving.value = false;
  }
}

async function removeBankCard(bankCard: BankCard) {
  try {
    await showConfirmDialog({
      title: '删除银行卡',
      message: `确定删除尾号 ${bankCard.cardNumber.slice(-4)} 的银行卡吗？`,
    });
    await deleteBankCard(bankCard.id);
    await loadBankCards();
    showSuccessToast('银行卡已删除');
  }
  catch (error) {
    if (error instanceof Error)
      showToast(error.message);
  }
}

async function sendVerificationCode(phone: string) {
  if (!isPhoneNumber(phone)) {
    showToast('请先输入正确的手机号');
    return;
  }

  await sendPaymentVerificationCode(phone);
  showSuccessToast('验证码已发送');
}

function afterRead(method: PaymentMethod, file: UploaderFileListItem | UploaderFileListItem[]) {
  const uploadedFile = Array.isArray(file) ? file[0] : file;
  const url = typeof uploadedFile?.content === 'string' ? uploadedFile.content : uploadedFile?.url;

  if (!url) {
    showToast('图片读取失败，请重新上传');
    return;
  }

  paymentCodeForms[method].imageUrl = url;
}

function deletePaymentCode(method: PaymentMethod) {
  paymentCodeForms[method].imageUrl = '';
}

function validatePaymentCodeForm(method: PaymentMethod) {
  const form = paymentCodeForms[method];

  if (!form.imageUrl) {
    showToast('请上传收款码');
    return false;
  }

  if (!isPhoneNumber(form.phone)) {
    showToast('请输入正确的手机号');
    return false;
  }

  if (!isVerificationCode(form.verificationCode)) {
    showToast('请输入 6 位验证码');
    return false;
  }

  return true;
}

async function saveCurrentPaymentCode() {
  const method = currentPaymentMethod.value;

  if (!method || paymentCodeSaving[method] || !validatePaymentCodeForm(method))
    return;

  paymentCodeSaving[method] = true;

  try {
    const { data } = await savePaymentCode(method, paymentCodeForms[method]);
    paymentCodes[method] = data;
    paymentCodeForms[method].verificationCode = '';
    showSuccessToast('收款码已保存');
  }
  finally {
    paymentCodeSaving[method] = false;
  }
}

function handleTabChange(name: string | number) {
  if (name === 'wechat' || name === 'alipay')
    loadPaymentCode(name);
}

onMounted(async () => {
  await loadBankCards();
});
</script>

<template>
  <div class="payment-management-page">
    <div class="payment-management-page__intro">
      <van-icon name="shield-o" />
      <span>请确认收款信息准确无误，保存前需完成手机验证。</span>
    </div>

    <van-tabs v-model:active="activeTab" class="payment-tabs" @change="handleTabChange">
      <van-tab title="银行卡" name="bank">
        <div class="payment-management-page__content">
          <van-skeleton v-if="bankLoading" title :row="6" />

          <template v-else>
            <div v-if="bankCards.length" class="bank-card-list">
              <div v-for="bankCard in bankCards" :key="bankCard.id" class="bank-card-item">
                <div class="bank-card-item__header">
                  <div class="bank-card-item__bank-icon">
                    <van-icon name="gold-coin-o" />
                  </div>
                  <div>
                    <strong>{{ bankCard.bankName }}</strong>
                    <p>{{ bankCard.accountName }} · {{ bankCard.reservedPhone.slice(0, 3) }}****{{ bankCard.reservedPhone.slice(-4) }}</p>
                  </div>
                </div>
                <div class="bank-card-item__number">
                  {{ maskCardNumber(bankCard.cardNumber) }}
                </div>
                <div class="bank-card-item__actions">
                  <button type="button" @click="openEditBankCard(bankCard)">
                    编辑
                  </button>
                  <button type="button" class="is-danger" @click="removeBankCard(bankCard)">
                    删除
                  </button>
                </div>
              </div>
            </div>

            <van-empty v-else image="search" description="暂无银行卡">
              <van-button round type="primary" size="small" @click="openCreateBankCard">
                添加银行卡
              </van-button>
            </van-empty>

            <van-button
              v-if="bankCards.length"
              class="add-bank-card-button"
              plain block type="primary" icon="plus"
              @click="openCreateBankCard"
            >
              添加银行卡
            </van-button>
          </template>
        </div>
      </van-tab>

      <van-tab title="微信" name="wechat">
        <div class="payment-management-page__content">
          <van-skeleton v-if="paymentCodeLoading.wechat" title :row="7" />
          <template v-else-if="currentPaymentForm">
            <div class="payment-code-notice">
              <van-icon name="info-o" />
              <span>仅支持上传一张微信收款码，新图片将替换原收款码。</span>
            </div>
            <div class="payment-code-form">
              <p class="payment-code-form__label">
                微信收款码
              </p>
              <van-uploader
                v-model="paymentCodeFiles.wechat"
                :max-count="1"
                :after-read="file => afterRead('wechat', file)"
                @delete="deletePaymentCode('wechat')"
              >
                <div class="payment-code-uploader">
                  <van-icon name="photograph" />
                  <span>{{ paymentCodes.wechat ? '更换收款码' : '上传收款码' }}</span>
                </div>
              </van-uploader>
              <p class="payment-code-form__hint">
                请上传清晰、完整的收款二维码图片
              </p>
              <van-cell-group inset>
                <van-field v-model="currentPaymentForm.phone" type="tel" label="手机号" placeholder="请输入绑定手机号" maxlength="11" />
                <van-field v-model="currentPaymentForm.verificationCode" type="digit" label="验证码" placeholder="请输入 6 位验证码" maxlength="6">
                  <template #button>
                    <van-button size="small" type="primary" plain @click="sendVerificationCode(currentPaymentForm.phone)">
                      获取验证码
                    </van-button>
                  </template>
                </van-field>
              </van-cell-group>
              <van-button round block type="primary" :loading="paymentCodeSaving.wechat" @click="saveCurrentPaymentCode">
                保存微信收款信息
              </van-button>
            </div>
          </template>
        </div>
      </van-tab>

      <van-tab title="支付宝" name="alipay">
        <div class="payment-management-page__content">
          <van-skeleton v-if="paymentCodeLoading.alipay" title :row="7" />
          <template v-else-if="currentPaymentForm">
            <div class="payment-code-notice">
              <van-icon name="info-o" />
              <span>仅支持上传一张支付宝收款码，新图片将替换原收款码。</span>
            </div>
            <div class="payment-code-form">
              <p class="payment-code-form__label">
                支付宝收款码
              </p>
              <van-uploader
                v-model="paymentCodeFiles.alipay"
                :max-count="1"
                :after-read="file => afterRead('alipay', file)"
                @delete="deletePaymentCode('alipay')"
              >
                <div class="payment-code-uploader">
                  <van-icon name="photograph" />
                  <span>{{ paymentCodes.alipay ? '更换收款码' : '上传收款码' }}</span>
                </div>
              </van-uploader>
              <p class="payment-code-form__hint">
                请上传清晰、完整的收款二维码图片
              </p>
              <van-cell-group inset>
                <van-field v-model="currentPaymentForm.phone" type="tel" label="手机号" placeholder="请输入绑定手机号" maxlength="11" />
                <van-field v-model="currentPaymentForm.verificationCode" type="digit" label="验证码" placeholder="请输入 6 位验证码" maxlength="6">
                  <template #button>
                    <van-button size="small" type="primary" plain @click="sendVerificationCode(currentPaymentForm.phone)">
                      获取验证码
                    </van-button>
                  </template>
                </van-field>
              </van-cell-group>
              <van-button round block type="primary" :loading="paymentCodeSaving.alipay" @click="saveCurrentPaymentCode">
                保存支付宝收款信息
              </van-button>
            </div>
          </template>
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="bankFormVisible" position="bottom" round closeable :style="{ maxHeight: '88%' }">
      <div class="bank-card-form">
        <h2>{{ editingBankCardId ? '编辑银行卡' : '添加银行卡' }}</h2>
        <van-cell-group inset>
          <van-field v-model="bankForm.accountName" label="持卡人" placeholder="请输入持卡人姓名" />
          <van-field v-model="bankForm.reservedPhone" type="tel" label="预留手机号" placeholder="请输入银行预留手机号" maxlength="11" />
          <van-field v-model="bankForm.bankName" label="开户行" placeholder="如：招商银行深圳分行" />
          <van-field v-model="bankForm.cardNumber" type="digit" label="银行卡号" placeholder="请输入银行卡号" maxlength="24" />
          <van-field v-model="bankForm.verificationCode" type="digit" label="验证码" placeholder="请输入 6 位验证码" maxlength="6">
            <template #button>
              <van-button size="small" type="primary" plain @click="sendVerificationCode(bankForm.reservedPhone)">
                获取验证码
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
        <van-button round block type="primary" :loading="bankSaving" @click="saveBankCard">
          保存银行卡
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.payment-management-page {
  &__intro {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 14px;
    background: #fff7e8;
    color: #9a6519;
    font-size: 12px;
    line-height: 18px;

    .van-icon {
      margin-top: 1px;
      flex: none;
      font-size: 16px;
    }
  }

  &__content {
    padding: 16px 12px 28px;
  }
}

.payment-tabs {
  :deep(.van-tabs__wrap) {
    background: #fff;
  }
}

.bank-card-list {
  display: grid;
  gap: 12px;
}

.bank-card-item {
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f67d8, #4f8df7);
  box-shadow: 0 6px 14px rgb(39 92 192 / 18%);
  color: #fff;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;

    strong {
      display: block;
      font-size: 16px;
      line-height: 22px;
    }

    p {
      margin: 2px 0 0;
      color: rgb(255 255 255 / 78%);
      font-size: 12px;
      line-height: 18px;
    }
  }

  &__bank-icon {
    display: flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgb(255 255 255 / 18%);
    font-size: 21px;
  }

  &__number {
    margin: 28px 0 16px;
    font-family: monospace;
    font-size: 20px;
    letter-spacing: 1px;
    line-height: 26px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;

    button {
      padding: 0;
      border: 0;
      background: transparent;
      color: rgb(255 255 255 / 84%);
      font-size: 13px;
      line-height: 20px;
    }

    .is-danger {
      color: #fff;
    }
  }
}

.add-bank-card-button {
  margin-top: 16px;
  border-style: dashed;
}

.payment-code-notice {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  color: #969799;
  font-size: 12px;
  line-height: 18px;

  .van-icon {
    margin-top: 1px;
    flex: none;
    color: var(--van-primary-color);
    font-size: 16px;
  }
}

.payment-code-form {
  &__label {
    margin: 0 0 10px;
    color: #323233;
    font-size: 15px;
    font-weight: 500;
  }

  &__hint {
    margin: 8px 0 14px;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }

  :deep(.van-cell-group) {
    margin: 0 0 20px;
  }
}

.payment-code-uploader {
  display: flex;
  width: 104px;
  height: 104px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 7px;
  border: 1px dashed #c8c9cc;
  border-radius: 8px;
  background: #fff;
  color: #969799;
  font-size: 12px;

  .van-icon {
    font-size: 28px;
  }
}

.bank-card-form {
  padding: 22px 0 calc(22px + env(safe-area-inset-bottom));

  h2 {
    margin: 0 44px 16px 16px;
    color: #323233;
    font-size: 18px;
    line-height: 26px;
  }

  :deep(.van-cell-group) {
    margin: 0 12px 22px;
  }

  :deep(.van-button) {
    margin: 0 16px;
    width: calc(100% - 32px);
  }
}
</style>
