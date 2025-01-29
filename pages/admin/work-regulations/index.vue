<script>
/**
 * 就業規則情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
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
    AirArrayManager,
    GBtnRegist,
    GInputWorkRegulation,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new WorkRegulation(),
    }
  },

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.items = this.schema.subscribeDocs()
  },

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
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        :dialog-props="{
          maxWidth: 600,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="就業規則情報"
        :schema="schema"
      >
        <template #default="props">
          <v-sheet class="d-flex flex-column" :height="props.height">
            <v-toolbar class="flex-grow-0" flat>
              <v-text-field
                v-bind="props.search.attrs"
                v-on="props.search.on"
              />
              <g-btn-regist
                v-bind="props.activator.attrs"
                icon
                v-on="props.activator.on"
              />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="props.table.attrs"
                :headers="[
                  { text: '適用年度', value: 'year' },
                  { text: '就業規則名', value: 'name' },
                  { text: '所定労働日', value: 'scheduledWorkDays' },
                  {
                    text: '月平均所定労働日数',
                    value: 'averageMonthlyScheduledWorkDays',
                    align: 'center',
                  },
                  { text: '法定休日', value: 'legalHoliday', align: 'center' },
                  { text: '時間外', value: 'overtimePayRate', align: 'center' },
                  { text: '休日', value: 'holidayPayRate', align: 'center' },
                  { text: '賞与', value: 'bonusEligibility', align: 'center' },
                ]"
                hide-default-footer
                v-on="props.table.on"
              >
              </v-data-table>
            </div>
            <g-pagination
              v-bind="props.pagination.attrs"
              v-on="props.pagination.on"
            />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-work-regulation v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
