<script>
/**
 * 自動採番の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import Autonumber from '~/models/Autonumber'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AutonumbersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    AirArrayManager,
    GBtnRegist,
    GInputAutonumber,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new Autonumber(),
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
          maxWidth: 480,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="自動採番"
        :schema="schema"
      >
        <template #default="{ activator, pagination, search, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <v-text-field v-bind="search.attrs" v-on="search.on" />
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                :headers="[
                  { text: 'コレクション名', value: 'collectionId' },
                  { text: '現在値', value: 'current' },
                  { text: '桁数', value: 'length' },
                  { text: 'フィールド名', value: 'field' },
                  { text: '状態', value: 'status' },
                ]"
                hide-default-footer
                sort-by="collectionId"
                v-on="table.on"
              >
              </v-data-table>
            </div>
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-autonumber v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
