<script>
/**
 * 稼働実績情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GInputOperationResultSelectDate from '~/components/molecules/inputs/GInputOperationResultSelectDate.vue'
import GInputOperationResultSelectSite from '~/components/molecules/inputs/GInputOperationResultSelectSite.vue'
import GInputOperationResultSelectWorkShift from '~/components/molecules/inputs/GInputOperationResultSelectWorkShift.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import OperationResult from '~/models/OperationResult'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationResultsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GInputOperationResultSelectWorkShift,
    GInputOperationResultSelectDate,
    GInputOperationResultSelectSite,
    GChipWorkShift,
    GDialogMonthPicker,
    AirArrayManager,
    GBtnRegist,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      month: this.$dayjs().format('YYYY-MM'),
      items: [],
      schema: new OperationResult(),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    month: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {},

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.schema.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },

    /**
     * 稼働実績ドキュメントの購読を開始します。
     */
    subscribe() {
      this.items = this.schema.subscribeDocs([
        ['where', 'month', '==', this.month],
      ])
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container :style="{ height: `${height}px` }">
      <air-array-manager
        v-bind="$attrs"
        :dialog-props="{
          fullscreen: $vuetify.breakpoint.mobile,
          maxWidth: 480,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="稼働実績情報"
        :schema="schema"
        :steps="['現場選択', '日付選択', '勤務区分選択']"
        @CREATE="$router.push(`/operation-results/${$event.docId}`)"
        v-on="$listeners"
      >
        <template #default="{ activator, pagination, table }">
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
              <v-spacer />
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
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
                @click:row="$router.push(`/operation-results/${$event.docId}`)"
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
        <template #step-0="{ attrs, on }">
          <g-input-operation-result-select-site v-bind="attrs" v-on="on" />
        </template>
        <template #step-1="{ attrs, on }">
          <g-input-operation-result-select-date v-bind="attrs" v-on="on" />
        </template>
        <template #step-2="{ attrs, on }">
          <g-input-operation-result-select-work-shift
            v-bind="attrs"
            v-on="on"
          />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
