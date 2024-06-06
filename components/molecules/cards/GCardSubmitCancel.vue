<script>
/**
 * ### GCardSubmitCancel
 * @author shisyamo4131
 */
import GBtnCancelIcon from '../btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../btns/GBtnSubmitIcon.vue'
import EditMode from '~/components/mixins/GMixinEditMode'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnCancelIcon, GBtnSubmitIcon },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [EditMode],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    dialog: { type: Boolean, default: false, required: false },
    disabled: { type: Boolean, default: false, required: false },
    label: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      formRef: null,
      scrollTargetRef: null,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      v || this.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.formRef?.resetValidation()
      this.scrollTargetRef?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    },
    onClickCancel() {
      this.$emit('click:cancel')
      this.$emit('update:dialog', false)
    },
    onClickSubmit() {
      if (!this.validate()) return
      this.$emit('click:submit')
    },
    validate() {
      const result = this.formRef?.validate() || false
      if (!result) alert('入力に不備があります。')
      return result
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-toolbar dense flat color="primary" dark>
      <v-toolbar-title>
        {{ `${label}[${$EDIT_MODE[editMode]}]` }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text :ref="(el) => (scrollTargetRef = el)" class="pa-4">
      <v-form :ref="(el) => (formRef = el)" :disabled="loading || disabled">
        <slot name="default" v-bind="{ editMode, loading }" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <g-btn-cancel-icon :disabled="loading" @click="onClickCancel" />
      <g-btn-submit-icon
        :disabled="loading"
        :loading="loading"
        color="primary"
        @click="onClickSubmit"
      />
    </v-card-actions>
  </v-card>
</template>

<style></style>
