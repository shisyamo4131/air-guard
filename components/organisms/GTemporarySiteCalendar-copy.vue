<script>
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GIconClose from '../atoms/icons/GIconClose.vue'
import GIconSubmit from '../atoms/icons/GIconSubmit.vue'
import GComboboxDate from '../atoms/inputs/GComboboxDate.vue'
import GTextarea from '../atoms/inputs/GTextarea.vue'
import GTextField from '../atoms/inputs/GTextField.vue'
import GBtnRegistIcon from '../molecules/btns/GBtnRegistIcon.vue'
import GNumeric from '../atoms/inputs/GNumeric.vue'
import GSwitch from '../atoms/inputs/GSwitch.vue'
import GSelectSearch from '../molecules/inputs/GSelectSearch.vue'
import GSelect from '../atoms/inputs/GSelect.vue'
import GIconEdit from '../atoms/icons/GIconEdit.vue'
/**
 * ### GTemporarySiteCalendar
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GCalendar,
    GIconClose,
    GIconSubmit,
    GTextField,
    GComboboxDate,
    GTextarea,
    GNumeric,
    GSwitch,
    GSelectSearch,
    GSelect,
    GIconEdit,
  },
  inheritAttrs: false,
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
        bulk: false,
        detail: false,
        individual: false,
      },
      editMode: 'REGIST',
      form: {
        bulk: null,
        individual: null,
      },
      schedules: [],
      listener: null,
      loading: false,
      model: {
        bulk: this.$TemporarySite(),
        individual: this.$TemporarySiteSchedule(),
      },
      remove: false,
      // scrollTarget: null,
      scrollTarget: {
        bulk: null,
        individual: null,
      },
      selectedDate: null,
      selectedSite: null,
      type: 'month',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    events() {
      return this.schedules
        .map((schedule) => {
          return {
            name: schedule.parent.name,
            start: new Date(`${schedule.date} ${schedule.start}`),
            end: new Date(`${schedule.date} ${schedule.end}`),
            color: schedule.workShift === 'day' ? 'blue' : 'red',
            data: schedule,
          }
        })
        .filter((event) => {
          return (
            !this.selectedSite ||
            event.data.parent.docId === this.selectedSite.docId
          )
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
    month() {
      return this.$dayjs(this.currentDate).format('YYYY-MM')
    },
    sites() {
      const unique = this.schedules.reduce((acc, { parent }) => {
        if (!acc.some((site) => site.docId === parent.docId)) {
          acc.push(parent)
        }
        return acc
      }, [])
      unique.forEach((item) => {
        item.disabled = this.selectedDate
          ? this.schedules.some(
              (schedule) =>
                schedule.date === this.selectedDate &&
                schedule.parent.docId === item.docId
            )
          : false
      })

      return unique
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.bulk': {
      handler(v) {
        v || this.initialize()
      },
      immediate: true,
    },
    'dialog.individual': {
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
    this.model.bulk.unsubscribe()
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      if (this.listener) this.listener()
      this.schedules.splice(0)
      const colRef = collectionGroup(this.$firestore, 'TemporarySiteSchedules')
      const q = query(
        colRef,
        where('date', '>=', this.min),
        where('date', '<=', this.max)
      )
      this.listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const item = change.doc.data()
          const index = this.schedules.findIndex(
            (schedule) =>
              schedule.docId === item.docId &&
              schedule.parent.docId === item.parent.docId
          )
          if (change.type === 'added') this.schedules.push(item)
          if (change.type === 'modified') this.schedules.splice(index, 1, item)
          if (change.type === 'removed') this.schedules.splice(index, 1)
        })
      })
    },
    initialize() {
      this.editMode = 'REGIST'
      this.remove = false
      const { bulk, individual } = this.model
      const { bulk: bulkForm, individual: individualForm } = this.form || {}
      const { bulk: bulkScroll, individual: individualScroll } =
        this.scrollTarget || {}
      bulk.initialize()
      individual.initialize()
      bulkForm?.resetValidation()
      individualForm?.resetValidation()
      ;[bulkScroll, individualScroll].forEach((scroll) =>
        scroll?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      )
    },
    async submitIndividual() {
      if (!this.validate()) return
      this.loading = true
      try {
        if (this.remove) {
          this.model.bulk.initialize(this.model.individual.parent)
          this.model.bulk.dates = this.model.bulk.dates.filter(
            (date) => date !== this.model.individual.date
          )
          if (this.model.bulk.dates.length) {
            await this.model.bulk.update()
          } else {
            await this.model.bulk.delete()
            this.selectedSite = null
          }
        } else {
          await this.model.individual.update()
        }
        this.dialog.individual = false
        this.dialog.detail = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    async submitBulk() {
      if (!this.validate()) return
      this.loading = true
      try {
        if (this.editMode === 'REGIST') {
          await this.model.bulk.create()
        } else if (this.editMode === 'UPDATE' && !this.remove) {
          await this.model.bulk.update()
        } else if (this.editMode === 'UPDATE' && this.remove) {
          await this.model.bulk.delete()
        }
        this.selectedSite = null
        this.dialog.bulk = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      const formRef = this.dialog.bulk ? this.form.bulk : this.form.individual
      const result = this.remove ? true : formRef.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
    onClickEditBulk(item) {
      this.model.bulk.initialize(item)
      this.editMode = 'UPDATE'
      this.dialog.bulk = true
    },
    onClickEditIndividualEvent(data) {
      this.model.individual.initialize(data)
      this.editMode = 'UPDATE'
      this.dialog.individual = true
    },
    onClickDate(date) {
      const eventsCount = this.schedules.filter(
        (schedule) => schedule.date === date
      ).length
      if (!eventsCount) return
      this.selectedDate = date
      this.dialog.detail = true
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title">
      スポット現場情報
      <v-dialog
        v-model="dialog.bulk"
        persistent
        scrollable
        max-width="480"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <v-card :tile="$vuetify.breakpoint.mobile">
          <v-toolbar flat color="primary" dark dense>
            <v-toolbar-title>{{ `スポット現場情報[${mode}]` }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text :ref="(el) => (scrollTarget.bulk = el)" class="pa-4">
            <v-form :ref="(el) => (form.bulk = el)">
              <g-text-field
                v-model="model.bulk.name"
                label="現場名"
                required
                ignore-surrogate-pair
              />
              <g-text-field v-model="model.bulk.address" label="住所" />
              <v-radio-group
                v-model="model.bulk.workShift"
                class="mt-1"
                :disabled="editMode !== 'REGIST'"
                row
              >
                <v-radio value="day" label="日勤" />
                <v-radio value="night" label="夜勤" />
              </v-radio-group>

              <v-row dense>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.bulk.start"
                    class="center-input"
                    label="開始時刻"
                    :disabled="editMode !== 'REGIST'"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.bulk.end"
                    class="center-input"
                    label="終了時刻"
                    :disabled="editMode !== 'REGIST'"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-numeric
                    v-model="model.bulk.numberOfWorkers"
                    class="right-input"
                    label="人数"
                    :disabled="editMode !== 'REGIST'"
                    required
                    suffix="名"
                  />
                </v-col>
                <v-col cols="6">
                  <g-switch
                    v-model="model.bulk.qualification"
                    label="要資格者"
                    :disabled="editMode !== 'REGIST'"
                  />
                </v-col>
              </v-row>
              <g-combobox-date
                v-model="model.bulk.dates"
                label="予定日"
                required
                multiple
              />
              <g-textarea
                v-model="model.bulk.remarks"
                label="備考"
                hide-details
              />
              <v-checkbox
                v-if="editMode === 'UPDATE'"
                v-model="remove"
                label="このスポット情報を削除する"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="dialog.bulk = false"
              ><g-icon-close />close</v-btn
            >
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submitBulk"
              ><g-icon-submit />submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="dialog.individual"
        persistent
        scrollable
        max-width="480"
        :fullscreen="$vuetify.breakpoint.mobile"
      >
        <v-card :tile="$vuetify.breakpoint.mobile">
          <v-card-title class="pa-0">
            <v-toolbar flat color="primary" dark dense>
              <v-toolbar-title>
                {{ `${model.individual.parent.name}[${mode}]` }}
              </v-toolbar-title>
            </v-toolbar>
          </v-card-title>
          <v-card-text
            :ref="(el) => (scrollTarget.individual = el)"
            class="pa-4"
          >
            <v-form :ref="(el) => (form.individual = el)">
              <g-select
                v-model="model.individual.status"
                label="状態"
                :items="$TEMPORARY_SITE_STATUS_ARRAY"
              />
              <v-radio-group
                v-model="model.individual.workShift"
                row
                class="mt-0"
              >
                <v-radio value="day" label="日勤" />
                <v-radio value="night" label="夜勤" />
              </v-radio-group>
              <v-row dense>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.individual.start"
                    class="center-input"
                    label="開始時刻"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-text-field
                    v-model="model.individual.end"
                    class="center-input"
                    label="終了時刻"
                    required
                    input-type="time"
                  />
                </v-col>
                <v-col cols="6">
                  <g-numeric
                    v-model="model.individual.numberOfWorkers"
                    class="right-input"
                    label="人数"
                    required
                    suffix="名"
                  />
                </v-col>
                <v-col cols="6">
                  <g-switch
                    v-model="model.individual.qualification"
                    label="要資格者"
                  />
                </v-col>
              </v-row>
              <g-textarea
                v-model="model.individual.remarks"
                label="備考"
                hide-details
              />
              <v-checkbox
                v-if="editMode === 'UPDATE'"
                v-model="remove"
                label="このスポット情報を削除する"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="dialog.individual = false"
              ><g-icon-close />close</v-btn
            >
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submitIndividual"
              ><g-icon-submit />submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <v-container fluid>
      <div class="d-flex mb-2 align-center" style="column-gap: 4px">
        <v-btn
          color="primary"
          small
          outlined
          @click="currentDate = $dayjs().format('YYYY-MM-DD')"
          >今月</v-btn
        >
        <v-btn icon @click="$refs.calendar.prev()"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
        <span>{{ month }}</span>
        <v-btn icon @click="$refs.calendar.next()"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
      </div>
      <g-select-search
        v-model="selectedSite"
        class="mb-3"
        :items="sites"
        item-text="name"
        return-object
      >
        <template #append-outer>
          <g-icon-edit
            color="primary"
            :disabled="!selectedSite"
            @click="onClickEditBulk(selectedSite)"
          />
        </template>
      </g-select-search>
      <div :style="{ height: `${height ? parseInt(height) : undefined}px` }">
        <g-calendar
          ref="calendar"
          v-model="currentDate"
          :events="events"
          :type="type"
          @click:date="onClickDate($event.date)"
          @click:event="onClickEditIndividualEvent($event.event.data)"
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
                  {{ event.data.numberOfWorkers }}
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
      <v-dialog v-model="dialog.detail" scrollable max-width="480">
        <v-card>
          <v-card-title class="g-card__title">
            {{ selectedDate }}
          </v-card-title>
          <v-card-text>
            <v-list-item
              v-for="(schedule, index) of schedules.filter(
                ({ docId }) => docId === selectedDate
              )"
              :key="index"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ schedule.parent.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ schedule.parent.address }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <g-icon-edit @click="onClickEditIndividualEvent(schedule)" />
              </v-list-item-action>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<style></style>
