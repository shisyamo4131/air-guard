<script>
/**
 * オブジェクトを要素とした配列を管理するためのレンダーレスコンポーネントです。
 * - 提供するスロットプロパティを利用することで、容易に配列の操作を行うことができます。
 * - VForm を内包した INPUT コンポーネントを利用することで、VForm のバリデーションや
 *   入力項目の初期化処理までを担当します。
 *
 * スロットプロパティ:
 * 1. items
 * props.value に引き渡された配列です。
 *
 * 2. add
 * 配列に要素を追加します。インデックスを指定することで特定の箇所に追加することも可能です。
 *
 * 3. change
 * 配列の要素を置換します。
 * インデックスを指定しない場合、同一オブジェクトを置換します。
 * インデックスを指定した場合は、指定された位置に存在する要素を置換します。
 *
 * 4. delete
 * 配列の要素を削除します。
 * インデックスを指定しない場合、同一オブジェクトが削除されます。
 * インデックスを指定した場合は、指定された位置に存在する要素を削除します。
 *
 * 5. input
 * INPUT コンポーネント専用のスロットプロパティです。
 * { attrs, on }
 *
 * 6. dialog
 * DIALOG コンポーネント（使うのであれば）専用のスロットプロパティです。
 * { attrs, on }
 *
 * 7. table
 * TABLE コンポーネント専用のスロットプロパティです。
 * { attrs, on }
 */
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
     * 管理対象配列内で itemKey の重複を許容するかどうかです。
     */
    allowDuplicates: { type: Boolean, default: false, required: false },

    /**
     * 登録モードでダイアログが開くときに editModel が初期化されます。
     */
    defaultValue: { type: Object, default: () => ({}), required: false },

    /**
     * 編集モードでダイアログを開くトリガーとなるイベント名です。
     */
    eventEdit: { type: String, default: 'click:row', required: false },

    /**
     * 追加モードでダイアログを開いた直後にコールされる関数です。
     */
    openedAsCreate: { type: Function, default: undefined, required: false },

    /**
     * 編集モードでダイアログを開いた直後にコールされる関数です。
     */
    openedAsEdit: { type: Function, default: undefined, required: false },

    /**
     * 削除モードでダイアログを開いた直後にコールされる関数です。
     */
    openedAsDelete: { type: Function, default: undefined, required: false },

    /**
     * 管理対象の配列要素を一意に識別するためのプロパティ名です。
     */
    itemKey: { type: String, default: 'docId', required: false },

    /**
     * 管理対象の配列です。
     */
    value: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * INPUT コンポーネントで定義されている editModel への参照です。
       */
      editModel: null,

      /**
       * INPUT コンポーネント内の VForm コンポーネントへの参照です。
       */
      formRef: null,

      /**
       * INPUT コンポーネントへの参照です。
       */
      inputRef: null,

      /**
       * ダイアログの開閉状態
       */
      isEditing: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * UI コンポーネントのダイアログコンポーネントに引き渡すスロットプロパティです。
     */
    dialog() {
      return {
        attrs: {
          eager: true,
          value: this.isEditing,
        },
        on: {
          input: (event) => (this.isEditing = event),
        },
      }
    },

    /**
     * INPUT コンポーネントに引き渡すスロットプロパティです。
     */
    input() {
      return {
        attrs: {
          ref: this.setInputComponentRef,
          editMode: this.editMode,
        },
        on: {
          'click:submit': this.submit,
          'click:cancel': this.cancel,
          'update:editMode': (event) => (this.editMode = event),
        },
      }
    },

    table() {
      return {
        attrs: {
          items: this.value,
        },
        on: {
          [this.eventEdit]: this.onClickTableRow,
        },
      }
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * ダイアログの開閉状態を監視します。
     * - ダイアログが追加モードで開くとき、data.editModel を初期化します。
     *   props.defaultValue が指定されている場合の反映
     * - 編集モードに合わせたコールバックを実行します。
     * - ダイアログが終了したら当該コンポーネントの初期化処理を実行します。
     */
    isEditing(v) {
      if (v) {
        if (this.editMode === this.CREATE) {
          this.editModel.initialize(this.defaultValue)
          if (this.openedAsCreate) this.openedAsCreate(this.editModel)
        } else if (this.editMode === this.UPDATE) {
          if (this.openedAsEdit) this.openedAsEdit(this.editModel)
        } else if (this.editMode === this.DELETE) {
          if (this.opendAsDelete) this.openedAsDelete(this.editModel)
        }
      } else {
        this.initialize()
      }
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * props.value のすべての要素がオブジェクトであり、かつ props.itemKey で
     * 指定されたプロパティを保有するかどうかをチェックします。
     * @returns {boolean} - 要件を満たす場合は true を、満たさない場合は false を返します。
     */
    arrayValidator() {
      return this.value.every((item) => this.itemValidator(item))
    },

    /**
     * INPUT コンポーネントの cancel イベントを処理します。
     * - ダイアログを終了します。
     */
    cancel() {
      this.isEditing = false
    },

    /**
     * INPUT コンポーネント内の VForm コンポーネントの validate メソッドを実行し、
     * 結果を返します。
     *
     * @returns {boolean} - バリデーションの結果を返します。VForm コンポーネントが存在しない場合は false を返します。
     */
    formValidate() {
      // VForm コンポーネントへの参照が存在するか、validate メソッドがあるかをチェック
      if (!this.formRef || typeof this.formRef.validate !== 'function') {
        // eslint-disable-next-line no-console
        console.warn(
          `VForm コンポーネントへの参照が取得できないか、validate メソッドが見つかりません。`
        )
        return false
      }

      // バリデーションの実行
      const result = this.formRef.validate()

      // バリデーション失敗時の処理
      if (!result) {
        alert(`入力内容に不備があります。`)
      }

      return result
    },

    /**
     * 引数で指定された item のインデックスを返します。
     * @returns {number} - インデックスです。見つからなかった場合は -1 を返します。
     */
    getIndex(item) {
      return this.value.findIndex(
        (el) => el[this.itemKey] === item[this.itemKey]
      )
    },

    /**
     * 当該コンポーネントの初期化処理です。
     * - data.editModel の initialize メソッドを実行します。
     * - data.editMode を `CREATE` に初期化します。
     * - ダイアログを終了します。
     * - VForm への参照が取得できていれば resetValidation を実行します。
     */
    initialize() {
      this.editModel.initialize()
      this.editMode = this.CREATE
      this.isEditing = false
      if (this.formRef && typeof this.formRef.resetValidation === 'function') {
        this.formRef.resetValidation()
      }
    },

    /**
     * 引数で指定されたインデックスの有効性をチェックします。
     * @param {number} index - チェック対象のインデックスです。
     * @returns {boolean} - 有効な場合は true を、無効な場合は false を返します。
     */
    isValidIndex(index) {
      if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
        // eslint-disable-next-line no-console
        console.warn(`インデックス (${index}) が無効な値です。`)
        return false
      }

      // 置換対象インデックスの範囲チェック
      if (index >= this.value.length) {
        // eslint-disable-next-line no-console
        console.warn(`インデックス (${index}) が配列の範囲を超えています。`)
        return false
      }

      return true
    },

    /**
     * 引数で受け取った item がオブジェクトであり、かつ props.itemKey で指定された
     * プロパティを保有し、さらに管理しているインスタンスと同じクラスであるかをチェックします。
     *
     * @param {Object} item - チェック対象のオブジェクト
     * @param {boolean} [outputLog=false] - true にすると要件を満たさなかった場合に警告ログを出力します。（オプション）
     * @returns {boolean} - 要件を満たす場合に true を、満たさない場合に false を返します。
     */
    itemValidator(item, outputLog = false) {
      // 基本要件: オブジェクトであること、nullでないこと、itemKeyプロパティを持つこと
      const isValidObject =
        typeof item === 'object' && item !== null && this.itemKey in item

      if (!isValidObject) {
        if (outputLog) {
          // eslint-disable-next-line no-console
          console.warn(
            `item はオブジェクトであり、かつ ${this.itemKey} プロパティを保有する必要があります。`,
            { item }
          )
        }
        return false
      }

      // クラスの一致を確認: editModel が存在し、item のクラスが同じであることを確認
      if (this.editModel && item.constructor !== this.editModel.constructor) {
        if (outputLog) {
          // eslint-disable-next-line no-console
          console.warn(`item が管理インスタンスと異なるクラスです。`, { item })
        }
        return false
      }

      // すべての要件を満たす場合は true を返す
      return true
    },

    onClickTableRow(item) {
      this.editModel.initialize(item)
      this.editMode = this.UPDATE
      this.isEditing = true
    },

    /**
     * INPUT コンポーネントの ref に引き渡されるメソッドです。
     * - INPUT コンポーネントへの参照を取得します。
     * - INPUT コンポーネント内の VForm コンポーネントへの参照を取得します。
     */
    setInputComponentRef(el) {
      /**
       * NOTE:
       * Vue の仕様で, props で定義されていないプロパティなど, $attrs によって提供している値に
       * 変更が生じた場合に, DOM が再描画（アンマウント -> マウント）される模様。
       * 結果, el に null が引き渡された後に新しい参照が引き渡される動きになる。
       * 当該コンポーネントの場合, editMode を `UPDATE` に切り替えたとき。
       * よって el が null の場合はそのまま処理を終了することとする。
       */
      if (!el) return

      // INPUT コンポーネントへの参照を取得
      this.inputRef = el
      // if (!this.inputRef) {
      //   // eslint-disable-next-line no-console
      //   console.warn(`INPUT コンポーネントへの参照が取得できませんでした。`)
      //   return
      // }

      this.editModel = this.inputRef.editModel || undefined
      if (!this.editModel) {
        // eslint-disable-next-line no-console
        console.warn(`INPUT コンポーネントに editModel が定義されていません。`)
        return
      }

      // エレメントが $el を保有していない場合は終了（エッジケース）
      // -> ホットリロードなどで保有していない状態でこの関数が呼び出されるケースに対応
      if (!el?.$el) return

      // VForm コンポーネントを再帰的に検索するための関数
      const findFormComponentByElement = (children, el) => {
        for (const child of children) {
          if (child.$el === el) return child
          const found = findFormComponentByElement(child.$children, el)
          if (found) return found
        }
        return null
      }

      // el 自体が VForm であればこれを取得して終了
      if (el.$el.classList.contains('v-form')) {
        this.formRef = el
        return
      }

      // v-form クラスを持つ DOM を取得
      const formElement = el.$el.querySelector('.v-form')

      // DOM が見つからなければ警告を出力して終了
      if (!formElement) {
        // eslint-disable-next-line no-console
        console.warn(
          `INPUT コンポーネントに VForm コンポーネントが見つかりません。`
        )
        return
      }

      const formComponent = findFormComponentByElement(
        el.$children,
        formElement
      )
      this.formRef = formComponent || null
    },

    /**
     * UI コンポーネントの INPUT コンポーネントから emit された submit イベントを処理します。
     * - 編集された data.editModel から新しいインスタンスを生成します。
     * - data.editMode に合わせて対応するメソッドを呼び出します。
     */
    submit() {
      // VForm の validate で検証を行い、検証結果が false であれば終了
      if (!this.formValidate()) return
      const item = new this.editModel.constructor(this.editModel)
      if (this.editMode === this.CREATE) this.add(item)
      if (this.editMode === this.UPDATE) this.change(item)
      if (this.editMode === this.DELETE) this.delete(item)
      this.isEditing = false
    },

    /**
     * 管理対象の配列に引数で指定された item を要素として追加します。
     * - インデックスを指定すると、指定された位置に要素を追加します。
     * - インデックスが指定されなかった場合は末尾に追加されます。
     * @param {Object} item - 配列に追加する要素（オブジェクト）
     * @param {number} [index] - 追加する位置のインデックス（オプション）
     */
    add(item, index = null) {
      // 配列の要素としての要件をチェック
      if (!this.itemValidator(item, true)) return

      // インデックスの有効性をチェック（指定されている場合のみ）
      if (index !== null && !this.isValidIndex(index)) {
        return // インデックスが無効な場合は何もせずに終了
      }

      // 要素の重複を許容する場合の処理
      if (this.allowDuplicates) {
        if (index !== null) {
          // 有効なインデックスが指定されている場合、その位置に要素を挿入
          const newValue = [...this.value]
          newValue.splice(index, 0, item)
          this.$emit('input', newValue)
        } else {
          // インデックスが指定されていない場合、末尾に追加
          this.$emit('input', [...this.value, item])
        }
        return
      }

      // 既存の配列に対して props.itemKey で重複チェック
      const existingIndex = this.getIndex(item)

      // 既に存在する要素の場合
      if (existingIndex !== -1) {
        // eslint-disable-next-line no-console
        console.warn(`重複した item を追加することはできません。`, {
          index: existingIndex,
          item,
        })
        return
      }

      // 新しい要素を指定された位置に追加または末尾に追加
      if (index !== null) {
        // 有効なインデックスが指定されている場合、その位置に要素を挿入
        const newValue = [...this.value]
        newValue.splice(index, 0, item)
        this.$emit('input', newValue)
      } else {
        // インデックスが指定されていない場合、末尾に追加
        this.$emit('input', [...this.value, item])
      }
    },

    /**
     * 管理対象の配列の要素を指定された item で置換します。
     * - インデックスが指定された場合、該当の位置にある要素を置換します。
     * - インデックスが指定されたなかった場合は item と合致する要素を配列から検索して置換します。
     * @param {Object} item - 新しい要素（オブジェクト）
     * @param {number} [index] - 置換対象のインデックス（オプション）
     */
    change(item, index = null) {
      // 配列の要素としての要件をチェック
      if (!this.itemValidator(item, true)) return

      // インデックスが指定されている場合の処理
      if (index !== null) {
        // インデックスの有効性をチェック
        if (!this.isValidIndex(index)) {
          return // インデックスが無効な場合は何もせず終了
        }

        // 重複が許可されていない場合の重複チェック
        if (!this.allowDuplicates) {
          const duplicateIndex = this.getIndex(item)
          if (duplicateIndex !== -1 && duplicateIndex !== index) {
            // eslint-disable-next-line no-console
            console.warn(`重複した item によって置換することはできません。`, {
              index: duplicateIndex,
              item,
            })
            return
          }
        }

        // 要素を指定されたインデックスで置換して emit
        const newValue = [...this.value]
        newValue.splice(index, 1, item)
        this.$emit('input', newValue)
        return
      }

      // インデックスが指定されていない場合、itemKey で要素を検索
      const existingIndex = this.getIndex(item)

      // 既存の要素が見つからなかった場合は警告ログを出力して終了
      if (existingIndex === -1) {
        // eslint-disable-next-line no-console
        console.warn(`置換対象の要素が存在しません。`, { item })
        return
      }

      // 重複が許可されていない場合の重複チェック（自分自身以外に重複がないか）
      if (!this.allowDuplicates) {
        const duplicateIndex = this.value.findIndex(
          (v, i) =>
            this.itemKey in v &&
            v[this.itemKey] === item[this.itemKey] &&
            i !== existingIndex
        )
        if (duplicateIndex !== -1) {
          // eslint-disable-next-line no-console
          console.warn(`重複した item によって置換することはできません。`, {
            index: duplicateIndex,
            item,
          })
          return
        }
      }

      // 要素を置換して emit
      const newValue = [...this.value]
      newValue.splice(existingIndex, 1, item)
      this.$emit('input', newValue)
    },

    /**
     * 管理対象の配列から引数で指定された item またはインデックスで指定された要素を削除します。
     *
     * @param {Object} item - 削除する要素（オブジェクト）。インデックスが指定されなかった場合に使用されます。
     * @param {number} [index=null] - 削除する位置のインデックス（オプション）。指定された場合は優先してそのインデックスを削除します。
     */
    delete(item, index = null) {
      // インデックスが指定されている場合はインデックスを優先
      if (index !== null) {
        // インデックスの有効性をチェック
        if (!this.isValidIndex(index)) {
          return // インデックスが無効な場合は何もせず終了
        }

        // 要素を削除して emit
        const newValue = [...this.value]
        newValue.splice(index, 1)
        this.$emit('input', newValue)
        return
      }

      // インデックスが指定されていない場合、itemKey で要素を検索
      // 配列の要素としての要件をチェック
      if (!this.itemValidator(item, true)) return

      // 既存の配列に対して props.itemKey でインデックスを取得
      const existingIndex = this.getIndex(item)

      // 要素が見つからなかった場合は警告ログを出力して終了
      if (existingIndex === -1) {
        // eslint-disable-next-line no-console
        console.warn(`削除対象の要素が存在しません。`, { item })
        return
      }

      // 要素を削除して emit
      const newValue = [...this.value]
      newValue.splice(existingIndex, 1)
      this.$emit('input', newValue)
    },
  },

  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render(h) {
    // スロットが指定されているか確認
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        items: this.value,
        add: this.add,
        change: this.change,
        delete: this.delete,
        input: this.input,
        dialog: this.dialog,
        table: this.table,
      })
    }
    return null // スロットが提供されていない場合、何もレンダリングしない
  },
}
</script>

<style></style>
