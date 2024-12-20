<script>
/**
 * 指定されたドキュメントID、インスタンスに基づいて Firestore のドキュメントを
 * 購読し、これをデフォルトスロットプロパティで提供するレンダーレスコンポーネントです。
 * @author shisyamo4131
 */
import FireModel from 'air-firebase/dist/firestore/FireModel'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],
  props: {
    /**
     * 管理対象のドキュメントIDです。
     */
    docId: { type: String, required: true },

    /**
     * 管理対象のインスタンスです。
     * - FireModel を継承したクラスインスタンスである必要があります。
     */
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof FireModel,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * コンポーネントが管理し、デフォルトスロットプロパティで提供するインスタンスです。
       * - props.instance で与えられたインスタンスの clone() メソッドによって複製された
       *   インスタンスがセットされます。
       */
      doc: null,
    }
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * props.docId, props.instance の複合でのウォッチャーを登録します。
     */
    this.$watch(
      () => [this.$props.docId, this.$props.instance],
      () => this.subscribe(),
      { immediate: true }
    )
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * プロパティで与えられたドキュメントID、インスタンスに基づいて
     * ドキュメントの購読を開始します。
     * - 既に購読が開始されている場合はこれを解除します。
     * - ドキュメントID、 インスタンスのどちらか一方でも設定されていない場合は処理を終了します。
     */
    subscribe() {
      this.unsubscribe()
      const { docId, instance } = this.$props
      if (!docId || !instance) return
      this.doc = instance.clone()
      this.doc.subscribe(docId)
    },

    /**
     * ドキュメントの購読を解除します。
     */
    unsubscribe() {
      if (this.doc) this.doc.unsubscribe()
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        doc: this.doc,

        // 編集画面を包括するダイアログコンポーネントへのプロパティ
        dialog: {
          attrs: {
            editMode: this.editMode,
            instance: this.doc,
          },
        },
      })
    }
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
