<script>
/**
 * GInput コンポーネント専用のダイアログコンポーネントです。
 * defaultスロットに GInput コンポーネントを配置して使用します。
 *
 * ### 使用方法
 * <g-dialog-input :edit-mode.sync="editMode" @submit:complete="someMethod">
 *    <template #activator="{attrs, on}">
 *        <v-btn v-bind="attrs" v-on="on">OPEN</v-btn>
 *    </template>
 *    <template #default="{ attrs, on }">
 *        <g-input-sample v-bind="attrs" v-on="on" />
 *    </template>
 * </g-dialog-input>
 *
 * 1. 通常のダイアログコンポーネント同様、activator スロットを利用可能です。
 * 2. editMode を .sync 修飾子とともにバインドしてください。
 * 3.`submit:complete` イベントが emit されます。 submit 後に必要な処理があれば適宜定義します。
 * 4. `click:cancel` イベントが emit されます。 cancel 後に必要な処理があれば適宜定義します。
 * 5. defaultスロットのスロットプロパティ`attrs`、`on`をGInputコンポーネントに適用します。
 * 6. ダイアログが終了すると、GInput コンポーネントの初期化メソッドが実行され、スクロール位置も初期化されます。
 * 7. ダイアログの開閉状態を管理する場合は props.value を使用します。 v-model が使用可能です。
 * 8. `initialize` メソッドが利用可能です。 GInput コンポーネントが初期化されます。
 *
 * - GInput コンポーネントへの参照を取得する都合上、ダイアログの eager プロパティは true を既定値にしています。
 * - データ編集に使われるコンポーネントを想定しているため、ダイアログの persistent プロパティは true を既定値にしています。
 * - ダイアログの scrollable プロパティは true を既定値にしています。
 * - モバイルモード（breakpoint.mobile）の場合、fullScreen が適用されます。
 *
 * @author shisyamo4131
 */
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],
  props: {
    eager: { type: Boolean, default: true, required: false },
    fullscreen: { type: Boolean, default: false, required: false },
    maxWidth: { type: [String, Number], default: 600, required: false },
    persistent: { type: Boolean, default: true, required: false },
    scrollable: { type: Boolean, default: true, required: false },
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * ダイアログの開閉状態を管理
       */
      dialog: false,

      /**
       * GInput コンポーネントへの参照
       */
      inputRef: null,

      /**
       * GInput コンポーネント内のスクロールターゲット（VCardText）への参照
       */
      scrollTargets: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * default スロットが提供する attrs プロパティ
     */
    attrs() {
      return {
        editMode: this.editMode,
        ref: this.setInputRef,
        tile: this.$vuetify.breakpoint.mobile,
      }
    },

    /**
     * default スロットが提供する on プロパティ
     */
    on() {
      return {
        'update:editMode': (event) => this.$emit('update:editMode', event),
        'click:cancel': this.onClickCancel,
        'submit:complete': this.onSubmitComplete,
      }
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * `data.dialog` を監視します。
     * - `initialize`メソッドを実行します。
     * - inputイベントをemitします。
     */
    dialog(newVal) {
      this.initialize()
      this.$emit('input', newVal)
    },

    /**
     * `props.value` を監視します。
     * - 値が変更された場合、`data.dialog` と同期させます。
     */
    value: {
      handler(newVal) {
        this.dialog = newVal
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * default スロットに配置された GInput コンポーネントの `click:cancel` イベントの処理です。
     * ダイアログを終了するとともに `click:cancel` イベントを emit します。
     */
    onClickCancel() {
      this.dialog = false
      this.$emit('click:cancel')
    },

    /**
     * defaultスロットに配置された GInput コンポーネントの `submit:complete` イベントの処理です。
     * ダイアログを終了し、データモデルインスタンスをペイロードに `submit:complete` イベントを emit します。
     * @param {Object} event - GInput コンポーネントが emit したオブジェクト（データモデルインスタンス）
     */
    onSubmitComplete(event) {
      this.dialog = false
      this.$emit('submit:complete', event)
    },

    /**
     * defaultスロットに配置された GInput コンポーネントへの参照を自身の `inputRef` にセットします。
     * - el が initialize, resetValidation メソッドのどちらか一方でも保有していない場合、警告を出力します。
     * - 同時に GInput コンポーネントのスクロールターゲットへの参照を取得して `scrollTargets` にセットします。
     * @param {Object} el - GInput コンポーネントへの参照
     */
    setInputRef(el) {
      if (!el || !el.$el) {
        this.inputRef = null
        // DOMが正しくマウントされていない場合の警告
        // eslint-disable-next-line no-console
        console.warn('inputRef is not set correctly during DOM mount.')
        return
      }
      this.inputRef = el
      // initializeメソッドの存在確認
      if (typeof this.inputRef.initialize !== 'function') {
        // eslint-disable-next-line no-console
        console.warn('inputRef has no initialize method during DOM mount.')
      }

      // resetValidationメソッドの存在確認
      if (typeof this.inputRef.resetValidation !== 'function') {
        // eslint-disable-next-line no-console
        console.warn('inputRef has no resetValidation method during DOM mount.')
      }

      // GInputコンポーネント内のスクロールターゲット（VCardText）への参照を取得
      // 複数存在する可能性があり、取得した参照は配列で保存
      this.scrollTargets.splice(0)
      this.scrollTargets = Array.from(el.$el.querySelectorAll('.v-card__text'))
    },

    /**
     * defaultスロットに配置された GInput コンポーネントの初期化メソッドを呼び出します。
     */
    initialize() {
      if (!this.inputRef) {
        // 親コンポーネントから呼ばれた時にinputRefが設定されていない場合の警告
        // eslint-disable-next-line no-console
        console.warn('inputRef is not set when initialize is called.')
        return
      }

      // initializeメソッドの存在確認
      if (typeof this.inputRef.initialize === 'function') {
        this.inputRef.initialize()
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'inputRef has no initialize method when initialize is called.'
        )
      }

      // resetValidationメソッドの存在確認
      if (typeof this.inputRef.resetValidation === 'function') {
        this.inputRef.resetValidation()
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'inputRef has no resetValidation method when initialize is called.'
        )
      }

      // VCardTextのスクロール位置を初期化
      this.scrollTo()
    },

    /**
     * defaultスロットに配置された GInput コンポーネント内に存在するスクロールターゲット（VCardText）について
     * スクロール位置を変更します。
     * - 引数を既定値のままにするとTOPに初期化されます。
     */
    scrollTo({ top = 0, left = 0, behavior = 'instant' } = {}) {
      this.scrollTargets.forEach((target) => {
        target.scrollTo({ top, left, behavior })
      })
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="{ ...$props, ...$attrs }"
    v-model="dialog"
    :fullscreen="fullscreen || $vuetify.breakpoint.mobile"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <slot name="default" v-bind="{ attrs, on }" />
  </v-dialog>
</template>

<style></style>
