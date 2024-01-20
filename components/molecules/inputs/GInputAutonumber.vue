<script>
/**
 * ### GInputAutonumber
 * AutonumberモデルのINPUTコンポーネント。
 *
 * AutonumberドキュメントのdocIdはコレクション名です。
 * よって、一度登録されたドキュメントのコレクション名は変更できません。
 * 運用として、コレクション名を変更する必要が生じた場合は削除⇒作成します。
 *
 * @author shisyamo4131
 */
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import ANumeric from '~/components/atoms/inputs/ANumeric.vue'
import ASwitch from '~/components/atoms/inputs/ASwitch.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField, ANumeric, ASwitch },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    editMode: {
      type: String,
      default: 'REGIST',
      validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
      required: false,
    },
    collectionId: { type: String, default: '', required: false },
    current: { type: Number, default: null, required: false },
    length: { type: Number, default: null, required: false },
    field: { type: String, default: '', required: false },
    status: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div>
    <!-- 追加モード時以外は編集不可 -->
    <a-text-field
      :value="collectionId"
      label="コレクション名"
      required
      :disabled="editMode !== 'REGIST'"
      hint="コレクション名は変更できません。"
      :persistent-hint="editMode !== 'REGIST'"
      @input="$emit('update:collectionId', $event)"
    />
    <a-numeric
      :value="current"
      label="現在値"
      required
      :decimal-places="0"
      @input="$emit('update:current', $event)"
    />
    <a-numeric
      :value="length"
      label="桁数"
      required
      @input="$emit('update:length', $event)"
    />
    <a-text-field
      :value="field"
      label="フィールド名"
      required
      @input="$emit('update:field', $event)"
    />
    <a-switch
      :input-value="status"
      :label="`状態：${status ? '有効' : '無効'}`"
      @change="$emit('update:status', $event)"
    />
  </div>
</template>

<style></style>
