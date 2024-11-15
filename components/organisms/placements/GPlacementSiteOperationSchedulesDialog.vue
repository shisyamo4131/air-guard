<script>
/**
 * 配置管理用の現場稼働予定管理ダイアログコンポーネントです。
 */
import GSiteOperationScheduleManager from '../GSiteOperationScheduleManager.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSiteOperationScheduleManager, GBtnCancelIcon },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, required: true },
    value: { type: Boolean, default: false, required: false },
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
    label() {
      return this.$store.getters['sites/get'](this.siteId)?.abbr || 'N/A'
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.dialog を監視します。
     * - 値を input イベントで emit します。
     */
    dialog(v) {
      this.$emit('input', v)
    },

    /**
     * props.value を監視します。
     * - 値を data.dialog に同期します。
     */
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 外部から当該コンポーネントを開くためのメソッドです。
     */
    open() {
      this.dialog = true
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
