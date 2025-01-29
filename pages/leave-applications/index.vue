<script>
/**
 * 休暇申請情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GInputLeaveApplication from '~/components/molecules/inputs/GInputLeaveApplication.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import LeaveApplication from '~/models/LeaveApplication'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'LeaveApplicationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    AirArrayManager,
    GBtnRegist,
    GInputLeaveApplication,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new LeaveApplication(),
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
        label="休暇申請情報"
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
                  { text: '日付', value: 'date' },
                  { text: '従業員', value: 'employeeId' },
                ]"
                hide-default-footer
                v-on="table.on"
              />
            </div>
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-leave-application v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
