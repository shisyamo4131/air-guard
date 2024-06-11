<template>
  <v-container>
    <g-autocomplete-employee v-model="value" />
  </v-container>
</template>

<script>
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
export default {
  components: { GAutocompleteEmployee },
  data() {
    return {
      value: 'DkGkmGm169Xrsk7o2ni6',
    }
  },
}
</script>

<style></style>
