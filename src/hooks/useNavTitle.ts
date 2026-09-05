import { readonly, ref } from 'vue';

export interface NavCountdown {
  label: string;
  time: number;
}

const navTitle = ref<string>();
const navCountdown = ref<NavCountdown>();

/**
 * 为需要异步加载标题的页面提供导航栏标题。
 */
export function useNavTitle() {
  function setNavTitle(title?: string) {
    navTitle.value = title?.trim() || undefined;
  }

  function setNavCountdown(countdown?: NavCountdown) {
    navCountdown.value = countdown && countdown.time > 0 ? countdown : undefined;
  }

  return {
    navTitle: readonly(navTitle),
    navCountdown: readonly(navCountdown),
    setNavTitle,
    setNavCountdown,
  };
}
