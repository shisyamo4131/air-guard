<script>
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
/**
 * 稼働実績登録用UIコンポーネント - 日付選択 -
 * @author shisyamo4131
 * @refact 2025-01-15
 */
import { vueProps } from '~/models/propsDefinition/OperationResult'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDatePicker },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: { ...vueProps },
}
</script>

<template>
  <v-container fluid>
    <v-input :value="date" :rules="[(v) => !!v || '選択してください。']">
      <v-sheet outlined>
        <g-date-picker
          :value="date"
          full-width
          no-title
          @change="$emit('update:date', $event)"
        />
      </v-sheet>
    </v-input>
  </v-container>
</template>

<style></style>
