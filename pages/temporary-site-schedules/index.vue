<script>
import { where } from 'firebase/firestore'
import GCalendar from '~/components/atoms/calendars/GCalendar.vue'
import GBtnRegistIcon from '~/components/molecules/btns/GBtnRegistIcon.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GDialogMonthPicker from '~/components/molecules/dialogs/GDialogMonthPicker.vue'
import GInputTemporarySiteSchedule from '~/components/molecules/inputs/GInputTemporarySiteSchedule.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
/**
 * ### pages.TemporarySiteScheduleIndex
 * @author shisyamo4131
 * @create 2024-06-14
 */
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'TemporarySiteSchedulesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDialogMonthPicker,
    GBtnRegistIcon,
    GCardSubmitCancel,
    GInputTemporarySiteSchedule,
    GCalendar,
    GIconEdit,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      bulkRegist: false,
      dialog: {
        editor: false,
        list: false,
      },
      editMode: 'REGIST',
      items: [],
      loading: false,
      model: this.$TemporarySiteSchedule(),
      month: this.$dayjs().format('YYYY-MM'),
      remove: false,
      selectedDate: null,
    }
  },
  computed: {
    dayEvents() {
      return this.events.filter(({ start }) => start === this.selectedDate)
    },
    events() {
      return this.items.map((item) => {
        return {
          name: item.name,
          start: item.date,
          color: item.workShift === 'day' ? 'blue' : 'red',
          item,
        }
      })
    },
    height() {
      const vMain = this.$vuetify.breakpoint.height
      const appBarHeight = 48
      const containerPadding = 12 * 2
      const toolbarHeight = 48 * 2
      const toolbarMargin = 16
      return (
        vMain - appBarHeight - containerPadding - toolbarHeight - toolbarMargin
      )
    },
    min() {
      return this.$dayjs(this.month + '01').format('YYYY-MM-DD')
    },
    max() {
      return this.$dayjs(this.month + '01')
        .endOf('month')
        .format('YYYY-MM-DD')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.editor'(v) {
      v || this.initialize()
    },
    month: {
      handler(v) {
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
    initialize() {
      this.editMode = 'REGIST'
      this.bulkRegist = true
      this.remove = false
      this.model.initialize()
    },
    onClickRegist(date) {
      this.editMode = 'REGIST'
      this.bulkRegist = false
      this.model.date = date
      this.dialog.editor = true
    },
    onClickEdit(item) {
      this.editMode = 'UPDATE'
      this.model.initialize(item)
      this.dialog.editor = true
    },
    onClickDate(date) {
      const eventsCount = this.items.filter((item) => item.date === date).length
      if (!eventsCount) {
        this.onClickRegist(date)
      } else {
        this.selectedDate = date
        this.dialog.list = true
      }
    },
    async regist() {
      if (this.bulkRegist) {
        const promises = this.model.dates.map((date) => {
          const model = this.$TemporarySiteSchedule(this.model)
          model.date = date
          return model.create()
        })
        await Promise.all(promises)
      } else {
        await this.model.create()
      }
    },
    async submit() {
      this.loading = true
      try {
        if (this.editMode === 'REGIST') await this.regist()
        if (this.editMode === 'UPDATE') await this.update()
        this.dialog.editor = false
        this.dialog.list = false
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
        where('date', '>=', this.min),
        where('date', '<=', this.max),
      ])
    },
    async update() {
      if (this.remove) {
        await this.model.delete()
      } else {
        await this.model.update()
      }
    },
  },
}
</script>

<template>
  <v-container fluid>
    <v-toolbar class="mb-4" dense flat>
      <v-toolbar-title class="g-card__title">
        {{ `スポット現場稼働予定` }}
      </v-toolbar-title>
      <v-dialog v-model="dialog.editor" max-width="480" persistent scrollable>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <g-card-submit-cancel
          label="スポット現場稼働予定"
          :dialog.sync="dialog.editor"
          :edit-mode="editMode"
          :loading="loading"
          @click:submit="submit"
        >
          <g-input-temporary-site-schedule
            v-bind.sync="model"
            :edit-mode="editMode"
            :bulk="editMode === 'REGIST' && bulkRegist"
          />
          <v-checkbox
            v-if="editMode !== 'REGIST'"
            v-model="remove"
            label="この予定を削除する"
          />
        </g-card-submit-cancel>
      </v-dialog>
      <template #extension>
        <g-dialog-month-picker v-model="month">
          <template #activator="{ attrs, on }">
            <v-text-field
              class="center-input"
              style="min-width: 96px; max-width: 96px"
              v-bind="attrs"
              label="年月"
              hide-details
              v-on="on"
            />
          </template>
        </g-dialog-month-picker>
      </template>
    </v-toolbar>
    <div :style="{ height: `${height}px` }">
      <g-calendar
        :events="events"
        @click:event="onClickEdit($event.event.item)"
        @click:date="onClickDate($event.date)"
      />
    </div>
    <v-dialog
      v-model="dialog.list"
      max-width="480"
      scrollable
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
          <template v-for="(event, index) of dayEvents">
            <v-list-item :key="`item-${index}`">
              <v-list-item-action>
                <div>{{ event.item.start }}</div>
                <div>{{ event.item.end }}</div>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ event.item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ event.item.address }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <g-icon-edit @click="onClickEdit(event.item)" />
              </v-list-item-action>
            </v-list-item>
            <v-divider :key="`divider-${index}`" />
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style></style>
