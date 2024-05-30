<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    min-width="auto"
    offset-y
  >
    <template #activator="{ attrs, on }">
      <slot
        name="activator"
        v-bind="{
          attrs: { ...attrs, readonly: true, value: formattedValue },
          on,
        }"
      >
      </slot>
    </template>
    <g-date-picker v-model="selectedDate" no-title>
      <v-btn small @click="menu = false">cancel</v-btn>
      <v-spacer />
      <v-btn color="primary" small @click="onClickSubmit">submit</v-btn>
    </g-date-picker>
  </v-menu>
</template>

<script>
import GDatePicker from '~/components/atoms/pickers/GDatePicker.vue'
export default {
  components: { GDatePicker },
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined, required: false },
  },
  data() {
    return {
      menu: false,
      selectedDate: undefined,
    }
  },
  computed: {
    formattedValue() {
      if (!this.value) return undefined
      return this.$dayjs(this.value).format('YYYY年MM月DD日(ddd)')
    },
  },
  watch: {
    menu(v) {
      this.selectedDate = this.value
    },
    value: {
      handler(v) {
        this.selectedDate = v
      },
      immediate: true,
    },
  },
  methods: {
    onClickSubmit() {
      this.$emit('input', this.selectedDate)
      this.menu = false
    },
    onClickCancel() {
      this.menu = false
    },
  },
}
</script>

<style></style>
