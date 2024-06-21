<script>
/**
 * ### pages.TemporarySiteScheduleIndex
 * @author shisyamo4131
 * @create 2024-06-18
 */
import { where } from 'firebase/firestore'
import GCalendar from '~/components/atoms/calendars/GCalendar.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GDialogSiteOperationScheduleBulkRegister from '~/components/organisms/GDialogSiteOperationScheduleBulkRegister.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GDialogSiteOperationSchedules from '~/components/organisms/GDialogSiteOperationSchedules.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'TemporarySiteSchedulesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendar,
    GBtnRegistIcon,
    GDialogSiteOperationScheduleBulkRegister,
    GDialogMonthPicker,
    GDialogSiteOperationSchedules,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      items: {
        schedules: [],
        sites: [],
      },
      model: {
        site: this.$Site(),
        schedule: this.$SiteOperationSchedule(),
      },
      popUp: false,
      register: false,
      selectedDate: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    events() {
      return this.items.schedules.map((item) => {
        const site =
          this.items.sites.find(({ docId }) => docId === item.siteId) ||
          this.$Site()
        return {
          name: site ? site.name : 'error',
          start: item.date,
          color: item.workShift === 'day' ? 'blue' : 'red',
          site,
          schedule: item,
        }
      })
    },
    month: {
      get() {
        return this.$dayjs(this.currentDate).format('YYYY-MM')
      },
      set(v) {
        this.currentDate = v + '-01'
      },
    },
    min() {
      return this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },
    max() {
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
    currentDate: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.subscribeSchedule()
      },
      immediate: true,
    },
    popUp(v) {
      if (!v) this.selectedDate = null
    },
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.subscribeSites()
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.site.unsubscribe()
    this.model.schedule.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickDate(date) {
      this.selectedDate = date
      this.popUp = true
    },
    onClickPopUpRegist() {
      this.model.schedule.initialize({ date: this.selectedDate })
      this.register = true
    },
    subscribeSites() {
      this.items.sites = this.model.site.subscribe(undefined, [
        where('temporary', '==', true),
      ])
    },
    subscribeSchedule() {
      this.items.schedules = this.model.schedule.subscribeGroup(undefined, [
        where('date', '>=', this.min),
        where('date', '<=', this.max),
        where('temporary', '==', true),
      ])
    },
  },
}
</script>

<template>
  <v-container>
    <v-card
      v-bind="$attrs"
      :height="$vuetify.breakpoint.height - 48 - 24"
      v-on="$listeners"
    >
      <v-card-title class="g-card__title">
        スポット現場稼働予定表
        <g-dialog-site-operation-schedule-bulk-register
          v-model="register"
          max-width="480"
          :default-date="selectedDate"
          as-temporary
          :selectable-sites="items.sites"
        >
          <template #activator="{ attrs, on }">
            <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
          </template>
        </g-dialog-site-operation-schedule-bulk-register>
      </v-card-title>
      <v-container class="pt-0" style="height: calc(100% - 68px)">
        <g-dialog-month-picker v-model="month">
          <template #activator="{ attrs, on }">
            <v-text-field
              v-bind="attrs"
              class="center-input mb-2"
              style="min-width: 96px; max-width: 96px"
              label="年月"
              hide-details
              v-on="on"
            />
          </template>
        </g-dialog-month-picker>
        <g-calendar
          :events="events"
          style="height: calc(100% - 56px)"
          @click:date="onClickDate($event.date)"
        >
        </g-calendar>
      </v-container>
    </v-card>
    <g-dialog-site-operation-schedules
      v-model="popUp"
      max-width="480"
      :date="selectedDate"
      :events="events"
      @click:regist="onClickPopUpRegist"
    />
  </v-container>
</template>

<style></style>
