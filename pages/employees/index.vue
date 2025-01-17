<script>
/**
 * 従業員情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-17
 */
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GInputEmployeeV2 from '~/components/molecules/inputs/GInputEmployeeV2.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GIconPlay,
    GIconStop,
    GInputEmployeeV2,
    GChipSyncStatus,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      schema: new Employee(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * DataTable のカラム設定です。
     */
    headers() {
      const template = [
        { text: 'CODE', value: 'code', width: 84 },
        { text: '従業員名', value: 'fullName' },
        { text: '住所1', value: 'address1', sortable: false },
        { text: '住所2', value: 'address2', sortable: false },
        {
          text: '同期状態',
          value: 'sync',
          sortable: false,
          align: 'center',
        },
      ]

      return template
    },

    /**
     * DataTable に表示するアイテムです。
     * - Vuex から取得します。
     */
    items() {
      return this.$store.getters['employees/items']
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        v-bind="$attrs"
        :dialog-props="{
          maxWidth: 600,
        }"
        event-edit="click:row"
        :event-edit-handler="
          ($event) => $router.push(`/employees/${$event.docId}`)
        "
        :handle-create="handleCreate"
        height="100%"
        :items="items"
        label="従業員情報"
        :schema="schema"
        v-on="$listeners"
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
                fixed-header
                :headers="headers"
                hide-default-footer
                item-key="docId"
                sort-by="code"
                sort-desc
                v-on="table.on"
              >
                <template #[`item.fullName`]="{ item }">
                  <div class="d-flex">
                    <g-icon-play
                      v-if="item.status === 'active'"
                      color="green"
                      left
                      small
                    />
                    <g-icon-stop v-else color="red" left small />
                    <div>{{ item.fullName }}</div>
                  </div>
                </template>
                <template #[`item.sync`]="{ item }">
                  <g-chip-sync-status :value="item.sync" x-small />
                </template>
              </v-data-table>
            </div>
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="pagination.attrs"
                    v-on="pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-employee-v-2 v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
