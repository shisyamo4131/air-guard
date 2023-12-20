<template>
  <v-row>
    <v-col :cols="editMode === 'REGIST' ? 6 : 12">
      <a-date
        :value="requestDate"
        label="申請日"
        required
        @input="$emit('update:requestDate', $event)"
      />
      <a-select
        :value="type"
        label="申請区分"
        :items="$LEAVE_APPLICATION_TYPE_ARRAY"
        required
        @input="$emit('update:type', $event)"
      />
      <a-select
        :value="employeeId"
        label="申請者"
        :items="employees"
        item-text="abbr"
        item-value="docId"
        required
        @input="$emit('update:employeeId', $event)"
      />
      <a-date
        v-if="editMode !== 'REGIST'"
        :value="requestDate"
        label="対象日"
        required
        @input="$emit('update:date', $event)"
      />
      <a-textarea
        :value="reason"
        label="申請事由"
        required
        @input="$emit('update:reason', $event)"
      />
    </v-col>
    <v-col v-if="editMode === 'REGIST'" cols="6">
      <a-date-picker
        :value="selectedDates"
        full-width
        multiple
        no-title
        @input="$emit('update:selectedDates', $event)"
      />
    </v-col>
  </v-row>
</template>

<script>
import ADate from '~/components/atoms/inputs/ADate.vue'
import ASelect from '~/components/atoms/inputs/ASelect.vue'
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
import ADatePicker from '~/components/atoms/pickers/ADatePicker.vue'
export default {
  components: { ADate, ASelect, ATextarea, ADatePicker },
  props: {
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
    selectedDates: { type: Array, default: () => [], required: false },
    editMode: {
      type: String,
      default: 'REGIST',
      validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
      required: false,
    },
  },
}
</script>

<style></style>
