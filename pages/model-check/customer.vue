<template>
  <v-container>
    <v-card>
      <v-card-title>model.Customer</v-card-title>
      <v-container>
        <g-input-customer v-bind.sync="model" />
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import Customer from '~/models/Customer'
export default {
  components: { GInputCustomer },
  data() {
    return {
      model: new Customer(),
    }
  },
}
</script>

<style></style>
