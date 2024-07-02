<script>
/**
 * ## GDataTableMedicalCheckups
 *
 * MedicalCheckups用DataTableコンポーネント
 *
 * 機能詳細:
 *
 * @author shisyamo4131
 * @create 2024-07-01
 * @version 1.0.0
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    sortBy: { type: [String, Array], default: 'date', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      if (this.$vuetify.breakpoint.xs) {
        return [{ text: '受診日', value: 'date' }]
      }
      return [{ text: '受診日', value: 'date' }]
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="{ ...$props, ...$attrs }"
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
  </g-data-table>
</template>

<style></style>
