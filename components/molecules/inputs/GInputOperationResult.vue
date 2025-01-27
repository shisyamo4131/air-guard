<script>
/**
 * 稼働実績情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-01-13
 */
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GDialogEmployeeSelector from '../dialogs/GDialogEmployeeSelector.vue'
import GDialogOutsourcerSelector from '../dialogs/GDialogOutsourcerSelector.vue'
import GInputOperationResultWorker from './GInputOperationResultWorker.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/OperationResult'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import { getDayType } from '~/utils/utility'
import OperationResultWorker from '~/models/OperationResultWorker'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import OperationResult from '~/models/OperationResult'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GAutocompleteSite,
    GDialogDatePicker,
    GSelect,
    GDate,
    GDialogEmployeeSelector,
    GInputOperationResultWorker,
    GBtnRegist,
    GDialogOutsourcerSelector,
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
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      schema: {
        worker: new OperationResultWorker(),
        outsourcer: new OperationResultOutsourcer(),
      },
    }
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 日付が変更された時の処理です。
     * - 曜日区分を更新します。
     */
    async onDateChanged(event) {
      if (!event) return
      const dayType = getDayType(event)
      if (dayType === 'weekdays') {
        const isHoliday = await this.$holiday.isHoliday(event)
        if (isHoliday) {
          this.$emit('update:dayDiv', 'holiday')
          return
        }
      }
      this.$emit('update:dayDiv', dayType)
    },
    workerHandleUpdate(item) {
      const instance = new OperationResult(this.$props)
      instance.changeWorker(item)
      this.$emit('update:workers', [...instance.workers])
      return Promise.resolve()
    },
    workerHandleDelete(item) {
      const instance = new OperationResult(this.$props)
      instance.removeWorker(item)
      this.$emit('update:workers', [...instance.workers])
      return Promise.resolve()
    },
    outsourcerHandleUpdate(item) {
      const instance = new OperationResult(this.$props)
      instance.changeWorker(item)
      this.$emit('update:outsourcers', [...instance.outsourcers])
      return Promise.resolve()
    },
    outsourcerHandleDelete(item) {
      const instance = new OperationResult(this.$props)
      instance.removeWorker(item)
      this.$emit('update:outsourcers', [...instance.outsourcers])
      return Promise.resolve()
    },
    onEmployeesSelected(items) {
      try {
        const instance = new OperationResult(this.$props)
        for (const item of items) {
          instance.addWorker({ employeeId: item.docId })
        }
        this.$emit('update:workers', [...instance.workers])
        return Promise.resolve()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },
    onOutsourcersSelected(items) {
      try {
        const instance = new OperationResult(this.$props)
        for (const item of items) {
          instance.addOutsourcer({ outsourcerId: item.docId })
        }
        this.$emit('update:outsourcers', [...instance.outsourcers])
        return Promise.resolve()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <g-text-field
          :value="code"
          label="CODE"
          disabled
          @input="$emit('update:code', $event)"
        />
        <g-autocomplete-site
          :value="siteId"
          required
          @input="$emit('update:siteId', $event)"
        />
        <g-dialog-date-picker
          :value="date"
          @input="$emit('update:date', $event)"
          @change="onDateChanged"
        >
          <template #activator="{ attrs, on }">
            <g-date v-bind="attrs" label="日付" required v-on="on" />
          </template>
        </g-dialog-date-picker>
        <v-row dense>
          <v-col cols="6" sm="12">
            <g-select
              :value="dayDiv"
              label="曜日区分"
              :items="$DAY_DIV_ARRAY"
              required
              @input="$emit('update:dayDiv', $event)"
            />
          </v-col>
          <v-col cols="6" sm="12">
            <g-select
              :value="workShift"
              label="勤務区分"
              :items="$WORK_SHIFT_ARRAY"
              required
              @input="$emit('update:workShift', $event)"
            />
          </v-col>
        </v-row>
        <g-textarea
          :value="remarks"
          label="備考"
          @input="$emit('update:remarks', $event)"
        />
      </v-col>
      <v-col cols="12" sm="8">
        <v-alert v-show="isLocked" type="info" dense text>
          ロックされているため、更新・削除できません。
        </v-alert>
        <air-array-manager
          :dialog-props="{ maxWidth: 480 }"
          event-edit="click:row"
          :handle-update="workerHandleUpdate"
          :handle-delete="workerHandleDelete"
          item-key="id"
          :items="workers"
          :schema="schema.worker"
        >
          <template #default="{ table }">
            <v-card outlined>
              <v-toolbar dense flat>
                <v-toolbar-title>従業員</v-toolbar-title>
                <v-spacer />
                <g-dialog-employee-selector
                  :items="$store.getters['employees/items']"
                  @click:submit="onEmployeesSelected"
                >
                  <template #activator="{ attrs, on }">
                    <g-btn-regist v-bind="attrs" icon v-on="on" />
                  </template>
                </g-dialog-employee-selector>
              </v-toolbar>
              <v-container fluid>
                <v-data-table
                  v-bind="table.attrs"
                  :headers="[
                    { text: '従業員', value: 'employeeId' },
                    { text: '勤務日', value: 'date' },
                    { text: '開始時刻', value: 'startTime' },
                    { text: '終了時刻', value: 'endTime' },
                    { text: '休憩時間', value: 'breakMinutes' },
                  ]"
                  hide-default-footer
                  :items-per-page="-1"
                  v-on="table.on"
                >
                  <template #[`item.employeeId`]="{ item }">
                    {{
                      $store.getters['employees/get'](item.employeeId)
                        ?.fullName || 'N/A'
                    }}
                  </template>
                </v-data-table>
              </v-container>
            </v-card>
          </template>
          <template #inputs="{ attrs, on }">
            <g-input-operation-result-worker v-bind="attrs" v-on="on" />
          </template>
        </air-array-manager>
        <air-array-manager
          :dialog-props="{ maxWidth: 480 }"
          event-edit="click:row"
          :handle-update="outsourcerHandleUpdate"
          :handle-delete="outsourcerHandleDelete"
          item-key="id"
          :items="outsourcers"
          :schema="schema.outsourcer"
        >
          <template #default="{ table }">
            <v-card outlined>
              <v-toolbar dense flat>
                <v-toolbar-title>外注先</v-toolbar-title>
                <v-spacer />
                <g-dialog-outsourcer-selector
                  :items="$store.getters['outsourcers/items']"
                  @click:submit="onOutsourcersSelected"
                >
                  <template #activator="{ attrs, on }">
                    <g-btn-regist v-bind="attrs" icon v-on="on" />
                  </template>
                </g-dialog-outsourcer-selector>
              </v-toolbar>
              <v-container fluid>
                <v-data-table
                  v-bind="table.attrs"
                  :headers="[
                    { text: '外注先', value: 'outsourcerId' },
                    { text: '勤務日', value: 'date' },
                    { text: '開始時刻', value: 'startTime' },
                    { text: '終了時刻', value: 'endTime' },
                    { text: '休憩時間', value: 'breakMinutes' },
                  ]"
                  hide-default-footer
                  :items-per-page="-1"
                  v-on="table.on"
                >
                  <template #[`item.outsourcerId`]="{ item }">
                    {{
                      $store.getters['outsourcers/get'](item.outsourcerId)
                        ?.abbr || 'N/A'
                    }}
                  </template>
                </v-data-table>
              </v-container>
            </v-card>
          </template>
          <template #inputs="{ attrs, on }">
            <g-input-operation-result-worker v-bind="attrs" v-on="on" />
          </template>
        </air-array-manager>
      </v-col>
    </v-row>
  </div>
</template>

<style></style>
