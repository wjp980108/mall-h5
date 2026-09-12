<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgotPassword } from '@/api';

defineOptions({ name: 'ForgotPasswordPage' });

const router = useRouter();
const submitting = ref(false);
const form = reactive({ account: '', verificationCode: '', password: '', confirmPassword: '' });

function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}
function verificationCodeValidator(value: string) {
  return /^[A-Z0-9]{6}$/i.test(value) || '请输入 6 位字母或数字验证码';
}
function confirmPasswordValidator(value: string) {
  return value === form.password || '两次输入的密码不一致';
}
async function handleResetPassword() {
  submitting.value = true;
  try {
    await forgotPassword({ account: form.account, password: form.password });
    await router.replace({ path: '/login', query: { account: form.account } });
  }
  finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="forgot-password-page">
    <div class="forgot-password-page__content">
      <div class="forgot-password-page__main" aria-label="重置密码">
        <h1>重置密码</h1>
        <p>验证用户名后重设登录密码</p>
        <van-form class="auth-form" @submit="handleResetPassword">
          <van-cell-group inset>
            <van-field v-model.trim="form.account" name="account" label="用户名" left-icon="user-o" placeholder="请输入用户名" autocomplete="username" :rules="[{ required: true, message: '请输入用户名' }]" />
            <van-field v-model.trim="form.verificationCode" name="verificationCode" maxlength="6" label="验证码" left-icon="shield-o" placeholder="请输入 6 位字母或数字" :rules="[{ required: true, message: '请输入验证码' }, { validator: verificationCodeValidator }]" />
            <van-field v-model="form.password" name="password" type="password" label="新密码" left-icon="lock" placeholder="6-20 位密码" :rules="[{ required: true, message: '请输入新密码' }, { validator: passwordValidator }]" />
            <van-field v-model="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" left-icon="lock" placeholder="请再次输入新密码" :rules="[{ required: true, message: '请再次输入新密码' }, { validator: confirmPasswordValidator }]" />
          </van-cell-group>
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            确认重置
          </van-button>
          <div class="form-actions">
            <button type="button" @click="router.push('/login')">
              返回登录
            </button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
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

  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--van-primary-color);
    font-size: inherit;
  }
}
</style>
