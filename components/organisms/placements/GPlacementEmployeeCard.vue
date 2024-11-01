<script>
/**
 * EmployeeCard component for placements.
 * This component displays an employee card with optional icons for continuous service or error.
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
    // Target Employee ID
    employeeId: { type: String, required: true },
    // End time in HH:MM format
    endTime: { type: String, default: '' },
    // Show an icon at the beginning of the name if the service is continuous
    showContinuous: { type: Boolean, default: false },
    // Show an error icon at the beginning of the employee name if true
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
    /**
     * Retrieve the employee object from Vuex using the employee ID.
     */
    employee() {
      return this.$store.getters['employees/get'](this.employeeId) || {}
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
        <v-icon class="handle" left small>mdi-menu</v-icon>
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
        <h4>{{ employee?.abbr || 'N/A' }}</h4>
        <v-spacer />
        <!--
          Edit button
          - It is displayed only when the ellipsis property is set to true.
        -->
        <v-btn v-if="!ellipsis" icon x-small @click="$emit('click:edit')">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
        <!-- Remove button -->
        <v-btn icon x-small @click="$emit('click:remove')">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
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
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style>
/* Add custom styling here as needed */
</style>
