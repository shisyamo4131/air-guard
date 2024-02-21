<template>
  <g-template-default>
    <v-container>
      <a-text-field v-model="value" ignore-surrogate-pair />
    </v-container>
  </g-template-default>
</template>

<script>
import ATextField from '~/components/atoms/inputs/ATextField.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { ATextField, GTemplateDefault },
  data() {
    return {
      // value: null,
      // multipleValue: [],
      value: 'cCKqxYVGLOWkTJViCar7',
      multipleValue: ['cCKqxYVGLOWkTJViCar7', 'QYPCuQGgHFxYGB3zwziK'],
      items: ['aaa', 'bbb'],
      search: null,
    }
  },
}
</script>

<style></style>
