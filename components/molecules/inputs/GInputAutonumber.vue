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
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GNumeric, GSwitch },
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
    <g-text-field
      :value="collectionId"
      label="コレクション名"
      required
      :disabled="editMode !== 'REGIST'"
      hint="コレクション名は変更できません。"
      :persistent-hint="editMode !== 'REGIST'"
      @input="$emit('update:collectionId', $event)"
    />
    <g-numeric
      :value="current"
      label="現在値"
      required
      :decimal-places="0"
      @input="$emit('update:current', $event)"
    />
    <g-numeric
      :value="length"
      label="桁数"
      required
      @input="$emit('update:length', $event)"
    />
    <g-text-field
      :value="field"
      label="フィールド名"
      required
      @input="$emit('update:field', $event)"
    />
    <g-switch
      :input-value="status"
      :label="`状態：${status ? '有効' : '無効'}`"
      @change="$emit('update:status', $event)"
    />
  </div>
</template>

<style></style>
