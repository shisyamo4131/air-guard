<template>
  <g-template-index :items="items">
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
      <v-btn>実績更新</v-btn>
      <v-spacer />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-monthly-attendances v-bind="attrs" v-on="on" />
    </template>
  </g-template-index>
</template>

<script>
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GDataTableMonthlyAttendances from '~/components/molecules/tables/GDataTableMonthlyAttendances.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import MonthlyAttendance from '~/models/MonthlyAttendance'
export default {
  components: {
    GTemplateIndex,
    GDialogMonthPicker,
    GDataTableMonthlyAttendances,
  },
  data() {
    return {
      items: [],
      listener: new MonthlyAttendance(),
      // month: this.$dayjs().format('YYYY-MM'),
      month: '2017-04',
    }
  },
  watch: {
    month: {
      handler(v) {
        this.items.splice(0)
        if (!v) this.listener.unsubscribe()
        this.items = this.listener.subscribeDocs([['where', 'month', '==', v]])
      },
      immediate: true,
    },
  },
}
</script>

<style></style>
