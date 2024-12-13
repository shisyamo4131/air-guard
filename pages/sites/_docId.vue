<script>
/**
 * ### pages.SiteDetail
 *
 * 現場の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GCardSite from '~/components/molecules/cards/GCardSite.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import Site from '~/models/Site'
import GSiteOperationScheduleManager from '~/components/organisms/GSiteOperationScheduleManager.vue'
import GSiteContractsManager from '~/components/organisms/GSiteContractsManager.vue'
import GCardSiteOperationResultsViewer from '~/components/molecules/cards/GCardSiteOperationResultsViewer.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCardMap,
    GCardSite,
    GTemplateDetail,
    GInputSite,
    GDialogInput,
    GSiteOperationScheduleManager,
    GSiteContractsManager,
    GCardSiteOperationResultsViewer,
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
    return { docId }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      listener: new Site(),
      tab: 0,
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
        { text: '現場', to: this.parentPath, exact: true },
        { text: '現場詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.listener.subscribe(this.docId)
  },
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
    /**
     * 現場データの編集画面を開きます。
     */
    onClickEdit() {
      this.editMode = this.UPDATE
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

    <!-- 現場概要 -->
    <v-container>
      <g-card-site :instance="listener" outlined />
    </v-container>

    <v-container>
      <v-card outlined>
        <!-- TABS -->
        <v-tabs
          v-model="tab"
          background-color="primary"
          center-active
          dark
          show-arrows
        >
          <v-tab>稼働予定</v-tab>
          <v-tab>所在地</v-tab>
          <v-tab>取極め</v-tab>
          <v-tab>稼働実績</v-tab>
        </v-tabs>

        <!-- TABS ITEMS -->
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-row no-gutters>
              <v-col cols="12">
                <v-container fluid>
                  <g-site-operation-schedule-manager
                    :site-id="listener.docId"
                  />
                </v-container>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <g-card-map :value="listener.address" height="612" />
          </v-tab-item>
          <v-tab-item>
            <v-container fluid>
              <g-site-contracts-manager :site-id="listener.docId" />
            </v-container>
          </v-tab-item>
          <v-tab-item>
            <g-card-site-operation-results-viewer
              :site-id="listener.docId"
              flat
            />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-container>

    <!-- editor -->
    <g-dialog-input
      v-model="dialog"
      :edit-mode.sync="editMode"
      :instance="listener"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-site v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-input>
  </g-template-detail>
</template>

<style></style>
