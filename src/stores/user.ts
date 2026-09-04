import type { CurrentUser } from '@/api';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { toRefs } from 'vue';
import { useReset } from '@/hooks/useReset';

export const useUserStore = defineStore('user-store', () => {
  const [state, reset] = useReset(() => ({
    userInfo: {} as CurrentUser,
  }));

  const accessToken = useStorage('access-token', '');

  // 退出登录
  const handleLogout = () => {
    reset();
    accessToken.value = '';
  };

  return {
    ...toRefs(state.value),
    accessToken,
    handleLogout,
  };
});
