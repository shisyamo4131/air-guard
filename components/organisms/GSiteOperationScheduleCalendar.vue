<script>
import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GBtnRegistIcon from '../molecules/btns/GBtnRegistIcon.vue'
import GCardSubmitCancel from '../molecules/cards/GCardSubmitCancel.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendar,
    GBtnRegistIcon,
    GCardSubmitCancel,
    GInputSiteOperationSchedule,
    GDivMonthChooser,
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
    currentDate(newVal, oldVal) {
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
  <v-card>
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
          :dialog="dialog"
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
    <v-container fluid>
      <g-calendar ref="calendar" v-model="currentDate" color="primary">
        <template #day="{ date }">
          <div class="schedule-container">
            <div class="shift-container">
              <v-avatar
                v-if="schedules[date]?.day"
                style="cursor: pointer"
                size="24"
                color="blue"
                class="white--text"
                @click="onClickEdit(schedules[date].day.item)"
              >
                {{ schedules[date].day.requiredWorkers }}
              </v-avatar>
            </div>
            <div class="shift-container">
              <v-avatar
                v-if="schedules[date]?.night"
                style="cursor: pointer"
                size="24"
                color="red"
                class="white--text"
                @click="onClickEdit(schedules[date].night.item)"
              >
                {{ schedules[date].night.requiredWorkers }}
              </v-avatar>
            </div>
          </div>
        </template>
      </g-calendar>
    </v-container>
  </v-card>
</template>

<style scoped>
/* GSiteOperationScheduleCalendar */
.schedule-container {
  display: flex;
  justify-content: space-between;
  height: 48px;
}

.shift-container {
  width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
