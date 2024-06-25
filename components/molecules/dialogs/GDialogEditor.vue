<script>
/**
 * ### GDialogEditor
 *
 * このコンポーネントは、ダイアログ内でフォームを表示し、データの登録、更新、削除を行います。
 * 内部でGCardSubmitCancelコンポーネントを使用しており、フォームの入力検証とボタン操作を提供します。
 * データ編集対象のコレクション（ドキュメント）ごとにこのコンポーネントを継承し、data.modelをオーバーライドして使用します。
 *
 * 機能の詳細：
 * - ドキュメントを追加する場合はactivatorスロットを使用して、onスロットプロパティをそのまま使用可能です。
 * - ドキュメントを変更・削除するためにdialogを開く必要がある場合はopenメソッドを使用します。
 * - openメソッドは編集対象データの規定値としてitem、編集モードとしてeditModeを受け付けます。
 * - `submit`メソッドでデータの登録、更新、削除を非同期で実行し、完了後にダイアログを閉じます。
 * - フォームの状態やエラーは内部で管理され、ロード中の表示やエラーメッセージの表示も行います。
 * - submit処理に成功すると`submit:complete`イベントをemitします。
 * - submit処理に失敗すると`submit:error`イベントをemitします。
 *
 * @component
 * @example
 * <GDialogEditor ref="some-collection-editor" :label="formLabel">
 *   <template #activator="{ attrs, on }">
 *     <v-btn v-bind="attrs" v-on="on">REGIST</v-btn>
 *   </template>
 *   <template #default="{ attrs, on }">
 *     <g-input-some-collection v-bind="attrs" v-on="on" />
 *   </template>
 * </GDialogEditor>
 * @props {String} label - ダイアログのタイトル
 *
 * @version 1.0.0
 * @date 2024-06-24
 * @author shisyamo4131
 */

import GCardSubmitCancel from '../cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardSubmitCancel },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    defaultItem: { type: Object, default: () => ({}), required: false },
    label: { type: String, default: '', required: false },
    maxWidth: { type: [String, Number], default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      model: null,
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    attrs() {
      return {
        ...Object.keys(this.model || {}).reduce((acc, i) => {
          acc[i] = this.model[i]
          return acc
        }, {}),
        editMode: this.editMode,
      }
    },
    on() {
      return {
        ...Object.keys(this.model || {}).reduce((acc, i) => {
          acc[`update:${i}`] = ($event) => (this.model[i] = $event)
          return acc
        }, {}),
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('input', newVal)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    open({ item = {}, editMode = 'REGIST' } = {}) {
      this.editMode = editMode
      if (this.model) this.model.initialize({ ...this.defaultItem, ...item })
      this.dialog = true
    },
    async submit(mode) {
      this.loading = true
      try {
        if (this.model) {
          if (mode === 'REGIST') await this.model.create()
          if (mode === 'UPDATE') await this.model.update()
          if (mode === 'DELETE') await this.model.delete()
        }
        this.dialog = false
        this.$emit('submit:complete', {
          item: JSON.parse(JSON.stringify(this.model || {})),
          editMode: mode,
        })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('submit:error', err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    :max-width="maxWidth"
    scrollable
    persistent
    v-on="$listeners"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{ attrs: props.attrs, on: { ...props.on, click: open } }"
      />
    </template>
    <g-card-submit-cancel
      :dialog.sync="dialog"
      :edit-mode="editMode"
      :label="label"
      :loading="loading"
      @click:submit="submit($event)"
    >
      <slot name="default" v-bind="{ attrs, on }" />
    </g-card-submit-cancel>
  </v-dialog>
</template>

<style></style>
