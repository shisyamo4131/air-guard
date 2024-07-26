<template>
  <v-container>
    <g-date-picker-multiple v-model="dates" />
  </v-container>
</template>

<script>
import GDatePickerMultiple from '~/components/atoms/pickers/GDatePickerMultiple.vue'
export default {
  components: { GDatePickerMultiple },
  data() {
    return {
      dates: [],
    }
  },
}
</script>

<style></style>
