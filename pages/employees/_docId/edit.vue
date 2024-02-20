<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.employee.docId.edit
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputEmployee, ARenderlessCrud, GTemplateEditor },
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
    edit-mode="UPDATE"
    @submit:complete="$router.push(`/employees/${docId}`)"
    @cancel="$router.push(`/employees/${docId}`)"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="従業員編集" v-bind="status" v-on="actions">
        <g-input-employee v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
