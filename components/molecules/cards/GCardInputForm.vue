<template>
  <v-card>
    <v-card-title>{{ label }}</v-card-title>
    <v-card-text class="py-5 px-6">
      <v-form ref="form" @submit.prevent>
        <slot name="default" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn :disabled="loading" @click="$emit('click:cancel')">cancel</v-btn>
      <slot
        name="btn-submit"
        v-bind="{
          attrs: { disabled: loading, loading },
          on: { click: onClickSubmit },
        }"
      >
        <v-btn
          :disabled="loading"
          :loading="loading"
          color="primary"
          @click="onClickSubmit"
          >submit</v-btn
        >
      </slot>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    label: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
  },
  methods: {
    initialize() {
      this.$refs.form.reset()
    },
    validate() {
      const result = this.$refs.form.validate()
      if (!result) {
        alert('入力に不備があります。')
      }
      return result
    },
    onClickSubmit() {
      if (!this.validate()) return
      this.$emit('click:submit')
    },
  },
}
</script>

<style></style>
