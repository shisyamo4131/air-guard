<script>
/**
 * ## GInputSiteOperationScheduleBulk
 *
 * 現場の稼働予定を一括入力するためのコンポーネントです。
 *
 * ### 機能の詳細：
 * - 一括登録用コンポーネントです。日付を複数選択することができます。
 * - 現場稼働予定の編集・削除には`GInputSiteOperationSchedule`を使用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import { props } from '~/models/SiteOperationScheduleBulk'
import EditMode from '~/components/mixins/GMixinEditMode'
import GDatePickerMultiple from '~/components/atoms/pickers/GDatePickerMultiple.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextarea, GSwitch, GNumeric, GTextField, GDatePickerMultiple },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div class="d-flex flex-wrap flex-sm-nowrap" style="gap: 16px">
    <v-card class="flex-grow-1 flex-sm-grow-0" outlined>
      <g-date-picker-multiple
        :value="dates"
        label="日付"
        required
        @input="$emit('update:dates', $event)"
      />
      <v-input
        class="ml-2 mb-2"
        :value="dates"
        :rules="[(v) => !!v.length || '日を選択してください']"
      />
    </v-card>
    <v-card class="flex-grow-1" outlined>
      <v-container>
        <div class="d-flex mb-4 flex-wrap" flat>
          <h5 class="align-self-end pr-4" style="color: rgba(0, 0, 0, 0.6)">
            勤務区分
          </h5>
          <v-radio-group
            :value="workShift"
            class="mt-0"
            hide-details
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
          <v-col cols="12" sm="6">
            <g-numeric
              :value="requiredWorkers"
              class="right-input"
              label="人数"
              required
              suffix="名"
              @input="$emit('update:requiredWorkers', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6">
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
      </v-container>
    </v-card>
  </div>
</template>

<style></style>
