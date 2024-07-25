<script>
/**
 * ### GDataTableSites
 *
 * 現場のDataTableコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-25 - breakpointに応じて表示するカラムを変更。
 * - version 1.0.0 - 2024-06-26 - 初版作成
 */
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      search: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    headers() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
          return [
            { text: 'CODE', value: 'code', width: 84 },
            { text: '略称', value: 'abbr' },
          ]
        case 'md':
          return [
            { text: 'CODE', value: 'code', width: 84 },
            { text: '略称', value: 'abbr', sortable: false },
          ]
        default:
          return [
            { text: 'CODE', value: 'code', width: 84 },
            { text: '現場名/住所', value: 'name', sortable: false },
          ]
      }
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    :headers="headers"
    :mobile-breakpoint="0"
    v-on="$listeners"
  >
    <template #[`item.name`]="{ item }">
      <div class="d-flex">
        <div class="align-self-center">
          <v-icon v-if="item.status === 'active'" color="green" left x-small
            >mdi-play</v-icon
          ><v-icon v-else color="red" left x-small>mdi-stop</v-icon>
        </div>
        <div>
          <div>
            {{ item.name }}
          </div>
          <div class="text-caption grey--text text--darken-1">
            {{ item.address }}
          </div>
        </div>
      </div>
    </template>
    <template #[`item.abbr`]="{ item }">
      <div class="d-flex">
        <div class="align-self-center">
          <v-icon v-if="item.status === 'active'" color="green" left x-small
            >mdi-play</v-icon
          ><v-icon v-else color="red" left x-small>mdi-stop</v-icon>
        </div>
        <div>
          {{ item.abbr }}
        </div>
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
