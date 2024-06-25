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
 * - editModeが`DELETE`の時はv-formによるvalidate()を行わず、click:submitイベントが削除モードで発火されます。
 *
 * @props {Boolean} dialog - dialogの開閉状態で.sync修飾子とともに使用可能
 * @props {Boolean} disabled - v-formのdisabled
 * @props {Boolean} disableDelete - 削除ボタンの無効化
 * @props {String} label - タイトル
 * @props {Boolean} loading - 処理中であることを表すブール値
 *
 * @events
 * @event click:cancel - キャンセルボタンがクリックされたときに発火します。引数はありません。
 * @event update:dialog - dialogの開閉状態が更新されたときに発火します。引数はBooleanです。
 * @event click:submit - Submitボタンがクリックされたときに発火します。引数はeditModeです。削除の場合は'DELETE'が渡されます。
 *
 * @version 1.0.2
 * @author shisyamo4131
 *
 * 更新履歴:
 * 2024-06-15 - 'btn-cancel'と'btn-submit'スロットを追加して置き換え可能に。
 * 2024-06-24 - 削除フラグを追加し、click:submitイベントがeditModeを伴うように変更。
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
    disableDelete: { type: Boolean, default: false, required: false },
    label: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      formRef: null, // v-formへの参照
      removeItem: false, // 削除フラグ
      scrollTargetRef: null, // v-card-textへの参照
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.dialogを監視します。
     * - falseに更新されたらmethods.initialize()を実行します。
     */
    dialog(v) {
      v || this.initialize()
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントの初期化処理です。
     * - v-formのresetValidation()を実行します。
     * - v-card-textのスクロールポジションを初期化します。
     * - data.removeItemをfalseにします。
     */
    initialize() {
      this.formRef?.resetValidation()
      this.scrollTargetRef?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' })
      this.removeItem = false
    },
    /**
     * cancelボタンがクリックされた時の処理です。
     * - click:cancelイベントをemitします。
     * - update:dialogイベントをfalseでemitします。
     */
    onClickCancel() {
      this.$emit('click:cancel')
      this.$emit('update:dialog', false)
    },
    /**
     * submitボタンがクリックされた時の処理です。
     * - methods.validate()を実行し、falseの場合は処理を終了します。
     * - data.removeItemがtrueの場合、DELETEモード固定でclick:submitイベントをemitします。
     * - それ以外の場合はprops.editModeでclick:submitイベントをemitします。
     */
    onClickSubmit() {
      if (!this.validate()) return
      if (this.removeItem) {
        this.$emit('click:submit', 'DELETE')
      } else {
        this.$emit('click:submit', this.editMode)
      }
    },
    /**
     * v-formのvalidate()を実行し、結果をBooleanで返します。
     * data.removeItemがtrueの場合は何も処理せずにtrueを返します。
     */
    validate() {
      if (this.removeItem) return true
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
      <v-checkbox
        v-if="editMode !== 'REGIST' && !disableDelete"
        v-model="removeItem"
        color="error"
        :label="`この${label}を削除する`"
      />
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
