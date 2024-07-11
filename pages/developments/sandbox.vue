<template>
  <v-container>
    <v-card width="600">
      <v-card-text>
        <g-autocomplete-customer v-model="value" multiple />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
export default {
  components: { GAutocompleteCustomer },
  data() {
    return {
      value: ['IjD0nH5x7wSNR1MLqiZX'],
    }
  },
}
</script>

<style></style>
