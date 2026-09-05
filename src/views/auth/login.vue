<script setup lang="ts">
import type { LoginReq } from '@/api';
import { showConfirmDialog } from 'vant';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '@/api';
import logo from '@/assets/images/logo.png';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'LoginPage' });

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const agreed = ref(false);
const submitting = ref(false);
const form = reactive<LoginReq>({
  account: typeof route.query.account === 'string' ? route.query.account : '',
  password: '',
});
const appName = import.meta.env.VITE_APP_NAME;

function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}

async function handleLogin() {
  if (!agreed.value) {
    try {
      await showConfirmDialog({
        title: '同意协议',
        message: '未勾选用户协议与隐私协议，是否默认同意并继续登录？',
        confirmButtonText: '同意并登录',
      });
      agreed.value = true;
    }
    catch {
      return;
    }
  }

  submitting.value = true;
  try {
    const { data } = await login(form);
    userStore.accessToken = data.token;
    await router.replace(import.meta.env.VITE_HOME_PATH);
  }
  finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-page__content">
      <header class="login-brand" aria-label="系统信息">
        <img class="login-brand__logo" :src="logo" alt="系统 logo">
        <span class="login-brand__name">{{ appName }}</span>
      </header>

      <section class="login-page__main" aria-label="欢迎登录">
        <h1>欢迎登录</h1>
        <p>登录后即可开始安心购物</p>
        <van-form class="auth-form" @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model.trim="form.account" name="account" label="账号" left-icon="user-o"
              placeholder="请输入手机号或用户名" autocomplete="username" clearable
              :rules="[{ required: true, message: '请输入手机号或用户名' }]"
            />
            <van-field
              v-model="form.password" name="password" type="password" label="密码"
              left-icon="lock" placeholder="请输入密码" autocomplete="current-password"
              clearable :rules="[{ required: true, message: '请输入密码' }, { validator: passwordValidator }]"
            />
          </van-cell-group>
          <div class="form-actions form-actions--between">
            <button type="button" @click="router.push('/forgot-password')">
              忘记密码？
            </button>
            <button type="button" @click="router.push('/register')">
              去注册
            </button>
          </div>
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            登录
          </van-button>
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
.login-page {
  height: 100%;
  min-height: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--van-background);

  &__content {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
  }

  &__main {
    padding: 10px 4px 4px;

    h1 {
      margin: 0;
      color: var(--van-text-color);
      font-size: 27px;
      letter-spacing: -0.5px;
      line-height: 36px;
    }

    > p {
      margin: 6px 0 22px;
      color: var(--van-text-color-2);
      font-size: 14px;
      line-height: 20px;
    }
  }
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 4px 20px;

  &__logo {
    width: 42px;
    height: 42px;
    padding: 3px;
    border-radius: 13px;
    object-fit: cover;
    box-shadow: 0 7px 15px rgb(0 0 0 / 8%);
  }

  &__name {
    color: var(--van-text-color);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
}

.auth-form {
  :deep(.van-cell-group--inset) {
    margin: 0;
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  :deep(.van-cell) {
    min-height: 54px;
    align-items: center;
    margin-bottom: 10px;
    padding: 0 12px;
    border: 1px solid var(--van-border-color);
    border-radius: 12px;
    background: var(--van-background-2);

    &::after {
      display: none;
    }
  }

  :deep(.van-field--error) {
    box-shadow: 0 0 0 1px rgb(238 10 36 / 55%);
  }

  :deep(.van-field__label) {
    width: 68px;
    color: var(--van-text-color);
    font-size: 14px;
    white-space: nowrap;
  }

  :deep(.van-field__left-icon) {
    margin-right: 8px;
    color: var(--van-text-color-2);
    font-size: 18px;
  }

  :deep(.van-field__control) {
    color: var(--van-text-color);
    font-size: 14px;

    &::placeholder {
      color: var(--van-text-color-3);
    }
  }

  > :deep(.van-button) {
    height: 48px;
    margin-top: 14px;
    font-size: 16px;
    font-weight: 600;
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  font-size: 13px;

  &--between {
    justify-content: space-between;
  }

  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--van-primary-color);
    font-size: inherit;
  }
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

  :deep(.van-checkbox) {
    margin-right: 2px;
  }

  :deep(.van-checkbox__label) {
    margin-left: 4px;
    color: var(--van-text-color-3);
  }

  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--van-primary-color);
    font-size: inherit;
  }
}
</style>
