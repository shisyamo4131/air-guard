<script>
/**
 * 配置管理用の現場稼働予定管理ダイアログコンポーネントです。
 */
import GSiteOperationScheduleManager from '../GSiteOperationScheduleManager.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
export default {
  components: { GSiteOperationScheduleManager, GBtnCancelIcon },

  props: {
    siteId: { type: String, required: true },
    value: { type: Boolean, default: false, required: false },
  },

  data() {
    return {
      dialog: false,
    }
  },

  computed: {
    label() {
      return this.$store.getters['sites/get'](this.siteId)?.abbr || 'N/A'
    },
  },

  watch: {
    dialog(v) {
      this.$emit('input', v)
    },
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.mobile"
    scrollable
    v-on="$listeners"
  >
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }" />
    </template>
    <v-card :tile="$vuetify.breakpoint.mobile">
      <v-toolbar color="secondary" dark dense flat>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer />
        <g-btn-cancel-icon @click="dialog = false" />
      </v-toolbar>
      <v-card-text class="flex-grow-1 py-0 px-0 px-md-4">
        <g-site-operation-schedule-manager :site-id="siteId" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style></style>
