<template>
  <g-template-default label="取引先詳細">
    <template #append-toolbar>
      <v-spacer />
      <v-toolbar-items>
        <v-btn text @click="$router.push(`/customers/${docId}/edit`)"
          ><v-icon left>mdi-pencil</v-icon>編集</v-btn
        >
      </v-toolbar-items>
    </template>
    <template #default>
      <v-container fluid>
        <v-card outlined>
          <v-simple-table>
            <tbody>
              <tr>
                <td>CODE</td>
                <td>{{ model.code }}</td>
              </tr>
              <tr>
                <td>取引先名1</td>
                <td>{{ model.name1 }}</td>
              </tr>
              <tr>
                <td>取引先名2</td>
                <td>{{ model.name2 }}</td>
              </tr>
              <tr>
                <td>略称</td>
                <td>{{ model.abbr }}</td>
              </tr>
              <tr>
                <td>略称カナ</td>
                <td>{{ model.abbrKana }}</td>
              </tr>
              <tr>
                <td>住所</td>
                <td>{{ model.address }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault },
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

<style></style>
