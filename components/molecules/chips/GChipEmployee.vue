<script>
/**
 * A Chip component for displaying employee's simple information.
 *
 * - Show 'mdi-circle-double' before label if licensed property is true.
 * - Show 'mdi-star' after label if continuous property is true.
 * - Show 'mdi-alert-circle' after the label, set the v-chip color to ERROR, and display the error content in a tooltip.
 *
 * ### PROPS
 *
 * | name       | type    | default   | required | description             |
 * | ---------- | ------- | --------- | -------- | ----------------------- |
 * | errors     | array   | []        | false    |                         |
 * | licensed   | boolean | false     | false    | Show 'licensed-icon'.   |
 * | continuous | boolean | false     | false    | Show 'continuous-icon'. |
 * | docId      | string  |           | true     | Employee doc-id.        |
 *
 * @author shisyamo4131
 */
export default {
  props: {
    docId: { type: String, required: true },
    errors: { type: Array, default: () => [], required: false },
    licensed: { type: Boolean, default: false, required: false },
    continuous: { type: Boolean, default: false, required: false },
  },
  computed: {
    abbr() {
      const employee = this.$store.getters['masters/Employee'](this.docId)
      return employee?.abbr || undefined
    },
    color() {
      if (this.errors.length) return 'error'
      return 'primary'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" label v-on="$listeners">
    <div class="d-flex" style="width: 96px">
      <v-icon v-if="licensed" color="amber lighten-2" left x-small
        >mdi-circle-double</v-icon
      >
      <div class="text-truncate">
        <span v-if="abbr">{{ abbr }}</span>
        <v-progress-circular v-else :size="16" :width="2" indeterminate />
      </div>
      <div class="ml-auto">
        <v-tooltip v-if="errors.length" top>
          <template #activator="{ attrs, on }">
            <v-icon v-bind="attrs" small v-on="on">mdi-alert-circle</v-icon>
          </template>
          <ul v-for="(error, index) of errors" :key="index">
            <li>{{ error }}</li>
          </ul>
        </v-tooltip>
        <v-icon v-else-if="continuous" color="red" small>mdi-star</v-icon>
      </div>
    </div>
  </v-chip>
</template>

<style></style>
