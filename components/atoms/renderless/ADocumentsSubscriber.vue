<script>
/**
 * 指定されたインスタンスに基づいて Firestore の複数のドキュメントを購読し、
 * これをデフォルトスロットプロパティで提供するレンダーレスコンポーネントです。
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
     * 購読するドキュメントの抽出条件を配列で指定します。
     */
    condition: {
      type: Array,
      required: true,
    },

    /**
     * editModel を初期化する際に適用されるインスタンスの初期値です。
     */
    defaultItem: {
      type: Object,
      default: () => {},
      required: false,
    },

    /**
     * 編集画面を開くトリガーとなるイベント名です。
     */
    editEvent: { type: String, default: 'click:row', required: false },

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
       * 編集画面を包括するダイアログの開閉状態を管理する変数です。
       */
      dialog: false,

      /**
       * コンポーネントが管理し、デフォルトスロットプロパティで提供するインスタンスの配列です。
       */
      docs: null,

      /**
       * docs に読み込まれたインスタンスの配列のうち、編集対象となるインスタンスが格納されます。
       */
      editModel: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * ダイアログが閉じられたら初期化処理を実行します。
     */
    dialog(v) {
      if (v) return
      this.initialize()
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * props.docId, props.instance の複合でのウォッチャーを登録します。
     */
    this.$watch(
      () => [this.$props.condition, this.$props.instance],
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
     * 編集画面を包括するダイアログを開きます。
     */
    openEditor(mode = this.CREATE, item = {}) {
      if (!this.editModel) {
        const message = `インスタンスが設定されていないため、編集画面を開くことはできません。`
        // eslint-disable-next-line no-console
        console.error(`${message}`)
        return
      }
      if (mode === this.CREATE) {
        this.editModel.initialize(this.defaultItem)
      } else {
        this.editModel.initialize(item)
      }
      this.editMode = mode
      this.dialog = true
    },

    /**
     * 編集画面を包括するダイアログを閉じます。
     */
    closeEditor() {
      this.dialog = false
    },

    /**
     * editModel, editMode を初期化します。
     */
    initialize() {
      this.editModel.initialize()
      this.editMode = this.CREATE
    },

    /**
     * プロパティで与えられたドキュメントID、インスタンスに基づいて
     * ドキュメントの購読を開始します。
     * - 既に購読が開始されている場合はこれを解除します。
     * - ドキュメントID、 インスタンスのどちらか一方でも設定されていない場合は処理を終了します。
     */
    subscribe() {
      this.unsubscribe()
      const { condition, instance } = this.$props
      if (!condition || !instance) return
      this.editModel = this.instance.clone()
      this.docs = this.editModel.subscribeDocs(condition)
    },

    /**
     * ドキュメントの購読を解除します。
     */
    unsubscribe() {
      if (this.editModel) this.editModel.unsubscribe()
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        docs: this.docs,
        openEditor: this.openEditor,
        closeEditor: this.closeEditor,

        // 編集画面を包括するダイアログコンポーネントへのプロパティ
        dialog: {
          attrs: {
            editMode: this.editMode,
            instance: this.editModel,
            value: this.dialog,
          },
          on: {
            input: this.closeEditor,
          },
        },

        // 読み込んだインスタンスの配列を表示しているコンポーネントに引き渡すスロットプロパティ
        table: {
          attrs: {
            items: this.docs,
          },
          on: {
            [this.editEvent]: (item) => this.openEditor(this.UPDATE, item),
          },
        },
      })
    }
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
