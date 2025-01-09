<script>
/**
 * 現場の詳細画面です。
 * @author shisyamo4131
 */
import GDocumentManagerSite from '~/components/managers/GDocumentManagerSite.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GSiteContractsManager from '~/components/organisms/GSiteContractsManager.vue'
import GCardSiteOperationResultsViewer from '~/components/molecules/cards/GCardSiteOperationResultsViewer.vue'
import GCardSite from '~/components/molecules/cards/GCardSite.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GCardFloatingLabel from '~/components/atoms/cards/GCardFloatingLabel.vue'
import GDocumentsManagerSiteOperationSchedules from '~/components/managers/GDocumentsManagerSiteOperationSchedules.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteDetail',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDocumentManagerSite,
    GCardMap,
    GSiteContractsManager,
    GCardSiteOperationResultsViewer,
    GCardSite,
    GTemplateDefault,
    GCardFloatingLabel,
    GDocumentsManagerSiteOperationSchedules,
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
   * METHODS
   ***************************************************************************/
  methods: {
    onSubmitComplete(event) {
      if (event.editMode === 'DELETE') {
        this.$router.replace(this.parentPath)
      }
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-breadcrumbs :items="breadcrumbs" />
    <g-document-manager-site :doc-id="docId">
      <template #default="{ attrs, on }">
        <v-container>
          <v-row>
            <!-- 現場概要 -->
            <v-col cols="12">
              <g-card-site v-bind="attrs" outlined v-on="on" />
            </v-col>

            <!-- 稼働予定 -->
            <v-col cols="12">
              <g-card-floating-label
                label="稼働予定"
                color="primary"
                icon="mdi-calendar"
                outlined
              >
                <v-container fluid class="pt-0">
                  <g-documents-manager-site-operation-schedules
                    color="primary"
                    :site-id="docId"
                  />
                </v-container>
              </g-card-floating-label>
            </v-col>
          </v-row>
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
              <v-tab>所在地</v-tab>
              <v-tab>取極め</v-tab>
              <v-tab>稼働実績</v-tab>
            </v-tabs>

            <!-- TABS ITEMS -->
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <g-card-map :value="attrs.address" height="612" />
              </v-tab-item>
              <v-tab-item>
                <v-container fluid>
                  <g-site-contracts-manager :site-id="docId" />
                </v-container>
              </v-tab-item>
              <v-tab-item>
                <g-card-site-operation-results-viewer :site-id="docId" flat />
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-container>
      </template>
    </g-document-manager-site>
  </g-template-default>
</template>

<style></style>
