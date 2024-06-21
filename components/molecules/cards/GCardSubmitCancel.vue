<script>
/**
 * ### GCardSubmitCancel
 *
 * Submit（確定）ボタン、Cancel（キャンセル）ボタンを提供するCardコンポーネントです。
 * データの編集も目的としているため、内部でv-formを保有しています。
 *
 * `props.dialog`は.sync修飾子とともに使用することでdialogの開閉状態を同期することができます。
 *
 * 機能の詳細：
 * - `slots.default`でデータの編集に使用するコンポーネントを利用可能です。
 * - submitボタンがクリック（タップ）されるとv-formのvalidate()を実行し、エラーがなければ`click:submit`をemitします。
 * - cancelボタンがクリック（タップ）されると`click:cancel`イベントをemitするとともに、dialogのupdateイベントをemitします。
 * - `props.disabled`がtrueの場合、`slots.default`に配置されたInputsが使用不可になります。
 * - `props.loading`がtrueの場合、submitボタンがロード中・使用不可に、cancelボタンが使用不可に、`slots.default`に配置されたInputsが使用不可になります。
 *
 * @component
 * @example
 * <GCardSubmitCancel
 *   :dialog.sync="dialog"
 *   :disabled="disabled"
 *   :label="label"
 *   :loading="loading"
 * />
 *
 * @props {Boolean} dialog - dialogの開閉状態で.sync修飾子とともに使用可能
 * @props {Boolean} disabled - v-formのdisabled
 * @props {String} label - タイトル
 * @props {Boolean} loading - 処理中であることを表すブール値
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 更新履歴:
 * 2024-06-15 - Add 'btn-cancel' and 'btn-submit' slot for replacing.
 * 2024-06-18 - dialogの値が変更される都度、initialize()が実行されるように修正。
 *              -> 機能によってはdialogが開かれた際にデータモデルを初期化するケースがあるため。
 */
import GBtnCancelIcon from '../../atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../../atoms/btns/GBtnSubmitIcon.vue'
import EditMode from '~/components/mixins/GMixinEditMode'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnCancelIcon, GBtnSubmitIcon },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [EditMode],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    dialog: { type: Boolean, default: false, required: false },
    disabled: { type: Boolean, default: false, required: false },
    label: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      formRef: null,
      scrollTargetRef: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      this.initialize()
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.formRef?.resetValidation()
      this.scrollTargetRef?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' })
    },
    onClickCancel() {
      this.$emit('click:cancel')
      this.$emit('update:dialog', false)
    },
    onClickSubmit() {
      if (!this.validate()) return
      this.$emit('click:submit')
    },
    validate() {
      const result = this.formRef?.validate() || false
      if (!result) {
        alert('入力に不備があります。')
      }
      return result
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-toolbar dense flat color="primary" dark>
      <v-toolbar-title>
        {{ `${label}[${$EDIT_MODE[editMode]}]` }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text :ref="(el) => (scrollTargetRef = el)" class="pa-4">
      <v-form :ref="(el) => (formRef = el)" :disabled="loading || disabled">
        <slot name="default" v-bind="{ editMode, loading }" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <slot
        name="btn-cancel"
        v-bind="{ attrs: { disabled: loading }, on: { click: onClickCancel } }"
      >
        <g-btn-cancel-icon :disabled="loading" @click="onClickCancel" />
      </slot>
      <slot
        name="btn-submit"
        v-bind="{
          attrs: { disabled: loading, loading },
          on: { click: onClickSubmit },
        }"
      >
        <g-btn-submit-icon
          :disabled="loading"
          :loading="loading"
          color="primary"
          @click="onClickSubmit"
        />
      </slot>
    </v-card-actions>
  </v-card>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
