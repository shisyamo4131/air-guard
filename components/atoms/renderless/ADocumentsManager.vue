<script>
/**
 * ドキュメントの配列を受け取り、これを管理するための UI コンポーネントに機能を提供するための
 * レンダーレスコンポーネントです。
 * @author shisyamo4131
 */
import FireModel from 'air-firebase/dist/firestore/FireModel'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象のドキュメントの配列です。
     */
    docs: { type: Array, default: () => [], required: false },

    /**
     * ドキュメントのデータモデルが定義されたクラスのインスタンスです。
     * - FireModel を継承したクラスインスタンスである必要があります。
     * - 編集対象のインスタンスである data.editModel の初期化処理に使用されます。
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
       * 編集対象のインスタンスです。
       */
      editModel: null,

      /**
       * コンポーネント内で発生したエラーのエラーオブジェクトを保持します。
       */
      err: {},

      /**
       * true の場合、ドキュメントが編集中であることを表します。
       */
      isEditing: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.instance を監視します。
     * - data.editModel にインスタンスを複製します。
     */
    instance: {
      handler(v) {
        if (!v) return
        this._cloneInstance()
      },
      immediate: true,
    },

    /**
     * data.isEditing を監視します。
     * - 編集が終了したら data.editMode を追加モードに初期化します。
     */
    isEditing(v) {
      if (!v) this.editMode = this.CREATE
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {},

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * props.instance を data.editModel に複製します。
     */
    _cloneInstance() {
      this.editModel = this.instance.clone()
    },

    /**
     * 引数で指定された編集モードに切り替えます。
     * 追加モード: data.editModel が props.instance で初期化されます。
     * 変更モード: 引数 item が指定されていれば data.editModel が item で初期化されます。
     * 削除モード: 引数 item が指定されていれば data.editModel が item で初期化されます。
     */
    updateEditMode({ editMode = this.CREATE, item = undefined } = {}) {
      // 編集モードの妥当性チェック
      if (
        editMode !== this.CREATE &&
        editMode !== this.UPDATE &&
        editMode !== this.DELETE
      ) {
        this.err = new Error(
          `不正な編集モードが指定されました。editMode: ${editMode}`
        )
        // eslint-disable-next-line no-console
        console.error(this.err)
        return
      }

      // 編集モードに合わせて data.editModel を初期化
      if (editMode === this.CREATE) {
        this.editModel.initialize(this.instance)
      } else if (item) {
        this.editModel.initialize(item)
      }

      this.editMode = editMode
      this.isEditing = true
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        // 指定されたドキュメントを読み込んだインスタンス
        docs: this.docs,

        // 編集モード
        editMode: this.editMode,

        // 編集対象のインスタンス
        editModel: this.editModel,

        // コンポーネント内で発生したエラーオブジェクト
        error: this.err,

        // ドキュメントが編集中であるかどうか
        isEditing: this.isEditing,

        // 編集中であるかを切り替えます。
        toggleIsEditing: ($event) => (this.isEditing = $event),

        // 編集モードを切り替えます。
        updateEditMode: this.updateEditMode,
      })
    }
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
