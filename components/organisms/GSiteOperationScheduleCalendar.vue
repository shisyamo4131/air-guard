<script>
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '../molecules/btns/GBtnRegistIcon.vue'
import GCardSubmitCancel from '../molecules/cards/GCardSubmitCancel.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
import GCalendarSiteOperationScheduleSummary from '../molecules/calendars/GCalendarSiteOperationScheduleSummary.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GCardSubmitCancel,
    GInputSiteOperationSchedule,
    GDivMonthChooser,
    GCalendarSiteOperationScheduleSummary,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      dialog: false,
      editMode: 'REGIST',
      items: [],
      loading: false,
      model: this.$SiteOperationSchedule(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    from() {
      return this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },
    to() {
      return this.$dayjs(this.currentDate)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
    },
    schedules() {
      return this.items.reduce((acc, item) => {
        const date = item.date
        const workShift = item.workShift
        if (!acc[date]) acc[date] = {}
        acc[date][workShift] = {
          requiredWorkers: item.requiredWorkers,
          item,
        }
        return acc
      }, {})
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    from(newVal, oldVal) {
      if (newVal === oldVal) return
      this.subscribe()
    },
    dialog(v) {
      v || this.initialize()
    },
    siteId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.model.siteId = newVal
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.editMode = 'REGIST'
      this.model.initialize({ siteId: this.siteId })
    },
    onClickEdit(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.dialog = true
    },
    onClickSchedule({ date, workShift }) {
      const item = this.items.find((item) => {
        return item.date === date && item.workShift === workShift
      })
      if (!item) {
        alert('スケジュールオブジェクトの取得に失敗しました。')
        return
      }
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.dialog = true
    },
    async submit() {
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'DELETE') await this.model.delete()
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    subscribe() {
      this.items = this.model.subscribe(undefined, [
        where('date', '>=', this.from),
        where('date', '<=', this.to),
      ])
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title">
      稼働予定表
      <v-dialog v-model="dialog" max-width="360">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            v-bind="attrs"
            class="ml-auto"
            color="primary"
            v-on="on"
          />
        </template>
        <g-card-submit-cancel
          label="稼働予定"
          :dialog.sync="dialog"
          :edit-mode="editMode"
          :loading="loading"
          @click:cancel="dialog = false"
          @click:submit="submit"
        >
          <g-input-site-operation-schedule
            v-bind.sync="model"
            :edit-mode="editMode"
          />
        </g-card-submit-cancel>
      </v-dialog>
    </v-card-title>
    <v-container fluid class="py-0">
      <g-div-month-chooser
        v-model="currentDate"
        @click:prev="$refs.calendar.prev()"
        @click:next="$refs.calendar.next()"
      />
    </v-container>
    <v-container fluid style="height: calc(100% - 104px)">
      <g-calendar-site-operation-schedule-summary
        ref="calendar"
        v-model="currentDate"
        :items="items"
        @click:schedule="onClickSchedule"
      />
    </v-container>
  </v-card>
</template>

<style></style>
