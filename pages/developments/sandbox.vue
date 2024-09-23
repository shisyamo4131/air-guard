<template>
  <v-container>
    <v-card>
      <v-card-title> 取極め未登録現場 </v-card-title>
      <g-data-table :items="items" />
    </v-card>
  </v-container>
</template>

<script>
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import Site from '~/models/Site'
export default {
  components: { GDataTable },
  data() {
    return {
      instance: new Site(),
      items: [],
    }
  },
}
</script>

<style></style>
