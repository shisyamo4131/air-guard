<template>
  <g-template-default>
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
  </g-template-default>
</template>

<script>
import GAutocompleteCustomer from '~/components/molecules/inputs/GAutocompleteCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, GAutocompleteCustomer },
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
