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
    // Show an icon at the beginning of the name if the service is continuous
    showContinuous: { type: Boolean, default: false },
    // Show an error icon at the beginning of the outsourcer name if true
    showError: { type: Boolean, default: false },
    // 存在状態にするかどうかです
    showExist: { type: Boolean, default: false },
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
  <v-card
    v-bind="$attrs"
    :color="showExist ? 'red' : undefined"
    v-on="$listeners"
  >
    <v-card-text :class="ellipsis ? 'pa-1' : 'pa-2'">
      <!-- Main line -->
      <div class="d-flex">
        <!-- Remove button -->
        <v-btn icon x-small @click="$emit('click:remove')">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
        <!--
          Error icon
          - It takes priority over the continuous icon when displayed.
        -->
        <v-icon v-if="showError" left small color="error">
          mdi-alert-circle
        </v-icon>
        <!-- Coutinuous icon -->
        <v-icon v-else-if="showContinuous" left small color="warning">
          mdi-star
        </v-icon>
        <h4>{{ outsourcer?.abbr || 'N/A' }}</h4>
        <v-spacer />
        <v-icon class="handle" left small>mdi-arrow-all</v-icon>
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
    </v-card-text>
  </v-card>
</template>

<style>
/* Add custom styling here as needed */
</style>
