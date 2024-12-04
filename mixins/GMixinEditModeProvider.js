import { EDIT_MODES } from '~/utils/EDIT_MODES'

/**
 * GMixinEditModeProvider
 *
 * コンポーネントに`data.editMode`を実装するためのミックスインです。
 *
 * @constant {String} CREATE - 新規作成モード。
 * @constant {String} UPDATE - 更新モード。
 * @constant {String} DELETE - 削除モード。
 *
 * @version 1.0.0
 * @creator shisyamo4131
 * @updates
 * - version 1.0.0 - 初版作成
 */
export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editMode: EDIT_MODES.CREATE,
    }
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
