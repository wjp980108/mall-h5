<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

defineOptions({ name: 'InviteCodePage' });

const userStore = useUserStore();
const inviteCode = computed(() => userStore.userInfo.inviteCode || '');

async function copyInviteCode() {
  if (!inviteCode.value) {
    showFailToast('暂无邀请码');
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(inviteCode.value);
    }
    else {
      const input = document.createElement('textarea');
      input.value = inviteCode.value;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();

      const copied = document.execCommand('copy');
      input.remove();

      if (!copied)
        throw new Error('Copy failed');
    }

    showSuccessToast('邀请码已复制');
  }
  catch {
    showFailToast('复制失败，请手动复制');
  }
}
</script>

<template>
  <div class="invite-code-page">
    <div class="invite-card" aria-label="我的邀请码">
      <div class="invite-card__decoration invite-card__decoration--left" aria-hidden="true" />
      <div class="invite-card__decoration invite-card__decoration--right" aria-hidden="true" />
      <van-icon name="friends-o" class="invite-card__icon" aria-hidden="true" />
      <p class="invite-card__label">
        我的邀请码
      </p>
      <strong class="invite-card__code" :class="{ 'invite-card__code--empty': !inviteCode }">
        {{ inviteCode || '暂无邀请码' }}
      </strong>
      <van-button round plain class="invite-card__copy" :disabled="!inviteCode" @click="copyInviteCode">
        <van-icon name="description-o" />
        复制邀请码
      </van-button>
    </div>

    <div class="invite-guide" aria-labelledby="invite-guide-title">
      <h2 id="invite-guide-title">
        如何使用
      </h2>
      <ol>
        <li><span>1</span><p>将邀请码发送给好友。</p></li>
        <li><span>2</span><p>好友注册时，在“邀请码”一栏填写该码。</p></li>
        <li><span>3</span><p>完成注册后，即可建立邀请关系。</p></li>
      </ol>
    </div>

    <p class="invite-code-page__notice">
      邀请码仅供好友注册时使用，请勿泄露给陌生人。
    </p>
  </div>
</template>

<style scoped lang="scss">
.invite-code-page {
  padding: 20px 16px 32px;

  &__notice {
    margin: 16px 4px 0;
    color: #969799;
    font-size: 12px;
    line-height: 18px;
  }
}

.invite-card {
  position: relative;
  display: flex;
  min-height: 244px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #2f67d8, #548ff5);
  box-shadow: 0 8px 18px rgb(47 103 216 / 20%);
  color: #fff;

  &__decoration {
    position: absolute;
    width: 144px;
    height: 144px;
    border: 28px solid rgb(255 255 255 / 10%);
    border-radius: 50%;

    &--left {
      top: -82px;
      left: -72px;
    }

    &--right {
      right: -76px;
      bottom: -88px;
    }
  }

  &__icon {
    position: relative;
    font-size: 42px;
  }

  &__label {
    position: relative;
    margin: 10px 0 4px;
    color: rgb(255 255 255 / 78%);
    font-size: 14px;
    line-height: 20px;
  }

  &__code {
    position: relative;
    font-family: monospace;
    font-size: 30px;
    letter-spacing: 3px;
    line-height: 42px;

    &--empty {
      color: rgb(255 255 255 / 70%);
      font-family: inherit;
      font-size: 20px;
      letter-spacing: 0;
    }
  }

  &__copy {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 126px;
    height: 36px;
    margin-top: 18px;
    font-size: 13px;
  }
}

.invite-guide {
  margin-top: 16px;
  padding: 18px 16px;
  border-radius: 14px;
  background: #fff;

  h2 {
    margin: 0;
    color: #323233;
    font-size: 16px;
    line-height: 24px;
  }

  ol {
    display: grid;
    gap: 16px;
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      display: flex;
      width: 22px;
      height: 22px;
      align-items: center;
      justify-content: center;
      flex: none;
      border-radius: 50%;
      background: #edf4ff;
      color: var(--van-primary-color);
      font-size: 12px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #646566;
      font-size: 14px;
      line-height: 20px;
    }
  }
}
</style>
