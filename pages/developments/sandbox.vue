<template>
  <g-template-default>
    <v-container> </v-container>
  </g-template-default>
</template>

<script>
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import { props } from '~/models/Customer'
export default {
  components: { GTemplateDefault },
  mixins: [props],
  props: {
    test: { type: String, default: '', required: false },
  },
  data() {
    return {
      model: this.$Customer(),
    }
  },
}
</script>

<style></style>
