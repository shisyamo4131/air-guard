<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
import GInputSite from '~/components/molecules/inputs/GInputSite.vue'
import GTemplateEditor from '~/components/templates/GTemplateEditor.vue'
/**
 * ## page.sites.regist
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateEditor, GInputSite, ARenderlessCrud },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Site()
    return { model }
  },
}
</script>

<template>
  <a-renderless-crud
    :model="model"
    edit-mode="REGIST"
    @submit:complete="$router.push(`/sites/${model.docId}`)"
    @cancel="$router.push('/sites')"
  >
    <template #default="{ attrs, on, status, actions }">
      <g-template-editor label="現場登録" v-bind="status" v-on="actions">
        <g-input-site v-bind="attrs" v-on="on" />
      </g-template-editor>
    </template>
  </a-renderless-crud>
</template>

<style></style>
