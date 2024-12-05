import GMixinEditModeReceiver from './GMixinEditModeReceiver'
import GInputValidationMixin from '~/mixins/GInputValidationMixin'
import GInputInitializeMixin from '~/mixins/GInputInitializeMixin'

/**
 * GInputSubmitMixin
 *
 * この Mixin は、`GInput` を接頭辞として持つコンポーネントにサブミット機能を提供します。
 * 編集モードに応じたバリデーションとフォーム送信処理が実装されます。
 *
 * インポートされる他の Mixins について:
 *
 * - `GMixinEditModeReceiver`:
 *   - 編集モード (`CREATE`, `UPDATE`, `DELETE`) の管理機能を提供します。
 *   - `editMode` プロパティを使用してフォームの操作状態を制御します。
 *
 * - `GInputInitializeMixin`:
 *   - `editModel` プロパティを初期化し、`props.instance` の複製を管理します。
 *   - フォーム送信時に複製されたインスタンスを使用して処理を行います。
 *
 * - `GInputValidationMixin`:
 *   - `validate` メソッドを提供し、コンポーネント内の VForm のバリデーションを実行します。
 *   - バリデーション結果に基づき、フォーム送信の可否を判断します。
 *   - `resetValidation` メソッドを提供して、バリデーションの状態をリセットします。
 *
 * 機能詳細:
 * - `GMixinEditModeReceiver`により、`props.editMode`と`props.loading`を親コンポーネントから受け取ります。
 * - `GInputInitializeMixin`により、`props.instance`を複製したインスタンスが`data.editModel`に設定されます。
 * - `data.submitType`の値が`toParent`の場合、`submit:complete`イベントがemitされます。
 * - `data.submitType`の値が`toFirestore`の場合、`props.editMode`に応じて`data.editModel`のcreate()、update()、またはdelete()が呼び出され、処理が完了すると`submit:complete`イベントがemitされます。
 * - `data.submitType`の既定値は`toFirestore`です。書き換える場合はオーバーライドします。
 * - `submit:complete`イベントでは`instance`として`data.editModel`を、`editMode`として`props.editMode`を受け取ることができます。
 * - `data.forceDelete`の値が true の場合、editModeを無視して削除処理が行われます。
 * - 削除の指示をユーザーから受け付けるようにする場合、`data.forceDelete`をtrueにするためのUIを用意してください。
 *
 * @method submit - フォーム送信処理を実行します。`editMode` や `validate` が未定義の場合は警告を出し、処理を中止します。
 *                  フォーム送信が成功した場合は `submit:complete` イベントを、失敗した場合は `submit:failed` イベントを emit します。
 *
 * @example
 * <template>
 *   <g-input-component :instance="someValue" :editMode="editMode" :loading="loading" />
 * </template>
 *
 * <script>
 * import GInputSubmitMixin from '~/mixins/GInputSubmitMixin';
 *
 * export default {
 *   mixins: [GInputSubmitMixin],
 *   props: {
 *     instance: {
 *       type: Object,
 *       required: true,
 *       validator(obj) {
 *         return obj instanceof SpecifiedClass;
 *       }
 *     }
 *   },
 *   data() {
 *     return {
 *       editModel: new SpecifiedClass(), // 特定のクラスのインスタンスを使用
 *     }
 *   }
 * };
 * </script>
 *
 * @version 1.10.0
 * @creator shisyamo4131
 * @updates
 * - version 1.10.0 - `data.forceDelete` を GInputInitializeMixin に移動
 * - version 1.9.0 - `data.forceDelete` を追加。
 * - version 1.8.0 - `data.loading`を追加。
 *                 - `submit`処理で`data.loading`の状態を制御するように修正
 * - version 1.7.0 - `GInputInitializeMixin`の`data.clone`を`data.editModel`に変更したことに伴う修正。
 *                 - `submit`処理での`input`イベントのemitを削除。
 *                 - `data.submitType`を実装。
 *                 - `data.submitType`が`toFirestore`の場合、`submit`処理でインスタンスの更新メソッドをコールするように修正。
 *                 - `data.submitType`が`toParent`の場合、`submit`処理でインスタンスを伴った`submit:complete`イベントをemitするように修正。
 * - version 1.6.1 - 各種 Mixin の機能に関するコメントを追加し、コードの説明を改善。
 */

export default {
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [
    GMixinEditModeReceiver,
    GInputValidationMixin,
    GInputInitializeMixin,
  ],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
      submitType: 'toFirestore',
    }
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async submit() {
      if (!this.editMode) {
        // eslint-disable-next-line no-console
        console.warn('editMode is not defined. Submit action aborted.')
        this.$emit('submit:failed', 'editMode not defined')
        return
      }

      if (!this.editModel) {
        // eslint-disable-next-line no-console
        console.warn('editModel is not initialized. Submit action aborted.')
        this.$emit('submit:failed', 'editModel not initialized')
        return
      }

      if (this.editMode !== this.DELETE && !this.forceDelete) {
        if (typeof this.validate !== 'function') {
          // eslint-disable-next-line no-console
          console.warn('Validation method not found. Submit action aborted.')
          this.$emit('submit:failed', 'Validation method not found')
          return
        }
        if (!this.validate()) {
          this.$emit('submit:failed', 'Validation failed')
          return
        }
      }

      try {
        this.loading = true
        if (this.submitType === 'toFirestore') {
          if (this.editMode === this.DELETE || this.forceDelete) {
            await this.editModel.delete()
          } else if (this.editMode === this.UPDATE) {
            await this.editModel.update()
          } else {
            await this.editModel.create()
          }
        }
        this.$emit('submit:complete', {
          instance: this.editModel.clone
            ? this.editModel.clone()
            : new this.editModel.constructor(this.editModel),
          editMode: this.forceDelete ? this.DELETE : this.editMode,
        })
        this.forceDelete = false
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Submit failed:', error)
        alert(error.message)
        this.$emit('submit:failed', error)
      } finally {
        this.loading = false
      }
    },
  },
}
