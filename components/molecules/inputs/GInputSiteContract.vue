<script>
/**
 * 現場取極め情報入力コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-27
 */
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import { UnitPrices, vueProps } from '~/models/SiteContract'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import GDate from '~/components/atoms/inputs/GDate.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GNumeric,
    GSwitch,
    GAutocompleteSite,
    GDialogDatePicker,
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
    allowedDates: { type: Function, default: null, required: false },
    hideSite: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dayDivs: [
        { text: '平日', value: 'weekdays' },
        { text: '土曜', value: 'saturday' },
        { text: '日曜', value: 'sunday' },
        { text: '祝日', value: 'holiday' },
      ],
      nums: [
        { text: '基本単価', value: 'price' },
        { text: '残業単価', value: 'overtime' },
      ],
      qualifies: [
        { text: '通常', value: 'standard' },
        { text: '資格者', value: 'qualified' },
      ],
      workShifts: [
        { text: '日勤', value: 'day' },
        { text: '夜勤', value: 'night' },
      ],
      tab: null,
    }
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    afterInitialize() {
      this.tab = null
    },
    updateUnitPrices(val, path) {
      const keys = path.split('.')
      const obj = new UnitPrices(this.unitPrices)
      let ref = obj
      keys.slice(0, -1).forEach((key) => {
        ref = ref[key]
      })
      ref[keys[keys.length - 1]] = val
      this.$emit('update:unitPrices', obj)
    },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-site
      v-if="!hideSite"
      :value="siteId"
      required
      :disabled="editMode !== CREATE"
      @input="$emit('update:siteId', $event)"
    />
    <v-row dense>
      <v-col cols="12" md="6">
        <g-dialog-date-picker
          :value="startDate"
          :allowed-dates="allowedDates"
          @input="$emit('update:startDate', $event)"
        >
          <template #activator="{ attrs, on }">
            <g-date
              class="center-input"
              v-bind="attrs"
              label="開始日"
              required
              :disabled="editMode !== CREATE"
              v-on="on"
            />
          </template>
        </g-dialog-date-picker>
      </v-col>
      <v-col cols="12" md="6">
        <v-radio-group
          :value="workShift"
          class="mt-1 mb-2"
          row
          :disabled="editMode !== CREATE"
          @change="$emit('update:workShift', $event)"
        >
          <v-radio label="日勤" value="day" />
          <v-radio label="夜勤" value="night" />
        </v-radio-group>
      </v-col>
      <v-col cols="6">
        <g-text-field
          :value="startTime"
          class="center-input"
          label="開始時刻"
          required
          input-type="time"
          @input="$emit('update:startTime', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-text-field
          :value="endTime"
          class="center-input"
          label="終了時刻"
          required
          input-type="time"
          @input="$emit('update:endTime', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-switch
          :input-value="endAtNextday"
          class="mt-1"
          label="翌日終了"
          required
          @change="$emit('update:endAtNextday', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-numeric
          :value="breakMinutes"
          class="center-input"
          label="休憩時間"
          required
          suffix="分"
          @input="$emit('update:breakMinutes', $event)"
        />
      </v-col>
    </v-row>
    <v-card class="mb-6" outlined>
      <v-tabs v-model="tab" center-active grow show-arrows>
        <v-tab v-for="dayDiv of dayDivs" :key="dayDiv.value">
          {{ dayDiv.text }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="dayDiv of dayDivs" :key="dayDiv.value" eager>
          <v-card-text>
            <template v-for="qualified of qualifies">
              <v-subheader :key="`header-${qualified.value}`">
                {{ qualified.text }}
              </v-subheader>
              <v-row :key="`row-${qualified.value}`" dense>
                <template v-for="num of nums">
                  <v-col
                    :key="`${dayDiv.value}-${qualified.value}-${num.value}`"
                    cols="6"
                  >
                    <g-numeric
                      :value="
                        unitPrices[dayDiv.value][qualified.value][num.value]
                      "
                      class="right-input"
                      :label="`${num.text}`"
                      required
                      suffix="円"
                      @input="
                        updateUnitPrices(
                          $event,
                          `${dayDiv.value}.${qualified.value}.${num.value}`
                        )
                      "
                    />
                  </v-col>
                </template>
              </v-row>
            </template>
          </v-card-text>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-row dense>
      <v-col cols="6">
        <g-numeric
          :value="halfRate"
          class="right-input"
          label="半勤請求割合"
          required
          suffix="%"
          @input="$emit('update:halfRate', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-numeric
          :value="cancelRate"
          class="right-input"
          label="中止請求割合"
          required
          suffix="%"
          @input="$emit('update:cancelRate', $event)"
        />
      </v-col>
    </v-row>
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
