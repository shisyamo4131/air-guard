<template>
  <g-template-default label="取引先管理">
    <template #append-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-dialog v-model="dialog" max-width="600">
          <template #activator="{ attrs, on }">
            <g-btn-regist v-bind="attrs" text v-on="on" />
          </template>
          <g-card-input-form
            ref="form"
            label="取引先"
            :loading="loading"
            @click:cancel="dialog = false"
            @click:submit="submit"
          >
            <template #default>
              <g-input-customer
                v-bind.sync="editItem"
                :code-is-duplicated="codeIsDuplicated"
              />
            </template>
          </g-card-input-form>
        </v-dialog>
      </v-toolbar-items>
    </template>
    <template #default>
      <v-container fluid>
        <v-data-table :headers="headers" :items="items">
          <template #[`item.actions`]="{ item }">
            <v-icon @click="openEditor(item, 'UPDATE')">mdi-pencil</v-icon>
            <v-icon @click="openEditor(item, 'DELETE')">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import GBtnRegist from '~/components/molecules/btns/GBtnRegist.vue'
import GCardInputForm from '~/components/molecules/cards/GCardInputForm.vue'
import GInputCustomer from '~/components/molecules/inputs/GInputCustomer.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    GCardInputForm,
    GBtnRegist,
    GInputCustomer,
  },
  data() {
    return {
      dialog: false,
      editItem: this.$Customer(),
      editMode: 'REGIST',
      loading: false,
    }
  },
  computed: {
    headers() {
      return [
        { text: 'CODE', value: 'code' },
        { text: '取引先名1', value: 'name1' },
        { text: '取引先名2', value: 'name2' },
        { text: '', value: 'actions' },
      ]
    },
    items() {
      return this.$store.getters['masters/Customers']
    },
    codeIsDuplicated() {
      if (!this.editItem.code) return false
      if (this.editMode === 'REGIST') {
        return this.$store.getters['masters/Customers'].some(
          ({ code }) => code === this.editItem.code
        )
      }
      if (this.editMode === 'UPDATE') {
        return this.$store.getters['masters/Customers'].some(
          ({ docId, code }) => {
            return docId !== this.editItem.docId && code === this.editItem.code
          }
        )
      }
      return false
    },
  },
  watch: {
    dialog(v) {
      if (v) return
      this.$refs.form.initialize()
      this.editItem.initialize()
      this.editMode = 'REGIST'
    },
  },
  methods: {
    openEditor(item, mode) {
      this.editItem.initialize(item)
      this.editMode = mode
      this.dialog = true
    },
    async submit() {
      try {
        this.loading = true
        if (this.editMode === 'REGIST') await this.editItem.create()
        if (this.editMode === 'UPDATE') await this.editItem.update()
        if (this.editMode === 'DELETE') await this.editItem.delete()
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
