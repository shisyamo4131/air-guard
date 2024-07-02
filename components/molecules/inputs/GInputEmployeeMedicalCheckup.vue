<script>
/**
 * ### GInputEmployeeMedicalCheckup
 *
 * 概要:
 * 従業員の健康診断結果を編集するためのInputコンポーネントです。
 *
 * @author shisayamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import { props } from '~/models/EmployeeMedicalCheckup'
import EditMode from '~/components/mixins/GMixinEditMode'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSelect, GTextarea, GComboboxDate, GNumeric },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <g-combobox-date
      :value="employeeId"
      label="受診日"
      required
      @input="$emit('update:employeeId', $event)"
    />
    <g-select
      :value="type"
      label="申請区分"
      :items="['entry', 'regular']"
      required
      @input="$emit('update:type', $event)"
    />
    <g-numeric
      :value="bloodPressure.top"
      label="血圧（上）"
      required
      @input="$emit('update:bloodPressure-top', $event)"
    />
    <g-numeric
      :value="bloodPressure.bottom"
      label="血圧（下）"
      required
      @input="$emit('update:bloodPressure-bottom', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
