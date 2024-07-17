<script>
/**
 * ### pages.WorkRegulationDetail
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-17 - 初版作成
 */
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'WorkRegulationDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDetail, GDialogEditor, GInputWorkRegulation },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const model = app.$WorkRegulation()
    model.subscribeDoc(docId)
    return { docId, model }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    parentPath() {
      return this.$route.path.split('/').slice(0, -1).join('/')
    },
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '就業規則', to: this.parentPath, exact: true },
        { text: '就業規則詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      const item = JSON.parse(JSON.stringify(this.model))
      const editMode = 'UPDATE'
      this.$refs.editor.open({ item, editMode })
    },
    onSubmitComplete(event) {
      if (event.editMode === 'DELETE') {
        this.$router.replace(this.parentPath)
      }
    },
  },
}
</script>

<template>
  <g-template-detail
    :actions="[{ event: 'edit', icon: 'mdi-pencil', color: 'green' }]"
    @click:edit="onClickEdit"
  >
    <v-breadcrumbs :items="breadcrumbs" />
    <v-row>
      <v-col cols="12">
        {{ model }}
      </v-col>
    </v-row>
    <!-- editor -->
    <g-dialog-editor
      ref="editor"
      label="就業規則"
      model-id="WorkRegulation"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-work-regulation v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor>
  </g-template-detail>
</template>

<style></style>
