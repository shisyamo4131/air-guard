<script>
/**
 * ## GTemplateEditor
 *
 * @author shisyamo4131
 */
import GTemplateDefault from './GTemplateDefault.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateDefault },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    loading: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickCancel() {
      this.$emit('click:cancel')
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

<template>
  <g-template-default v-bind="$attrs" v-on="$listeners">
    <template #prepend-toolbar>
      <v-btn :disabled="loading" icon @click="onClickCancel"
        ><v-icon>mdi-chevron-left</v-icon></v-btn
      >
    </template>
    <template #append-toolbar>
      <v-btn :disabled="loading" icon :loading="loading" @click="onClickSubmit"
        ><v-icon>mdi-check</v-icon></v-btn
      >
    </template>
    <template #default>
      <v-container fluid class="py-5 px-6">
        <v-form ref="form">
          <slot name="default" />
        </v-form>
      </v-container>
    </template>
  </g-template-default>
</template>

<style></style>
