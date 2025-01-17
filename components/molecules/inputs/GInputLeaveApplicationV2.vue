<script>
/**
 * 従業員の休暇申請を入力するためのコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/LeaveApplication'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GComboboxDate,
    GAutocompleteEmployee,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,
    hideDate: { type: Boolean, default: false, required: false },
    hideEmployee: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    date: {
      get() {
        return this.isCreate ? this.dates : this.date
      },
      set(v) {
        if (this.isCreate) {
          this.dates = v
        } else {
          this.date = v
        }
      },
    },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-employee
      v-if="!hideEmployee"
      :value="employeeId"
      required
      :disabled="!isCreate"
      @input="$emit('update:employeeId', $event)"
    />
    <g-combobox-date
      v-if="!hideDate"
      v-model="date"
      label="日付"
      :multiple="isCreate"
      required
      :disabled="!isCreate"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      required
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
