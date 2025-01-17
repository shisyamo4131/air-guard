<script>
/**
 * 休暇申請情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GManagerLeaveApplications from '~/components/managers/GManagerLeaveApplications.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'LeaveApplicationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GManagerLeaveApplications,
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <g-manager-leave-applications color="primary" height="100%" />
    </v-container>
  </g-template-default>
</template>

<style></style>
