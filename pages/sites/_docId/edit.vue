<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.site.docId.edit
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GInputSite, ARenderlessCrud, GTemplateEditor },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  async asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$Site()
    await model.fetch(docId)
    return { docId, model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="UPDATE"
    @submit:complete="$router.push(`/sites/${docId}`)"
    @cancel="$router.push(`/sites/${docId}`)"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="現場編集" v-bind="status" v-on="actions">
        <g-input-site v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
