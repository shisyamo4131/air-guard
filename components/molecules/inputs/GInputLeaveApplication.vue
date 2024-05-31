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
      @input="$emit('update:requestDate', $event)"
    />
    <g-select
      :value="type"
      label="休暇種別"
      :items="$LEAVE_APPLICATION_TYPE_ARRAY"
      @input="$emit('update:type', $event)"
    />
    <g-autocomplete-employee
      :value="employeeId"
      label="従業員"
      required
      item-text="abbr"
      item-value="docId"
      @input="$emit('update:employeeId', $event)"
    />
    <g-combobox-date
      :value="dates"
      label="対象日"
      required
      multiple
      @input="$emit('update:dates', $event)"
    />
    <g-textarea
      :value="reason"
      label="申請事由"
      required
      @input="$emit('update:reason', $event)"
    />
    <g-select
      :value="status"
      label="状態"
      :items="$LEAVE_APPLICATION_STATUS_ARRAY"
      attach
      @input="$emit('update:status', $event)"
    />
    <v-expand-transition>
      <g-combobox-date
        v-show="status !== 'unapproved'"
        :value="settlementDate"
        label="決済日"
        :required="status !== 'unapproved'"
        @input="$emit('update:settlementDate', $event)"
      />
    </v-expand-transition>
    <v-expand-transition>
      <g-textarea
        v-show="status === 'reject'"
        :value="rejectReason"
        label="否決事由"
        :required="status === 'reject'"
        @input="$emit('update:rejectReason', $event)"
      />
    </v-expand-transition>
  </div>
</template>

<style></style>
