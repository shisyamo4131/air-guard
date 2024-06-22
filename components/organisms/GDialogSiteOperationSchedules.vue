<script>
/**
 * ### GDialogSiteOperationSchedules
 *
 * 特定の日の現場稼働予定を表示・編集するためのコンポーネントです。
 *
 * 機能の詳細：
 * - `props.events`で受け取った現場稼働予定のうち、`props.date`で指定された日の現場稼働予定を一覧表示します。
 * - 一覧画面で「＋」ボタンをクリック（タップ）すると、`click:regist`イベントがemitされます。
 * - このコンポーネントでは新規の現場稼働予定を入力するための機能を提供しません。
 * - 一覧表示されている現場稼働予定をクリック（タップ）すると、当該予定の詳細情報を表示します。
 * - 詳細表示画面で「編集」ボタンをクリック（タップ）すると、当該予定の編集画面を表示します。
 * - 編集画面では当該予定の情報を編集・更新・複製することができます。
 * - 編集・更新が完了すると、詳細画面に戻ります。
 *
 * @component
 * @example
 * <GDialogSiteOperationSchedules
 *   :date="date"
 *   :events="events"
 * />
 *
 * @props {String} date - 表示対象の日付（YYYY-MM-DD）
 * @props {Array} events - 現場の稼働予定イベントオブジェクトの配列
 *
 * @author shisyamo4131
 * @create 2024-06-18
 * @update 2024-06-19   複製機能を追加。
 *         2024-06-22   dayjsのlocaleの変更方法がグローバルになっていたのをローカルに変更。
 */
import ja from 'dayjs/locale/ja'
import GDatePicker from '../atoms/pickers/GDatePicker.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GListItemSiteOperationSchedule from '../molecules/lists/GListItemSiteOperationSchedule.vue'
import GSimpleTableSiteOperationSchedule from '../molecules/tables/GSimpleTableSiteOperationSchedule.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputSiteOperationSchedule,
    GListItemSiteOperationSchedule,
    GSimpleTableSiteOperationSchedule,
    GDatePicker,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    date: { type: String, default: '', required: false },
    events: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      duplicator: {
        dialog: false,
        date: '',
        pickerDate: undefined,
        snackbar: false,
      },
      formRef: null,
      loading: false,
      model: this.$SiteOperationSchedule(),
      removeSchedule: false,
      scrollTargetRef: null,
      selectedEvent: null,
      window: 1,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    leftBtn() {
      switch (this.window) {
        case 1:
          return {
            icon: 'mdi-close',
            attrs: {},
            on: { click: () => (this.dialog = false) },
          }
        case 2:
          return {
            icon: 'mdi-chevron-left',
            attrs: {},
            on: { click: () => (this.window = 1) },
          }
        case 3:
          return {
            icon: 'mdi-chevron-left',
            attrs: { disabled: this.loading },
            on: { click: () => this.window-- },
          }
        default:
          return { icon: '', on: {} }
      }
    },
    rightBtn() {
      switch (this.window) {
        case 1:
          return {
            icon: 'mdi-plus',
            attrs: {},
            on: { click: this.onClickRegist },
          }
        case 2:
          return {
            icon: 'mdi-pencil',
            attrs: {},
            on: { click: this.onClickEdit },
          }
        case 3:
          return {
            icon: 'mdi-check',
            attrs: { disabled: this.loading, loading: this.loading },
            on: { click: this.onClickSubmit },
          }
        default:
          return { icon: '', on: {} }
      }
    },
    dayEvents() {
      return this.events.filter((event) => event.start === this.date)
    },
    title() {
      switch (this.window) {
        case 1: {
          if (!this.date) return ''
          return this.$dayjs(this.date).locale(ja).format('M月D日（ddd）')
        }
        case 2:
          return this.selectedEvent?.site?.name || ''
        case 3:
          return this.selectedEvent?.site?.name || ''
        default:
          return ''
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.value': {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
    dialog(newVal, oldVal) {
      if (newVal === oldVal) return
      newVal || this.initialize()
      this.$emit('input', newVal)
    },
    'duplicator.dialog'(newVal, oldVal) {
      if (newVal === oldVal) return
      if (!newVal) {
        this.duplicator.date = ''
        this.duplicator.pickerDate = this.date
      }
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.model.initialize()
      this.formRef?.resetValidation()
      this.scrollTargetRef.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      this.window = 1
      this.removeSchedule = false
    },
    onClickRegist() {
      this.$emit('click:regist')
    },
    onClickEdit() {
      this.model.initialize(this.selectedEvent.schedule)
      this.window++
    },
    onClickEvent(event) {
      this.selectedEvent = event
      this.window++
    },
    async onClickSubmit() {
      if (!this.validate()) return
      this.loading = true
      try {
        if (!this.removeSchedule) await this.model.update()
        if (this.removeSchedule) await this.model.delete()
        this.initialize()
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      if (this.removeSchedule) return true
      const result = this.formRef.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
    async duplicate() {
      this.model.initialize(this.selectedEvent.schedule)
      this.model.date = this.duplicator.date
      this.loading = true
      try {
        await this.model.create()
        this.duplicator.dialog = false
        this.duplicator.snackbar = true
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
  <v-dialog
    v-model="dialog"
    v-bind="$attrs"
    scrollable
    transition="dialog-bottom-transition"
    v-on="$listeners"
  >
    <v-card height="80vh">
      <!-- card title -->
      <v-card-title class="pa-0">
        <v-toolbar dense flat>
          <v-fab-transition>
            <v-btn
              v-bind="leftBtn.attrs"
              :key="leftBtn.icon"
              icon
              v-on="leftBtn.on"
            >
              <v-icon>{{ leftBtn.icon }}</v-icon>
            </v-btn>
          </v-fab-transition>
          <v-toolbar-title>
            {{ title }}
          </v-toolbar-title>
          <v-spacer />
          <v-fab-transition>
            <v-btn
              v-bind="rightBtn.attrs"
              :key="rightBtn.icon"
              color="primary"
              icon
              v-on="rightBtn.on"
            >
              <v-icon>{{ rightBtn.icon }}</v-icon>
            </v-btn>
          </v-fab-transition>
        </v-toolbar>
      </v-card-title>
      <v-divider />
      <!-- v-card-text to make v-dialog scroll work -->
      <v-card-text :ref="(el) => (scrollTargetRef = el)" class="pa-0">
        <v-window v-model="window" touchless>
          <v-window-item :value="1">
            <template v-for="(event, index) of dayEvents">
              <g-list-item-site-operation-schedule
                :key="`item-${index}`"
                :event="event"
                @click="onClickEvent(event)"
              />
              <v-divider :key="`div-${index}`" />
            </template>
          </v-window-item>
          <v-window-item :value="2">
            <g-simple-table-site-operation-schedule :event="selectedEvent" />
            <v-container>
              <v-dialog v-model="duplicator.dialog" max-width="290">
                <template #activator="{ attrs, on }">
                  <v-btn v-bind="attrs" block color="primary" text v-on="on"
                    ><v-icon left small>mdi-content-copy</v-icon
                    >この予定を複製する</v-btn
                  >
                </template>
                <g-date-picker
                  v-model="duplicator.date"
                  no-title
                  :picker-date.sync="duplicator.pickerDate"
                  :show-current="false"
                >
                  <v-btn
                    color="primary"
                    :disabled="loading"
                    text
                    @click="duplicator.dialog = false"
                    >CANCEL</v-btn
                  >
                  <v-spacer />
                  <v-btn
                    :disabled="!duplicator.date || loading"
                    color="primary"
                    :loading="loading"
                    text
                    @click="duplicate"
                    >OK</v-btn
                  >
                </g-date-picker>
              </v-dialog>
            </v-container>
          </v-window-item>
          <v-window-item :value="3">
            <v-card-text class="pa-4">
              <v-form :ref="(el) => (formRef = el)" :disabled="loading">
                <g-input-site-operation-schedule
                  v-bind.sync="model"
                  edit-mode="UPDATE"
                />
              </v-form>
              <v-checkbox
                v-model="removeSchedule"
                label="この予定を削除する"
                color="error"
              />
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-snackbar v-model="duplicator.snackbar" centered
        >複製しました。</v-snackbar
      >
    </v-card>
  </v-dialog>
</template>

<style></style>
