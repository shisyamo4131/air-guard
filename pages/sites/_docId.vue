<script>
import GMapCard from '~/components/organisms/GMapCard.vue'
import GSiteCard from '~/components/organisms/GSiteCard.vue'
import GSiteOperationScheduleCalendar from '~/components/organisms/GSiteOperationScheduleCalendar.vue'
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
    GMapCard,
    GSiteCard,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Site()
    model.subscribeDoc(docId)
    return { docId, model }
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
    this.model.unsubscribe()
  },
}
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container>
      <v-row>
        <v-col cols="12">
          <g-site-card v-bind="model" outlined flat />
        </v-col>
        <v-col cols="12" md="5">
          <g-map-card :value="model.address" height="612" flat outlined />
        </v-col>
        <v-col cols="12" md="7">
          <g-site-operation-schedule-calendar
            :site-id="docId"
            height="612"
            flat
            outlined
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
