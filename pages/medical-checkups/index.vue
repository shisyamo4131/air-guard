<script>
/**
 * 健康診断情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GInputMedicalCheckup from '~/components/molecules/inputs/GInputMedicalCheckup.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import MedicalCheckup from '~/models/MedicalCheckup'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MedicalCheckupsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GInputMedicalCheckup,
    AirArrayManager,
    GBtnRegist,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new MedicalCheckup(),
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
        label="健康診断情報"
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
                  { text: '受診日', value: 'date' },
                  { text: '受診機関', value: 'agency' },
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
          <g-input-medical-checkup v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
