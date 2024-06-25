<script>
import GCustomerCard from '~/components/organisms/GCustomerCard.vue'
import GCustomerSites from '~/components/organisms/GCustomerSitesCard.vue'
import GMapCard from '~/components/organisms/GMapCard.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'CustomerDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCustomerSites, GMapCard, GCustomerCard },
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
   * COMPUTED
   ***************************************************************************/
  computed: {
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '取引先', to: '/customers', exact: true },
        { text: '取引先詳細', to: `/customers/${this.docId}` },
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
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <g-customer-card v-bind="model" flat outlined />
        </v-col>
        <v-col cols="12" md="5">
          <g-map-card :value="model.address1" flat outlined height="600" />
        </v-col>
        <v-col cols="12" md="7">
          <g-customer-sites
            :customer-id="docId"
            flat
            height="600"
            outlined
            @click:row="$router.push(`/sites/${$event.docId}`)"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
