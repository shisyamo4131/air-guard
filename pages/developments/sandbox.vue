<template>
  <v-container>
    <div></div>
  </v-container>
</template>

<script>
import OperationResult from '~/models/OperationResult'
export default {
  data() {
    return {
      instance: new OperationResult(),
    }
  },
  computed: {},
  mounted() {
    this.test()
  },
  methods: {
    async test() {
      await this.instance.fetchDocs([
        ['where', 'docId', '==', '00wfglbWeVCKXabMPVPr'],
      ])
    },
  },
}
</script>

<style></style>
