<template>
  <v-container>
    <g-card-employee-allowances v-model="value" />
    {{ value }}
  </v-container>
</template>

<script>
import GCardEmployeeAllowances from '~/components/molecules/cards/GCardEmployeeAllowances.vue'
import EmployeeAllowance from '~/models/EmployeeAllowance'
export default {
  components: { GCardEmployeeAllowances },
  data() {
    return {
      instance: new EmployeeAllowance(),
      value: [],
    }
  },
  computed: {},

  methods: {
    onInput(event) {
      console.log(event)
    },
  },
}
</script>

<style></style>
