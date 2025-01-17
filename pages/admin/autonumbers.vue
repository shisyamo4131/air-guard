<script>
/**
 * 自動採番の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerAutonumbers from '~/components/managers/GManagerAutonumbers.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AutonumbersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerAutonumbers,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-autonumbers color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
