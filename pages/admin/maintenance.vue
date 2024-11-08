<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <g-maintenance-refresh-employee-site-history />
      </v-col>
      <v-col cols="12">
        <g-maintenance-refresh-index />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import GMaintenanceRefreshEmployeeSiteHistory from '~/components/organisms/maintenances/GMaintenanceRefreshEmployeeSiteHistory.vue'
import GMaintenanceRefreshIndex from '~/components/organisms/maintenances/GMaintenanceRefreshIndex.vue'
export default {
  components: {
    GMaintenanceRefreshEmployeeSiteHistory,
    GMaintenanceRefreshIndex,
  },
}
</script>

<style></style>
