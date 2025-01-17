<script>
/**
 * AutonumberモデルのINPUTコンポーネント。
 * AutonumberドキュメントのdocIdはコレクション名です。
 * よって、一度登録されたドキュメントのコレクション名は変更できません。
 * 運用として、コレクション名を変更する必要が生じた場合は削除⇒作成します。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Autonumber'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GNumeric, GSwitch },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,
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
      :disabled="!isCreate"
      hint="コレクション名は変更できません。"
      :persistent-hint="!isCreate"
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
