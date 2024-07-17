<script>
/**
 * ### pages.WorkRegulationIndex
 *
 * 就業規則情報の一覧ページです。
 * 就業規則情報（WorkRegulations）はVuexから取得します。
 *
 * @author shisyamo4131
 * @version 1.0.0 - 2024-07-17
 */
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GDataTableWorkRegulations from '~/components/molecules/tables/GDataTableWorkRegulations.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'WorkRegulationsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputWorkRegulation,
    GTemplateIndex,
    GDialogEditor,
    GDataTableWorkRegulations,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listener = app.$WorkRegulation()
    const items = listener.subscribe()
    return { docId, items, listener }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
}
</script>

<template>
  <g-template-index :items="items">
    <template #append-search>
      <g-dialog-editor
        label="就業規則"
        model-id="WorkRegulation"
        @submit:complete="$router.push(`${$route.path}/${$event.item.docId}`)"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-work-regulation v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-work-regulations
        v-bind="attrs"
        :search="search"
        @click:row="$router.push(`${$route.path}/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
