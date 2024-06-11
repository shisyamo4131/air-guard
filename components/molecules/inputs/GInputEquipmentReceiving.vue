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
    <g-combobox-date
      :value="date"
      label="入庫日"
      @input="$emit('update:date', $event)"
    />
    <div v-for="(item, index) of items" :key="index">
      <g-text-field />
      <g-numeric />
    </div>
    <g-textarea
      :value="remarks"
      label="備考"
      hide-details
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
