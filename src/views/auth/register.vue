<script setup lang="ts">
import type { RegisterReq } from '@/api';
import { showConfirmDialog, showToast } from 'vant';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/api';

defineOptions({ name: 'RegisterPage' });

const router = useRouter();
const agreed = ref(false);
const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  inviteCode: '',
  password: '',
  confirmPassword: '',
});

function phoneValidator(value: string) {
  return /^1\d{10}$/.test(value) || '请输入正确的手机号';
}

function passwordValidator(value: string) {
  return (value.length >= 6 && value.length <= 20) || '密码长度为 6-20 位';
}

function inviteCodeValidator(value: string) {
  return !value || /^[A-Z0-9]{8}$/i.test(value) || '邀请码为 8 位字母或数字';
}

function emailValidator(value: string) {
  return !value || /^\S[^\s@]*@\S[^\s.]*\.\S+$/.test(value) || '请输入正确的邮箱地址';
}

function confirmPasswordValidator(value: string) {
  return value === form.password || '两次输入的密码不一致';
}

async function handleRegister() {
  if (!agreed.value) {
    try {
      await showConfirmDialog({
        title: '同意协议',
        message: '未勾选用户协议与隐私协议，是否默认同意并继续注册？',
        confirmButtonText: '同意并注册',
      });
      agreed.value = true;
    }
    catch {
      return;
    }
  }
  const data: RegisterReq = {
    username: form.username,
    password: form.password,
    phone: form.phone,
    nickname: form.nickname || undefined,
    email: form.email || undefined,
    inviteCode: form.inviteCode || undefined,
  };
  await register(data);
  await router.replace({ path: '/login', query: { account: form.username } });
  showToast({ type: 'success', message: '注册成功，请登录' });
}
</script>

<template>
  <main class="register-page">
    <section class="register-page__content">
      <section class="register-page__main" aria-label="注册账号">
        <h1>注册账号</h1>
        <p>设置账号与密码，完成后即可登录购物</p>
        <van-form class="auth-form" @submit="handleRegister">
          <van-cell-group inset>
            <van-field
              v-model.trim="form.username" name="username" label="用户名"
              left-icon="user-o" placeholder="请输入登录用户名" autocomplete="username"
              clearable :rules="[{ required: true, message: '请输入登录用户名' }]"
            />
            <van-field
              v-model.trim="form.nickname" name="nickname" label="昵称" left-icon="smile-o"
              placeholder="昵称（选填）" clearable
            />
            <van-field
              v-model.trim="form.phone" name="phone" type="tel" label="手机号"
              left-icon="phone-o" placeholder="请输入手机号" autocomplete="tel" clearable
              :rules="[{ required: true, message: '请输入手机号' }, { validator: phoneValidator }]"
            />
            <van-field
              v-model.trim="form.email" name="email" type="email" label="邮箱"
              left-icon="envelop-o" placeholder="邮箱（选填）" autocomplete="email" clearable
              :rules="[{ validator: emailValidator }]"
            />
            <van-field
              v-model.trim="form.inviteCode" name="inviteCode" label="邀请码"
              left-icon="friends-o" placeholder="邀请码（选填）" clearable
              :rules="[{ validator: inviteCodeValidator }]"
            />
            <van-field
              v-model="form.password" name="password" type="password" label="密码"
              left-icon="lock" placeholder="6-20 位密码" autocomplete="new-password"
              clearable :rules="[{ required: true, message: '请输入密码' }, { validator: passwordValidator }]"
            />
            <van-field
              v-model="form.confirmPassword" name="confirmPassword" type="password"
              label="确认密码" left-icon="lock" placeholder="请再次输入密码"
              autocomplete="new-password" clearable
              :rules="[{ required: true, message: '请再次输入密码' }, { validator: confirmPasswordValidator }]"
            />
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
