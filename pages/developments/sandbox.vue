<template>
  <g-template-default>
    <v-container>
      <v-form v-model="valid">
        <g-text-field-code v-model="value" required @blur="test" />
        <div>
          {{ value }}
        </div>
        <div>
          {{ valid }}
        </div>
      </v-form>
    </v-container>
  </g-template-default>
</template>

<script>
import GTextFieldCode from '~/components/molecules/inputs/GTextFieldCode.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, GTextFieldCode },
  data() {
    return {
      valid: false,
      value: null,
      // multipleValue: [],
      // value: 'cCKqxYVGLOWkTJViCar7',
      // multipleValue: ['cCKqxYVGLOWkTJViCar7', 'QYPCuQGgHFxYGB3zwziK'],
      // items: ['aaa', 'bbb'],
      // search: null,
    }
  },
  methods: {
    test() {
      console.log('OK')
    },
  },
}
</script>

<style></style>
