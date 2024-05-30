<template>
  <v-container>
    <g-autocomplete-customer v-model="value" multiple />
    {{ value }}
    <g-autocomplete-site />
  </v-container>
</template>

<script>
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
export default {
  components: { GAutocompleteCustomer, GAutocompleteSite },
  data() {
    return {
      value: ['h1uRedzsqeHQSHpy3FCh', 'klnShX9vk03PHloYvmQg'],
    }
  },
}
</script>

<style></style>
