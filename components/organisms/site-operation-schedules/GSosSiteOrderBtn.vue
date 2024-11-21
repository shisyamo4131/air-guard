<script>
/**
 * 現場稼働予定管理用の現場並べ替えボタンコンポーネントです。
 */
import GCardDraggableSiteOrder from '~/components/molecules/cards/GCardDraggableSiteOrder.vue'
export default {
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  components: { GCardDraggableSiteOrder },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    loading: { type: Boolean, default: false, required: false },
    value: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * モバイル表示かどうかを判定します。
     */
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  methods: {
    onClickSubmit(event) {
      this.$emit('input', event)
      this.dialog = false
    },
  },
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    :fullscreen="$vuetify.breakpoint.mobile"
    scrollable
  >
    <template #activator="{ attrs, on }">
      <v-btn v-bind="{ ...$attrs, ...attrs }" v-on="{ ...$listeners, ...on }">
        <v-icon :left="!isMobile">mdi-order-alphabetical-ascending</v-icon>
        <span v-if="!isMobile">並べ替え</span>
      </v-btn>
    </template>
    <g-card-draggable-site-order
      :loading="loading"
      :site-order="value"
      @click:close="dialog = false"
      @click:submit="onClickSubmit"
    />
  </v-dialog>
</template>

<style></style>
