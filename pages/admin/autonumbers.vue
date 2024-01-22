<script>
import ARenderlessCrud from '~/components/atoms/renderless/ARenderlessCrud.vue'
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
    GCardInputForm,
    GInputAutonumber,
    ARenderlessCrud,
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
      this.$refs.form.initialize()
      this.model.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
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
        <a-renderless-crud
          :edit-mode="editMode"
          :model="model"
          @cancel="dialog = false"
          @submit:complete="dialog = false"
        >
          <template #default="{ attrs, on }">
            <g-card-input-form ref="form" v-bind="attrs" v-on="on">
              <g-input-autonumber
                v-bind.sync="model"
                :edit-mode="attrs.editMode"
              />
            </g-card-input-form>
          </template>
        </a-renderless-crud>
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
