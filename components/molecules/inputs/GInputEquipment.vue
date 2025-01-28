<script>
/**
 * 制服装備品情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-01-28
 */
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Equipment'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextarea },

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
    <g-text-field
      :value="name"
      label="名称"
      required
      @input="$emit('update:name', $event)"
    />
    <g-text-field
      :value="code"
      label="商品コード"
      @input="$emit('update:code', $event)"
    />
    <g-text-field
      :value="colorSize"
      label="色・サイズ"
      @input="$emit('update:colorSize', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
