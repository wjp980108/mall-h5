<script setup lang="ts">
import { showToast } from 'vant';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'ForgotPasswordPage' });

const router = useRouter();
const form = reactive({ phone: '', verificationCode: '', password: '', confirmPassword: '' });

function phoneValidator(value: string) {
  return /^1\d{10}$/.test(value) || '请输入正确的手机号';
}
function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}
function verificationCodeValidator(value: string) {
  return /^[A-Z0-9]{6}$/i.test(value) || '请输入任意 6 位字母或数字验证码';
}
function confirmPasswordValidator(value: string) {
  return value === form.password || '两次输入的密码不一致';
}
async function handleResetPassword() {
  showToast('密码找回服务暂未开通');
}
</script>

<template>
  <main class="forgot-password-page">
    <section class="forgot-password-page__content">
      <section class="forgot-password-page__main" aria-label="找回密码">
        <h1>找回密码</h1>
        <p>验证手机号后重设登录密码</p>
        <van-form class="auth-form" @submit="handleResetPassword">
          <van-cell-group inset>
            <van-field v-model.trim="form.phone" name="phone" type="tel" label="手机号" left-icon="phone-o" placeholder="请输入手机号" :rules="[{ required: true, message: '请输入手机号' }, { validator: phoneValidator }]" />
            <van-field v-model.trim="form.verificationCode" name="verificationCode" maxlength="6" label="验证码" left-icon="shield-o" placeholder="请输入任意 6 位字母或数字" :rules="[{ required: true, message: '请输入验证码' }, { validator: verificationCodeValidator }]" />
            <van-field v-model="form.password" name="password" type="password" label="新密码" left-icon="lock" placeholder="6-20 位密码" :rules="[{ required: true, message: '请输入新密码' }, { validator: passwordValidator }]" />
            <van-field v-model="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" left-icon="lock" placeholder="请再次输入新密码" :rules="[{ required: true, message: '请再次输入新密码' }, { validator: confirmPasswordValidator }]" />
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
