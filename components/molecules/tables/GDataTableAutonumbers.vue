<template>
  <g-data-table v-bind="{ ...$props, ...$attrs }" v-on="$listeners">
  </g-data-table>
</template>

<script>
import GDataTable from './GDataTable.vue'
export default {
  components: { GDataTable },
  props: {
    headers: {
      type: Array,
      default: () => [
        { text: 'collection', value: 'docId' },
        { text: 'current', value: 'current' },
        { text: 'length', value: 'length' },
        { text: 'field', value: 'field' },
        { text: 'status', value: 'status' },
      ],
    },
  },
}
</script>

<style></style>
