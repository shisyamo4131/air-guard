<template>
  <g-dialog-month-picker v-bind="$attrs" v-on="$listeners">
    <template #activator="{ attrs, on }">
      <slot name="activator" v-bind="{ attrs, on }">
        <v-text-field
          v-bind="attrs"
          class="center-input"
          style="max-width: 120px"
          label="年月"
          dense
          outlined
          hide-details
          v-on="on"
        />
      </slot>
    </template>
  </g-dialog-month-picker>
</template>

<script>
import GDialogMonthPicker from '../dialogs/GDialogMonthPicker.vue'
export default {
  components: { GDialogMonthPicker },
}
</script>

<style></style>
