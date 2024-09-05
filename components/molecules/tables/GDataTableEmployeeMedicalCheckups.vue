<script>
/**
 * ## GDataTableEmployeeMedicalCheckups
 *
 * 概要:
 * 従業員の健康診断結果表示用DataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-07-03
 * @version 1.0.0
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
  },
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
      if (this.$vuetify.breakpoint.smAndDown) {
        return [
          { text: '受診日', value: 'date', width: 120 },
          { text: '血圧', value: 'bloodPressure', sortable: false },
        ]
      }
      return [
        { text: '受診日', value: 'date', width: 120 },
        { text: '受診機関', value: 'agency', sortable: false },
        { text: '血圧', value: 'bloodPressure', sortable: false },
      ]
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
    <template #[`item.bloodPressure`]="{ item }">
      {{ `${item.bloodTop} - ${item.bloodBottom}` }}
    </template>
  </g-data-table>
</template>

<style></style>
