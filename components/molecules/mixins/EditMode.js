/**
 * ## mixins.EditMode.js
 * データ入力用コンポーネントの編集モードを表すeditModeをpropsに定義します。
 * @author shisyamo4131
 */
export default {
  props: {
    editMode: {
      type: String,
      validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
      required: true,
    },
  },
}
