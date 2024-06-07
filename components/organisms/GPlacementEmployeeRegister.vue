<template>
  <v-dialog v-model="dialog" max-width="360">
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <g-card-input-form
      ref="form"
      label="従業員"
      :edit-mode="editMode"
      :loading="loading"
      @click:cancel="dialog = false"
      @click:submit="onClickSubmit"
    >
      <template #default>
        <g-input-employee v-bind.sync="editItem" />
      </template>
    </g-card-input-form>
  </v-dialog>
</template>

<script>
import GCardInputForm from '../molecules/cards/GCardInputForm.vue'
import GInputEmployee from '../molecules/inputs/GInputEmployee.vue'
export default {
  components: { GCardInputForm, GInputEmployee },
  data() {
    return {
      dialog: false,
      editItem: this.$Employee(),
      editMode: 'REGIST',
      loading: false,
    }
  },
  watch: {
    dialog(v) {
      if (v) return
      this.$refs.form.initialize()
      this.editItem.initialize()
    },
    'editItem.lastName'(v) {
      this.editItem.abbr = `${v || ''}${this.editItem.firstName || ''}`
    },
    'editItem.firstName'(v) {
      this.editItem.abbr = `${this.editItem.lastName || ''}${v || ''}`
    },
  },
  methods: {
    async onClickSubmit() {
      try {
        this.loading = true
        await this.editItem.create()
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

<style></style>
