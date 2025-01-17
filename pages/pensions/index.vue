<script>
/**
 * 厚生年金情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerPensions from '~/components/managers/GManagerPensions.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'PensionsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerPensions,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-pensions color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
