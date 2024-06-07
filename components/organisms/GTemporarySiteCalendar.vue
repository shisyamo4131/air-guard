<script>
import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GTextarea from '../atoms/inputs/GTextarea.vue'
import GTextField from '../atoms/inputs/GTextField.vue'
import GNumeric from '../atoms/inputs/GNumeric.vue'
import GSwitch from '../atoms/inputs/GSwitch.vue'
import GSelect from '../atoms/inputs/GSelect.vue'
import GIconEdit from '../atoms/icons/GIconEdit.vue'
import GBtnRegistIcon from '../molecules/btns/GBtnRegistIcon.vue'
import GComboboxDate from '../atoms/inputs/GComboboxDate.vue'
import GDatePicker from '../atoms/pickers/GDatePicker.vue'
import GBtnCancelIcon from '../molecules/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '../molecules/btns/GBtnSubmitIcon.vue'
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
/**
 * ### GTemporarySiteCalendar
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendar,
    GTextField,
    GTextarea,
    GNumeric,
    GSwitch,
    GSelect,
    GIconEdit,
    GBtnRegistIcon,
    GComboboxDate,
    GDatePicker,
    GBtnCancelIcon,
    GBtnSubmitIcon,
    GDivMonthChooser,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    height: { type: [String, Number], default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      dialog: {
        detail: false,
        schedule: false,
        duplicate: false,
      },
      duplicateDates: [],
      editMode: 'REGIST',
      form: {
        schedule: null,
      },
      listener: null,
      loading: false,
      model: this.$TemporarySiteSchedule(),
      pickerDate: {
        duplicate: this.$dayjs().format('YYYY-MM-DD'),
      },
      remove: false,
      scrollTarget: {
        schedule: null,
      },
      schedules: [],
      selectedDate: null,
      selectedSite: null,
      type: 'month',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    daySchedules() {
      if (!this.selectedDate) return []
      return this.schedules.filter(({ date }) => date === this.selectedDate)
    },
    events() {
      return this.schedules.map((schedule) => {
        return {
          name: schedule.name,
          start: new Date(`${schedule.date} ${schedule.start}`),
          end: new Date(`${schedule.date} ${schedule.end}`),
          color: schedule.workShift === 'day' ? 'blue' : 'red',
          data: schedule,
        }
      })
    },
    min() {
      const result = this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
      return result
    },
    max() {
      const result = this.$dayjs(this.currentDate)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
      return result
    },
    mode() {
      if (this.editMode === 'REGIST') return '登録'
      if (this.editMode === 'UPDATE') return '変更'
      return '削除'
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.schedule': {
      handler(v) {
        v || this.initialize()
      },
      immediate: true,
    },
    'dialog.detail': {
      handler(v) {
        if (!v) this.selectedDate = null
      },
    },
    'dialog.duplicate': {
      handler(v) {
        if (!v) {
          this.duplicateDates.splice(0)

          this.pickerDate.duplicate = this.$dayjs().format('YYYY-MM-DD')
        }
      },
    },
    currentDate: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.selectedSite = null
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.schedules = this.model.subscribe(undefined, [
        where('date', '>=', this.min),
        where('date', '<=', this.max),
      ])
    },
    initialize() {
      this.editMode = 'REGIST'
      this.remove = false
      this.model.initialize()
      this.form.schedule?.resetValidation()
      this.scrollTarget.schedule?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    },
    async submit() {
      if (!this.validate()) return
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.model.create()
        if (this.editMode === 'UPDATE') {
          this.remove ? await this.model.delete() : await this.model.update()
        }
        this.dialog.schedule = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      const formRef = this.dialog.bulk ? this.form.bulk : this.form.schedule
      const result = this.remove ? true : formRef.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
    onClickRegist(date) {
      this.model.initialize({ date })
      this.editMode = 'REGIST'
      this.dialog.schedule = true
    },
    onClickEdit(data) {
      this.model.initialize(data)
      this.editMode = 'UPDATE'
      this.dialog.schedule = true
    },
    onClickDate(date) {
      const eventsCount = this.schedules.filter(
        (schedule) => schedule.date === date
      ).length
      if (!eventsCount) {
        this.onClickRegist(date)
      } else {
        this.selectedDate = date
        this.dialog.detail = true
      }
    },
    async duplicate() {
      this.loading = true
      try {
        const promises = this.duplicateDates.map((date) => {
          const model = this.$TemporarySiteSchedule({
            ...structuredClone(this.model),
            date,
          })
          return model.create()
        })
        await Promise.all(promises)
        this.dialog.duplicate = false
        this.dialog.schedule = false
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

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title">
      スポット現場情報
      <v-dialog
        v-model="dialog.schedule"
        persistent
        scrollable
        max-width="480"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <v-card :tile="$vuetify.breakpoint.mobile">
          <v-card-title class="pa-0">
            <v-toolbar flat color="primary" dark dense>
              <v-toolbar-title>
                {{ `[${mode}]` }}
              </v-toolbar-title>
            </v-toolbar>
          </v-card-title>
          <v-card-text :ref="(el) => (scrollTarget.schedule = el)" class="pa-4">
            <v-form :ref="(el) => (form.schedule = el)">
              <div v-if="editMode === 'UPDATE'" class="text-right">
                <v-dialog
                  ref="duplicate"
                  v-model="dialog.duplicate"
                  max-width="290"
                >
                  <template #activator="{ attrs, on }">
                    <v-btn v-bind="attrs" color="primary" text v-on="on">
                      <v-icon left small>mdi-content-copy</v-icon>
                      この情報を複製する
                    </v-btn>
                  </template>
                  <g-date-picker
                    v-model="duplicateDates"
                    :disabled="loading"
                    multiple
                    no-title
                    :picker-date.sync="pickerDate.duplicate"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      :disabled="loading"
                      @click="dialog.duplicate = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      :disabled="loading"
                      :loading="loading"
                      @click="duplicate"
                    >
                      OK
                    </v-btn>
                  </g-date-picker>
                </v-dialog>
              </div>
              <g-select
                v-model="model.status"
                label="状態"
                :items="$TEMPORARY_SITE_STATUS_ARRAY"
              />
              <g-text-field
                v-model="model.name"
                label="現場名"
                required
                ignore-surrogate-pair
              />
              <g-text-field v-model="model.address" label="住所" />
              <g-combobox-date v-model="model.date" label="日にち" />
              <v-radio-group v-model="model.workShift" row class="mt-0">
                <v-radio value="day" label="日勤" />
                <v-radio value="night" label="夜勤" />
              </v-radio-group>
              <v-row dense>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.start"
                    class="center-input"
                    label="開始時刻"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.end"
                    class="center-input"
                    label="終了時刻"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-numeric
                    v-model="model.requiredWorkers"
                    class="right-input"
                    label="人数"
                    required
                    suffix="名"
                  />
                </v-col>
                <v-col cols="6">
                  <g-switch v-model="model.qualification" label="要資格者" />
                </v-col>
              </v-row>
              <g-textarea v-model="model.remarks" label="備考" hide-details />
              <v-checkbox
                v-if="editMode === 'UPDATE'"
                v-model="remove"
                label="このスポット情報を削除する"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <g-btn-cancel-icon
              :disabled="loading"
              @click="dialog.schedule = false"
            />
            <g-btn-submit-icon
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
            />
          </v-card-actions>
        </v-card>
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
      <div :style="{ height: `${height ? parseInt(height) : undefined}px` }">
        <g-calendar
          ref="calendar"
          v-model="currentDate"
          :events="events"
          :type="type"
          @click:date="onClickDate($event.date)"
          @click:event="onClickEdit($event.event.data)"
        >
          <template #event="{ event }">
            <div class="pl-1 text-truncate">
              <v-avatar
                v-if="event.data.status === 'accepted'"
                :color="`${
                  event.data.qualification ? 'orange' : 'grey'
                } darken-1`"
                size="16"
              >
                <span class="white--text text-caption">
                  {{ event.data.requiredWorkers }}
                </span>
              </v-avatar>
              <span v-else>
                {{ `[${$TEMPORARY_SITE_STATUS[event.data.status]}]` }}
              </span>
              {{ event.name }}
            </div>
          </template>
        </g-calendar>
      </div>
      <v-dialog
        v-model="dialog.detail"
        scrollable
        max-width="480"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-card-title class="pa-0">
            <v-toolbar dense flat>
              <v-toolbar-title>
                {{ selectedDate }}
              </v-toolbar-title>
              <v-spacer />
              <g-btn-regist-icon
                color="primary"
                @click="onClickRegist(selectedDate)"
              />
            </v-toolbar>
          </v-card-title>
          <v-card-text>
            <v-list-item v-for="(schedule, index) of daySchedules" :key="index">
              <v-list-item-action>
                <div>{{ schedule.start }}</div>
                <div>{{ schedule.end }}</div>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ schedule.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ schedule.address }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <g-icon-edit @click="onClickEdit(schedule)" />
              </v-list-item-action>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<style></style>
