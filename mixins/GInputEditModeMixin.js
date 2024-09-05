import { EDIT_MODES } from '~/utils/EDIT_MODES'

/**
 * GInputEditModeMixin
 *
 * `GInput`を接頭辞として持つコンポーネントに対して、編集モードとロード中状態の管理機能を提供するMixinです。
 *
 * - 編集モードを示す `editMode` プロパティを提供します。
 * - ロード中状態を示す `loading` プロパティを提供します。
 *
 * @prop {String} editMode - コンポーネントの操作モード (`CREATE` | `UPDATE` | `DELETE`)。
 * @prop {Boolean} loading - ロード中状態を示すBoolean値
 *
 * @constant {String} CREATE - 新規作成モード。
 * @constant {String} UPDATE - 更新モード。
 * @constant {String} DELETE - 削除モード。
 *
 * @version 1.4.0
 * @creator shisyamo4131
 * @updates
 * - version 1.4.0 - `props.editMode` を必須に変更
 * - version 1.3.1 - `props.loading` を追加
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    editMode: { type: String, required: true },
    loading: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    CREATE() {
      return EDIT_MODES.CREATE
    },
    UPDATE() {
      return EDIT_MODES.UPDATE
    },
    DELETE() {
      return EDIT_MODES.DELETE
    },
  },
}
