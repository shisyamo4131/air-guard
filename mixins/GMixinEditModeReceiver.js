/**
 * コンポーネントが editMode を受け付けるようにするミックスインです。
 * - 編集モードを示す props.editMode が実装されます。必須で受け付けます。
 * - このミックスインを利用するコンポーネントでは、computedEditMode を利用することで
 *   親コンポーネントが editMode に .sync 修飾子を使用することが可能になります。
 *
 * @author shisyamo4131
 * @refact 2025-02-01
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

    isCreate: { type: Boolean, default: false, required: false },
    isUpdate: { type: Boolean, default: false, required: false },
    isDelete: { type: Boolean, default: false, required: false },
    isEditing: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * コンポーネント内部で管理する editMode です。
       */
      internalEditMode: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * data.interanalEditMode の値を返します。
     * このプロパティに値をセットすると、新しい値をペイロードとして
     * `update:editMode` イベント を emit します。
     * 当該ミックスインを利用するコンポーネントにおいて editMode の参照を
     * このプロパティにすることで、親コンポーネントが editMode に .sync 修飾子を
     * 利用可能になります。
     */
    computedEditMode: {
      get() {
        return this.internalEditMode
      },
      set(v) {
        this.internalEditMode = v
        this.$emit('update:editMode', v)
      },
    },

    CREATE() {
      return 'CREATE'
    },
    UPDATE() {
      return 'UPDATE'
    },
    DELETE() {
      return 'DELETE'
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.editMode を監視し、data.internalEditMode と同期します。
     */
    editMode: {
      handler(v) {
        this.internalEditMode = v
      },
      immediate: true,
    },
  },
}
