<script>
/**
 * ### pages.CustomerDetail
 *
 * 取引先の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.0.1
 *
 * @updates
 * - version 1.0.1 - 2024-07-17 - ページ遷移に$routeを使用。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import { limit, orderBy, where } from 'firebase/firestore'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GCardCustomer from '~/components/molecules/cards/GCardCustomer.vue'
import GCardSites from '~/components/molecules/cards/GCardSites.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardSites,
    GCardMap,
    GCardCustomer,
    GTemplateDetail,
    GDialogEditor,
    GInputCustomer,
    GInputSite,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Customer()
    model.subscribeDoc(docId)
    return { docId, model }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: {
        sites: [],
      },
      lazySearch: {
        sites: null,
      },
      listeners: {
        sites: this.$Site(),
      },
      showLast: {
        sites: false,
      },
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
    'lazySearch.sites': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        if (!newVal) {
          this.items.sites = this.listeners.sites.subscribe(undefined, [
            where('customer.docId', '==', this.docId),
            orderBy('code', 'desc'),
            limit(10),
          ])
          this.showLast.sites = true
        } else {
          this.items.sites = this.listeners.sites.subscribe(newVal, [
            where('customer.docId', '==', this.docId),
            orderBy('code', 'desc'),
          ])
          this.showLast.sites = false
        }
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      const item = JSON.parse(JSON.stringify(this.model))
      const editMode = 'UPDATE'
      this.$refs[`customer-editor`].open({ item, editMode })
    },
    onSubmitComplete(event) {
      if (event.editMode === 'DELETE') {
        this.$router.replace(this.parentPath)
      }
    },
    onClickRegistSite() {
      const editMode = 'REGIST'
      this.$refs[`site-editor`].open({ editMode })
    },
  },
}
</script>

<template>
  <g-template-detail
    :actions="[{ event: 'edit', icon: 'mdi-pencil', color: 'green' }]"
    @click:edit="onClickEdit"
  >
    <v-breadcrumbs :items="breadcrumbs" />
    <v-row>
      <v-col cols="12">
        <g-card-customer v-bind="model" outlined />
      </v-col>
      <v-col cols="12" md="5">
        <g-card-map :value="model.address1" outlined height="600" />
      </v-col>
      <v-col cols="12" md="7">
        <g-card-sites
          :items="items.sites"
          :show-last="showLast.sites"
          height="600"
          :lazy-search.sync="lazySearch.sites"
          outlined
          @click:regist="onClickRegistSite"
          @click:row="$router.push(`/sites/${$event.docId}`)"
        />
        <!-- site editor -->
        <g-dialog-editor
          ref="site-editor"
          label="現場"
          model-id="Site"
          :default-item="{ customer: JSON.parse(JSON.stringify(model)) }"
        >
          <template #default="{ attrs, on }">
            <g-input-site v-bind="attrs" hide-customer v-on="on" />
          </template>
        </g-dialog-editor>
      </v-col>
    </v-row>
    <!-- editor -->
    <g-dialog-editor
      ref="customer-editor"
      label="取引先"
      model-id="Customer"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-customer v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor>
  </g-template-detail>
</template>

<style></style>
