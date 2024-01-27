<template>
  <g-template-default>
    <v-container>
      <v-text-field v-model="value" @change="test" />
    </v-container>
  </g-template-default>
</template>

<script>
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault },
  data() {
    return {
      value: null,
    }
  },
  methods: {
    test(event) {
      console.log(event)
    },
  },
}
</script>

<style></style>
