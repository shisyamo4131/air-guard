<script>
/**
 * OutsourcerCard component for placements.
 * This component displays an outsourcer card with optional icons for continuous service or error.
 * It includes a start and end time, and options to edit or remove the card.
 *
 * - emits 'click:edit' event when edit-button is clicked.
 * - emits 'click:remove' event when edit-button is clicked.
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // Display the text in an abbreviated format if true
    ellipsis: { type: Boolean, default: false },
    // Target Outsourcer KEY
    outsourcerKey: { type: String, required: true },
    // End time in HH:MM format
    endTime: { type: String, default: '' },
    // Start time in HH:MM format
    startTime: { type: String, default: '' },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    outsourcerId() {
      return this.outsourcerKey.split('-')?.[0] || undefined
    },
    /**
     * Retrieve the outsourcer object from Vuex using the outsourcer ID.
     */
    outsourcer() {
      return this.$store.getters['outsourcers/get'](this.outsourcerId) || {}
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-text :class="ellipsis ? 'pa-1' : 'pa-2'">
      <div class="d-flex">
        <div>
          <!-- Main line -->
          <div class="d-flex">
            <!-- Remove button -->
            <v-btn icon x-small @click="$emit('click:remove')">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
            <h4 class="text-truncate" style="max-width: 120px">
              {{ outsourcer?.abbr || 'N/A' }}
            </h4>
          </div>
          <!--
            Start and end time
            - It is displayed only when the ellipsis property is set to true.
          -->
          <div v-show="!ellipsis">
            <div class="d-flex align-center">
              <v-icon left small>mdi-clock-outline</v-icon>
              <div>{{ startTime }}</div>
              <div>-</div>
              <div>{{ endTime }}</div>
              <v-btn class="ml-1" icon x-small @click="$emit('click:edit')">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
        <v-icon class="handle ml-auto">mdi-arrow-all</v-icon>
      </div>
    </v-card-text>
  </v-card>
</template>

<style>
/* Add custom styling here as needed */
</style>
