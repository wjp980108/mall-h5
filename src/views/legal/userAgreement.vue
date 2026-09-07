<script setup lang="ts">
import { AgreementType } from '@/api/agreement';
import AgreementPageContent from './components/AgreementPageContent.vue';

defineOptions({ name: 'UserAgreementPage' });
</script>

<template>
  <AgreementPageContent :type="AgreementType.User" fallback-title="用户协议" />
</template>
