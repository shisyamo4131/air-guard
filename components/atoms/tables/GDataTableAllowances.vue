<script>
/**
 * 手当用 DataTable コンポーネント
 * @author shisyamo4131
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      const result = []
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          result.push({ text: '手当名', value: 'name' })
          break
        case 'sm':
          result.push({ text: '手当名', value: 'name' })
          break
        case 'md':
          result.push({ text: '手当名', value: 'name' })
          break
        default:
          result.push({ text: '手当名', value: 'name' })
      }
      return result
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :mobile-breakpoint="600"
    v-on="$listeners"
  >
  </g-data-table>
</template>

<style></style>
