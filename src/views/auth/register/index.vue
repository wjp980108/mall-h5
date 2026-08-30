<script setup lang="ts">
import type { FieldValidateError, FormInstance } from 'vant';
import type { RegisterReq } from '@/api';
import { showNotify, showToast } from 'vant';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/api';

defineOptions({ name: 'RegisterPage' });

const router = useRouter();
const agreed = ref(false);
const formRef = ref<FormInstance>();
const sendingCode = ref(false);
const form = reactive({ phone: '', verificationCode: '', inviteCode: '', password: '', confirmPassword: '' });

function phoneValidator(value: string) {
  return /^1\d{10}$/.test(value) || '请输入正确的手机号';
}
function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}
function handleFormFailed({ errors }: { errors: FieldValidateError[] }) {
  showNotify({ type: 'warning', message: errors[0]?.message || '请完善注册信息' });
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
async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    showNotify({ type: 'warning', message: '两次输入的密码不一致' });
    return;
  }
  if (!agreed.value) {
    showNotify({ type: 'warning', message: '请先阅读并同意用户协议与隐私协议' });
    return;
  }
  const data: RegisterReq = { username: form.phone, phone: form.phone, password: form.password, inviteCode: form.inviteCode || undefined };
  await register(data);
  await router.replace({ path: '/login', query: { account: form.phone } });
  showToast({ type: 'success', message: '注册成功，请登录' });
}
</script>

<template>
  <main class="register-page">
    <section class="register-page__content">
      <section class="register-page__main" aria-label="注册账号">
        <h1>注册账号</h1>
        <p>手机号将作为你的登录账号</p>
        <van-form ref="formRef" class="auth-form" :show-error-message="false" @failed="handleFormFailed" @submit="handleRegister">
          <van-cell-group inset>
            <van-field v-model.trim="form.phone" name="phone" type="tel" label="手机号" left-icon="phone-o" placeholder="请输入手机号" :rules="[{ required: true, validator: phoneValidator }]" />
            <van-field v-model="form.verificationCode" name="verificationCode" label="验证码" left-icon="shield-o" placeholder="请输入验证码" :rules="[{ required: true, message: '请输入验证码' }]">
              <template #button>
                <van-button size="small" type="primary" plain :loading="sendingCode" @click="sendVerificationCode">
                  获取验证码
                </van-button>
              </template>
            </van-field>
            <van-field v-model.trim="form.inviteCode" name="inviteCode" label="邀请码" left-icon="friends-o" placeholder="邀请码（选填）" />
            <van-field v-model="form.password" name="password" type="password" label="密码" left-icon="lock" placeholder="6-20 位密码" :rules="[{ required: true, validator: passwordValidator }]" />
            <van-field v-model="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" left-icon="lock" placeholder="请再次输入密码" :rules="[{ required: true, message: '请再次输入密码' }]" />
          </van-cell-group>
          <van-button round block type="primary" native-type="submit">
            立即注册
          </van-button>
          <div class="form-actions">
            <button type="button" @click="router.push('/login')">
              已有账号？去登录
            </button>
          </div>
        </van-form>
        <footer class="auth-agreement">
          <van-checkbox v-model="agreed" checked-color="var(--van-primary-color)" icon-size="16px">
            我已阅读并同意
          </van-checkbox>
          <button type="button" @click="router.push('/user-agreement')">
            《用户协议》
          </button>
          <span>和</span>
          <button type="button" @click="router.push('/privacy-policy')">
            《隐私协议》
          </button>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
.register-page {
  height: 100%;
  min-height: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--van-background);
}
.register-page__content {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.register-page__main {
  padding: 10px 4px 4px;
}
.register-page__main h1 {
  margin: 0;
  color: var(--van-text-color);
  font-size: 27px;
  letter-spacing: -0.5px;
  line-height: 36px;
}
.register-page__main > p {
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
.auth-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 18px;
  color: var(--van-text-color-3);
  font-size: 12px;
  line-height: 20px;
}
.auth-agreement :deep(.van-checkbox) {
  margin-right: 2px;
}
.auth-agreement :deep(.van-checkbox__label) {
  margin-left: 4px;
  color: var(--van-text-color-3);
}
.auth-agreement button {
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--van-primary-color);
  font-size: inherit;
}
</style>
