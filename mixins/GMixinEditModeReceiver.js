import { EDIT_MODES } from '~/utils/EDIT_MODES'

/**
 * コンポーネントが editMode, loading を受け付けるようにするミックスインです。
 * - 編集モードを示す props.editMode が実装されます。必須で受け付けます。
 * - 通信中であることを示す props.loading が実装されます。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    editMode: {
      type: String,
      validator: (v) => ['CREATE', 'UPDATE', 'DELETE'].includes(v),
      required: true,
    },
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
