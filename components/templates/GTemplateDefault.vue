<script>
/**
 * ### GTemplateDefault
 * @author shisyamo4131
 */
export default {
  props: {
    label: { type: String, default: undefined, required: false },
  },
  computed: {
    templateHeight() {
      const top = this.$vuetify.application.top
      const bar = this.$vuetify.application.bar
      const footer = this.$vuetify.application.footer
      const bottom = this.$vuetify.application.bottom
      const padding = this.$vuetify.breakpoint.xs ? 0 : 24
      const height = this.$vuetify.breakpoint.height
      return height - (top + bar + footer + bottom + padding)
    },
    containerHeight() {
      return this.templateHeight - this.toolbarHeight
    },
    toolbarHeight() {
      return 48
    },
  },
}
</script>

<template>
  <div :style="{ height: `${templateHeight}px` }">
    <v-toolbar color="primary" dark dense flat>
      <slot name="prepend-toolbar" v-bind="{ label }" />
      <v-toolbar-title>{{ label }}</v-toolbar-title>
      <v-spacer />
      <slot name="append-toolbar" v-bind="{ label }" />
    </v-toolbar>
    <div class="overflow-y-auto" :style="{ height: `${containerHeight}px` }">
      <slot name="default" v-bind="{ height: containerHeight }" />
    </div>
  </div>
</template>

<style></style>
