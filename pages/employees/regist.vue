<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.employees.regist
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateEditor, GInputEmployee, ARenderlessCrud },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Employee()
    return { model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="REGIST"
    @submit:complete="$router.push(`/employees/${model.docId}`)"
    @cancel="$router.push('/employees')"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="従業員登録" v-bind="status" v-on="actions">
        <g-input-employee v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
