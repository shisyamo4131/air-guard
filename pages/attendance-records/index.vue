<template>
  <g-template-index>
    <template #search>
      <g-dialog-month-picker v-model="month">
        <template #activator="{ attrs, on }">
          <v-text-field
            v-bind="attrs"
            class="center-input"
            style="max-width: 120px"
            flat
            solo-inverted
            dense
            hide-details
            v-on="on"
          />
        </template>
      </g-dialog-month-picker>
      <v-btn @click="updateResults">実績更新</v-btn>
      <v-spacer />
    </template>
  </g-template-index>
</template>

<script>
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import Employee from '~/models/Employee'
export default {
  components: { GTemplateIndex, GDialogMonthPicker },
  data() {
    return {
      month: this.$dayjs().format('YYYY-MM'),
    }
  },
  methods: {
    async updateResults() {
      // 在職中の従業員ドキュメントを取得
      const employees = await Employee.getExistingEmployees({
        hireDate: this.$dayjs(`${this.month}-01`)
          .endOf('month')
          .format('YYYY-MM-DD'),
      })
      console.log(employees)
    },
  },
}
</script>

<style></style>
