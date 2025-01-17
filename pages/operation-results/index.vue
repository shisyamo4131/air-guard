<script>
/**
 * 稼働実績情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerOperationResults from '~/components/managers/GManagerOperationResults.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'OperationResultsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerOperationResults,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-operation-results color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
