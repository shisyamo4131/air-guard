<script>
import GCardSubmitCancel from '../molecules/cards/GCardSubmitCancel.vue'
import GInputLeaveApplication from '../molecules/inputs/GInputLeaveApplication.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardSubmitCancel, GInputLeaveApplication },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      model: this.$LeaveApplication(),
      loading: false,
      removeItem: false,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.value': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.dialog = newVal
      },
    },
    dialog(newVal, oldVal) {
      if (newVal === oldVal) return
      newVal || this.initialize()
      this.$emit('input', newVal)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize({ item, editMode } = { item: undefined, editMode: 'REGIST' }) {
      this.editMode = editMode
      this.model.initialize(item)
      this.removeItem = false
    },
    async submit() {
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'DELETE') await this.model.delete()
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    max-width="480"
    scrollable
    persistent
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <g-card-submit-cancel
      :dialog.sync="dialog"
      :edit-model="editMode"
      label="従業員休暇申請"
      :loading="loading"
    >
      <g-input-leave-application
        v-bind.sync="model"
        :edit-mode="editMode"
        hide-employee
      />
      <v-checkbox
        v-if="editMode !== 'REGIST'"
        v-model="removeItem"
        label="この休暇申請を削除する"
        color="error"
      />
    </g-card-submit-cancel>
  </v-dialog>
</template>

<style></style>
