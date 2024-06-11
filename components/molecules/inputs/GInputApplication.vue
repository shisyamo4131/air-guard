<script>
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
/**
 * ### GInputApplication
 * @author shisayamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDate, GSelect, GTextarea, GDatePicker },
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
    requestDate: { type: undefined, default: null, required: false },
    type: { type: undefined, default: null, required: false },
    employeeId: { type: undefined, default: null, required: false },
    date: { type: undefined, default: null, required: false },
    reason: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    settlementDate: { type: undefined, default: null, required: false },
    settlementUid: { type: undefined, default: null, required: false },
    rejectReason: { type: undefined, default: null, required: false },
    employees: { type: Array, default: () => [], required: false },
  },
}
</script>

<template>
  <v-row>
    <v-col cols="6">
      <g-date
        :value="requestDate"
        label="申請日"
        required
        @input="$emit('update:requestDate', $event)"
      />
      <g-select
        :value="type"
        label="申請区分"
        :items="$LEAVE_APPLICATION_TYPE_ARRAY"
        required
        @input="$emit('update:type', $event)"
      />
      <g-select
        :value="employeeId"
        label="申請者"
        :items="employees"
        item-text="abbr"
        item-value="docId"
        required
        @input="$emit('update:employeeId', $event)"
      />
      <g-date
        :value="date"
        label="対象日"
        required
        @input="$emit('update:date', $event)"
      />
      <g-textarea
        :value="reason"
        label="申請事由"
        required
        @input="$emit('update:reason', $event)"
      />
    </v-col>
    <v-col cols="6">
      <g-date-picker
        :value="date"
        :disabled="editMode === 'DELETE'"
        full-width
        no-title
        @input="$emit('update:date', $event)"
      />
    </v-col>
  </v-row>
</template>

<style></style>
