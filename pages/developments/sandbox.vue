<template>
  <v-container>
    <g-autocomplete-customer v-model="value" multiple />
    {{ value }}
    <g-autocomplete-site />
    <g-switch />
  </v-container>
</template>

<script>
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
export default {
  components: { GAutocompleteCustomer, GAutocompleteSite, GSwitch },
  data() {
    return {
      value: ['h1uRedzsqeHQSHpy3FCh', 'klnShX9vk03PHloYvmQg'],
    }
  },
}
</script>

<style></style>
