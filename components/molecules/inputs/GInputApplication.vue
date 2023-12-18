<template>
  <v-row>
    <v-col cols="6">
      <a-date
        :value="applicationDate"
        label="申請日"
        required
        @input="$emit('update:applicationDate', $event)"
      />
      <a-select
        :value="applicationType"
        label="申請区分"
        :items="$APPLICATION_TYPE_ARRAY"
        required
        @input="$emit('update:applicationType', $event)"
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
      <a-textarea
        :value="reason"
        label="申請事由"
        required
        @input="$emit('update:reason', $event)"
      />
    </v-col>
    <v-col cols="6">
      <a-date-picker
        :value="dates"
        full-width
        multiple
        no-title
        @input="$emit('update:dates', $event)"
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
    applicationDate: { type: undefined, default: null, required: false },
    applicationType: { type: undefined, default: null, required: false },
    employeeId: { type: undefined, default: null, required: false },
    dates: { type: undefined, default: null, required: false },
    reason: { type: undefined, default: null, required: false },
    approvedDate: { type: undefined, default: null, required: false },
    approvedUid: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    rejectReason: { type: undefined, default: null, required: false },
    employees: { type: Array, default: () => [], required: false },
  },
}
</script>

<style></style>
