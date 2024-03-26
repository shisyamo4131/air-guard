<script>
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: undefined, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    style() {
      const isMobile = this.$vuetify.breakpoint.mobile
      return {
        width: isMobile ? '100%' : '120px',
        height: isMobile ? '24px' : '40px',
        'min-width': isMobile ? '100%' : '120px',
        'word-break': 'break-all',
        'padding-left': isMobile ? '4px' : '0px',
      }
    },
  },
}
</script>

<template>
  <div :class="{ 'd-flex': !$vuetify.breakpoint.mobile }">
    <div
      class="d-inline-flex align-center air-label text-caption pr-1"
      :style="style"
    >
      {{ label }}
    </div>
    <slot name="default" v-bind="{ attrs: $attrs, on: $listeners }" />
  </div>
</template>

<style></style>
