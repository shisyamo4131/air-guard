<script>
import GIconRegist from '~/components/atoms/icons/GIconRegist.vue'
export default {
  components: { GIconRegist },
}
</script>

<template>
  <v-btn v-bind="$attrs" icon v-on="$listeners">
    <g-icon-regist />
  </v-btn>
</template>

<style></style>
