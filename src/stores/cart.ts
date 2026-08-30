import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  specification?: string;
  price: number;
  quantity: number;
  checked: boolean;
}

export type AddCartItem = Omit<CartItem, 'specification' | 'quantity' | 'checked'>;

const initialCartItems: CartItem[] = [
  {
    id: 'product-1',
    name: '轻盈缓震运动跑鞋',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=85',
    specification: '白色 / 42码',
    price: 699,
    quantity: 1,
    checked: true,
  },
  {
    id: 'product-5',
    name: '降噪蓝牙头戴耳机',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=720&q=85',
    specification: '曜石黑',
    price: 899,
    quantity: 1,
    checked: true,
  },
  {
    id: 'product-8',
    name: '简约不锈钢保温杯',
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=720&q=85',
    specification: '奶油白 / 500ml',
    price: 89,
    quantity: 2,
    checked: false,
  },
];

export const useCartStore = defineStore('cart-store', () => {
  const items = ref<CartItem[]>(initialCartItems);

  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0));

  function addItem(product: AddCartItem) {
    const existingItem = items.value.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.checked = true;
      return;
    }

    items.value.push({
      ...product,
      quantity: 1,
      checked: true,
    });
  }

  return {
    items,
    itemCount,
    addItem,
  };
});
