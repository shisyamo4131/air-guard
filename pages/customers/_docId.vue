<script>
/**
 * ### pages.CustomerDetail
 *
 * 取引先の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GCardCustomer from '~/components/molecules/cards/GCardCustomer.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
// import GSitesManager from '~/components/organisms/GSitesManager.vue'
import Customer from '~/models/Customer'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
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
    GInputCustomer,
    // GSitesManager,
    GDialogInput,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],
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
      dialog: false,
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
  watch: {},
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      this.dialog = true
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
        <g-card-customer v-bind="listener" outlined />
      </v-col>
      <v-col cols="12" md="5">
        <g-card-map :value="listener.address1" outlined height="600" />
      </v-col>
      <v-col cols="12" md="7">
        <!-- <g-sites-manager outlined :customer-id="docId" height="600" /> -->
      </v-col>
    </v-row>
    <!-- editor -->
    <g-dialog-input
      v-model="dialog"
      :edit-mode="UPDATE"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-customer v-bind="attrs" :instance="listener" v-on="on" />
      </template>
    </g-dialog-input>
  </g-template-detail>
</template>

<style></style>
