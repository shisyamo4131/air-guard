<script>
/**
 * 配列の管理機能を提供するためのレンダーレスコンポーネントです。
 *
 * - data.editItem に対する入力について、このコンポーネントはバリデーションを行いません。
 * - 配列管理の都合上、props.itemKey に設定されたプロパティのみ、未入力の場合にエラーになります。
 *
 * [EVENTS]
 *
 * | event           | description                                                                                 |
 * | --------------- | ------------------------------------------------------------------------------------------- |
 * | CREATE          | 配列への追加処理が完了した時にemitされます。イベント名はeditModesプロパティに依存します。   |
 * | UPDATE          | 配列への変更処理が完了した時にemitされます。イベント名はeditModesプロパティに依存します。   |
 * | DELETE          | 配列からの削除処理が完了した時にemitされます。イベント名はeditModesプロパティに依存します。 |
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
  model: { prop: 'items', event: 'input' },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントが編集モードに入る直前に実行される関数を指定します。
     * - toggleEditMode を使って編集モードを切り替える際は実行されません。
     * (editMode) => Promise({void})
     */
    beforeEdit: { type: Function, default: undefined, required: false },

    /**
     * コンポーネントの編集モードを表す固定値を要素とした配列を指定します。
     * 配列の要素順に、登録、変更、削除を表す固定値を指定してください。
     * - 基本的に変更する必要はありません。
     */
    editModes: {
      type: Array,
      default: () => ['CREATE', 'UPDATE', 'DELETE'],
      required: false,
      validator: (v) => {
        return Array.isArray(v) && v.length >= 3
      },
    },

    /**
     * 配列へ要素を追加する処理を上書きします。
     * (item, index, items) => Promise({boolean})
     */
    handleCreate: {
      type: Function,
      default: undefined,
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * 配列の要素を変更する処理を上書きします。
     * (item, index, items) => Promise({boolean})
     */
    handleUpdate: {
      type: Function,
      default: undefined,
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * 配列の要素を削除する処理を上書きします。
     * (item, index, items) => Promise<boolean>
     */
    handleDelete: {
      type: Function,
      default: undefined,
      validator: (v) => !v || typeof v === 'function',
    },

    /**
     * コンポーネントの状態（編集中かどうか）です。
     * - true を与えると `登録` モードで編集中になります。
     * - .sync 修飾子による同期が可能です。
     */
    isEditing: { type: Boolean, default: false, required: false },

    /**
     * `変更` または `削除` モードに切り替える際、対象アイテムの初期化処理を
     * カスタムすることができます。
     * NOTE:
     * schema には本来のモデルを指定しているものの、配列に格納されているアイテムは
     * 別のデータである場合などに使用します。
     * (item) => Promise<Object>
     */
    itemConverter: {
      type: Function,
      default: undefined,
      required: false,
    },

    /**
     * 配列内の要素を特定するためのキーです。
     */
    itemKey: {
      type: String,
      default: 'docId',
      required: false,
      validator: (v) => !!v,
    },

    /**
     * 管理対象の配列です。
     * 配列の要素はすべてオブジェクトでなければなりません。
     */
    items: {
      type: Array,
      default: () => [],
      required: false,
      validator: (arr) =>
        Array.isArray(arr) &&
        arr.every((el) => typeof el === 'object' && el !== null),
    },

    /**
     * 配列の要素（オブジェクト）のデータ構造を表すスキーマです。
     * オブジェクトやカスタムクラスのインスタンスを受け取ります。
     */
    schema: { type: Object, default: () => ({}), required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 編集前のオブジェクトまたはインスタンスです。
       */
      beforeItem: null,

      /**
       * 編集対象のオブジェクトまたはインスタンスです。
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
       * コンポーネント内部で管理する配列です。
       * ウォッチャーで props.items が複製されます。
       */
      internalItems: [],

      /**
       * true の場合、item が編集中であることを表します。
       */
      internalIsEditing: false,

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
    CREATE() {
      return this.editModes?.[0] || 'CREATE'
    },
    UPDATE() {
      return this.editModes?.[1] || 'UPDATE'
    },
    DELETE() {
      return this.editModes?.[2] || 'DELETE'
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
     * 現在編集中のアイテムのインデックスを返します。
     */
    editIndex() {
      if (!this.editItem) return -1
      if (!this.editItem[this.itemKey]) return -1
      return this.internalItems.findIndex(
        (item) => item[this.itemKey] === this.editItem[this.itemKey]
      )
    },

    /**
     * コンポーネントの現在の状態が `登録` モードであるかどうかを返します。
     */
    isCreate() {
      return this.editMode === this.CREATE
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
     * props.items を data.internalItems に複製します。
     */
    items: {
      handler(v) {
        this.internalItems = [...v]
      },
      immediate: true,
    },

    /**
     * props.schema を監視します。
     * - data.beforeItem にオブジェクトまたはインスタンスを複製します。
     * - data.editItem にオブジェクトまたはインスタンスを複製します。
     */
    schema: {
      handler(v) {
        if (!v) return
        this.beforeItem = this._cloneObject(v)
        this.editItem = this._cloneObject(v)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.editMode = this.editModes?.[0] || 'CREATE'
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

      // data.editItem が props.itemKey を持っていない場合はエラーを出力して終了
      // if (!this.editItem[this.itemKey]) {
      if (!(this.itemKey in this.editItem)) {
        this.setError(
          `Cannot submit because editItem does not have ${this.itemKey}.`
        )
        return
      }

      this.loading = true

      try {
        // 編集モードに合わせて処理
        if (this.editMode === this.CREATE) {
          await this._handleAddItem()
        } else if (this.editMode === this.UPDATE) {
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
     * - toRegist, toUpdate, toDelete を使わず、編集モードのみを切り替える際はこちらを使用します。
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
     * コンポーネントの編集モードを `登録` にし、コンポーネントの状態を編集中にします。
     * - data.editItem が props.schema で初期化されます。
     */
    async toRegist() {
      await this._toEdit(this.CREATE, this.schema)
    },

    /**
     * コンポーネントの編集モードを `変更` にし、コンポーネントの状態を編集中にします。
     * - data.editItem が item で初期化されます。
     * - itemConverter が指定されている場合、これを実行します。
     */
    async toUpdate(item) {
      await this._toEdit(this.UPDATE, item)
    },

    /**
     * コンポーネントの編集モードを `削除` にし、コンポーネントの状態を編集中にします。
     * - data.editItem が item で初期化されます。
     * - itemConverter が指定されている場合、これを実行します。
     */
    async toDelete(item) {
      await this._toEdit(this.DELETE, item)
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
     * 編集中のアイテムを配列に追加し、新しい配列を input イベントで emit します。
     * - 処理が正常に完了すると `CREATE` イベントを emit します。
     */
    async _handleAddItem() {
      // インデックスのチェック
      if (this.editIndex !== -1) {
        this.setError(`Invalid index. index: ${this.editIndex}`)
        return
      }

      try {
        const clonedItem = this._cloneObject(this.editItem)

        if (this.handleCreate) {
          await this.handleCreate(
            clonedItem,
            this.editIndex,
            this.internalItems
          )
        } else {
          this.internalItems.push(clonedItem)
          this.$emit('input', this.internalItems)
        }

        this.$emit(this.CREATE, clonedItem)
      } catch (err) {
        this.setError(`Failed to add item.`, err)
        throw err
      }
    },

    /**
     * 配列内の editIndex で指定された位置にあるアイテムを
     * 編集中のアイテムで置換し、新しい配列を input イベントで emit します。
     * - 処理が正常に完了すると `UPDATE` イベントを emit します。
     */
    async _handleModifyItem() {
      // インデックスのチェック
      if (this.editIndex < 0) {
        this.setError(`Invalid index. index: ${this.editIndex}`)
        return
      }

      try {
        const clonedItem = this._cloneObject(this.editItem)

        if (this.handleUpdate) {
          await this.handleUpdate(
            clonedItem,
            this.editIndex,
            this.internalItems
          )
        } else {
          this.internalItems.splice(this.editIndex, 1, clonedItem)
          this.$emit('input', this.internalItems)
        }

        this.$emit(this.UPDATE, clonedItem)
      } catch (err) {
        this.setError(`Failed to modify item.`, err)
        throw err
      }
    },

    /**
     * 編集中のアイテムを配列から削除し、新しい配列を input イベントで emit します。
     * - 処理が正常に完了すると `UPDATE` イベントを emit します。
     */
    async _handleRemoveItem() {
      // インデックスのチェック
      if (this.editIndex < 0) {
        this.setError(`Invalid index. index: ${this.editIndex}`)
        return
      }

      try {
        const clonedItem = this._cloneObject(this.editItem)

        if (this.handleDelete) {
          await this.handleDelete(
            clonedItem,
            this.editIndex,
            this.internalItems
          )
        } else {
          this.internalItems.splice(this.editIndex, 1)
          this.$emit('input', this.internalItems)
        }
        this.$emit(this.DELETE, clonedItem)
      } catch (err) {
        this.setError(`Failed to remove item.`, err)
        throw err
      }
    },

    /**
     * コンポーネントの状態を初期化します。
     * - 編集モードを `登録` に初期化されます。
     * - data.editItem を props.schema で初期化します。
     */
    _initialize() {
      this.editMode = this.CREATE
      this._initializeItem(this.schema)
      this.clearError()
      this.$emit('initialized')
    },

    /**
     * 引数に指定されたオブジェクトで data.beforeItem, data.editItem を初期化します。
     * @param {Object} obj - 初期化に使用するオブジェクトです。
     */
    _initializeItem(obj = {}) {
      Object.entries(obj).forEach(([key, value]) => {
        if (key in this.beforeItem) this.beforeItem[key] = value
        if (key in this.editItem) this.editItem[key] = value
      })
    },

    /**
     * toRegist, toUpdate, toDelete からコールされる関数です。
     * コンポーネントを編集状態にします。
     */
    async _toEdit(editMode, item) {
      this.loading = true

      try {
        // コンポーネントのエラー状態を初期化
        this.clearError()

        // 編集モードを変更
        this.toggleEditMode(editMode)

        // props.beforeEdit が指定されている場合はこれを実行
        if (this.beforeEdit) {
          await this.beforeEdit({
            isCreate: this.isCreate,
            isUpdate: this.isUpdate,
            isDelete: this.isDelete,
          }).catch((err) => {
            this.setError(`An error has occured at beforeEdit.`, err)
            throw err
          })
        }

        // `追加` モード以外で props.itemConverter が指定されている場合はこれを実行
        const initItem =
          !this.isCreate && this.itemConverter
            ? await this.itemConverter(item).catch((err) => {
                const message = `Failed to convert item.`
                this.setError(message, err)
              })
            : item

        // data.editItem を 初期化
        this._initializeItem(initItem)

        // `追加` モード以外で computed.editIndex が -1 の場合はエラー
        if (!this.isCreate && this.editIndex === -1) {
          const err = new Error(
            `Could not find the specified item in the items.`
          )
          this.setError(err.message, err)
          throw err
        }

        // コンポーネントを編集状態に変更
        this.computedIsEditing = true
      } catch (err) {
        const message = `An error occurred in the process of putting the file into edit status. editMode: ${editMode}`
        this.setError(message, err)
      } finally {
        this.loading = false
      }
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        // 編集前のオブジェクトまたはインスタンス
        beforeItem: this.beforeItem,

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

        // コンポーネントの編集モードが `登録` モードかどうかです。
        isCreate: this.isCreate,

        // コンポーネントの編集モードが `変更` モードかどうかです。
        isUpdate: this.isUpdate,

        // コンポーネントの編集モードが `削除` モードかどうかです。
        isDelete: this.isDelete,

        // コンポーネントの状態（編集中であるかどうか）
        isEditing: this.computedIsEditing,

        // コンポーネントが管理している配列
        items: this.internalItems,

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
        toRegist: this.toRegist,
        toUpdate: this.toUpdate,
        toDelete: this.toDelete,

        // 子コンポーネントから data.editItem の各プロパティを編集するためのメソッドです。
        updateProperties: this.updateProperties,
      })
    }

    // eslint-disable-next-line no-console
    console.warn('[AirRenderlessArrayManager] No default slot provided.')
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>
