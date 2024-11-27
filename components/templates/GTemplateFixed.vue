<script>
/**
 * ### GTemplateDefault
 *
 * ### 概要:
 * コンテナの高さが画面の高さに固定されたテンプレートです。
 * `slots.default`に配置されたコンポーネントがこの高さを超える場合、
 * コンテナがスクロールします。
 *
 * #### 更新履歴:
 * - version 1.0.1 - 2024-07-10 - モバイルの場合、画面下部の操作が難しくなるため余白を調整
 * - version 1.0.0 - 2024-07-xx - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.1
 */
export default {
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    containerHeight() {
      return this.templateHeight
    },
    /**
     * テンプレートの高さを計算して返します。
     */
    templateHeight() {
      const top = this.$vuetify.application.top
      const bar = this.$vuetify.application.bar
      const footer = this.$vuetify.application.footer
      const bottom = this.$vuetify.application.bottom
      const height = this.$vuetify.breakpoint.height
      return height - (top + bar + footer + bottom)
    },
  },
}
</script>

<template>
  <v-container
    class="overflow-y-auto pa-0"
    :style="{ height: `${templateHeight}px` }"
  >
    <slot name="default" v-bind="{ height: containerHeight }"> </slot>
  </v-container>
</template>

<style></style>
