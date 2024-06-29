<script>
/**
 * ### GInputSiteContract
 *
 * @author shisyamo4131
 * @create 2024-06-29
 * @version 1.0.0
 *
 */
import { props } from '~/models/SiteContract'
import EditMode from '~/components/mixins/GMixinEditMode'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GTextarea, GComboboxDate, GNumeric, GSwitch },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
  props: {
    allowedDates: { type: Function, default: null, required: false },
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
}
</script>

<template>
  <div>
    <g-combobox-date
      :value="startDate"
      :allowed-dates="allowedDates"
      label="開始日"
      required
      :disabled="editMode !== 'REGIST'"
      @input="$emit('update:startDate', $event)"
    />
    <v-tabs v-model="tab" grow>
      <v-tab v-for="workShift of workShifts" :key="workShift.value">{{
        workShift.text
      }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="workShift of workShifts" :key="workShift.value" eager>
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <g-text-field
                class="center-input"
                :value="$props[workShift.value].startAt"
                label="開始時刻"
                required
                input-type="time"
                @input="$emit(`update:${workShift.value}-startAt`, $event)"
              />
            </v-col>
            <v-col cols="6">
              <g-text-field
                class="center-input"
                :value="$props[workShift.value].endAt"
                label="終了時刻"
                required
                input-type="time"
                @input="$emit(`update:${workShift.value}-endAt`, $event)"
              />
            </v-col>
            <v-col cols="6">
              <g-switch
                class="mt-1"
                :input-value="$props[workShift.value].endAtNextday"
                label="翌日終了"
                required
                @change="
                  $emit(`update:${workShift.value}-endAtNextday`, $event)
                "
              />
            </v-col>
            <v-col cols="6">
              <g-numeric
                class="center-input"
                :value="$props[workShift.value].breakTime"
                label="休憩時間"
                required
                suffix="分"
                @input="$emit(`update:${workShift.value}-breakTime`, $event)"
              />
            </v-col>
          </v-row>
          <template v-for="qualified of qualifies">
            <v-subheader :key="`header-${qualified.value}`">{{
              qualified.text
            }}</v-subheader>
            <v-row :key="`row-${qualified.value}`" dense>
              <template v-for="dayDiv of dayDivs">
                <template v-for="num of nums">
                  <v-col
                    :key="`${workShift.value}-${dayDiv.value}-${qualified.value}-${num.value}`"
                    cols="6"
                  >
                    <g-numeric
                      class="center-input"
                      :value="
                        $props[workShift.value].unitPrices[dayDiv.value][
                          qualified.value
                        ][num.value]
                      "
                      :label="`${dayDiv.text}${num.text}`"
                      required
                      suffix="円"
                      @input="
                        $emit(
                          `update:${workShift.value}-unitPrices-${dayDiv.value}-${qualified.value}-${num.value}`,
                          $event
                        )
                      "
                    />
                  </v-col>
                </template>
              </template>
            </v-row>
          </template>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
    <v-row dense>
      <v-col cols="6">
        <g-numeric
          class="center-input"
          :value="halfRate"
          label="半勤請求割合"
          required
          suffix="%"
          @input="$emit('update:halfRate', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-numeric
          class="center-input"
          :value="cancelRate"
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
      hide-details
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
