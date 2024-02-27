<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.operation-result.docId.edit
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputOperationResult, ARenderlessCrud, GTemplateEditor },
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
    edit-mode="UPDATE"
    @submit:complete="$router.push(`/operation-results/${docId}`)"
    @cancel="$router.push(`/operation-results/${docId}`)"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="稼働実績編集" v-bind="status" v-on="actions">
        <g-input-operation-result v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
