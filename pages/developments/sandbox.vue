<template>
  <v-container>
    <g-employee-contracts-manager
      employee-id="ezD5kn7tg8yiNepgHEMC"
      @contracts="contracts = $event"
    />
    {{ contracts }}
  </v-container>
</template>

<script>
import GEmployeeContractsManager from '~/components/organisms/GEmployeeContractsManager.vue'
export default {
  components: { GEmployeeContractsManager },
  data() {
    return {
      contracts: [],
    }
  },
}
</script>

<style></style>
