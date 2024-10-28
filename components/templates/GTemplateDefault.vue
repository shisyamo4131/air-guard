<script>
/**
 * # GTemplateDefault
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {},
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    containerHeight() {
      return this.templateHeight
    },
    templateHeight() {
      const top = this.$vuetify.application.top
      const bar = this.$vuetify.application.bar
      const footer = this.$vuetify.application.footer
      const bottom = this.$vuetify.application.bottom
      // const padding = this.$vuetify.breakpoint.xs ? 0 : 24
      const height = this.$vuetify.breakpoint.height
      // return height - (top + bar + footer + bottom + padding)
      return height - (top + bar + footer + bottom)
    },
  },
}
</script>

<template>
  <div :style="{ height: `${templateHeight}px` }">
    <div class="overflow-y-auto" :style="{ height: `${containerHeight}px` }">
      <slot name="default" v-bind="{ height: containerHeight }">
        <v-container fluid>
          <v-card>
            <v-card-text>
              プロジェクトのデフォルトレイアウトコンポーネントです。<br />
              defaultスロットを使用して、この部分を他のコンポーネントに置き換えてください。
            </v-card-text>
          </v-card>
        </v-container>
      </slot>
    </div>
  </div>
</template>

<style></style>
