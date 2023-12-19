<script>
/**
 * A chip component for displaying work-shift.
 * @author shisyamo4131
 */
export default {
  props: {
    value: {
      type: String,
      validator: (v) => ['day', 'night'].includes(v),
      required: true,
    },
  },
  computed: {
    label() {
      return this.value === 'day' ? '日勤' : '夜勤'
    },
    color() {
      return this.value === 'day' ? 'orange' : 'indigo'
    },
    dark() {
      return this.value !== 'day'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" :dark="dark" v-on="$listeners">
    {{ label }}
  </v-chip>
</template>

<style></style>
