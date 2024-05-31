<script>
import GSelect from '../../atoms/inputs/GSelect.vue'
import { props } from '~/models/LeaveApplication'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'

/**
 * ## GInputLeaveApplication
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSelect,
    GTextarea,
    GAutocompleteEmployee,
    GComboboxDate,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <g-combobox-date
      :value="requestDate"
      label="申請日"
      required
      :disabled="['rejected', 'withdraw'].includes(status)"
      @input="$emit('update:requestDate', $event)"
    />
    <g-select
      :value="type"
      label="休暇種別"
      :items="$LEAVE_APPLICATION_TYPE_ARRAY"
      :disabled="['rejected', 'withdraw'].includes(status)"
      @input="$emit('update:type', $event)"
    />
    <g-autocomplete-employee
      :value="employeeId"
      label="従業員"
      required
      item-text="abbr"
      item-value="docId"
      :disabled="['rejected', 'withdraw'].includes(status)"
      @input="$emit('update:employeeId', $event)"
    />
    <g-combobox-date
      :value="dates"
      label="対象日"
      required
      multiple
      :disabled="['rejected', 'withdraw'].includes(status)"
      @input="$emit('update:dates', $event)"
    />
    <g-textarea
      :value="reason"
      label="申請事由"
      required
      :disabled="['rejected', 'withdraw'].includes(status)"
      @input="$emit('update:reason', $event)"
    />
    <g-textarea
      v-if="status === 'rejected'"
      :value="rejectReason"
      label="却下事由"
      :required="status === 'rejected'"
      @input="$emit('update:rejectReason', $event)"
    />
    <g-textarea
      v-if="status === 'withdraw'"
      :value="withdrawReason"
      label="取下事由"
      :required="status === 'withdraw'"
      @input="$emit('update:withdrawReason', $event)"
    />
  </div>
</template>

<style></style>
