<script>
/**
 * 稼働実績登録用UIコンポーネント - 勤務区分選択 -
 * @author shisyamo4131
 * @refact 2025-01-15
 */
import GRadioGroupWorkShift from './GRadioGroupWorkShift.vue'
import { vueProps } from '~/models/propsDefinition/OperationResult'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GRadioGroupWorkShift,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: { ...vueProps },
}
</script>

<template>
  <v-container fluid>
    <g-radio-group-work-shift
      :value="workShift"
      row
      @change="$emit('update:workShift', $event)"
    />
  </v-container>
</template>

<style></style>
