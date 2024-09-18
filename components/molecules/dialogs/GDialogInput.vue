<script>
/**
 * ## GDialogInput
 *
 * GInputコンポーネント専用のDialogコンポーネントです。
 * defaultスロットにGInputコンポーネントを配置することで、ダイアログによるデータ編集を実現します。
 *
 * - defaultスロットのスロットプロパティ`attrs`、`on`をGInputコンポーネントに適用します。
 * - GInputコンポーネントの`submit:complete`イベントを受け取ると、ダイアログを終了して同一イベントをemitします。
 * - GInputコンポーネントの`click:cancel`イベントを受け取ると、ダイアログを終了して同一イベントをemitします。
 * ‐ ダイアログが終了すると、GInputコンポーネントの初期化メソッドを実行します。
 * - `props.value`を使用することでこのコンポーネントの開閉を制御可能です。
 * - `initialize`メソッドを実行することで、外部からGInputコンポーネントの初期化処理を実行することができます。
 * - GInputコンポーネント内のVCardTextへの参照を取得し、ダイアログが終了したタイミングでスクロール位置を初期化します。
 *
 * ### 同一イベントをemitする理由
 * GInputコンポーネントの`submitType`が`toParent`であった場合、編集後のデータを親コンポーネントが
 * 受け取る必要があります。
 *
 * このコンポーネントは`props.value`を使用することでその開閉を制御可能です。
 *
 * @author shisyamo4131
 * @version 1.0.1
 * @updates
 * - version 1.0.1 - 2024-09-17 - initializeメソッドの実行について、dialogの変更内容にかかわらず実行するように修正。
 * - version 1.0.0 - 2024-09-06 - 初版作成
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    maxWidth: { type: [String, Number], default: 600, required: false },
    value: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      inputRef: null,
      scrollTargets: [],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    attrs() {
      return {
        ref: this.setInputRef,
      }
    },
    on() {
      return {
        'submit:complete': this.onSubmitComplete,
        'click:cancel': this.onClickCancel,
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
     * defaultスロットに配置されたGInputコンポーネントの`submit:complete`イベントを
     * 自身のイベントとしてemitします。
     * - GInputコンポーネントの`submitType`が`toParent`であった場合、編集後のデータを
     *   親コンポーネントに引き渡す必要があります。
     */
    onSubmitComplete(event) {
      this.dialog = false
      this.$emit('submit:complete', event)
    },
    /**
     * defaultスロットに配置されたGInputコンポーネントの`click:cancel`イベントを
     * 自身のイベントしてemitします。
     */
    onClickCancel() {
      this.dialog = false
      this.$emit('click:cancel')
    },
    /**
     * defaultスロットに配置されたGInputコンポーネントへの参照を自身の`inputRef`にセットします。
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

      // GInputコンポーネント内のVCardTextへの参照を取得
      this.scrollTargets.splice(0)
      this.scrollTargets = Array.from(el.$el.querySelectorAll('.v-card__text'))
    },
    /**
     * defaultスロットに配置されたGInputコンポーネントの初期化メソッドを呼び出します。
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
     * defaultスロットに配置されたGInputコンポーネント内に存在するVCardTextについて
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
    v-bind="$attrs"
    v-model="dialog"
    :max-width="maxWidth"
    eager
    persistent
    scrollable
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <slot name="default" v-bind="{ attrs, on }" />
  </v-dialog>
</template>

<style></style>
