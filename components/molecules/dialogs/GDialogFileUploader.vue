<script>
/**
 * ### GDialogFileUploader
 *
 * 概要:
 * ファイル選択ダイアログとファイルアップロード機能を備えたdialogコンポーネントです。
 *
 * 機能の詳細:
 * - AFileUploaderを拡張したコンポーネントです。属性やリスナーはAFileUploaderにバインドされます。
 * - VDialogと同じようにactivatorスロットを使用してください。
 *
 * @props
 * propsは AFileUploader を参照してください。
 *
 * @slots
 * @slot activator - VDialogのactivatorスロットです。
 *
 * @events
 * eventは AFileUploader を参照してください。
 *
 * @author shisyamo4131
 * @create 2024-07-03
 * @version 1.0.0
 */
import GBtnCancelIcon from '../../atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../../atoms/btns/GBtnSubmitIcon.vue'
import AFileUploader from '../../atoms/renderless/AFileUploader.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AFileUploader, GBtnCancelIcon, GBtnSubmitIcon },
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
    listeners() {
      return {
        ...this.$listeners,
        'upload:complete': ($event) => {
          this.dialog = false
          this.$emit('upload:complete', $event)
        },
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      v || this.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.$refs.uploader.initialize()
    },
  },
}
</script>

<template>
  <a-file-uploader
    ref="uploader"
    v-slot="{ attrs, on, uploader }"
    v-bind="$attrs"
    v-on="listeners"
  >
    <v-dialog v-model="dialog" persistent max-width="360">
      <template #activator="props">
        <slot name="activator" v-bind="props" />
      </template>
      <v-card>
        <v-card-title>ファイル選択</v-card-title>
        <v-card-text>
          <v-file-input v-bind="attrs" hide-details v-on="on" />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <g-btn-cancel-icon @click="dialog = false" />
          <g-btn-submit-icon
            color="primary"
            v-bind="uploader.attrs"
            v-on="uploader.on"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </a-file-uploader>
</template>

<style></style>
