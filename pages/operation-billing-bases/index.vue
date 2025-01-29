<script>
/**
 * 請求稼働実績の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import OperationBillingBasis from '~/models/OperationBillingBasis'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationBillingBasesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GDialogMonthPicker,
    GChipWorkShift,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customerId: '',
      items: [],
      month: this.$dayjs().format('YYYY-MM'),
      schema: new OperationBillingBasis(),
      siteId: '',
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    filteredItems() {
      return this.items
        .filter((item) => {
          return this.customerId
            ? item.site.customer.docId === this.customerId
            : true
        })
        .filter((item) => {
          return this.siteId ? item.site.docId === this.siteId : true
        })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        const constraints = [['where', 'month', '==', newVal]]
        this.items = this.schema.subscribeDocs(constraints)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.schema.unsubscribe()
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container :style="{ height: `${height}px` }">
      <air-array-manager
        v-bind="$attrs"
        height="100%"
        :items="items"
        label="請求稼働実績情報"
        :schema="schema"
        v-on="$listeners"
      >
        <template #default="{ pagination, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <g-dialog-month-picker v-model="month">
                <template #activator="{ attrs, on }">
                  <v-text-field
                    style="max-width: 132px"
                    class="center-input"
                    v-bind="attrs"
                    hide-details
                    prepend-inner-icon="mdi-calendar"
                    @click:prepend-inner="on['click']"
                    v-on="on"
                  />
                </template>
              </g-dialog-month-picker>
              <template #extension>
                <v-text-field />
              </template>
            </v-toolbar>
            <div class="d-flex flex-grow-1 overflow-y-hidden">
              <v-data-table
                class="flex-table"
                v-bind="table.attrs"
                :headers="[
                  { text: '日付', value: 'date', width: 144 },
                  {
                    text: '曜日区分',
                    value: 'dayDiv',
                    width: 96,
                    align: 'center',
                    sortable: false,
                  },
                  {
                    text: '勤務区分',
                    value: 'workShift',
                    width: 96,
                    align: 'center',
                    sortable: false,
                  },
                  { text: '現場', value: 'site.abbr', sortable: false },
                  {
                    text: '稼働数',
                    value: 'operationCount',
                    align: 'right',
                    sortable: false,
                  },
                ]"
                hide-default-footer
                sort-by="date"
                sort-desc
                @click:row="
                  $router.push(`/operation-billing-bases/${$event.docId}`)
                "
                v-on="table.on"
              >
                <template #[`item.dayDiv`]="{ item }">
                  {{ $DAY_DIV[item.dayDiv] }}
                </template>
                <template #[`item.workShift`]="{ item }">
                  <g-chip-work-shift x-small :value="item.workShift" />
                </template>
                <template #[`item.site.abbr`]="{ item }">
                  <div>
                    <v-icon v-if="item.isLocked" color="info" left small
                      >mdi-lock</v-icon
                    >{{ item.site.abbr }}
                  </div>
                  <div class="text-caption grey--text text--darken-1">
                    {{ item.site.customer.abbr }}
                  </div>
                </template>
                <template #[`item.operationCount`]="{ item }">
                  {{
                    `${(item.operationCount.total || 0).toLocaleString()} 稼働`
                  }}
                </template>
              </v-data-table>
            </div>
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
