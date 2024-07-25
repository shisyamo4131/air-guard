<script>
/**
 * ### pages.CustomerDetail
 *
 * 取引先の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-25 - 現場管理用コンポーネントを`GCardSites`から`GSitesManager`に変更。
 * - version 1.0.1 - 2024-07-17 - ページ遷移に$routeを使用。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GCardCustomer from '~/components/molecules/cards/GCardCustomer.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GSitesManager from '~/components/organisms/GSitesManager.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardMap,
    GCardCustomer,
    GTemplateDetail,
    GDialogEditor,
    GInputCustomer,
    GSitesManager,
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
    return {}
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
  watch: {},
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
        <g-sites-manager outlined :customer-id="docId" height="600" />
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
