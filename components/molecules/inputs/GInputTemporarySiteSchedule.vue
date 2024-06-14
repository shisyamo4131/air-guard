<script>
import GRadioGroupWorkShift from './GRadioGroupWorkShift.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import { props } from '~/models/TemporarySiteSchedule'
import EditMode from '~/components/mixins/GMixinEditMode'

/**
 * ### GInputTemporarySiteSchedule
 * @author shisyamo4131
 * @create 2024-06-14
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextarea,
    GSwitch,
    GNumeric,
    GTextField,
    GComboboxDate,
    GRadioGroupWorkShift,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
  props: {
    bulk: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <div>
    <g-text-field
      :value="name"
      label="現場名"
      ignore-surrogate-pair
      required
      @input="$emit('update:name', $event)"
    />
    <g-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
    <g-combobox-date
      v-if="!bulk"
      :value="date"
      label="日付"
      required
      @input="$emit('update:date', $event)"
    />
    <g-combobox-date
      v-else
      :value="dates"
      label="日付"
      required
      multiple
      @input="$emit('update:dates', $event)"
    />
    <g-radio-group-work-shift
      :value="workShift"
      row
      class="mt-0"
      @change="$emit('update:workShift', $event)"
    />
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
