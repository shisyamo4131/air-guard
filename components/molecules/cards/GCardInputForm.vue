<template>
  <v-card>
    <v-card-title>{{ label }}</v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent>
        <slot name="default" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn :disabled="loading" @click="$emit('click:cancel')">cancel</v-btn>
      <v-btn
        :disabled="loading"
        :loading="loading"
        color="primary"
        @click="$emit('click:submit')"
        >submit</v-btn
      >
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
    onClickSubmit() {
      if (!this.$refs.form.validate()) {
        alert('入力に不備があります。')
        return
      }
      this.$emit('click:submit')
    },
  },
}
</script>

<style></style>
