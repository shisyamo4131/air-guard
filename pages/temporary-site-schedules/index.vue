<template>
  <v-container fluid>
    <v-toolbar class="mb-4" dense flat>
      <v-toolbar-title class="g-card__title">
        {{ `スポット現場稼働予定` }}
      </v-toolbar-title>
      <v-dialog v-model="dialog.editor" max-width="600" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <g-card-submit-cancel
          label="スポット現場稼働予定"
          :dialog.sync="dialog.editor"
          :edit-mode="editMode"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-site-as-temporary
            v-bind.sync="model"
            :edit-mode="editMode"
          />
        </g-card-submit-cancel>
      </v-dialog>
      <template #extension>
        <g-dialog-month-picker v-model="month">
          <template #activator="{ attrs, on }">
            <v-text-field
              class="center-input"
              style="min-width: 96px; max-width: 96px"
              v-bind="attrs"
              label="年月"
              hide-details
              v-on="on"
            />
          </template>
        </g-dialog-month-picker>
      </template>
    </v-toolbar>
  </v-container>
</template>

<script>
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GInputSiteAsTemporary from '~/components/molecules/inputs/GInputSiteAsTemporary.vue'
export default {
  components: {
    GDialogMonthPicker,
    GBtnRegistIcon,
    GInputSiteAsTemporary,
    GCardSubmitCancel,
  },
  data() {
    return {
      dialog: {
        editor: false,
      },
      editMode: 'REGIST',
      loading: false,
      model: this.$Site({ isTemporary: true }),
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  watch: {
    'dialog.editor'(v) {
      v || this.initialize()
    },
  },
  methods: {
    initialize() {
      this.editMode = 'REGIST'
      this.model.initialize({ isTemporary: true })
    },
    async submit() {
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'DELETE') await this.model.delete()
        this.dialog.editor = false
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
