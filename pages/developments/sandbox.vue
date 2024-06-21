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
      value: [],
    }
  },
}
</script>

<style></style>
