<script>
/**
 * 健康保険情報管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-16
 */
import GDataTableHealthInsurances from '../atoms/tables/GDataTableHealthInsurances.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GInputHealthInsuranceV2 from '../molecules/inputs/GInputHealthInsuranceV2.vue'
import AirArrayManager from '../air/AirArrayManager.vue'
import HealthInsurance from '~/models/HealthInsurance'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableHealthInsurances,
    GBtnRegist,
    GInputHealthInsuranceV2,
    AirArrayManager,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new HealthInsurance(),
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
  <air-array-manager
    v-bind="$attrs"
    :dialog-props="{
      maxWidth: 600,
    }"
    event-edit="click:row"
    :handle-create="handleCreate"
    :handle-update="handleUpdate"
    :handle-delete="handleDelete"
    :items="items"
    label="健康保険情報"
    :schema="schema"
    v-on="$listeners"
  >
    <template #default="{ activator, pagination, height, search, table }">
      <v-sheet class="d-flex flex-column" :height="height">
        <v-toolbar class="flex-grow-0" flat>
          <v-text-field v-bind="search.attrs" v-on="search.on" />
          <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
        </v-toolbar>
        <div class="d-flex flex-grow-1 overflow-y-hidden">
          <g-data-table-health-insurances
            class="flex-table"
            v-bind="table.attrs"
            v-on="table.on"
          />
        </div>
        <v-container fluid>
          <v-row justify="center">
            <v-col cols="10">
              <v-pagination v-bind="pagination.attrs" v-on="pagination.on" />
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-health-insurance-v-2 v-bind="attrs" v-on="on" />
    </template>
  </air-array-manager>
</template>

<style></style>
