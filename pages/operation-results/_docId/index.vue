<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GSimpleTableOperationResult from '~/components/molecules/tables/GSimpleTableOperationResult.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
/**
 * ## page.operation-results.docId
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GSimpleTableOperationResult,
    ARenderlessCrud,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$OperationResult()
    await model.fetch(docId)
    return { docId, model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="DELETE"
    @submit:complete="$router.replace('/operation-results')"
  >
    <template #default="{ actions }">
      <g-template-default label="稼働実績詳細">
        <template #prepend-toolbar>
          <v-btn icon @click="$router.push('/operation-results')"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
        </template>
        <template #append-toolbar>
          <v-spacer />
          <v-btn icon @click="$router.push(`/operation-results/${docId}/edit`)"
            ><v-icon>mdi-pencil</v-icon></v-btn
          >
        </template>
        <template #default>
          <v-container fluid>
            <v-card outlined>
              <g-simple-table-operation-result v-bind="model" />
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
                  >この稼働実績を削除する</v-btn
                >
              </template>
            </air-dialog-confirm-delete>
          </v-container>
        </template>
      </g-template-default>
    </template>
  </a-renderless-crud>
</template>

<style></style>
