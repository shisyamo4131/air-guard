<script>
/**
 * 指定されたドキュメントID、インスタンスに基づいて Firestore のドキュメントを
 * 購読し、これをデフォルトスロットプロパティで提供するレンダーレスコンポーネントです。
 *
 * - default スロットで提供する各種プロパティを UI コンポーネントに引き渡して使用します。
 *
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
       * - props.docId で与えられたIDのドキュメントが読み込まれます。
       */
      doc: null,

      /**
       * 子コンポーネントに提供する編集用のデータモデルインスタンスです。
       */
      editModel: null,

      /**
       * コンポーネント内で発生したエラーのエラーオブジェクトを保持します。
       */
      err: {},

      /**
       * true の場合、読み込んだドキュメントが編集中であることを表します。
       */
      isEditing: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * props.docId で指定されたドキュメントが読み込まれているかどうかを返します。
     * - 読み込んだドキュメントのIDとprops.docIdを比較します。
     * - リアルタイムリッスンであるため、ドキュメントの内容が最新かどうかは保証されません。
     */
    isFeched() {
      if (!this._isRequiredPropsSet()) return false
      return this.docId === this.doc?.docId
    },

    /**
     * コンポーネントがドキュメントを読み込み中であるかどうかを返します。
     * - props.docId と data.doc.docId を比較します。
     * - 何らかの理由によりドキュメントの読み込みに失敗した場合、必ず true を返します。
     */
    isloading() {
      if (!this._isRequiredPropsSet()) return false
      return this.docId !== this.doc?.docId
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.isEditing を監視します。
     * - 編集が終了したら data.editMode を変更モードに初期化します。
     * - data.editModel を読み込んだドキュメントで初期化します。
     */
    isEditing(v) {
      if (!v) this.editMode = this.UPDATE
      this.editModel.initialize(this.doc)
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
      () => [this.$props.docId, this.$props.instance],
      () => {
        // props.docId, props.instance のどちらかが設定されていない場合は終了します。
        if (!this._isRequiredPropsSet()) return

        // data.doc, data.editModel にインスタンスを複製します。
        this._cloneInstance()

        // ドキュメントの購読を開始します。
        this.subscribe()
      },
      { immediate: true }
    )

    // 編集モードの初期値を変更モードにします。
    this.editMode = this.UPDATE
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
     * props.docId, props.instance の両方が設定されているかをチェックします。
     */
    _isRequiredPropsSet() {
      return this.docId && this.instance
    },

    /**
     * props.instance を data.doc, data.editModel に複製します。
     */
    _cloneInstance() {
      this.doc = this.instance.clone()
      this.editModel = this.instance.clone()
    },

    /**
     * 編集モードを引数に受け取り、ダイアログを開きます。
     */
    updateEditMode(editMode) {
      if (!editMode) {
        this.err = new Error(
          `編集モードを指定してください。。editMode: ${editMode}`
        )
        // eslint-disable-next-line no-console
        console.error(this.err)
        return
      }
      if (editMode !== this.UPDATE && editMode !== this.DELETE) {
        this.err = new Error(
          `不正な編集モードが指定されました。editMode: ${editMode}`
        )
        // eslint-disable-next-line no-console
        console.error(this.err)
        return
      }
      this.editMode = editMode
      this.isEditing = true
    },

    /**
     * プロパティで与えられたドキュメントID、インスタンスに基づいて
     * ドキュメントの購読を開始します。
     * - 既に購読が開始されている場合はこれを解除します。
     * - ドキュメントID、 インスタンスのどちらか一方でも設定されていない場合は処理を終了します。
     */
    subscribe() {
      // props.docId, props.instance のどちらか一方でも設定されていない場合は終了します。
      if (!this._isRequiredPropsSet()) return

      try {
        this.doc.subscribe(this.docId)
      } catch (err) {
        this.err = err
      }
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
        // 指定されたドキュメントを読み込んだインスタンス
        doc: this.doc,

        // ドキュメントID
        docId: this.docId,

        // 編集モード
        editMode: this.editMode,

        // コンポーネント内で発生したエラーオブジェクト
        error: this.err,

        // ドキュメントが編集中であるかどうか
        isEditing: this.isEditing,

        // 編集中であるかを切り替えます。
        toggleIsEditing: ($event) => (this.isEditing = $event),

        // 編集モードを更新します。
        updateEditMode: this.updateEditMode,
      })
    }
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
