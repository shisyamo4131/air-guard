<script>
/**
 * AttendanceRecordsドキュメント入力コンポーネント
 *
 * - 入力コンポーネントとして用意していますが、アプリ側から作成・更新・削除されることを想定していません。
 * - よって、コンポーネントはすべて読み取り専用です。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
import GTextField from '../../atoms/inputs/GTextField.vue'
import GCardInputForm from '../cards/GCardInputForm.vue'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import AttendanceRecord from '~/models/AttendanceRecord'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GAutocompleteEmployee, GNumeric, GCardInputForm },
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
        return instance instanceof AttendanceRecord
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new AttendanceRecord(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="月間勤怠実績"
    :edit-mode="editMode"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form ref="form" @submit.prevent>
      <g-autocomplete-employee v-model="editModel.employeeId" readonly />
      <g-text-field v-model="editModel.month" readonly />
      <g-numeric v-model="editModel.scheduledWorkingTime" readonly />
      <g-numeric v-model="editModel.statutoryOverTime" readonly />
      <g-numeric v-model="editModel.nonStatutoryOverTime" readonly />
      <g-numeric v-model="editModel.holidayWorkingTime" readonly />
      <g-numeric v-model="editModel.midnightWorkingTime" readonly />
      <g-numeric v-model="editModel.scheduledWorkingDays" readonly />
      <g-numeric v-model="editModel.statutoryWorkingDays" readonly />
      <g-numeric v-model="editModel.holidayWorkingDays" readonly />
      <g-numeric v-model="editModel.absenceDays" readonly />
      <g-numeric v-model="editModel.annualVacationDays" readonly />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
