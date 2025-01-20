<script>
/**
 * 雇用保険情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GInputEmploymentInsurance from '~/components/molecules/inputs/GInputEmploymentInsurance.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import EmploymentInsurance from '~/models/EmploymentInsurance'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmploymentInsurancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GInputEmploymentInsurance,
    AirArrayManager,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new EmploymentInsurance(),
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
        label="雇用保険情報"
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
                  { text: 'CODE', value: 'employee.code' },
                  { text: '従業員', value: 'employee.fullName' },
                  { text: '被保険者整理番号', value: 'policyNumber' },
                  { text: '資格取得日', value: 'acquisitionDate' },
                  { text: '資格喪失日', value: 'lossDateJp' },
                ]"
                hide-default-footer
                v-on="props.table.on"
              >
              </v-data-table>
            </div>
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="props.pagination.attrs"
                    v-on="props.pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-employment-insurance v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
