<template>
  <v-container>
    <v-sheet width="290">
      <g-date-picker-multiple :value="value" @input="value = $event" />
    </v-sheet>
  </v-container>
</template>

<script>
import GDatePickerMultiple from '~/components/atoms/pickers/GDatePickerMultiple.vue'
export default {
  components: { GDatePickerMultiple },
  data() {
    return {
      value: ['2024-06-01'],
    }
  },
}
</script>

<style></style>
