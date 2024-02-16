<template>
  <g-template-index>
    <v-container>
      <g-autocomplete-customer
        v-model="value"
        item-text="abbr"
        label="single"
      />
      <!-- <g-autocomplete-customer
        v-model="multipleValue"
        label="multiple"
        multiple
      />
      <v-autocomplete :items="items" :search-input.sync="search" /> -->
    </v-container>
  </g-template-index>
</template>

<script>
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
export default {
  components: { GAutocompleteCustomer, GTemplateIndex },
  data() {
    return {
      // value: null,
      // multipleValue: [],
      value: 'cCKqxYVGLOWkTJViCar7',
      multipleValue: ['cCKqxYVGLOWkTJViCar7', 'QYPCuQGgHFxYGB3zwziK'],
      items: ['aaa', 'bbb'],
      search: null,
    }
  },
}
</script>

<style></style>
