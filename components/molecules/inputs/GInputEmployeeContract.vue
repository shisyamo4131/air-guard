<script>
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import { props } from '~/models/EmployeeContract'
import EditMode from '~/components/mixins/GMixinEditMode'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
/**
 * ### GInputEmployeeContract
 *
 * 従業員の雇用契約情報編集用コンポーネントです。
 *
 * @author shisayamo4131
 * @version 1.0.1
 *
 * @updates
 * - version 1.0.1 - 2024-07-24 - 追加モード以外では契約日を編集不可に。
 * - version 1.0.0 - 2024-07-18 - 初版作成
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GSelect, GTextarea, GComboboxDate, GNumeric, GCheckbox },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props, EditMode],
}
</script>

<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <g-checkbox
          :input-value="hasPeriod"
          label="期間の定め"
          @change="$emit('update:hasPeriod', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          :value="startDate"
          label="契約日"
          required
          :disabled="editMode !== 'REGIST'"
          @input="$emit('update:startDate', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-combobox-date
          :value="expiredDate"
          label="契約満了日"
          :disabled="!hasPeriod"
          :required="hasPeriod"
          @input="$emit('update:expiredDate', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-select
          :value="contractType"
          label="雇用形態"
          :items="[
            { text: 'アルバイト', value: 'part-time' },
            { text: '契約社員', value: 'contract' },
            { text: '正社員', value: 'full-time' },
          ]"
          required
          attach
          @input="$emit('update:contractType', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-select
          :value="paymentType"
          label="支給形態"
          :items="[
            { text: '月給', value: 'monthly' },
            { text: '日給', value: 'daily' },
          ]"
          required
          attach
          @input="$emit('update:paymentType', $event)"
        />
      </v-col>
      <v-col cols="12" md="6">
        <g-numeric
          class="center-input"
          :value="basicWage"
          label="基本給"
          required
          suffix="円"
          @input="$emit('update:basicWage', $event)"
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
