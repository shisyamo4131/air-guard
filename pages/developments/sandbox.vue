<template>
  <air-array-manager :schema="instance">
    <template #default="{ activator }">
      <v-btn v-bind="activator.attrs" v-on="activator.on">aaa</v-btn>
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-operation-result-worker-v-2 v-bind="attrs" v-on="on" />
    </template>
  </air-array-manager>
</template>

<script>
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GInputOperationResultWorkerV2 from '~/components/molecules/inputs/GInputOperationResultWorkerV2.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
export default {
  components: { AirArrayManager, GInputOperationResultWorkerV2 },
  data() {
    return {
      instance: new OperationResultWorker(),
    }
  },
}
</script>

<style></style>
