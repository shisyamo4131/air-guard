/**
 * GInputValidationMixin
 *
 * `GInput`を接頭辞として持つコンポーネントに対して、バリデーション機能を提供するMixinです。
 * このMixinを使用することで、コンポーネント内のVFormのバリデーション処理を簡素化できます。
 *
 * - mounted()で、GInputコンポーネント内のVFormコンポーネントを自動取得します。
 * - `validate`メソッドを提供します。
 * - バリデーションに失敗した場合、ユーザーに通知し、エラーメッセージをコンソールに出力します。
 * - `resetValidation` メソッドを提供し、VForm の `resetValidation()` 関数を呼び出してバリデーションを初期化します。
 *
 * @method validate - フォームのバリデーションを実行し、その結果を返します。バリデーションに失敗した場合、ユーザーに通知します。
 * @returns {Boolean} - バリデーションが成功した場合は `true`、失敗した場合は `false` を返します。
 *
 * @method resetValidation - フォームのバリデーションを初期化します。
 *
 * @example
 * <template>
 *   <v-form>
 *     <!-- フォーム要素 -->
 *   </v-form>
 * </template>
 *
 * <script>
 * import GInputValidationMixin from '~/mixins/GInputValidationMixin';
 *
 * export default {
 *   mixins: [GInputValidationMixin],
 *   methods: {
 *     submit() {
 *       if (this.validate()) { // すべてのフォームのバリデーションを実行
 *         // バリデーション成功時の処理
 *       }
 *     },
 *     reset() {
 *       this.resetValidation(); // すべてのフォームのバリデーションを初期化
 *     }
 *   }
 * };
 * </script>
 *
 * @version 2.0.0
 * @creator shisyamo4131
 * @updates
 * - version 2.0.0 - GInputコンポーネント内のVFormコンポーネントを自動取得するように機能を追加
 *                   これにより、GInputコンポーネント実装時にVFormのref属性が不要に。
 * - version 1.2.0 - `resetValidation` メソッドを追加し、バリデーションを初期化する機能を追加
 * - version 1.1.0 - 引数無しで呼び出された場合、すべてのVFormを対象にバリデーションを実行する機能を追加
 * - version 1.0.0 - 初版作成
 */

export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      _formRef: null,
    }
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this._formRef = this._findVForm()
    console.log(`form is found: ${!!this._formRef}`)
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * GInputコンポーネント内のVFormコンポーネントを探して返します。
     * @returns {Object|undefined} VFormコンポーネントのインスタンスまたはundefined
     */
    _findVForm() {
      // 1. 現在のコンポーネント自身がVFormかどうかを確認
      if (this.$el.classList.contains('v-form')) {
        return this
      }

      // 2. v-formクラスを持つDOM要素を取得
      const formElement = this.$el.querySelector('.v-form')
      if (formElement) {
        // 3. 再帰的にすべての子コンポーネントから対応するVueコンポーネントを探す
        const formComponent = this._findComponentByEl(
          this.$children,
          formElement
        )
        return formComponent || undefined
      } else {
        // eslint-disable-next-line no-console
        console.warn('GInput component must have VForm.')
        return undefined
      }
    },
    /**
     * 再帰的に子コンポーネントを探索し、指定されたDOM要素に対応するコンポーネントを返します。
     * @param {Array} children 子コンポーネントの配列
     * @param {Element} el DOM要素
     * @returns {Object|undefined} 対応するコンポーネントまたはundefined
     */
    _findComponentByEl(children, el) {
      for (const child of children) {
        // 子コンポーネントの$elが一致した場合、そのコンポーネントを返す
        if (child.$el === el) {
          return child
        }
        // 再帰的に孫コンポーネントを探索
        const found = this._findComponentByEl(child.$children, el)
        if (found) {
          return found
        }
      }
      return undefined
    },
    /**
     * フォームのバリデーションを実行します。
     * バリデーションに失敗した場合、ユーザーに通知し、結果を返します。
     * @returns {Boolean} - バリデーションが成功した場合は `true`、失敗した場合は `false` を返します。
     */
    validate() {
      if (!this._formRef) {
        // eslint-disable-next-line no-console
        console.warn(`Could not find VForm.`)
        return false
      }
      const result = this._formRef.validate()
      if (!result) {
        // eslint-disable-next-line no-console
        console.warn('Validation failed.')
        alert('入力に不備があります。')
      }
      return result
    },
    /**
     * フォームのバリデーションを初期化します。
     */
    resetValidation() {
      if (!this._formRef) {
        // eslint-disable-next-line no-console
        console.warn(`Could not find VForm.`)
      }
      this._formRef.resetValidation()
    },
  },
}
