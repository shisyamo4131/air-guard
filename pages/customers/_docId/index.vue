<script>
import { limit, where } from 'firebase/firestore'
import AIconEdit from '~/components/atoms/icons/AIconEdit.vue'
import AIconPrev from '~/components/atoms/icons/AIconPrev.vue'
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GBtnDelete from '~/components/molecules/btns/GBtnDelete.vue'
import GSimpleTableCustomer from '~/components/molecules/tables/GSimpleTableCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GDataTableSites from '~/components/molecules/tables/GDataTableSites.vue'
/**
 * ## page.customers.docId
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GSimpleTableCustomer,
    ARenderlessCrud,
    GBtnDelete,
    AIconEdit,
    AIconPrev,
    GDataTableSites,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Customer()
    await model.fetch(docId)
    const siteModel = app.$Site()
    const siteDefaultConstraints = [
      where('customer.docId', '==', docId),
      limit(10),
    ]
    const sites = siteModel.subscribe(undefined, siteDefaultConstraints)
    return { docId, model, siteModel, siteDefaultConstraints, sites }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      site: {
        lazySearch: null,
      },
      tab: 1,
    }
  },
  watch: {
    'site.lazySearch'(newVal, oldVal) {
      if (newVal === oldVal) return
      if (!newVal) {
        this.sites = this.siteModel.subscribe(
          undefined,
          this.siteDefaultConstraints
        )
      } else {
        this.sites = this.siteModel.subscribe(newVal)
      }
    },
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="DELETE"
    @submit:complete="$router.replace('/customers')"
  >
    <template #default="{ actions }">
      <g-template-default label="取引先詳細">
        <template #prepend-toolbar>
          <v-btn icon @click="$router.push('/customers')">
            <a-icon-prev />
          </v-btn>
        </template>
        <template #append-toolbar>
          <v-spacer />
          <v-btn icon @click="$router.push(`/customers/${docId}/edit`)">
            <a-icon-edit color="undefined" />
          </v-btn>
        </template>
        <template #default="{ height }">
          <v-tabs v-model="tab">
            <v-tab>登録情報</v-tab>
            <v-tab>現場情報</v-tab>
          </v-tabs>
          <v-container fluid>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-card outlined>
                  <g-simple-table-customer v-bind="model" />
                  <v-divider />
                  <v-card-actions>
                    <air-dialog-confirm-delete v-on="actions">
                      <template #activator="{ attrs, on }">
                        <g-btn-delete v-bind="attrs" block small v-on="on"
                          >この取引先を削除する</g-btn-delete
                        >
                      </template>
                    </air-dialog-confirm-delete>
                  </v-card-actions>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <g-data-table-sites
                  :height="height - 72"
                  :items="sites"
                  :lazy-search.sync="site.lazySearch"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-container>
        </template>
      </g-template-default>
    </template>
  </a-renderless-crud>
</template>

<style></style>
