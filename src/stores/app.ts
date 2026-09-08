import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchSiteSettings } from '@/api';

const defaultSiteName = import.meta.env.VITE_APP_NAME;

export const useAppStore = defineStore('app-store', () => {
  const siteName = ref(defaultSiteName);
  const siteLogo = ref('');

  async function fetchSettings() {
    const { data } = await fetchSiteSettings();

    siteName.value = data.siteName.trim() || defaultSiteName;
    siteLogo.value = data.siteLogo.trim();
  }

  return {
    siteName,
    siteLogo,
    fetchSettings,
  };
});
