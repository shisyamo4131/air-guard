<template>
  <v-container fluid>
    <div class="mb-3 d-flex" style="column-gap: 2px">
      <g-dialog-month-picker v-model="month" />
      <v-dialog v-model="dialog.regist" max-width="600">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <g-card-submit-cancel :edit-mode="editMode" label="稼働予定登録">
          <g-autocomplete-site label="現場" />
        </g-card-submit-cancel>
      </v-dialog>
    </div>
    <v-data-table
      class="fixed-column"
      disable-sort
      fixed-header
      :headers="headers"
      :height="360"
      hide-default-footer
      :items="items"
      :items-per-page="-1"
    >
    </v-data-table>
  </v-container>
</template>

<script>
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
// import { where } from 'firebase/firestore'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
export default {
  name: 'PlacementsIndex',
  components: {
    GDialogMonthPicker,
    GBtnRegistIcon,
    GCardSubmitCancel,
    GAutocompleteSite,
  },
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      dialog: {
        regist: false,
      },
      editMode: 'REGIST',
      items: [],
      model: this.$Placement(),
    }
  },
  computed: {
    days() {
      const result = []
      const from = this.$dayjs(this.from)
      const to = this.$dayjs(this.to)
      for (let day = from; day <= to; day = day.add(1, 'day')) {
        result.push(day)
      }
      return result
    },
    from() {
      return this.$dayjs(this.currentDate).startOf('month').format('YYYY-MM-DD')
    },
    headers() {
      return [
        { text: '現場', value: 'siteId' },
        { text: '勤務区分', value: 'workShift', align: 'center' },
        ...this.days.map((day) => {
          return {
            text: day.format('MM/DD'),
            value: '',
            align: 'center',
          }
        }),
      ]
    },
    month: {
      get() {
        return this.$dayjs(this.currentDate).format('YYYY-MM')
      },
      set(v) {
        this.currentDate = `${v}-01`
      },
    },
    to() {
      return this.$dayjs(this.currentDate).endOf('month').format('YYYY-MM-DD')
    },
  },
  watch: {
    currentDate: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        // this.items = this.model.subscribe(undefined, [
        //   where('date', '>=', this.from),
        //   where('date', '<=', this.to),
        // ])
        this.items = [...Array(30)].map((_, i) => {
          return {
            siteId: i,
            workShift: 'day',
          }
        })
      },
      immediate: true,
    },
  },
  destroyed() {
    this.model.unsubscribe()
  },
}
</script>

<style></style>
