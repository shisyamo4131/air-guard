<template>
  <v-container>
    <v-data-table :items="contracts" :headers="headers" :items-per-page="-1" />
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        { text: 'docId', value: 'docId' },
        { text: 'startDate', value: 'startDate' },
        { text: 'expiredDate', value: 'expiredDate' },
      ],
    }
  },
  computed: {
    contracts() {
      return this.$store.state['employee-contracts'].items.current.filter(
        (item) => item.employeeId === 'zcjl99C6BzBlrc7TPkBN'
      )
    },
  },
}
</script>

<style></style>
