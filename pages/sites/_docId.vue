<script>
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GCardSite from '~/components/organisms/GCardSite.vue'
// import GSiteContractsTimeline from '~/components/organisms/GSiteContractsTimeline.vue'
import GSiteOperationScheduleCalendar from '~/components/organisms/GSiteOperationScheduleCalendar.vue'
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
    // GSiteContractsTimeline,
    GTemplateDetail,
    GInputSite,
    GDialogEditor,
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
   * COMPUTED
   ***************************************************************************/
  computed: {
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '現場', to: '/sites', exact: true },
        { text: '現場詳細', to: `/sites/${this.docId}` },
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
        this.$router.replace(`/sites`)
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
    <v-container>
      <v-row>
        <v-col cols="12">
          <g-card-site v-bind="listeners.site" outlined />
        </v-col>
        <v-col cols="12" md="5">
          <g-card-map :value="listeners.site.address" height="612" outlined />
        </v-col>
        <v-col cols="12" md="7">
          <g-site-operation-schedule-calendar
            :site-id="docId"
            height="612"
            outlined
          />
        </v-col>
        <!-- <v-col cols="12">
          <g-site-contracts-timeline outlined :site-id="docId" />
        </v-col> -->
      </v-row>
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
