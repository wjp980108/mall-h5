<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'PrivacyPolicyPage' });

const router = useRouter();
</script>

<template>
  <main class="privacy-policy-page">
    <section class="privacy-policy-page__content">
      <h1>隐私协议</h1>
      <p class="privacy-policy-page__description">
        我们重视并保护你的个人信息
      </p>
      <article class="agreement-content">
        <h2>一、信息收集</h2>
        <p>我们仅收集提供商品、订单、支付和客户服务所必需的信息，包括账号、联系方式和订单相关信息。</p>
        <h2>二、信息使用</h2>
        <p>收集的信息仅用于提供和优化平台服务、保障交易安全，以及履行法律法规规定的义务。</p>
        <h2>三、信息保护</h2>
        <p>我们采取合理的技术和管理措施保护你的个人信息，并在必要范围内控制信息访问权限。</p>
        <h2>四、你的权利</h2>
        <p>你可通过平台提供的渠道查询、更正或删除个人信息。最终协议内容以平台正式发布版本为准。</p>
      </article>
      <button class="back-button" type="button" @click="router.back()">
        返回上一页
      </button>
    </section>
  </main>
</template>

<style scoped lang="scss">
.privacy-policy-page {
  height: 100%;
  min-height: 0;
  padding: max(16px, env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--van-background);
}
.privacy-policy-page__content {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.privacy-policy-page h1 {
  margin: 10px 0 0;
  color: var(--van-text-color);
  font-size: 27px;
  line-height: 36px;
}
.privacy-policy-page__description {
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
