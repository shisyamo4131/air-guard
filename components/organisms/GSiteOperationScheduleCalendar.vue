<script>
/**
 * ### GSiteOperationScheduleCalendar
 *
 * 現場の稼働予定を管理するコンポーネントです。
 *
 * #### 機能詳細:
 * - `props.siteId`で指定された現場の稼働予定をカレンダー表示します。
 * - `props.siteId`で指定された現場の稼働予定の追加・変更・削除が可能です。
 * - `period`イベントで、現在カレンダーに表示されている期間を`{from, to}`として受け取ることができます。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - `period`イベントを実装。現在カレンダーで選択されている期間の開始・終了をemitする。
 * - version 1.0.0 - 初版作成
 */
import { where } from 'firebase/firestore'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GDivMonthChooser from '../molecules/divs/GDivMonthChooser.vue'
import GCalendarSiteOperationScheduleSummary from '../molecules/calendars/GCalendarSiteOperationScheduleSummary.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputSiteOperationScheduleBulk from '../molecules/inputs/GInputSiteOperationScheduleBulk.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputSiteOperationSchedule,
    GDivMonthChooser,
    GCalendarSiteOperationScheduleSummary,
    GDialogEditor,
    GInputSiteOperationScheduleBulk,
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
      editMode: null,
      items: [],
      listener: this.$SiteOperationSchedule(),
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
    modelId() {
      if (this.editMode === 'REGIST') {
        return 'SiteOperationScheduleBulk'
      } else {
        return 'SiteOperationSchedule'
      }
    },
    component() {
      if (this.editMode === 'REGIST') {
        return `GInputSiteOperationScheduleBulk`
      } else {
        return `GInputSiteOperationSchedule`
      }
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
    siteId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.listener.siteId = newVal
        this.subscribe()
      },
      immediate: true,
    },
    currentDate: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.$emit('period', { from: this.from, to: this.to })
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickSchedule({ date, workShift }) {
      this.editMode = 'UPDATE'
      this.$nextTick(() => {
        const item = this.items.find((item) => {
          return item.date === date && item.workShift === workShift
        })
        this.$refs.editor.open({ item, editMode: 'UPDATE' })
      })
    },
    subscribe() {
      this.items = this.listener.subscribe(undefined, [
        where('date', '>=', this.from),
        where('date', '<=', this.to),
      ])
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" class="d-flex flex-column" v-on="$listeners">
    <v-card-title class="g-card__title">
      稼働予定表
      <g-dialog-editor
        ref="editor"
        label="稼働予定"
        :model-id="modelId"
        :max-width="editMode === 'REGIST' ? 720 : 360"
        :default-item="{ siteId }"
        @edit-mode="editMode = $event"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            v-bind="attrs"
            class="ml-auto"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <component :is="component" v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </v-card-title>
    <v-container fluid class="py-0">
      <g-div-month-chooser
        v-model="currentDate"
        @click:prev="$refs.calendar.prev()"
        @click:next="$refs.calendar.next()"
      />
    </v-container>
    <v-container fluid class="flex-grow-1">
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
