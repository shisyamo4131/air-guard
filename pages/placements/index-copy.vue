<template>
  <v-container fluid>
    <div class="mb-3 d-flex" style="column-gap: 2px">
      <g-dialog-month-picker v-model="month" />
      <v-dialog v-model="dialog.regist" max-width="600">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <g-card-submit-cancel>
          <g-autocomplete-site />
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
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
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

<style scoped>
/* 列幅の全体設定 */
.fixed-column ::v-deep th {
  min-width: 120px;
}

/* ヘッダー1列目の設定 */
.fixed-column ::v-deep th:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 3;
  background-color: white;
  max-width: 100px;
  min-width: 100px;
  word-break: break-all;
}

/* 明細1列目の設定 */
.fixed-column ::v-deep td:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: white;
  max-width: 100px;
  min-width: 100px;
  word-break: break-all;
}

.fixed-column ::v-deep tr:hover td {
  background-color: #eee;
}

/* ヘッダー2列目の設定 */
.fixed-column ::v-deep th:nth-child(2) {
  position: sticky;
  left: 100px;
  z-index: 3;
  background-color: white;
  max-width: 100px;
  min-width: 100px;
  word-break: break-all;
}

/* 明細2列目の設定 */
.fixed-column ::v-deep td:nth-child(2) {
  position: sticky;
  left: 100px;
  z-index: 1;
  background-color: white;
  max-width: 100px;
  min-width: 100px;
  word-break: break-all;
}
</style>
