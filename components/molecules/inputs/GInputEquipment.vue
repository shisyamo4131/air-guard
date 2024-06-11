<script>
import { props } from '~/models/Equipment'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
/**
 * ### GInputEquipment
 * @author shisayamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextarea, GComboboxDate, GNumeric },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
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
    <g-combobox-date
      :value="inventoryDate"
      label="棚卸日"
      @input="$emit('update:inventoryDate', $event)"
    />
    <g-numeric
      class="right-input"
      :value="inventoryAmount"
      label="棚卸時在庫数"
      :required="!!inventoryDate"
      @input="$emit('update:inventoryAmount', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      hide-details
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
