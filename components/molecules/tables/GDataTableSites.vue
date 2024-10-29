<script>
/**
 * ### GDataTableSites
 *
 * 現場のDataTableコンポーネントです。
 *
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
    sortBy: { type: [String, Array], default: 'code', required: false },
    sortDesc: { type: [Boolean, Array], default: true, required: false },
  },
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
      const result = [{ text: 'CODE', value: 'code', width: 84 }]
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          result.push({ text: '略称', value: 'name-xs', sortable: false })
          break
        case 'sm':
          result.push({
            text: '現場名/住所',
            value: 'name-sm',
            sortable: false,
          })
          break
        default:
          result.push(
            { text: '現場名', value: 'name', sortable: false },
            { text: '住所', value: 'address', sortable: false }
          )
      }
      return result
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * テーブルのトップにスクロールする
     */
    scrollToTop() {
      this.$refs.table.scrollToTop()
    },
  },
}
</script>

<template>
  <g-data-table
    v-bind="$attrs"
    ref="table"
    :headers="headers"
    :mobile-breakpoint="0"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    v-on="$listeners"
  >
    <template #[`item.name-xs`]="{ item }">
      <div class="d-flex">
        <div class="align-self-center">
          <v-icon v-if="item.status === 'active'" color="green" left x-small
            >mdi-play</v-icon
          ><v-icon v-else color="red" left x-small>mdi-stop</v-icon>
        </div>
        <div>{{ item.abbr }}</div>
      </div>
    </template>
    <template #[`item.name-sm`]="{ item }">
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
            {{ item.customer?.abbr || '' }}
          </div>
        </div>
      </div>
    </template>
  </g-data-table>
</template>

<style></style>
