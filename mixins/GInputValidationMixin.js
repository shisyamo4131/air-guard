/**
 * GInputValidationMixin
 *
 * `GInput`を接頭辞として持つコンポーネントに対して、バリデーション機能を提供するMixinです。
 * このMixinを使用することで、コンポーネント内のVFormのバリデーション処理を簡素化できます。
 *
 * - `validate`メソッドを提供します。
 * - コンポーネント内のVFormコンポーネントの `validate()` メソッドを呼び出して、フォームのバリデーションを実行します。
 * - バリデーションに失敗した場合、ユーザーに通知し、エラーメッセージをコンソールに出力します。
 * - 引数無しで呼び出された場合、コンポーネント内のすべてのVFormのバリデーションを実行します。
 * - `resetValidation` メソッドを提供し、VForm の `resetValidation()` 関数を呼び出してバリデーションを初期化します。
 *
 * @method validate - フォームのバリデーションを実行し、その結果を返します。バリデーションに失敗した場合、ユーザーに通知します。
 * @param {String} [refName] - バリデーションを実行するフォームの `ref` 名。デフォルトは `null` で、すべてのフォームを対象とします。
 * @returns {Boolean} - バリデーションが成功した場合は `true`、失敗した場合は `false` を返します。
 *
 * @method resetValidation - フォームのバリデーションを初期化します。
 * @param {String} [refName] - バリデーションを初期化するフォームの `ref` 名。デフォルトは `null` で、すべてのフォームを対象とします。
 *
 * @example
 * <template>
 *   <v-form ref="customForm1">
 *     <!-- フォーム要素 -->
 *   </v-form>
 *   <v-form ref="customForm2">
 *     <!-- 別のフォーム要素 -->
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
 * @version 1.2.0
 * @creator shisyamo4131
 * @updates
 * - version 1.0.0 - 初版作成
 * - version 1.1.0 - 引数無しで呼び出された場合、すべてのVFormを対象にバリデーションを実行する機能を追加
 * - version 1.2.0 - `resetValidation` メソッドを追加し、バリデーションを初期化する機能を追加
 */

export default {
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * フォームのバリデーションを実行します。
     * バリデーションに失敗した場合、ユーザーに通知し、結果を返します。
     * @param {String} [refName] - バリデーションを実行するフォームの `ref` 名。デフォルトは `null` で、すべてのフォームを対象とします。
     * @returns {Boolean} - バリデーションが成功した場合は `true`、失敗した場合は `false` を返します。
     */
    validate(refName = null) {
      if (refName) {
        const form = this.$refs[refName]
        if (!form) {
          // eslint-disable-next-line no-console
          console.warn(`Form with ref "${refName}" not found.`)
          return false
        }
        if (typeof form.validate !== 'function') {
          // eslint-disable-next-line no-console
          console.warn(
            `Form with ref "${refName}" does not have a validate() method.`
          )
          return false
        }
        const result = form.validate()
        if (!result) {
          // eslint-disable-next-line no-console
          console.warn('Validation failed.')
          alert('入力に不備があります。')
        }
        return result
      } else {
        const forms = Object.values(this.$refs).filter(
          (ref) => ref && typeof ref.validate === 'function'
        )
        let allValid = true
        forms.forEach((form) => {
          const result = form.validate()
          if (!result) {
            // eslint-disable-next-line no-console
            console.warn('Validation failed.')
            alert('入力に不備があります。')
            allValid = false
          }
        })
        return allValid
      }
    },

    /**
     * フォームのバリデーションを初期化します。
     * @param {String} [refName] - バリデーションを初期化するフォームの `ref` 名。デフォルトは `null` で、すべてのフォームを対象とします。
     */
    resetValidation(refName = null) {
      if (refName) {
        const form = this.$refs[refName]
        if (!form) {
          // eslint-disable-next-line no-console
          console.warn(`Form with ref "${refName}" not found.`)
          return
        }
        if (typeof form.resetValidation !== 'function') {
          // eslint-disable-next-line no-console
          console.warn(
            `Form with ref "${refName}" does not have a resetValidation() method.`
          )
          return
        }
        form.resetValidation()
      } else {
        const forms = Object.values(this.$refs).filter(
          (ref) => ref && typeof ref.resetValidation === 'function'
        )
        forms.forEach((form) => {
          form.resetValidation()
        })
      }
    },
  },
}
