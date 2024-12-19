<script>
/**
 * ラベルをフロートさせたカードコンポーネントです。
 * VCardを基底としており、すべてのプロパティが利用可能です。
 *
 * - colorプロパティはラベル部の色として使用されます。
 * - roundedプロパティはラベル部と連動します。
 * - titeプロパティはラベル部と連動します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ラベルの背景色です。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * ラベルに表示されるアイコンです。
     */
    icon: { type: String, default: undefined, required: false },

    /**
     * ラベルです。
     */
    label: { type: String, default: undefined, required: false },

    /**
     * ラベル・カードの四隅の丸みです。
     */
    rounded: { type: [Boolean, String], default: 'rounded', required: false },

    /**
     * true にするとラベル・カードの四隅の丸みが削除されます。
     */
    tile: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div class="g-card-floating-label__container">
    <v-sheet
      :color="color"
      dark
      class="g-card-floating-label__label px-3 py-2 text-subtitle-1"
      :tile="tile"
      :rounded="rounded"
    >
      <div class="d-flex overflow-hidden">
        <v-icon v-if="icon" left>{{ icon }}</v-icon>
        <div class="text-truncate">{{ label }}</div>
      </div>
    </v-sheet>
    <v-card
      class="pt-8"
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
.g-card-floating-label__container {
  position: relative !important;
  margin: 12px 0 0 0 !important;
}

.g-card-floating-label__label {
  position: absolute;
  top: -12px;
  left: 12px;
  z-index: 2;
  max-width: calc(100% - 24px);
}
</style>
