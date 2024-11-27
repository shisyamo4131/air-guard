<script>
/**
 * ### GInputEmployeeContract
 *
 * 従業員の雇用契約情報編集用コンポーネントです。
 *
 * @author shisayamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-10-08 - `disableStartDate` プロパティを実装。
 * ‐ version 1.1.0 - 2024-10-07 - `disableEdit` プロパティを実装。true の場合は編集・削除不可能に。
 *                              - `GDatePicker` に対する `allowedDates` プロパティを実装。
 * - version 1.0.1 - 2024-07-24 - 追加モード以外では契約日を編集不可に。
 * - version 1.0.0 - 2024-07-18 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import EmployeeContract from '~/models/EmployeeContract'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
import WorkRegulation from '~/models/WorkRegulation'
import { isValidDateFormat } from '~/utils/utility'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSelect,
    GTextarea,
    GNumeric,
    GCheckbox,
    GAutocompleteEmployee,
    GCardInputForm,
    GDialogDatePicker,
    GDate,
    GAutocomplete,
    GSwitch,
    GCheckboxDeleteData,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    allowedDates: { type: Function, default: null, required: false },
    disableEdit: { type: Boolean, default: false, required: false },
    disableStartDate: { type: Boolean, default: false, required: false },
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof EmployeeContract
      },
    },
    hideEmployee: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new EmployeeContract(),
      workRegulations: [],
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'editModel.startDate': {
      async handler(v) {
        if (!v || !isValidDateFormat(v)) return
        const year = v.slice(0, 4)
        this.workRegulations = await new WorkRegulation().fetchDocs([
          ['where', 'year', '>=', year],
        ])
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="雇用契約情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-alert v-if="disableEdit" type="info" dense text>
      新しい雇用契約が登録されているため、編集・削除できません。
    </v-alert>
    <v-form :disabled="disableEdit" @submit.prevent>
      <g-autocomplete-employee
        v-if="!hideEmployee"
        v-model="editModel.employeeId"
        label="従業員"
        required
        :disabled="editMode !== CREATE"
      />
      <v-row dense>
        <v-col cols="12" md="3">
          <g-dialog-date-picker
            v-model="editModel.startDate"
            :allowed-dates="allowedDates"
          >
            <template #activator="{ attrs, on }">
              <g-date
                class="center-input"
                v-bind="attrs"
                label="契約日"
                required
                :disabled="editMode !== CREATE || disableStartDate"
                v-on="on"
              />
            </template>
          </g-dialog-date-picker>
        </v-col>
        <v-col cols="12" md="9">
          <g-checkbox
            v-model="editModel.hasPeriod"
            class="mt-1"
            label="期間の定め"
          />
        </v-col>
        <v-col cols="12" md="3">
          <g-dialog-date-picker v-model="editModel.expiredDate">
            <template #activator="{ attrs, on }">
              <g-date
                class="center-input"
                v-bind="attrs"
                label="契約満了日"
                :required="editModel.hasPeriod"
                :disabled="!editModel.hasPeriod"
                v-on="on"
              />
            </template>
          </g-dialog-date-picker>
        </v-col>
        <v-col cols="12" md="9">
          <g-autocomplete
            v-model="editModel.workRegulation"
            label="就業規則"
            :items="workRegulations"
            item-key="docId"
            :item-text="(item) => `${item.name}(${item.year})`"
            required
            return-object
            attach
          />
        </v-col>
        <v-col cols="12" md="3">
          <g-select
            v-model="editModel.paymentType"
            label="支給形態"
            :items="[
              { text: '月給', value: 'monthly' },
              { text: '日給', value: 'daily' },
            ]"
            required
            attach
          />
        </v-col>
        <v-col cols="12" md="9">
          <g-numeric
            v-model="editModel.basicWage"
            class="center-input"
            label="基本給"
            required
            suffix="円"
          />
        </v-col>
        <v-col cols="12">
          <g-switch
            v-model="editModel.providesTransportationAllowance"
            class="mt-1"
            :label="`交通費: ${
              editModel.providesTransportationAllowance
                ? '支給する'
                : '支給しない'
            }`"
          />
        </v-col>
      </v-row>
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data
      v-if="editMode !== CREATE"
      v-model="forceDelete"
      :disabled="disableEdit"
    />
  </g-card-input-form>
</template>

<style></style>
