<script>
/**
 * ## GSiteOperationScheduleManager
 *
 * 現場の稼働予定を管理するコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
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
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
import GCalendarSiteOperationSchedules from '../molecules/calendars/GCalendarSiteOperationSchedules.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GCardSiteOperationScheduleHistories from '../molecules/cards/GCardSiteOperationScheduleHistories.vue'
import Site from '~/models/Site'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
import GEditModeMixin from '~/mixins/GEditModeMixin'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputSiteOperationSchedule,
    GDivMonthChooser,
    GCalendarSiteOperationSchedules,
    GDialogInput,
    GBtnRegistIcon,
    GCardSiteOperationScheduleHistories,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator: (instance) => instance instanceof Site,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      dialog: false,
      editModel: new SiteOperationSchedule(),
      items: {
        schedules: [],
        histories: [],
      },
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
        this.editModel.initialize({ siteId: this.instance.docId })
      }
      if (!v) {
        this.editMode = this.CREATE
        this.editModel.initialize()
      }
    },
    from() {
      this.subscribeSchedules()
      this.subscribeHistories()
    },
    instance: {
      handler(v) {
        if (!v.docId) return
        this.subscribeSchedules()
        this.subscribeHistories()
      },
      immediate: true,
      deep: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listeners.schedules.unsubscribe()
    if (this.listeners.histories) this.listeners.histories()
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
    subscribeSchedules() {
      this.items.schedules = this.listeners.schedules.subscribeDocs([
        ['where', 'date', '>=', this.from],
        ['where', 'date', '<=', this.to],
      ])
    },
    subscribeHistories() {
      this.items.histories.splice(0)
      const path = `History/SiteOperationSchedules/${this.instance.docId}`
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
    <div class="flex-grow-1">
      <div>
        <div class="pb-2 d-flex">
          <g-div-month-chooser
            v-model="currentDate"
            @click:prev="$refs.calendar.prev()"
            @click:next="$refs.calendar.next()"
          />
          <v-spacer />
          <g-dialog-input v-model="dialog" max-width="600">
            <template #activator="{ attrs, on }">
              <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
            </template>
            <template #default="{ attrs, on }">
              <g-input-site-operation-schedule
                v-bind="attrs"
                :instance="editModel"
                :edit-mode="editMode"
                hide-site
                v-on="on"
              />
            </template>
          </g-dialog-input>
        </div>
        <g-calendar-site-operation-schedules
          ref="calendar"
          v-model="currentDate"
          :items="items.schedules"
          @click:edit="onClickEdit"
        />
      </div>
    </div>
    <div
      v-if="$vuetify.breakpoint.mdAndUp"
      class="flex-grow-1"
      style="height: 100%; max-width: 360px"
    >
      <g-card-site-operation-schedule-histories
        :items="items.histories"
        class="overflow-y-auto"
        height="100%"
        flat
      />
    </div>
  </div>
</template>

<style></style>
