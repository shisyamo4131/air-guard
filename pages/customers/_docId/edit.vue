<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.customer.docId.edit
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputCustomer, ARenderlessCrud, GTemplateEditor },
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
  <a-renderless-crud
    :model="model"
    edit-mode="UPDATE"
    @submit:complete="$router.push(`/customers/${docId}`)"
    @cancel="$router.push(`/customers/${docId}`)"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="取引先編集" v-bind="status" v-on="actions">
        {{ attrs }}
        <g-input-customer v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
