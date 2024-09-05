<template>
  <v-container fluid>
    <g-input-operation-result-worker v-model="model" @submit:complete="test" />
  </v-container>
</template>

<script>
import GInputOperationResultWorker from '~/components/molecules/inputs/GInputOperationResultWorker.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
export default {
  components: { GInputOperationResultWorker },
  data() {
    return {
      model: new OperationResultWorker(),
    }
  },
  methods: {
    test() {
      console.log('OK')
    },
  },
}
</script>

<style></style>
