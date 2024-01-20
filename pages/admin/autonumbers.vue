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
          @click:cancel="dialog = false"
          @click:submit="submit"
        >
          <g-input-autonumber v-bind.sync="model" />
        </g-card-input-form>
      </v-dialog>
    </template>
    <template #default="{ height }">
      <v-container fluid>
        <g-data-table-autonumbers :items="items" :height="height - 24" />
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import GDataTableAutonumbers from '~/components/molecules/tables/GDataTableAutonumbers.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
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
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.editMode = 'REGIST'
      this.model.initialize()
      this.$refs.form.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async submit() {
      if (this.editMode === 'REGIST') await this.model.create(this.model.docId)
      if (this.editMode === 'UPDATE') await this.model.update()
      if (this.editMode === 'DELETE') await this.model.delete()
      this.dialog = false
    },
  },
}
</script>

<style></style>
