<template>
  <v-container>
    <v-card>
      <v-card-text>
        <g-input-site-operation-schedule-bulk v-bind.sync="model" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import GInputSiteOperationScheduleBulk from '~/components/molecules/inputs/GInputSiteOperationScheduleBulk.vue'
export default {
  components: { GInputSiteOperationScheduleBulk },
  data() {
    return {
      model: this.$SiteOperationScheduleBulk({
        siteId: 'KFLWoTljBjmlDbGi992A',
        workShift: 'day',
      }),
    }
  },
}
</script>

<style></style>
