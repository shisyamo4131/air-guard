<script>
/**
 * 現場稼働予定ドキュメント管理コンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-16
 */
import ja from 'dayjs/locale/ja'
import GBtnPrev from '../atoms/btns/GBtnPrev.vue'
import GBtnNext from '../atoms/btns/GBtnNext.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GCalendarV2 from '../atoms/calendars/GCalendarV2.vue'
import GBtnCancel from '../atoms/btns/GBtnCancel.vue'
import GIconEdit from '../atoms/icons/GIconEdit.vue'
import GIconStar from '../atoms/icons/GIconStar.vue'
import GIconDay from '../atoms/icons/GIconDay.vue'
import GIconNight from '../atoms/icons/GIconNight.vue'
import AirArrayManager from '../air/AirArrayManager.vue'
import GInputSiteOperationScheduleV2 from '../molecules/inputs/GInputSiteOperationScheduleV2.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnPrev,
    GBtnNext,
    GBtnRegist,
    GCalendarV2,
    GBtnCancel,
    GIconEdit,
    GIconStar,
    GIconDay,
    GIconNight,
    AirArrayManager,
    GInputSiteOperationScheduleV2,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントカラーです。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * 管理対象の現場IDです。
     */
    siteId: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new SiteOperationSchedule(),

      docs: [], // 購読している現場稼働予定ドキュメントの配列
      instance: new SiteOperationSchedule(),
      internalValue: this.$dayjs().format('YYYY-MM-DD'),
      list: false,
      selectedDate: undefined,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 購読中の現場稼働予定ドキュメントの配列を Calendar コンポーネント用の
     * events 配列に変換して返します。
     */
    events() {
      return this.items.map((item) => {
        const name = item.isClosed
          ? '休工'
          : item.qualification
          ? `★${item.requiredWorkers}名`
          : `${item.requiredWorkers}名`
        const start = item.isClosed
          ? new Date(`${item.date}`)
          : new Date(`${item.date}T${item.startTime}`)
        const end = item.isClosed
          ? new Date(`${item.date}`)
          : new Date(`${item.date}T${item.endTime}`)
        const color = item.workShift === 'day' ? 'info' : 'accent'
        return { name, start, end, color, item }
      })
    },

    /**
     * 選択された日のイベント配列を返します。
     */
    listEvents() {
      if (!this.selectedDate) return []
      return this.events
        .filter((event) => event.item.date === this.selectedDate)
        .sort((a, b) => a.item.workShift.localeCompare(b.item.workShift))
    },

    /**
     * 基準日月初を含む週の開始日を返します。
     * - 現場稼働予定ドキュメントを抽出対象となる日付範囲の開始日になります。
     */
    from() {
      return this.$dayjs(this.internalValue)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },

    /**
     * 基準日の年月を返します。
     */
    month() {
      return this.$dayjs(this.internalValue).format('YYYY年MM月')
    },

    /**
     * リストダイアログのタイトルを返します。
     */
    listTitle() {
      if (!this.selectedDate) return undefined
      return this.$dayjs(this.selectedDate)
        .locale(ja)
        .format('YYYY年MM月DD日 dddd')
    },

    /**
     * 基準日月末を含む週の最終日を返します。
     * - 現場稼働予定ドキュメントを抽出対象となる日付範囲の最終日になります。
     */
    to() {
      return this.$dayjs(this.internalValue)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.list を監視します。
     * - リストが閉じられたら data.selectedDate を初期化します。
     * - 現場稼働予定の登録ダイアログで、日付の初期値設定に影響します。
     */
    list(v) {
      if (!v) this.selectedDate = undefined
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * from, to, siteId の複合ウォッチャーを登録します。
     */
    this.$watch(
      () => [this.from, this.to, this.siteId],
      (newVal, oldVal) => {
        const [fromBefore, toBefore, siteIdBefore] = oldVal || []
        const [fromAfter, toAfter, siteIdAfter] = newVal || []

        // siteId が変更されたら data.schema を初期化
        if (siteIdBefore !== siteIdAfter) {
          this.schema.initialize(siteIdAfter ? { siteId: siteIdAfter } : {})
        }

        // from, to, siteId のいずれかが変更された場合、購読を開始
        if (
          fromBefore !== fromAfter ||
          toBefore !== toAfter ||
          siteIdBefore !== siteIdAfter
        ) {
          this.subscribe()
        }
      },
      { immediate: true }
    )
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },
    /**
     * 基準日（interanalValue）を翌月月初にします。
     */
    next() {
      this.internalValue = this.$dayjs(this.internalValue)
        .startOf('month')
        .add(1, 'month')
        .format('YYYY-MM-DD')
    },

    /**
     * ダイアログを登録モードで開きます。
     * - AirArrayManager の toRegist を callback で受け取ります。
     * - 日付が選択されている場合はインスタンスに初期値として設定します。
     */
    openDialogAsRegist(callback) {
      this.schema.dates = this.selectedDate ? [this.selectedDate] : []
      callback()
    },

    /**
     * 現場稼働予定リストダイアログを開きます。
     */
    openList(event) {
      this.selectedDate = event.date
      this.list = true
    },

    /**
     * 基準日（internalValue）を前月月初に設定します。
     */
    prev() {
      this.internalValue = this.$dayjs(this.internalValue)
        .startOf('month')
        .subtract(1, 'month')
        .format('YYYY-MM-DD')
    },

    /**
     * 現場稼働予定ドキュメントの購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      if (!this.siteId || !this.from || !this.to) return
      this.items = this.schema.subscribeDocs([
        ['where', 'siteId', '==', this.siteId],
        ['where', 'date', '>=', this.from],
        ['where', 'date', '<=', this.to],
      ])
    },

    /**
     * 現場稼働予定ドキュメントの購読を解除します。
     */
    unsubscribe() {
      this.schema.unsubscribe()
    },
  },
}
</script>

<template>
  <air-array-manager
    v-bind="$attrs"
    :dialog-props="{ maxWidth: 360 }"
    :handle-create="handleCreate"
    :handle-update="handleUpdate"
    :handle-delete="handleDelete"
    :items="items"
    label="現場稼働予定"
    :schema="schema"
    v-on="$listeners"
  >
    <template #default="props">
      <slot name="header">
        <v-toolbar flat>
          <v-spacer />
          <g-btn-prev :color="color" icon @click="prev" />
          <span class="text-h6">{{ month }}</span>
          <g-btn-next :color="color" icon @click="next" />
          <v-spacer />
        </v-toolbar>
      </slot>
      <slot name="default" v-bind="props">
        <g-calendar-v-2
          v-model="internalValue"
          :color="color"
          :events="events"
          @click:date="openList"
          @click:event="
            ($event) => props.table.on['click:edit']($event.event.item)
          "
        />
      </slot>
      <slot name="list">
        <v-dialog v-model="list" max-width="360">
          <v-card>
            <v-toolbar :color="color" dark dense flat>
              <v-toolbar-title>
                {{ listTitle }}
              </v-toolbar-title>
              <v-spacer />
              <g-btn-cancel icon @click="list = false" />
            </v-toolbar>
            <v-list>
              <v-list-item v-for="(event, index) of listEvents" :key="index">
                <v-list-item-icon>
                  <g-icon-day v-if="event.item.workShift === 'day'" />
                  <g-icon-night v-else />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-if="event.item.isClosed">
                    <span>休工</span>
                  </v-list-item-title>
                  <v-list-item-title v-else>
                    {{ `${event.item.startTime} ～ ${event.item.endTime}` }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-content v-if="!event.item.isClosed">
                  <v-list-item-title>
                    <g-icon-star
                      v-if="event.item.qualification"
                      color="yellow darken-3"
                      small
                    />
                    {{ `${event.item.requiredWorkers} 名` }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <g-icon-edit
                    :color="color"
                    @click="() => props.table.on['click:edit'](event.item)"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <g-btn-regist
                block
                :color="color"
                label="新しい予定を登録"
                small
                @click="() => openDialogAsRegist(props.activator.on['click'])"
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </slot>
      <slot name="footer">
        <v-toolbar dense flat>
          <v-spacer />
          <g-btn-regist
            :color="color"
            icon
            @click="() => openDialogAsRegist(props.activator.on['click'])"
          />
        </v-toolbar>
      </slot>
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-site-operation-schedule-v-2
        v-bind="attrs"
        :hide-site="!!siteId"
        v-on="on"
      />
    </template>
  </air-array-manager>
</template>

<style></style>
