<script>
/**
 * 取引先情報詳細画面
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import Customer from '~/models/Customer'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import Site from '~/models/Site'
import GPagination from '~/components/atoms/paginations/GPagination.vue'
import AirRenderlessDelayInput from '~/components/air/AirRenderlessDelayInput.vue'
import GCollectionManagerSites from '~/components/managers/GCollectionManagerSites.vue'
import GDocumentManagerCustomer from '~/components/managers/GDocumentManagerCustomer.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GBtnEdit,
    GInputCustomer,
    GPagination,
    AirRenderlessDelayInput,
    GCollectionManagerSites,
    GDocumentManagerCustomer,
  },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ route }) {
    const docId = route.params.docId
    const listener = new Customer()
    listener.subscribe(docId)
    return { docId, listener }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      lazySearchSiteName: null,
      loading: false,
      schemaSite: new Site(),
      sites: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    parentPath() {
      return this.$route.path.split('/').slice(0, -1).join('/')
    },
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '取引先', to: this.parentPath, exact: true },
        { text: '取引先詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    lazySearchSiteName(v) {
      this.fetchDocs()
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      // sites を初期化
      this.sites.splice(0)

      // 検索文字列が入力されていなければ終了
      if (!this.lazySearchSiteName) return

      this.loading = true
      try {
        this.sites = await this.schemaSite.fetchDocs(this.lazySearchSiteName)
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
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container>
      <v-row>
        <!-- 取引先概要 -->
        <v-col cols="12" lg="4">
          <g-document-manager-customer
            color="primary"
            :doc-id="docId"
            height="100%"
            @DELETE="$router.replace('/customers')"
          >
            <template #default="{ attrs, height, on }">
              <v-card class="d-flex flex-column" outlined :height="height">
                <v-card-title>{{ attrs.abbr }}</v-card-title>
                <v-card-subtitle>{{ attrs.abbrKana }}</v-card-subtitle>
                <v-list class="flex-grow-1">
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map-marker</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.address1 }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ attrs.address2 }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.tel }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-fax</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ attrs.fax }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{
                          `${$DEADLINE[attrs.deadline]}締め ${
                            attrs.depositMonth
                          }ヶ月後 ${$DEADLINE[attrs.depositDate]}入金
                          `
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-clipboard-text-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle
                        class="text-wrap"
                        style="line-height: 2"
                      >
                        {{ attrs.remarks }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card-actions class="justify-end">
                  <g-btn-edit
                    :color="attrs.color"
                    icon
                    @click="on['click:edit']"
                  />
                </v-card-actions>
              </v-card>
            </template>
            <template #inputs="{ attrs, on }">
              <g-input-customer v-bind="attrs" v-on="on" />
            </template>
          </g-document-manager-customer>
        </v-col>
        <v-col cols="12" lg="8">
          <g-collection-manager-sites height="480" :items="sites">
            <template #default="{ height, pagination, table }">
              <v-card class="d-flex flex-column" :height="height" outlined>
                <v-card-title>現場情報</v-card-title>
                <v-toolbar class="flex-grow-0" flat>
                  <air-renderless-delay-input v-model="lazySearchSiteName">
                    <template #default="{ attrs, on }">
                      <v-text-field
                        v-bind="attrs"
                        clearable
                        hide-details
                        placeholder="現場名で検索"
                        prepend-inner-icon="mdi-magnify"
                        v-on="on"
                      />
                    </template>
                  </air-renderless-delay-input>
                </v-toolbar>
                <div class="flex-table-container">
                  <v-data-table
                    v-bind="table.attrs"
                    fixed-header
                    :headers="[
                      { text: 'CODE', value: 'code', width: 84 },
                      { text: '現場名', value: 'abbr' },
                      { text: '住所', value: 'address', sortable: false },
                    ]"
                    hide-default-footer
                    item-key="docId"
                    sort-by="code"
                    sort-desc
                    v-on="table.on"
                  >
                  </v-data-table>
                  <g-pagination
                    v-bind="pagination.attrs"
                    v-on="pagination.on"
                  />
                </div>
              </v-card>
            </template>
          </g-collection-manager-sites>
        </v-col>
      </v-row>
    </v-container>
  </g-template-default>
</template>

<style></style>
