<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputOperationResult from '~/components/molecules/inputs/GInputOperationResult.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.operation-results.regist
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateEditor, GInputOperationResult, ARenderlessCrud },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$OperationResult()
    return { model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="REGIST"
    @submit:complete="$router.push(`/operation-results/${model.docId}`)"
    @cancel="$router.push('/operation-results')"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="取引先登録" v-bind="status" v-on="actions">
        <g-input-operation-result v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
