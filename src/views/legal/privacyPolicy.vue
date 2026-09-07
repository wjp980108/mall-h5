<script setup lang="ts">
import { AgreementType } from '@/api/agreement';
import AgreementPageContent from './components/AgreementPageContent.vue';

defineOptions({ name: 'PrivacyPolicyPage' });
</script>

<template>
  <AgreementPageContent :type="AgreementType.Privacy" fallback-title="隐私协议" />
</template>
