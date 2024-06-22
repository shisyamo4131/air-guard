<template>
  <v-container>
    <g-combobox-date v-model="value" multiple />
    {{ value }}
  </v-container>
</template>

<script>
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
export default {
  components: { GComboboxDate },
  data() {
    return {
      value: ['2024-06-01'],
    }
  },
}
</script>

<style></style>
