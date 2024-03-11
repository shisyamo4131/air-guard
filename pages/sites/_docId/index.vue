<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GDataTableSiteContracts from '~/components/molecules/tables/GDataTableSiteContracts.vue'
import GSimpleTableSite from '~/components/molecules/tables/GSimpleTableSite.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
/**
 * ## page.sites.docId
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GSimpleTableSite,
    ARenderlessCrud,
    GDataTableSiteContracts,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Site()
    await model.fetch(docId)
    const modelSiteContract = app.$SiteContract(docId)
    const siteContracts = await modelSiteContract.fetchDocs()
    return { docId, model, siteContracts }
  },
  data() {
    return {
      tab: null,
    }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="DELETE"
    @submit:complete="$router.replace('/sites')"
  >
    <template #default="{ actions }">
      <g-template-default label="現場詳細">
        <template #prepend-toolbar>
          <v-btn icon @click="$router.push('/sites')"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
        </template>
        <template #append-toolbar>
          <v-spacer />
          <v-btn icon @click="$router.push(`/sites/${docId}/edit`)"
            ><v-icon>mdi-pencil</v-icon></v-btn
          >
        </template>
        <template #default>
          <v-tabs v-model="tab">
            <v-tab>登録情報</v-tab>
            <v-tab>契約情報</v-tab>
          </v-tabs>
          <v-container fluid>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-card outlined>
                  <g-simple-table-site v-bind="model" />
                </v-card>
                <air-dialog-confirm-delete v-on="actions">
                  <template #activator="{ attrs, on }">
                    <v-btn
                      class="mt-4"
                      v-bind="attrs"
                      block
                      color="error"
                      small
                      v-on="on"
                      >この現場を削除する</v-btn
                    >
                  </template>
                </air-dialog-confirm-delete>
              </v-tab-item>
              <v-tab-item>
                <g-data-table-site-contracts :items="siteContracts" />
              </v-tab-item>
            </v-tabs-items>
          </v-container>
        </template>
      </g-template-default>
    </template>
  </a-renderless-crud>
</template>

<style></style>
