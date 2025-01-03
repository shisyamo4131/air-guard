<script>
/**
 * 現場の稼働予定を管理するコンポーネントです。
 * @author shisyamo4131
 */
import {
  onChildAdded,
  orderByChild,
  query,
  ref,
  endAt,
  startAt,
} from 'firebase/database'
import { database } from 'air-firebase'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
// import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
import GCalendarSiteOperationSchedules from '../molecules/calendars/GCalendarSiteOperationSchedules.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GCardSiteOperationScheduleHistories from '../molecules/cards/GCardSiteOperationScheduleHistories.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputSiteOperationSchedule,
    // GDivMonthChooser,
    GCalendarSiteOperationSchedules,
    GDialogInput,
    GBtnRegist,
    GCardSiteOperationScheduleHistories,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],
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
      editModel: new SiteOperationSchedule(),
      items: { schedules: [], histories: [] },
      listeners: {
        schedules: new SiteOperationSchedule(),
        histories: null,
      },
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
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v && this.editMode === this.CREATE) {
        this.editModel.initialize({ siteId: this.siteId })
      }
      if (!v) {
        this.editMode = this.CREATE
        this.editModel.initialize({ siteId: this.siteId })
      }
    },
    from() {
      this.subscribeSchedules()
      this.subscribeHistories()
    },
    siteId: {
      handler(v) {
        if (!v) return
        this.subscribeSchedules()
        this.subscribeHistories()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      if (!this.listeners[key]) this.listeners[key]()
      this.listeners[key] = null
    })
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit({ date, workShift }) {
      this.editMode = this.UPDATE
      const item = this.items.schedules.find((item) => {
        return item.date === date && item.workShift === workShift
      })
      this.editModel.initialize(item)
      this.dialog = true
    },
    /**
     * 現場の稼働予定ドキュメントに対するリアルタイムリスナーをセットします。
     */
    subscribeSchedules() {
      this.items.schedules = this.listeners.schedules.subscribeDocs([
        ['where', 'siteId', '==', this.siteId],
        ['where', 'date', '>=', this.from],
        ['where', 'date', '<=', this.to],
      ])
    },
    /**
     * 稼働予定の更新履歴に対するリアルタイムリスナーをセットします。
     */
    subscribeHistories() {
      this.items.histories.splice(0)
      const path = `History/SiteOperationSchedules/${this.siteId}`
      const dbRef = ref(database, path)
      const q = query(
        dbRef,
        orderByChild('date'),
        startAt(this.from),
        endAt(this.to)
      )
      this.listeners.histories = onChildAdded(q, (snapshot) => {
        this.items.histories.push({ ...snapshot.val(), id: snapshot.key })
      })
    },
  },
}
</script>

<template>
  <div class="d-flex" style="height: 596px">
    <g-calendar-site-operation-schedules
      ref="calendar"
      v-model="currentDate"
      class="flex-grow-1"
      :items="items.schedules"
      @click:edit="onClickEdit"
    >
      <template #append-toolbar>
        <v-spacer />
        <g-dialog-input
          v-model="dialog"
          :edit-mode.sync="editMode"
          :instance="editModel"
          max-width="480"
        >
          <template #activator="{ attrs, on }">
            <g-btn-regist icon v-bind="attrs" color="primary" v-on="on" />
          </template>
          <template #default="{ attrs, on }">
            <g-input-site-operation-schedule
              v-bind="attrs"
              hide-site
              v-on="on"
            />
          </template>
        </g-dialog-input>
      </template>
    </g-calendar-site-operation-schedules>
    <div
      v-if="$vuetify.breakpoint.mdAndUp"
      class="flex-grow-1"
      style="height: 100%; max-width: 360px"
    >
      <g-card-site-operation-schedule-histories
        :items="items.histories"
        flat
        height="100%"
      />
    </div>
  </div>
</template>

<style></style>
