<script>
/**
 * 現場情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-04
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import Site from '~/models/Site'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SitesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GIconPlay,
    GIconStop,
    GInputSite,
    GChipSyncStatus,
    AirArrayManager,
    GPagination,
    AirRenderlessDelayInput,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      includeExpired: false,
      items: [],
      lazySearch: null,
      lazySearchCustomerId: null,
      loading: false,
      schema: new Site(),
      searchType: 'name',
      selectedCustomerId: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    customers() {
      const result = this.items.reduce((acc, item) => {
        if (!acc.some(({ docId }) => docId === item.customer.docId)) {
          acc.push(item.customer)
        }
        return acc
      }, [])
      return result.sort((a, b) => a.abbrKana.localeCompare(b.abbrKana))
    },

    filteredItems() {
      return this.items.filter((item) => {
        return (
          !this.selectedCustomerId ||
          item.customer.docId === this.selectedCustomerId
        )
      })
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    customers(v) {
      this.selectedCustomerId = null
    },

    includeExpired(v) {
      this.fetchDocs()
    },

    lazySearch(v) {
      this.fetchDocs()
    },

    searchType(v) {
      this.fetchDocs()
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      // items を初期化
      this.items.splice(0)

      // 検索文字列が入力されていなければ終了
      if (!this.lazySearch) return

      this.loading = true
      try {
        if (this.searchType === 'name') {
          await this._fetchDocsByName()
        } else {
          await this._fetchDocsByCode()
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('fetchDocs に失敗しました。')
      } finally {
        this.loading = false
      }
    },

    async _fetchDocsByName() {
      const options = this.includeExpired
        ? undefined
        : [['where', 'status', '==', 'active']]
      this.items = await this.schema.fetchDocs(this.lazySearch, options)
    },

    async _fetchDocsByCode() {
      this.items = await this.schema.fetchDocs([
        ['where', 'code', '==', this.lazySearch],
      ])
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        :dialog-props="{ maxWidth: 600 }"
        event-edit="click:row"
        :event-edit-handler="($event) => $router.push(`/sites/${$event.docId}`)"
        :handle-create="async (item) => await item.create()"
        height="100%"
        :items="filteredItems"
        label="現場情報"
        :loading="loading"
        :schema="schema"
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
                    :placeholder="`${
                      searchType === 'name' ? '現場名' : 'コード'
                    }で検索`"
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
                  label="稼働終了を含める"
                  hide-details
                />
              </template>
            </v-toolbar>
            <v-expand-transition>
              <v-toolbar v-show="customers.length > 1" class="flex-grow-0" flat>
                <v-chip-group
                  v-model="selectedCustomerId"
                  active-class="primary--text"
                  center-active
                  show-arrows
                >
                  <v-chip
                    v-for="(item, index) of customers"
                    :key="index"
                    :value="item.docId"
                    >{{ item.abbr }}</v-chip
                  >
                </v-chip-group>
              </v-toolbar>
            </v-expand-transition>
            <div class="flex-table-container">
              <v-data-table
                v-bind="table.attrs"
                fixed-header
                :headers="[
                  { text: 'CODE', value: 'code', width: 84 },
                  { text: '現場名', value: 'abbr' },
                  { text: '住所', value: 'address', sortable: false },
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
                <template #[`item.abbr`]="{ item }">
                  <div class="d-flex">
                    <g-icon-play
                      v-if="item.status === 'active'"
                      color="green"
                      left
                      small
                    />
                    <g-icon-stop v-else color="red" left small />
                    <div>
                      <div>{{ item.abbr }}</div>
                      <div class="text-caption grey--text text--darken-1">
                        {{
                          $store.getters['customers/get'](item.customerId)
                            ?.abbr || 'N/A'
                        }}
                      </div>
                    </div>
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
          <g-input-site v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
