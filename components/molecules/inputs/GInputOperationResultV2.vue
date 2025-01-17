<script>
/**
 * 稼働実績情報入力コンポーネント
 * @author shisayamo4131
 * @refact 2025-01-13
 */
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/OperationResult'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import { getDayType } from '~/utils/utility'
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
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 日付が変更された時の処理です。
     * - 自身の現場取極め情報を更新します。
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
        <!-- <v-input>
          <div class="d-flex flex-column flex-grow-1">
            <v-card outlined>
              <g-input-operation-result-details
                :disable-edit="editModel.isLocked"
                :value="editModel.workers.concat(editModel.outsourcers)"
                @changeWorker="changeWorker($event)"
                @removeWorker="removeWorker($event)"
                @changeOutsourcer="changeOutsourcer($event)"
                @removeOutsourcer="removeOutsourcer($event)"
              />
            </v-card>
            <div class="text-right mt-2">
              <g-dialog-employee-selector
                :items="selectableEmployees"
                @click:submit="addWorker"
              >
                <template #activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    :disabled="!isValidDate || noContract || editModel.isLocked"
                    small
                    color="primary"
                    v-on="on"
                    >従業員を追加</v-btn
                  >
                </template>
              </g-dialog-employee-selector>
              <g-dialog-outsourcer-selector
                :items="selectableOutsourcers"
                @click:submit="addOutsourcer"
              >
                <template #activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    :disabled="!isValidDate || noContract || editModel.isLocked"
                    small
                    color="secondary"
                    v-on="on"
                    >外注先を追加</v-btn
                  >
                </template>
              </g-dialog-outsourcer-selector>
            </div>
          </div>
        </v-input> -->
      </v-col>
    </v-row>
  </div>
</template>

<style></style>
