<script>
/**
 * ### GInputEmployeeMedicalCheckup
 *
 * 概要:
 * 従業員の健康診断結果を編集するためのInputコンポーネントです。
 *
 * @author shisayamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import { props } from '~/models/EmployeeMedicalCheckup'
import EditMode from '~/components/mixins/GMixinEditMode'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSelect, GTextarea, GComboboxDate, GNumeric, GTextField },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <v-row dense>
      <v-col cols="12" md="6">
        <g-combobox-date
          :value="date"
          label="受診日"
          required
          @input="$emit('update:date', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-select
          :value="type"
          label="受診区分"
          :items="[
            { text: '入社時', value: 'entry' },
            { text: '法定検診', value: 'regular' },
          ]"
          required
          attach
          @input="$emit('update:type', $event)"
        />
      </v-col>
      <v-col cols="12">
        <g-text-field
          :value="agency"
          label="受診機関"
          required
          @input="$emit('update:agency', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          :value="bloodPressure.top"
          label="血圧（上）"
          required
          @input="$emit('update:bloodPressure-top', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          :value="bloodPressure.bottom"
          label="血圧（下）"
          required
          @input="$emit('update:bloodPressure-bottom', $event)"
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
