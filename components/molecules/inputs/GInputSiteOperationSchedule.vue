<script>
/**
 * ## GInputSiteOperationSchedule
 *
 * 現場の稼働予定を入力するためのコンポーネントです。
 *
 * ### 注意事項:
 * - 稼働日、勤務区分は変更できません。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-29 - 現場の稼働予定の仕様について再確認。日付と勤務区分は変更不可に。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import { props } from '~/models/SiteOperationSchedule'
import EditMode from '~/mixins/GMixinEditMode'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextarea, GSwitch, GNumeric, GTextField, GComboboxDate },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
  props: {
    hideDate: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div>
    <g-combobox-date
      v-if="!hideDate"
      :value="date"
      label="日付"
      :disabled="editMode !== 'REGIST'"
      required
      @input="$emit('update:date', $event)"
    />
    <div class="d-flex mb-6 flex-wrap" flat>
      <h5 class="align-self-end pr-4" style="color: rgba(0, 0, 0, 0.6)">
        勤務区分
      </h5>
      <v-radio-group
        :value="workShift"
        class="mt-0"
        hide-details
        :disabled="editMode !== 'REGIST'"
        row
        @change="$emit('update:workShift', $event)"
      >
        <v-radio value="day" label="日勤" />
        <v-radio value="night" label="夜勤" />
      </v-radio-group>
    </div>
    <v-row dense>
      <v-col cols="6">
        <g-text-field
          :value="start"
          class="center-input"
          label="開始時刻"
          required
          input-type="time"
          @input="$emit('update:start', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-text-field
          :value="end"
          class="center-input"
          label="終了時刻"
          required
          input-type="time"
          @input="$emit('update:end', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-numeric
          :value="requiredWorkers"
          class="right-input"
          label="人数"
          required
          suffix="名"
          @input="$emit('update:requiredWorkers', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-switch
          class="mt-1"
          :input-value="qualification"
          label="要資格者"
          @change="$emit('update:qualification', $event)"
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
