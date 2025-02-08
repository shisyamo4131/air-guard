<script>
/**
 * 従業員情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GCollectionManagerEmployees from '~/components/managers/GCollectionManagerEmployees.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
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
    GInputEmployee,
    GChipSyncStatus,
    GPagination,
    GCollectionManagerEmployees,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      eventEdit: 'click:row',
      includeExpired: false,
      instance: new Employee(),
      items: [],
      lazySearch: null,
      loading: false,
      searchType: 'name',
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
    eventEditHandler(event) {
      this.$router.push(`/employees/${event.docId}`)
    },

    async subscribeDocs(search) {
      // items を初期化
      this.items.splice(0)

      // 検索文字列が入力されていなければ終了
      if (!this.lazySearch) return

      this.loading = true
      try {
        if (this.searchType === 'name') {
          await this._subscribeDocsByName()
        } else {
          await this._subscribeDocsByCode()
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('subscribeDocs に失敗しました。')
      } finally {
        this.loading = false
      }
    },

    async _subscribeDocsByName() {
      const options = this.includeExpired
        ? undefined
        : [['where', 'status', '==', 'active']]
      this.items = await this.instance.subscribeDocs(this.lazySearch, options)
    },

    async _subscribeDocsByCode() {
      this.items = await this.instance.subscribeDocs([
        ['where', 'code', '==', this.lazySearch],
      ])
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-collection-manager-employees
        :event-edit="eventEdit"
        :event-edit-handler="eventEditHandler"
        height="100%"
        :items="items"
        :loading="loading"
      >
        <template #default="{ activator, pagination, table }">
          <v-sheet class="d-flex flex-column" height="100%">
            <v-toolbar class="flex-grow-0" flat>
              <air-renderless-delay-input v-model="lazySearch">
                <template #default="{ attrs, on }">
                  <v-text-field
                    v-bind="attrs"
                    clearable
                    hide-details
                    placeholder="従業員名で検索"
                    prepend-inner-icon="mdi-magnify"
                    v-on="on"
                  />
                </template>
              </air-renderless-delay-input>
              <g-btn-regist v-bind="activator.attrs" icon v-on="activator.on" />
              <template #extension>
                <v-radio-group v-model="searchType" hide-details row>
                  <v-radio label="名称検索" value="name" />
                  <v-radio label="コード検索" value="code" />
                </v-radio-group>
                <v-switch
                  v-show="searchType === 'name'"
                  v-model="includeExpired"
                  label="退職者を含める"
                  hide-details
                />
              </template>
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                fixed-header
                :headers="[
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
                ]"
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
            <g-pagination v-bind="pagination.attrs" v-on="pagination.on" />
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-employee v-bind="attrs" v-on="on" />
        </template>
      </g-collection-manager-employees>
    </v-container>
  </g-template-default>
</template>

<style></style>
