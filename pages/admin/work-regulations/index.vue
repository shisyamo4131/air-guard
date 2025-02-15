<script>
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
/**
 * 就業規則情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-15
 */
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GCollectionManager from '~/components/managers/GCollectionManager.vue'
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import WorkRegulation from '~/models/WorkRegulation'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'WorkRegulationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GInputWorkRegulation,
    GPagination,
    GCollectionManager,
    AirRenderlessDelayInput,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      instance: new WorkRegulation(),
      lazySearch: this.$dayjs().format('YYYY'),
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch: {
      handler(v) {
        this.items = []
        if (v) this.subscribeDocs(v)
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async subscribeDocs(search) {
      this.loading = true
      try {
        this.items = await this.instance.subscribeDocs([
          ['where', 'year', '==', search],
        ])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('subscribeDocs に失敗しました。')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-collection-manager
        :dialog-props="{ maxWidth: 600 }"
        event-edit="click:row"
        height="100%"
        :items="items"
        label="就業規則情報"
        :instance="instance"
      >
        <template #default="{ activator, pagination, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <air-renderless-delay-input v-model="lazySearch">
                <template #default="{ attrs, on }">
                  <v-text-field
                    class="center-input"
                    style="max-width: 108px"
                    v-bind="attrs"
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    suffix="年"
                    v-on="on"
                  />
                </template>
              </air-renderless-delay-input>
              <v-spacer />
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                disable-sort
                :headers="[
                  { text: '適用年度', value: 'year' },
                  { text: '就業規則名', value: 'name' },
                  {
                    text: '法定休日',
                    value: 'legalHoliday',
                    align: 'center',
                  },
                  {
                    text: '法定外休日',
                    value: 'nonStatutoryHolidays',
                    align: 'center',
                  },
                  {
                    text: '月平均所定労働日数',
                    value: 'averageMonthlyScheduledWorkDays',
                    align: 'center',
                  },
                  {
                    text: '時間外割増',
                    value: 'overtimePayRate',
                    align: 'center',
                  },
                  {
                    text: '休日割増',
                    value: 'holidayPayRate',
                    align: 'center',
                  },
                  { text: '賞与', value: 'bonusEligibility', align: 'center' },
                ]"
                hide-default-footer
                v-on="table.on"
              >
                <template #[`item.legalHoliday`]="{ item }">
                  <v-chip small>{{ $DAY_OF_WEEK()[item.legalHoliday] }}</v-chip>
                </template>
                <template #[`item.nonStatutoryHolidays`]="{ item }">
                  <v-chip
                    v-for="day of item.nonStatutoryHolidays"
                    :key="day"
                    small
                  >
                    {{ $DAY_OF_WEEK()[day] }}
                  </v-chip>
                </template>
                <template #[`item.averageMonthlyScheduledWorkDays`]="{ item }">
                  {{ `${item.averageMonthlyScheduledWorkDays.toFixed(3)}` }}
                </template>
                <template #[`item.overtimePayRate`]="{ item }">
                  {{ `${item.overtimePayRate} %` }}
                </template>
                <template #[`item.holidayPayRate`]="{ item }">
                  {{ `${item.holidayPayRate} %` }}
                </template>
                <template #[`item.bonusEligibility`]="{ item }">
                  <v-simple-checkbox
                    :value="item.bonusEligibility"
                    color="secondary"
                  />
                </template>
              </v-data-table>
            </div>
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-work-regulation v-bind="attrs" v-on="on" />
        </template>
      </g-collection-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
