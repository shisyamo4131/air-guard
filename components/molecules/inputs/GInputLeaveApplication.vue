<script>
/**
 * 従業員の休暇申請を入力するためのコンポーネントです。
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import LeaveApplication from '~/models/LeaveApplication'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GComboboxDate,
    GCardInputForm,
    GAutocompleteEmployee,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof LeaveApplication
      },
    },
    hideDate: { type: Boolean, default: false, required: false },
    hideEmployee: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    date: {
      get() {
        return this.editMode === this.CREATE
          ? this.editModel.dates
          : this.editModel.date
      },
      set(v) {
        if (this.editMode === this.CREATE) {
          this.editModel.dates = v
        } else {
          this.editModel.date = v
        }
      },
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="従業員休暇申請編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <g-autocomplete-employee
      v-if="!hideEmployee"
      v-model="editModel.employeeId"
      required
      :disabled="editMode !== CREATE"
    />
    <g-combobox-date
      v-if="!hideDate"
      v-model="date"
      label="日付"
      :multiple="editMode === CREATE"
      required
      :disabled="editMode !== CREATE"
    />
    <g-textarea v-model="editModel.remarks" label="備考" required />
  </g-card-input-form>
</template>

<style></style>
