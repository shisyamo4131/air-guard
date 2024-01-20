<script>
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import GDataTableAutonumbers from '~/components/molecules/tables/GDataTableAutonumbers.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
/**
 * ### page.autonumbers
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GDataTableAutonumbers,
    GInputAutonumber,
    GCardInputForm,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    const model = app.$Autonumber()
    const items = model.subscribe()
    return { model, items }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      loading: false,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.editMode = 'REGIST'
      this.$refs.form.initialize()
      this.model.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async submit(mode) {
      if (mode === 'REGIST') await this.model.create()
      if (mode === 'UPDATE') await this.model.update()
      if (mode === 'DELETE') await this.model.delete()
    },
    async onClickSubmit() {
      try {
        this.loading = true
        await this.submit(this.editMode)
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    onClickEdit(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.dialog = true
    },
    onClickDelete(item) {
      this.editMode = 'DELETE'
      this.model.initialize(item)
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-default label="自動採番管理">
    <template #append-toolbar>
      <v-spacer />
      <v-dialog v-model="dialog" width="600">
        <template #activator="{ attrs, on }">
          <v-btn v-bind="attrs" icon v-on="on"><v-icon>mdi-plus</v-icon></v-btn>
        </template>
        <g-card-input-form
          ref="form"
          :edit-mode="editMode"
          :loading="loading"
          @click:cancel="dialog = false"
          @click:submit="submit"
        >
          <g-input-autonumber v-bind.sync="model" :edit-mode="editMode" />
        </g-card-input-form>
      </v-dialog>
    </template>
    <template #default="{ height }">
      <v-container fluid>
        <g-data-table-autonumbers
          :items="items"
          :height="height - 24"
          show-actions
          @click:edit="onClickEdit($event)"
          @click:delete="onClickDelete($event)"
        />
      </v-container>
    </template>
  </g-template-default>
</template>

<style></style>
