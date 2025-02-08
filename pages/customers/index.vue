<script>
/**
 * 取引先情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-02-08
 */
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import GCollectionManagerCustomers from '~/components/managers/GCollectionManagerCustomers.vue'
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
    GChipSyncStatus,
    GPagination,
    AirRenderlessDelayInput,
    GCollectionManagerCustomers,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      eventEdit: 'click:row',
      items: [],
      lazySearch: null,
      loading: false,
      instance: new Customer(),
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
      this.$router.push(`/customers/${event.docId}`)
    },

    async subscribeDocs(search) {
      this.loading = true
      try {
        this.items = await this.instance.subscribeDocs(search)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('subscribeDocs に失敗しました。')
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
      <g-collection-manager-customers
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
                    placeholder="取引先名で検索"
                    prepend-inner-icon="mdi-magnify"
                    v-on="on"
                  />
                </template>
              </air-renderless-delay-input>
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
      </g-collection-manager-customers>
    </v-container>
  </g-template-default>
</template>

<style></style>
