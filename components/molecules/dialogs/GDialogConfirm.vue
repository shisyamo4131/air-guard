<script>
/**
 * 処理確認を行うためダイアログコンポーネントです。
 * @author shisyamo4131
 */
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnCancel, GBtnSubmit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    beforeSubmit: { type: Function, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
    maxWidth: { type: [String, Number], default: 360, required: false },
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
   * WATCH
   ***************************************************************************/
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

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    close() {
      this.dialog = false
    },

    /**
     * submit ボタンがクリックされた時の処理です。
     * - `submit` イベントを emit してダイアログを終了します。
     * - props.beforeSubmit が指定されている場合はこれを実行します。
     */
    async onClickSubmit() {
      if (this.beforeSubmit) await this.beforeSubmit()
      this.$emit('submit')
    },
  },
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    v-bind="$attrs"
    :max-width="maxWidth"
    persistent
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card>
      <v-toolbar color="info" dark dense flat>
        <v-icon left>mdi-chat-question</v-icon>
        <v-toolbar-title>確認</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="py-5 px-6">
        <slot name="default"> 処理を開始します。よろしいですか？ </slot>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <g-btn-cancel icon :disabled="loading" @click="close" />
        <g-btn-submit
          icon
          :diasbled="loading"
          :loading="loading"
          color="primary"
          @click="onClickSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
