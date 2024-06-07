<script>
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import { props } from '~/models/SiteOperationSchedule'
import EditMode from '~/components/mixins/GMixinEditMode'

/**
 * ### GInputSiteOperationSchedule
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextarea, GSwitch, GNumeric, GTextField, GComboboxDate },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <g-combobox-date
      :value="date"
      label="日にち"
      required
      @input="$emit('update:date', $event)"
    />
    <v-radio-group
      :value="workShift"
      row
      class="mt-0"
      @change="$emit('update:workShift', $event)"
    >
      <v-radio value="day" label="日勤" />
      <v-radio value="night" label="夜勤" />
    </v-radio-group>
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
