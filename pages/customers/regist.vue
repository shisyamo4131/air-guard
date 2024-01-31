<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.customers.regist
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateEditor, GInputCustomer, ARenderlessCrud },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Customer()
    return { model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="REGIST"
    @submit:complete="$router.push(`/customers/${model.docId}`)"
    @cancel="$router.push('/customers')"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="取引先登録" v-bind="status" v-on="actions">
        <g-input-customer v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
