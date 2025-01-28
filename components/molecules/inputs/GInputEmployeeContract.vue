<script>
/**
 * 従業員の雇用契約情報編集用コンポーネントです。
 * @author shisayamo4131
 * @refact 2025-01-28
 */
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GCardWorkRegulation from '../cards/GCardWorkRegulation.vue'
import GInputEmployeeAllowance from './GInputEmployeeAllowance.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GAutocompleteEmployee from '~/components/molecules/inputs/GAutocompleteEmployee.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GAutocomplete from '~/components/atoms/inputs/GAutocomplete.vue'
import { WorkRegulationMinimal } from '~/models/WorkRegulation'
import { isValidDateFormat } from '~/utils/utility'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GAutocompletePaymentType from '~/components/atoms/inputs/GAutocompletePaymentType.vue'
import { vueProps } from '~/models/propsDefinition/EmployeeContract'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import EmployeeAllowance from '~/models/EmployeeAllowance'
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
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
    GDialogDatePicker,
    GDate,
    GAutocomplete,
    GSwitch,
    GCardWorkRegulation,
    GAutocompletePaymentType,
    AirArrayManager,
    GBtnRegist,
    GInputEmployeeAllowance,
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
    allowedDates: { type: Function, default: null, required: false },
    disableEdit: { type: Boolean, default: false, required: false },
    disableStartDate: { type: Boolean, default: false, required: false },
    hideEmployee: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 曜日を日本語に直すためのオブジェクトです。
       */
      dayOfWeek: {
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金',
        sat: '土',
        sun: '日',
      },

      schema: new EmployeeAllowance(),

      /**
       * 就業規則の表示切替です。
       */
      showWorkRegulation: false,

      /**
       * 選択可能な就業規則ドキュメントの配列です。
       */
      workRegulations: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * data.workRegulations のうち、現在選択されている就業規則ドキュメントを返します。
     */
    selectedWorkRegulation() {
      return this.workRegulations.find(
        ({ docId }) => docId === this.workRegulationId
      )
    },

    /**
     * 現在選択されている就業規則ドキュメントから求められる週所定労働時間を返します。
     */
    scheduledWorkHoursPerWeek() {
      if (!this.selectedWorkRegulation) return 0
      return this.selectedWorkRegulation.scheduledWorkHoursPerWeek
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * props.startDate を監視します。
     * - 契約開始日を基準に選択可能な就業規則ドキュメントを取得して data.workRegulations にセットします。
     */
    startDate: {
      async handler(v) {
        if (!v || !isValidDateFormat(v)) return
        const year = v.slice(0, 4)
        this.workRegulations = await new WorkRegulationMinimal().fetchDocs([
          ['where', 'year', '>=', year],
        ])
      },
      immediate: true,
    },
  },
}
</script>

<template>
  <div>
    <v-alert v-if="disableEdit" type="info" dense text>
      新しい雇用契約が登録されているため、編集・削除できません。
    </v-alert>
    <g-autocomplete-employee
      v-if="!hideEmployee"
      :value="employeeId"
      label="従業員"
      required
      :disabled="editMode !== CREATE"
      @input="$emit('update:employeeId', $event)"
    />
    <v-row dense>
      <v-col cols="12" sm="4">
        <g-dialog-date-picker
          :value="startDate"
          :allowed-dates="allowedDates"
          @input="$emit('update:startDate', $event)"
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
      <v-col cols="12" sm="4">
        <g-checkbox
          :input-value="hasPeriod"
          class="mt-1"
          label="期間の定め"
          @change="$emit('update:hasPeriod', $event)"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <g-dialog-date-picker
          :value="expiredDate"
          @input="$emit('update:expiredDate', $event)"
        >
          <template #activator="{ attrs, on }">
            <g-date
              class="center-input"
              v-bind="attrs"
              label="契約満了日"
              :required="hasPeriod"
              :disabled="!hasPeriod"
              v-on="on"
            />
          </template>
        </g-dialog-date-picker>
      </v-col>
      <v-col cols="12" sm="4">
        <g-select
          :value="contractType"
          label="雇用形態"
          :items="$CONTRACT_TYPE_ARRAY"
          required
          attach
          @input="$emit('update:contractType', $event)"
        />
      </v-col>
      <v-col cols="12" sm="8">
        <g-autocomplete
          :value="workRegulationId"
          label="就業規則"
          attach
          :items="workRegulations"
          :item-text="(item) => `${item.name}(${item.year})`"
          item-value="docId"
          required
          @input="$emit('update:workRegulationId', $event)"
        />
      </v-col>
    </v-row>
    <div class="text-right mb-6">
      <v-btn
        color="primary"
        :disabled="!workRegulationId"
        outlined
        x-small
        @click="showWorkRegulation = !showWorkRegulation"
      >
        {{ `就業規則の詳細を${showWorkRegulation ? '閉じる' : '開く'}` }}
      </v-btn>
    </div>

    <!-- 就業規則カード -->
    <v-expand-transition>
      <g-card-work-regulation
        v-show="showWorkRegulation"
        class="mb-8"
        disable-edit
        outlined
        :doc-id="workRegulationId"
      />
    </v-expand-transition>

    <v-row dense>
      <v-col cols="12" sm="4">
        <g-autocomplete-payment-type
          :value="paymentType"
          required
          attach
          @input="$emit('update:paymentType', $event)"
        />
      </v-col>
      <v-col cols="12" sm="8">
        <g-numeric
          :value="basicWage"
          class="center-input"
          label="基本給"
          required
          suffix="円"
          @input="$emit('update:basicWage', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-switch
          :input-value="providesTransportationAllowance"
          class="mt-1"
          :label="`交通費: ${
            providesTransportationAllowance ? '支給する' : '支給しない'
          }`"
          @change="$emit('update:providesTransportationAllowance', $event)"
        />
      </v-col>
    </v-row>
    <v-card class="mb-8" outlined>
      <v-toolbar dense flat>
        <v-toolbar-title class="text-subtitle-1">社会保険</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="py-0">
        <v-row dense>
          <v-col cols="12" sm="4">
            <g-checkbox
              :input-value="isHealthInsuranceRequired"
              label="健康保険加入"
              @change="$emit('update:isHealthInsuranceRequired', $event)"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <g-checkbox
              :input-value="isPensionRequired"
              label="厚生年金加入"
              @change="$emit('update:isPensionRequired', $event)"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <g-checkbox
              :input-value="isEmploymentInsuranceRequired"
              label="雇用保険加入"
              @change="$emit('update:isEmploymentInsuranceRequired', $event)"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- 支給手当 -->
    <air-array-manager
      :dialog-props="{ maxWidth: 360 }"
      event-edit="click:row"
      :items="allowances"
      :schema="schema"
      label="支給手当"
      @input="$emit('update:allowances', $event)"
    >
      <template #default="{ activator, table }">
        <v-card outlined class="mb-8">
          <v-toolbar dense flat>
            <v-toolbar-title class="text-subtitle-1">支給手当</v-toolbar-title>
            <v-spacer />
            <g-btn-regist
              icon
              v-bind="activator.attrs"
              color="primary"
              v-on="activator.on"
            />
          </v-toolbar>
          <v-card-text class="pt-0">
            <v-data-table
              v-bind="table.attrs"
              :headers="[
                { text: '手当名', value: 'docId' },
                { text: '金額', value: 'amount' },
              ]"
              hide-default-footer
              :items="allowances"
              :items-per-page="-1"
              v-on="table.on"
            >
              <template #[`item.docId`]="{ item }">
                {{
                  $store.getters['allowances/get'](item.docId)?.name || 'N/A'
                }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </template>
      <template #inputs="{ attrs, on }">
        <g-input-employee-allowance v-bind="attrs" v-on="on" />
      </template>
    </air-array-manager>

    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
