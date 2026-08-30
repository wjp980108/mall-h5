<template>
  <section class="product-detail">
    <main class="product-detail__content">
      <div class="product-detail__image-placeholder">
        <van-icon name="photo-o" size="44" color="#c8c9cc" />
        <span>商品主图</span>
      </div>

      <section class="product-detail__info-placeholder">
        <van-skeleton title :row="3" />
      </section>

      <section class="product-detail__section-placeholder">
        <div class="section-title">
          商品详情
        </div>
        <van-skeleton :row="5" />
      </section>
    </main>

    <footer class="product-detail__actions">
      <van-button round disabled block type="primary">
        加入购物车
      </van-button>
      <van-button round disabled block type="danger">
        立即购买
      </van-button>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.product-detail__content {
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
}

.product-detail__image-placeholder {
  display: flex;
  height: 375px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff;
  color: #969799;
}

.product-detail__info-placeholder,
.product-detail__section-placeholder {
  margin-top: 12px;
  padding: 16px;
  background: #fff;
}

.section-title {
  margin-bottom: 16px;
  color: #323233;
  font-size: 16px;
  font-weight: 600;
}

.product-detail__actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
  background: #fff;
}

@media (min-width: 480px) {
  .product-detail__actions {
    right: auto;
    left: 50%;
    width: var(--mall-content-width);
    transform: translateX(-50%);
  }
}
</style>
