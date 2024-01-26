<script>
import GSimpleTableCustomer from '~/components/molecules/tables/GSimpleTableCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
/**
 * ## page.customers.docId
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GSimpleTableCustomer },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Customer()
    await model.fetch(docId)
    return { docId, model }
  },
}
</script>

<template>
  <g-template-default label="取引先詳細">
    <template #prepend-toolbar>
      <v-btn icon @click="$router.push('/customers')"
        ><v-icon>mdi-chevron-left</v-icon></v-btn
      >
    </template>
    <template #append-toolbar>
      <v-spacer />
      <v-btn icon @click="$router.push(`/customers/${docId}/edit`)"
        ><v-icon>mdi-pencil</v-icon></v-btn
      >
    </template>
    <template #default>
      <v-container fluid>
        <v-card outlined>
          <g-simple-table-customer v-bind="model" />
        </v-card>
      </v-container>
    </template>
  </g-template-default>
</template>

<style></style>
