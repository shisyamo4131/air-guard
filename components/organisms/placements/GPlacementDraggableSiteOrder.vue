<script>
import GCardDraggableSiteOrder from '~/components/molecules/cards/GCardDraggableSiteOrder.vue'

export default {
  components: {
    GCardDraggableSiteOrder,
  },
  props: {
    // v-model との連携用
    value: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      siteOrder: [],
    }
  },
  watch: {
    dialog: {
      // ダイアログが開くときにsiteOrderを初期化
      handler(v) {
        if (v) {
          this.siteOrder = structuredClone(
            this.$store.state['site-order']?.data || []
          )
        }
        this.$emit('input', v)
      },
      immediate: true,
    },
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },
  methods: {
    // サイト並べ替えの保存処理
    async onClickSubmit(newOrder) {
      this.loading = true
      try {
        await this.$store.dispatch('site-order/update', newOrder)
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
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
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <g-card-draggable-site-order
      :loading="loading"
      :site-order="siteOrder"
      @click:close="dialog = false"
      @click:submit="onClickSubmit"
    />
  </v-dialog>
</template>

<style></style>
