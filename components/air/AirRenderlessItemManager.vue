<script>
/**
 * アイテム（オブジェクト）管理機能を提供するためのレンダーレスコンポーネントです。
 *
 * - data.editItem に対する入力について、このコンポーネントはバリデーションを行いません。
 *
 * [EVENTS]
 *
 * | event           | description                                                                                 |
 * | --------------- | ------------------------------------------------------------------------------------------- |
 * | UPDATE          | 変更処理が完了した時にemitされます。イベント名はeditModesプロパティに依存します。   |
 * | DELETE          | 削除処理が完了した時にemitされます。イベント名はeditModesプロパティに依存します。 |
 * | initialized     | コンポーネントの初期化処理が完了した時にemitされます。                                      |
 * | input           | v-modelの対象イベント                                                                       |
 * | submit:complete | 配列への更新処理が完了した時にemitされます。                                                |
 *
 * @author shisyamo4131
 * @refact 2025-01-16
 */
export default {
  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: { prop: 'item', event: 'input' },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントの編集モードを表す固定値を要素とした配列を指定します。
     * 配列の要素順に、変更、削除を表す固定値を指定してください。
     * - 基本的に変更する必要はありません。
     */
    editModes: {
      type: Array,
      default: () => ['UPDATE', 'DELETE'],
      required: false,
      validator: (v) => {
        return Array.isArray(v) && v.length >= 2
      },
    },

    /**
     * アイテムの編集が確定された時の追加処理です。
     * (item) => Promise({boolean})
     */
    handleUpdate: {
      type: Function,
      default: undefined,
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * アイテムの削除が確定された時の追加処理です。
     * (item) => Promise<boolean>
     */
    handleDelete: {
      type: Function,
      default: undefined,
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * コンポーネントの状態（編集中かどうか）です。
     * - true を与えると `変更` モードで編集中になります。
     * - .sync 修飾子による同期が可能です。
     */
    isEditing: { type: Boolean, default: false, required: false },

    /**
     * 管理対象のオブジェクトです。
     */
    item: { type: Object, default: () => ({}), required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 編集対象のオブジェクトです。
       */
      editItem: null,

      /**
       * 編集モードです。
       */
      editMode: undefined,

      /**
       * コンポーネント内で発生したエラーのメッセージの配列です。
       */
      errors: [],

      /**
       * true の場合、item が編集中であることを表します。
       */
      internalIsEditing: false,

      /**
       * コンポーネントが内部で管理するアイテムです。
       */
      internalItem: null,

      /**
       * コンポーネントが処理中であることを表すフラグです。
       */
      loading: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネントの編集モードを表す固定値を返します。
     */
    UPDATE() {
      return this.editModes?.[0] || 'UPDATE'
    },
    DELETE() {
      return this.editModes?.[1] || 'DELETE'
    },

    /**
     * コンポーネントが使用する、コンポーネントの状態（編集中かどうか）です。
     * - 値がセットされると `update:isEditing` イベントを emit します。
     */
    computedIsEditing: {
      get() {
        return this.internalIsEditing
      },
      set(v) {
        this.internalIsEditing = v
        this.$emit('update:isEditing', v)
      },
    },

    /**
     * コンポーネントの現在の状態が `変更` モードであるかどうかを返します。
     */
    isUpdate() {
      return this.editMode === this.UPDATE
    },

    /**
     * コンポーネントの現在の状態が `削除` モードであるかどうかを返します。
     */
    isDelete() {
      return this.editMode === this.DELETE
    },

    /**
     * コンポーネントがエラー状態かどうかを表すフラグを返します。
     */
    hasError() {
      return this.errors.length > 0
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.internalIsEditing を監視します。
     * - 編集が終了したらコンポーネントの状態を初期化します。
     */
    internalIsEditing(v) {
      if (!v) {
        this._initialize()
      }
    },

    /**
     * props.isEditing を監視します。
     * - data.internalIsEditing と同期します。
     */
    isEditing: {
      handler(v) {
        this.internalIsEditing = v
      },
      immediate: true,
    },

    /**
     * props.item を監視します。
     * - data.internalItem, data.editItem に複製します。
     */
    item: {
      handler(v) {
        this.internalItem = this._cloneObject(v)
        this.editItem = this._cloneObject(v)
      },
      immediate: true,
      deep: true,
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.editMode = this.editModes?.[0] || 'UPDATE'
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントのエラー状態を初期化します。
     */
    clearError() {
      this.errors.splice(0)
    },

    /**
     * コンポーネントの状態を編集終了にします。
     * - ウォッチャーによりコンポーネントの初期化処理が実行されます。
     */
    quitEditing() {
      this.computedIsEditing = false
    },

    /**
     * エラーメッセージと詳細情報をコンソールに出力し、コンポーネントをエラー状態にします。
     * @param {string} message - エラーの内容を説明するメッセージ。
     * @param {any} [payload] - エラーに関連する追加情報（オブジェクトや値など）。省略可能。
     */
    setError(message, payload) {
      if (payload !== undefined) {
        // eslint-disable-next-line no-console
        console.error(`[AirRenderlessArrayManager] ${message}`, payload)
      } else {
        // eslint-disable-next-line no-console
        console.error(`[AirRenderlessArrayManager] ${message}`)
      }

      this.errors.push(message)
    },

    /**
     * 現在編集中のアイテムの編集内容を確定させます。
     */
    async submit() {
      // コンポーネントのエラー状態を初期化
      this.clearError()

      // コンポーネントの状態が編集中でなければエラーを出力して終了
      if (!this.computedIsEditing) {
        this.setError(`Cannot submit because it is not being edited.`)
        return
      }

      // data.editItem が null の場合はエラーを出力して終了
      if (!this.editItem || typeof this.editItem !== 'object') {
        this.setError(`Cannot submit because editItem is not set.`)
        return
      }

      this.loading = true

      try {
        // 編集モードに合わせて処理
        if (this.editMode === this.UPDATE) {
          await this._handleModifyItem()
        } else if (this.editMode === this.DELETE) {
          await this._handleRemoveItem()
        }

        // 編集モードを終了する
        this.quitEditing()

        // `submit:complete` イベントを emit
        this.$emit('submit:complete', { editMode: this.editMode })
      } catch (err) {
        const message = `Failed to submit process.`
        // eslint-disable-next-line no-console
        console.error(message, err)
        this.setError(message, err)
      } finally {
        this.loading = false
      }
    },

    /**
     * コンポーネントの編集モードを指定されたモードに切り替えます。
     * - toUpdate, toDelete を使わず、編集モードのみを切り替える際はこちらを使用します。
     * @param {string} editMode - 編集モード
     */
    toggleEditMode(editMode) {
      // コンポーネントのエラー状態を初期化
      this.clearError()

      // 編集モードの妥当性チェック
      if (!this.editModes.includes(editMode)) {
        const message = `Invalid editMode was specified. editMode: ${editMode}`
        this.setError(message)
        return
      }
      this.editMode = editMode
    },

    /**
     * コンポーネントの編集モードを `変更` にし、コンポーネントの状態を編集中にします。
     * - data.editItem が data.interanalItem で初期化されます。
     */
    toUpdate() {
      this.clearError()
      this.loading = true
      try {
        this.toggleEditMode(this.UPDATE)
        this._intializeEditItem(this.internalItem)
        this.computedIsEditing = true
      } catch (err) {
        const message = `An error has occured at toUpdate().`
        this.setError(message, err)
      } finally {
        this.loading = false
      }
    },

    /**
     * コンポーネントの編集モードを `削除` にし、コンポーネントの状態を編集中にします。
     * - data.editItem が data.internalItem で初期化されます。
     * - itemConverter が指定されている場合、これを実行します。
     */
    toDelete() {
      this.clearError()
      this.loading = true
      try {
        this.toggleEditMode(this.DELETE)
        this._intializeEditItem(this.internalItem)
        this.computedIsEditing = true
      } catch (err) {
        const message = `An error has occured at toDelete().`
        this.setError(message, err)
      } finally {
        this.loading = false
      }
    },

    /**
     * 指定された引数をもとに data.editItem を更新します。
     * - UI コンポーネントから data.editItem の各プロパティを更新するために使用することを想定しています。
     * @param {Object} obj - 更新するプロパティを持つオブジェクト
     */
    updateProperties(obj = {}) {
      if (!this.editItem || typeof this.editItem !== 'object') {
        // eslint-disable-next-line no-console
        console.warn(
          `Cannot update properties: editItem is not defined or invalid.`
        )
        return
      }

      Object.entries(obj).forEach(([key, value]) => {
        if (key in this.editItem) {
          this.editItem[key] = value
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Property "${key}" does not exist in editItem.`)
        }
      })
    },

    /**
     * オブジェクトを複製します。
     * @param {Object} obj - 複製対象のオブジェクト
     * @return {Object} 複製されたオブジェクト
     * @throws {TypeError} 引数がオブジェクトでない場合にエラーをスローします。
     */
    _cloneObject(obj) {
      if (obj === null || typeof obj !== 'object') {
        throw new TypeError(
          `The argument must be an object. Received ${typeof obj}.`
        )
      }

      const proto = Object.getPrototypeOf(obj)
      const newObj = proto?.constructor
        ? new proto.constructor()
        : Object.create(proto)

      for (const key of Object.keys(obj)) {
        const value = obj[key]
        newObj[key] =
          value && typeof value === 'object' ? this._cloneObject(value) : value
      }

      return newObj
    },

    /**
     * 編集後のアイテムを自身が内部で管理するアイテムに複製します。
     * 1. props.handleUpdate が指定されていればこれを実行します。
     * 2. `input` イベントで 自身が内部で管理するアイテムを emit します。
     * 3. `UPDATE` イベントで 自身が内部で管理するアイテムを emit します。
     */
    async _handleModifyItem() {
      try {
        if (this.handleUpdate) await this.handleUpdate(this.editItem)
        this.internalItem = this._cloneObject(this.editItem)
        this.$emit('input', this.internalItem)
        this.$emit(this.UPDATE, this.internalItem)
      } catch (err) {
        this.setError(`Failed to modify item. ${err.message}`, err)
        throw err
      }
    },

    /**
     * 削除が指示された時の処理です。
     * 1. props.handleDelete が指定されていればこれを実行します。
     * 2. `DELETE` イベントで data.editItem を emit します。
     */
    async _handleRemoveItem() {
      try {
        if (this.handleDelete) await this.handleDelete(this.editItem)
        this.$emit(this.DELETE, this.editItem)
      } catch (err) {
        this.setError(`Failed to remove item. ${err.message}`, err)
        throw err
      }
    },

    /**
     * コンポーネントの状態を初期化します。
     * - 編集モードを `変更` に初期化されます。
     * - data.editItem を data.internalItem で初期化します。
     */
    _initialize() {
      this.editMode = this.UPDATE
      this._intializeEditItem()
      this.clearError()
      this.$emit('initialized')
    },

    /**
     * data.internalItem で data.editItem を初期化します。
     */
    _intializeEditItem() {
      Object.entries(this.internalItem).forEach(([key, value]) => {
        if (key in this.editItem) this.editItem[key] = value
      })
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        // 編集モード
        editMode: this.editMode,

        // 編集モード配列
        editModes: this.editModes,

        // 編集対象のオブジェクトまたはインスタンス
        editItem: this.editItem,

        // コンポーネント内で発生したエラーのメッセージの配列
        errors: this.errors,

        // コンポーネントがエラー状態かどうかです。
        hasError: this.hasError,

        // コンポーネントの編集モードが `変更` モードかどうかです。
        isUpdate: this.isUpdate,

        // コンポーネントの編集モードが `削除` モードかどうかです。
        isDelete: this.isDelete,

        // コンポーネントの状態（編集中であるかどうか）
        isEditing: this.computedIsEditing,

        // コンポーネントが受け取ったオブジェクトです。
        item: this.item,

        // コンポーネントが処理中であることを表します。
        loading: this.loading,

        // コンポーネントの状態を初期化します。
        quitEditing: this.quitEditing,

        // コンポーネントのエラー状態をセットする関数です。
        setError: this.setError,

        // 編集を確定するための関数です。
        submit: this.submit,

        // コンポーネントの編集モードのみを切り替えます。
        toggleEditMode: this.toggleEditMode,

        // 編集モード指定でコンポーネントの状態を切り替えます。
        toUpdate: this.toUpdate,
        toDelete: this.toDelete,

        // 子コンポーネントから data.editItem の各プロパティを編集するためのメソッドです。
        updateProperties: this.updateProperties,
      })
    }

    // eslint-disable-next-line no-console
    console.warn('[AirRenderlessItemManager] No default slot provided.')
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
