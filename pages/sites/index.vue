<script>
/**
 * 現場情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-17
 */
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GChipSyncStatus from '~/components/atoms/chips/GChipSyncStatus.vue'
import GIconPlay from '~/components/atoms/icons/GIconPlay.vue'
import GIconStop from '~/components/atoms/icons/GIconStop.vue'
import GInputSiteV2 from '~/components/molecules/inputs/GInputSiteV2.vue'
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
    GInputSiteV2,
    GChipSyncStatus,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      schema: new Site(),
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
        { text: '現場名', value: 'abbr' },
        { text: '住所', value: 'address', sortable: false },
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
      return this.$store.getters['sites/items']
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
        :event-edit-handler="($event) => $router.push(`/sites/${$event.docId}`)"
        :handle-create="handleCreate"
        height="100%"
        :items="items"
        label="現場情報"
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
          <g-input-site-v-2 v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
