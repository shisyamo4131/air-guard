<script>
import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GIconClose from '../atoms/icons/GIconClose.vue'
import GIconSubmit from '../atoms/icons/GIconSubmit.vue'
import GComboboxDate from '../atoms/inputs/GComboboxDate.vue'
import GTextarea from '../atoms/inputs/GTextarea.vue'
import GTextField from '../atoms/inputs/GTextField.vue'
import GBtnRegistIcon from '../molecules/btns/GBtnRegistIcon.vue'
import GNumeric from '../atoms/inputs/GNumeric.vue'
import GSwitch from '../atoms/inputs/GSwitch.vue'
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
        detail: false,
        editor: false,
      },
      editMode: 'REGIST',
      form: null,
      items: [],
      loading: false,
      model: this.$TemporarySiteSchedule(),
      remove: false,
      scrollTarget: null,
      selectedDate: null,
      type: 'month',
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    detailEvents() {
      if (!this.selectedDate) return []
      return this.events.filter((event) => event.start === this.selectedDate)
    },
    events() {
      return this.items.reduce((sum, item) => {
        const color = item.workShift === 'day' ? 'blue' : 'red'
        item.dates.forEach((date) => {
          sum.push({
            name: item.name,
            start: date,
            color,
            item,
          })
        })
        return sum
      }, [])
    },
    mode() {
      if (this.editMode === 'REGIST') return '登録'
      if (this.editMode === 'UPDATE') return '変更'
      return '削除'
    },
    month() {
      return this.$dayjs(this.currentDate).format('YYYY-MM')
    },
    months() {
      const dayjs = this.$dayjs(this.currentDate)
      const prev = dayjs.startOf('month').subtract(1, 'day').format('YYYY-MM')
      const current = dayjs.format('YYYY-MM')
      const next = dayjs.startOf('month').add(1, 'day').format('YYYY-MM')
      return [prev, current, next]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.editor': {
      handler(v) {
        v || this.initialize()
      },
      immediate: true,
    },
    months: {
      handler() {
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
      this.items = this.model.subscribe(undefined, [
        where('months', 'array-contains-any', this.months),
      ])
    },
    initialize() {
      this.editMode = 'REGIST'
      this.remove = false
      this.model.initialize()
      this.$refs.form?.resetValidation()
      this.$refs.scrollTarget?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    },
    async submit() {
      if (!this.validate()) return
      try {
        this.loading = true
        if (this.editMode === 'REGIST') await this.model.create()
        // if (this.editMode === 'UPDATE') await this.model.update()
        if (this.editMode === 'UPDATE') {
          this.remove ? await this.model.delete() : await this.model.update()
        }
        // if (this.editMode === 'DELETE') await this.model.delete()
        this.dialog.editor = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      const result = this.remove ? true : this.$refs.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
    onClickEdit(item) {
      this.model.initialize(item)
      this.editMode = 'UPDATE'
      this.dialog.editor = true
    },
    // onClickDelete(item) {
    //   this.model.initialize(item)
    //   this.editMode = 'DELETE'
    //   this.dialog.editor = true
    // },
    onClickDate(date) {
      if (!this.events.filter((event) => event.start === date).length) return
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
      <v-dialog v-model="dialog.editor" persistent scrollable max-width="480">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <v-card>
          <v-toolbar flat color="primary" dark dense>
            <v-toolbar-title>{{ `スポット現場情報[${mode}]` }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text ref="scrollTarget" class="pa-4">
            <v-form ref="form">
              <g-text-field
                v-model="model.name"
                label="現場名"
                required
                ignore-surrogate-pair
              />
              <g-text-field v-model="model.address" label="住所" />
              <v-radio-group v-model="model.workShift" row>
                <v-radio value="day" label="日勤" />
                <v-radio value="night" label="夜勤" />
              </v-radio-group>
              <g-numeric v-model="model.numberOfPeople" label="人数" />
              <g-switch v-model="model.qualification" label="資格者" />
              <g-combobox-date
                v-model="model.dates"
                label="予定日"
                required
                multiple
              />
              <g-textarea v-model="model.remarks" label="備考" hide-details />
              <v-checkbox
                v-if="editMode === 'UPDATE'"
                v-model="remove"
                label="このスポット情報を削除する"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="dialog.editor = false"
              ><g-icon-close />close</v-btn
            >
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
              ><g-icon-submit />submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <v-container fluid>
      <div class="d-flex mb-2 align-center" style="column-gap: 4px">
        <v-btn icon @click="$refs.calendar.prev()"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
        <span>{{ month }}</span>
        <v-btn icon @click="$refs.calendar.next()"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
        <v-btn
          class="ml-auto"
          color="primary"
          small
          outlined
          @click="currentDate = $dayjs().format('YYYY-MM-DD')"
          >今月</v-btn
        >
      </div>
      <div :style="{ height: `${height ? parseInt(height) : undefined}px` }">
        <g-calendar
          ref="calendar"
          v-model="currentDate"
          :events="events"
          :type="type"
          @click:date="onClickDate($event.date)"
          @click:event="onClickEdit($event.event.item)"
        />
      </div>
      <v-dialog v-model="dialog.detail" scrollable max-width="480">
        <v-card>
          <v-card-title class="g-card__title"> スポット現場情報 </v-card-title>
          <v-card-text>
            <v-list-item v-for="(event, index) of detailEvents" :key="index">
              <v-list-item-content>
                <v-list-item-title>
                  {{ event.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ event.item.address }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon @click="onClickEdit(event.item)">mdi-pencil</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<style></style>
