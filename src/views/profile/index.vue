<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

interface ProfileInfo {
  name: string;
  phone: string;
}

interface MenuItem {
  title: string;
  icon: string;
  routeName?: 'AddressList' | 'BuyerOrders' | 'SellerOrders' | 'InviteCode' | 'PaymentManagement';
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

defineOptions({ name: 'ProfilePage' });

const router = useRouter();

const userStore = useUserStore();
const profile = computed<ProfileInfo>(() => ({
  name: userStore.userInfo.nickname || userStore.userInfo.username || '商城用户',
  phone: userStore.userInfo.phone ? userStore.userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定手机号',
}));
const avatarUrl = computed(() => {
  const { avatar } = userStore.userInfo;
  return !avatar || /^(?:https?:)?\/\//.test(avatar) ? avatar : new URL(avatar, import.meta.env.VITE_BASE_URL).toString();
});

const menuGroups: MenuGroup[] = [
  {
    items: [
      { title: '权益券', icon: 'coupon-o' },
    ],
  },
  {
    title: '买方服务',
    items: [
      { title: '我的仓库', icon: 'bag-o', routeName: 'BuyerOrders' },
    ],
  },
  {
    title: '卖方服务',
    items: [
      { title: '我的仓库', icon: 'shop-o', routeName: 'SellerOrders' },
    ],
  },
  {
    items: [
      { title: '我的地址', icon: 'location-o', routeName: 'AddressList' },
      { title: '我的邀请码', icon: 'friends-o', routeName: 'InviteCode' },
      { title: '分销中心', icon: 'chart-trending-o' },
      { title: '收款管理', icon: 'balance-o', routeName: 'PaymentManagement' },
    ],
  },
];

function handleMenuClick(item: MenuItem) {
  if (item.routeName)
    router.push({ name: item.routeName });
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-card__avatar" aria-hidden="true">
        <van-image v-if="avatarUrl" :src="avatarUrl" fit="cover" round />
        <van-icon v-else name="user-circle-o" />
      </div>
      <div class="profile-card__info">
        <strong>{{ profile.name }}</strong>
        <span>{{ profile.phone }}</span>
      </div>
      <button class="profile-card__settings" type="button" @click="router.push({ name: 'ProfileSettings' })">
        <van-icon name="setting-o" />
        <span>设置</span>
      </button>
    </div>

    <div
      v-for="(group, groupIndex) in menuGroups"
      :key="groupIndex"
      class="profile-menu"
    >
      <h2 v-if="group.title" class="profile-menu__title">
        {{ group.title }}
      </h2>
      <van-cell-group inset class="profile-menu__list">
        <van-cell
          v-for="item in group.items"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          is-link
          @click="handleMenuClick(item)"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  padding: 16px 12px;
}

.profile-card {
  display: flex;
  align-items: center;
  min-height: 104px;
  padding: 20px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 14px rgb(0 0 0 / 4%);

  &__avatar {
    display: flex;
    width: 64px;
    height: 64px;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    background: #f2f3f5;
    color: var(--van-primary-color);
    font-size: 48px;

    .van-image {
      width: 100%;
      height: 100%;
    }
  }

  &__info {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 7px;
    margin-left: 14px;

    strong {
      overflow: hidden;
      color: #323233;
      font-size: 18px;
      line-height: 24px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: #969799;
      font-size: 13px;
      line-height: 18px;
    }
  }

  &__settings {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0 8px 12px;
    border: 0;
    background: transparent;
    color: #646566;
    font-size: 13px;

    .van-icon {
      font-size: 18px;
    }
  }
}

.profile-menu {
  margin-top: 16px;

  &__title {
    margin: 0 0 8px 4px;
    color: #969799;
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
  }

  &__list {
    margin: 0;
    overflow: hidden;
    border-radius: 12px;

    :deep(.van-cell) {
      min-height: 52px;
      align-items: center;
    }

    :deep(.van-cell__left-icon) {
      margin-right: 10px;
      color: var(--van-primary-color);
      font-size: 20px;
    }

    :deep(.van-cell__title) {
      color: #323233;
      font-size: 15px;
    }
  }
}
</style>
