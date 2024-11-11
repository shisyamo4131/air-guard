<script>
import draggable from 'vuedraggable'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'

export default {
  components: { draggable, GBtnSubmitIcon, GBtnCancelIcon, GChipWorkShift },
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
    async onClickSubmit() {
      this.loading = true
      try {
        await this.$store.dispatch('site-order/update', this.siteOrder)
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
    <v-card class="d-flex flex-column" :tile="$vuetify.breakpoint.mobile">
      <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
        <v-icon left>mdi-swap-vertical</v-icon>
        <v-toolbar-title>現場並べ替え</v-toolbar-title>
        <v-spacer />
        <g-btn-cancel-icon :disabled="loading" @click="dialog = false" />
      </v-toolbar>
      <v-card-text class="px-0 px-md-6">
        <draggable
          v-model="siteOrder"
          tag="v-list"
          handle=".handle"
          :disabled="loading"
          v-bind="{ animation: 300 }"
        >
          <div v-for="(order, index) in siteOrder" :key="index">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <g-chip-work-shift :value="order.workShift" small />
                  {{
                    $store.getters['site-order/site'](order.siteId)?.name ||
                    'N/A'
                  }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon class="handle">mdi-arrow-all</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-divider />
          </div>
        </draggable>
      </v-card-text>
      <v-card-actions class="justify-end">
        <g-btn-submit-icon
          color="primary"
          :disabled="loading"
          :loading="loading"
          @click="onClickSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
