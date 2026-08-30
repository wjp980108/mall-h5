<script setup lang="ts">
import type { FieldValidateError, FormInstance } from 'vant';
import { showNotify, showToast } from 'vant';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'ForgotPasswordPage' });

const router = useRouter();
const formRef = ref<FormInstance>();
const sendingCode = ref(false);
const form = reactive({ phone: '', verificationCode: '', password: '', confirmPassword: '' });

function phoneValidator(value: string) {
  return /^1\d{10}$/.test(value) || '请输入正确的手机号';
}
function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}
function handleFormFailed({ errors }: { errors: FieldValidateError[] }) {
  showNotify({ type: 'warning', message: errors[0]?.message || '请完善重置信息' });
}
function sendVerificationCode() {
  if (phoneValidator(form.phone) !== true) {
    showToast('请先输入正确的手机号');
    return;
  }
  sendingCode.value = true;
  form.verificationCode = '123456';
  showToast('验证码已发送');
  window.setTimeout(() => {
    sendingCode.value = false;
  }, 1000);
}
async function handleResetPassword() {
  if (form.password !== form.confirmPassword) {
    showNotify({ type: 'warning', message: '两次输入的密码不一致' });
    return;
  }
  showToast('密码找回服务暂未开通');
}
</script>

<template>
  <main class="forgot-password-page">
    <section class="forgot-password-page__content">
      <section class="forgot-password-page__main" aria-label="找回密码">
        <h1>找回密码</h1>
        <p>验证手机号后重设登录密码</p>
        <van-form ref="formRef" class="auth-form" :show-error-message="false" @failed="handleFormFailed" @submit="handleResetPassword">
          <van-cell-group inset>
            <van-field v-model.trim="form.phone" name="phone" type="tel" label="手机号" left-icon="phone-o" placeholder="请输入手机号" :rules="[{ required: true, validator: phoneValidator }]" />
            <van-field v-model="form.verificationCode" name="verificationCode" label="验证码" left-icon="shield-o" placeholder="请输入验证码" :rules="[{ required: true, message: '请输入验证码' }]">
              <template #button>
                <van-button size="small" type="primary" plain :loading="sendingCode" @click="sendVerificationCode">
                  获取验证码
                </van-button>
              </template>
            </van-field>
            <van-field v-model="form.password" name="password" type="password" label="新密码" left-icon="lock" placeholder="6-20 位密码" :rules="[{ required: true, validator: passwordValidator }]" />
            <van-field v-model="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" left-icon="lock" placeholder="请再次输入新密码" :rules="[{ required: true, message: '请再次输入新密码' }]" />
          </van-cell-group>
          <van-button round block type="primary" native-type="submit">
            确认重置
          </van-button>
          <div class="form-actions">
            <button type="button" @click="router.push('/login')">
              返回登录
            </button>
          </div>
        </van-form>
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
.forgot-password-page {
  height: 100%;
  min-height: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--van-background);
}
.forgot-password-page__content {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.forgot-password-page__main {
  padding: 10px 4px 4px;
}
.forgot-password-page__main h1 {
  margin: 0;
  color: var(--van-text-color);
  font-size: 27px;
  letter-spacing: -0.5px;
  line-height: 36px;
}
.forgot-password-page__main > p {
  margin: 6px 0 22px;
  color: var(--van-text-color-2);
  font-size: 14px;
  line-height: 20px;
}
:deep(.auth-form .van-cell-group--inset) {
  margin: 0;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
}
:deep(.auth-form .van-cell) {
  min-height: 54px;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 12px;
  border: 1px solid var(--van-border-color);
  border-radius: 12px;
  background: var(--van-background-2);
}
:deep(.auth-form .van-cell::after) {
  display: none;
}
:deep(.auth-form .van-field--error) {
  box-shadow: 0 0 0 1px rgb(238 10 36 / 55%);
}
:deep(.auth-form .van-field__label) {
  width: 68px;
  color: var(--van-text-color);
  font-size: 14px;
  white-space: nowrap;
}
:deep(.auth-form .van-field__left-icon) {
  margin-right: 8px;
  color: var(--van-text-color-2);
  font-size: 18px;
}
:deep(.auth-form .van-field__control) {
  color: var(--van-text-color);
  font-size: 14px;
}
:deep(.auth-form .van-field__control::placeholder) {
  color: var(--van-text-color-3);
}
:deep(.auth-form > .van-button) {
  height: 48px;
  margin-top: 14px;
  font-size: 16px;
  font-weight: 600;
}
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 13px;
}
.form-actions button {
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--van-primary-color);
  font-size: inherit;
}
</style>
