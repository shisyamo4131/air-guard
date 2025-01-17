<script>
/**
 * 健康保険情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerHealthInsurances from '~/components/managers/GManagerHealthInsurances.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'HealthInsurancesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerHealthInsurances,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-health-insurances color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
