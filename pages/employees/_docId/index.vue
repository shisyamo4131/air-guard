<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GSimpleTableEmployee from '~/components/molecules/tables/GSimpleTableEmployee.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
/**
 * ## page.employees.docId
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault, GSimpleTableEmployee, ARenderlessCrud },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Employee()
    await model.fetch(docId)
    return { docId, model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="DELETE"
    @submit:complete="$router.replace('/employees')"
  >
    <template #default="{ actions }">
      <g-template-default label="従業員詳細">
        <template #prepend-toolbar>
          <v-btn icon @click="$router.push('/employees')"
            ><v-icon>mdi-chevron-left</v-icon></v-btn
          >
        </template>
        <template #append-toolbar>
          <v-spacer />
          <v-btn icon @click="$router.push(`/employees/${docId}/edit`)"
            ><v-icon>mdi-pencil</v-icon></v-btn
          >
        </template>
        <template #default>
          <v-container fluid>
            <v-card outlined>
              <g-simple-table-employee v-bind="model" />
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
                  >この従業員を削除する</v-btn
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
