<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <g-maintenance-refresh-employee-site-history />
      </v-col>
      <v-col cols="12">
        <g-maintenance-refresh-site-employee-history />
      </v-col>
      <v-col cols="12" md="6">
        <g-maintenance-refresh-index />
      </v-col>
      <v-col cols="12" md="6">
        <g-maintenance-clean-up-placements />
      </v-col>
      <v-col cols="12">
        <g-maintenance-integrate-site-operation-schedules />
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>従業員データ空更新</v-card-title>
          <v-card-actions>
            <v-btn @click="test">test</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { httpsCallable } from 'firebase/functions'
import { functions } from 'air-firebase'
import GMaintenanceCleanUpPlacements from '~/components/organisms/maintenances/GMaintenanceCleanUpPlacements.vue'
import GMaintenanceIntegrateSiteOperationSchedules from '~/components/organisms/maintenances/GMaintenanceIntegrateSiteOperationSchedules.vue'
import GMaintenanceRefreshEmployeeSiteHistory from '~/components/organisms/maintenances/GMaintenanceRefreshEmployeeSiteHistory.vue'
import GMaintenanceRefreshIndex from '~/components/organisms/maintenances/GMaintenanceRefreshIndex.vue'
import GMaintenanceRefreshSiteEmployeeHistory from '~/components/organisms/maintenances/GMaintenanceRefreshSiteEmployeeHistory.vue'

export default {
  components: {
    GMaintenanceRefreshEmployeeSiteHistory,
    GMaintenanceRefreshIndex,
    GMaintenanceRefreshSiteEmployeeHistory,
    GMaintenanceCleanUpPlacements,
    GMaintenanceIntegrateSiteOperationSchedules,
  },
  methods: {
    async test() {
      try {
        const api = httpsCallable(functions, `maintenance-api`)
        const result = await api({ functionName: 'emptyUpdate' })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      }
    },
  },
}
</script>

<style></style>
