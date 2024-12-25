<script>
/**
 * 従業員休暇申請のDataTableコンポーネントです。
 * @author shisyamo4131
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    items: { type: Array, default: () => [], required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const result = []
      switch (this.$vuetify.breakpoint.name) {
        default: {
          result.push(
            { text: '日付', value: 'date' },
            { text: '従業員', value: 'employeeId' }
          )
        }
      }
      return result
    },

    internalItems() {
      return this.items.map((item) => {
        const employee = this.$store.getters['employees/get'](item.employeeId)
        return { ...item, employee }
      })
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="internalItems"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.employeeId`]="{ item }">
      {{ item.employee.abbr }}
    </template>
  </g-data-table>
</template>

<style></style>
