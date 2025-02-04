<script>
/**
 * 取引先情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-04
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnRegist,
    GIconPlay,
    GIconStop,
    GInputCustomer,
    GChipSyncStatus,
    AirArrayManager,
    GPagination,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      lazySearch: null,
      loading: false,
      schema: new Customer(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearch: {
      handler(v) {
        this.items = []
        if (v) this.fetchDocs(v)
      },
      immediate: true,
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
    async fetchDocs(search) {
      this.loading = true
      try {
        this.items = await this.schema.fetchDocs(search)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('fetchDocs に失敗しました。')
      } finally {
        this.loading = false
      }
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
        :event-edit-handler="
          ($event) => $router.push(`/customers/${$event.docId}`)
        "
        :handle-create="async (item) => await item.create()"
        height="100%"
        :items="items"
        label="取引先情報"
        :loading="loading"
        :schema="schema"
        unbind-search
        @lazy-search="lazySearch = $event"
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
                :headers="[
                  { text: 'CODE', value: 'code', width: 84 },
                  { text: '取引先名', value: 'abbr' },
                  { text: '住所', value: 'address1', sortable: false },
                  {
                    text: '同期状態',
                    value: 'sync',
                    sortable: false,
                    align: 'center',
                  },
                ]"
                hide-default-footer
                item-key="docId"
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
                      <div>{{ item.name1 }}</div>
                      <div
                        v-if="item.name2"
                        class="text-caption grey--text text--darken-1"
                      >
                        {{ item.name2 }}
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
          <g-input-customer v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
