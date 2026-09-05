<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'UserAgreementPage' });

const router = useRouter();
</script>

<template>
  <main class="agreement-page">
    <section class="agreement-page__content">
      <h1>用户协议</h1>
      <p class="agreement-page__description">
        请仔细阅读并理解本协议内容
      </p>
      <article class="agreement-content">
        <h2>一、服务说明</h2>
        <p>感谢使用本平台。平台将依照本协议及相关规则为你提供商品浏览、订单交易和客户服务等功能。</p>
        <h2>二、账号使用</h2>
        <p>你应提供真实、准确的账号信息，并妥善保管账号及密码。因账号保管不当造成的风险，由账号使用人自行承担。</p>
        <h2>三、用户行为</h2>
        <p>你不得利用平台从事违法违规活动，不得干扰平台正常运行或侵害其他用户的合法权益。</p>
        <h2>四、协议更新</h2>
        <p>平台可在法律法规允许的范围内更新本协议。最终协议内容以平台正式发布版本为准。</p>
      </article>
      <button class="back-button" type="button" @click="router.back()">
        返回上一页
      </button>
    </section>
  </main>
</template>

<style scoped lang="scss">
.agreement-page {
  height: 100%;
  min-height: 0;
  padding: max(16px, env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--van-background);
}
.agreement-page__content {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.agreement-page h1 {
  margin: 10px 0 0;
  color: var(--van-text-color);
  font-size: 27px;
  line-height: 36px;
}
.agreement-page__description {
  margin: 6px 0 22px;
  color: var(--van-text-color-2);
  font-size: 14px;
  line-height: 20px;
}
.agreement-content {
  color: var(--van-text-color-2);
  font-size: 14px;
  line-height: 24px;
}
.agreement-content h2 {
  margin: 0 0 8px;
  color: var(--van-text-color);
  font-size: 16px;
  line-height: 24px;
}
.agreement-content p {
  margin: 0 0 20px;
}
.back-button {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  border: 0;
  border-radius: 22px;
  background: var(--van-background-2);
  box-shadow: inset 0 0 0 1px var(--van-border-color);
  color: var(--van-primary-color);
  font-size: 15px;
}
</style>
