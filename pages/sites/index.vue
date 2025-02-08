<script>
/**
 * 現場情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GCollectionManagerSites from '~/components/managers/GCollectionManagerSites.vue'
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
    GChipSyncStatus,
    GPagination,
    AirRenderlessDelayInput,
    GCollectionManagerSites,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      eventEdit: 'click:row',
      includeExpired: false,
      instance: new Site(),
      items: [],
      lazySearch: null,
      lazySearchCustomerId: null,
      loading: false,
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
      this.subscribeDocs()
    },

    lazySearch(v) {
      this.subscribeDocs()
    },

    searchType(v) {
      this.subscribeDocs()
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
      this.$router.push(`/sites/${event.docId}`)
    },

    async subscribeDocs() {
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
      <g-collection-manager-sites
        :event-edit="eventEdit"
        :event-edit-handler="eventEditHandler"
        height="100%"
        :items="filteredItems"
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
      </g-collection-manager-sites>
    </v-container>
  </g-template-default>
</template>

<style></style>
