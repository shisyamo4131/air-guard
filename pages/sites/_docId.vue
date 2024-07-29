<script>
/**
 * ### pages.SiteDetail
 *
 * 現場の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-29 - レイアウトを変更（tab化）
 *                              - 稼働予定の更新履歴を表示する`GSiteOperationScheduleHistory`を配置。
 * - version 1.0.1 - 2024-07-17 - ページ遷移に$routeを使用。
 * - version 1.0.0 - xxxx-xx-xx - 初版作成
 */
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GCardSite from '~/components/organisms/GCardSite.vue'
import GSiteContractsTimeline from '~/components/organisms/GSiteContractsTimeline.vue'
import GSiteOperationScheduleCalendar from '~/components/organisms/GSiteOperationScheduleCalendar.vue'
import GSiteOperationScheduleHistory from '~/components/organisms/GSiteOperationScheduleHistory.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSiteOperationScheduleCalendar,
    GCardMap,
    GCardSite,
    GSiteContractsTimeline,
    GTemplateDetail,
    GInputSite,
    GDialogEditor,
    GSiteOperationScheduleHistory,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listeners = {
      site: app.$Site(),
    }
    listeners.site.subscribeDoc(docId)
    return { docId, listeners }
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
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listeners.site.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      const item = JSON.parse(JSON.stringify(this.listeners.site))
      const editMode = 'UPDATE'
      this.$refs[`site-editor`].open({ item, editMode })
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
      <g-card-site v-bind="listeners.site" outlined />
    </v-container>

    <v-container>
      <v-card outlined>
        <!-- TABS -->
        <v-tabs v-model="tab" background-color="primary" center-active dark>
          <v-tab>稼働予定</v-tab>
          <v-tab>所在地</v-tab>
          <v-tab>取極め</v-tab>
        </v-tabs>

        <!-- TABS ITEMS -->
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-row no-gutters>
              <v-col cols="12" md="6" style="height: 612px">
                <g-site-operation-schedule-calendar
                  :site-id="docId"
                  flat
                  height="100%"
                />
              </v-col>
              <v-col cols="12" md="6" style="height: 612px">
                <v-container style="height: 100%">
                  <g-site-operation-schedule-history
                    height="100%"
                    class="overflow-y-auto"
                    :site-id="docId"
                    outlined
                  />
                </v-container>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <g-card-map :value="listeners.site.address" height="612" />
          </v-tab-item>
          <v-tab-item>
            <g-site-contracts-timeline :site-id="docId" />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-container>
    <!-- editor -->
    <g-dialog-editor
      ref="site-editor"
      label="現場"
      model-id="Site"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-site v-bind="attrs" hide-customer v-on="on" />
      </template>
    </g-dialog-editor>
  </g-template-detail>
</template>

<style></style>
