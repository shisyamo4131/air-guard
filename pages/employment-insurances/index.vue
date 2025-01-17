<script>
/**
 * 雇用保険情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerEmploymentInsurances from '~/components/managers/GManagerEmploymentInsurances.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmploymentInsurancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerEmploymentInsurances,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-employment-insurances color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
