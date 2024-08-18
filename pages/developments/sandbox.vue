<template>
  <v-container>
    <v-toolbar>
      <v-btn @click="fetch">fetch</v-btn>
    </v-toolbar>
    <v-data-table
      :headers="[
        { text: 'id', value: 'docId' },
        { text: 'status', value: 'transportationCost.status' },
        { text: 'createAt', value: 'transportationCost.createAt' },
        { text: 'draftAt', value: 'transportationCost.draftAt' },
        { text: 'actions', value: 'actions' },
      ]"
      :items="items"
      disable-sort
    >
      <template #[`item.transportationCost.createAt`]="{ item }">
        {{ dateFormat(item.createAt) }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn @click="showDetail(item)">detail</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
export default {
  components: {},
  data() {
    return {
      items: [],
    }
  },
  computed: {},
  methods: {
    async fetch() {
      this.items.splice(0)
      const colRef = collection(this.$firestore, 'OperationWorkResults')
      const snapshot = await getDocs(colRef)
      this.items = snapshot.docs.map((doc) => doc.data())
    },
    dateFormat(timestamp) {
      return this.$dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    async toDraft(item) {
      const model = this.$OperationWorkResult(item)
      await model.toDraft()
    },
    showDetail(item) {
      const model = this.$OperationWorkResult(item)
      console.log(model)
    },
  },
}
</script>

<style></style>
