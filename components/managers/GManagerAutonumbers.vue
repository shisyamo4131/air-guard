<script>
/**
 * 自動採番管理コンポーネント
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import GDataTableAutonumbers from '../atoms/tables/GDataTableAutonumbers.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GInputAutonumber from '../molecules/inputs/GInputAutonumber.vue'
import AirArrayManager from '../air/AirArrayManager.vue'
import Autonumber from '~/models/Autonumber'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableAutonumbers,
    GBtnRegist,
    GInputAutonumber,
    AirArrayManager,
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
    label="自動採番"
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
          <g-data-table-autonumbers
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
      <g-input-autonumber v-bind="attrs" v-on="on" />
    </template>
  </air-array-manager>
</template>

<style></style>
