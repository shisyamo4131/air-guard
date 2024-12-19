<script>
/**
 * タイトルをフロートさせたカードコンポーネントです。
 * VCardを基底としており、すべてのプロパティが利用可能です。
 *
 * - colorプロパティはタイトル部の色として使用されます。
 * - roundedプロパティはタイトル部と連動します。
 * - titeプロパティはタイトル部と連動します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: undefined, required: false },
    rounded: { type: [Boolean, String], default: 'rounded', required: false },
    tile: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div class="g-card-floating-title__container">
    <v-sheet
      :color="color"
      dark
      class="g-card-floating-title__title px-2 text-subtitle-1"
      :tile="tile"
      :rounded="rounded"
    >
      <div class="d-flex overflow-hidden">
        <v-icon left>mdi-hospital-box</v-icon>
        <div class="text-truncate">健康保険aaaaaaaaaaaaaa</div>
      </div>
    </v-sheet>
    <v-card
      class="pt-5"
      v-bind="$attrs"
      :rounded="rounded"
      :tile="tile"
      v-on="$listeners"
    >
      <slot name="default" />
    </v-card>
  </div>
</template>

<style scoped>
.g-card-floating-title__container {
  position: relative !important;
  margin: 12px 0 0 0 !important;
}

.g-card-floating-title__title {
  position: absolute;
  top: -12px;
  left: 12px;
  z-index: 2;
  max-width: calc(100% - 24px);
}
</style>
