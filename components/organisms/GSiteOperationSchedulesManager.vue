<script>
/**
 * 現場稼働予定ドキュメント管理コンポーネントです。
 * - コンポーネントとしての処理が比較的複雑であるため、SFC で定義しています。
 * - props.siteId で現場IDを受け取ると、現在コンポーネントが管理している期間中の
 *   現場稼働予定ドキュメントを Firestore から取得してカレンダーに表示します。
 *
 * @author shisyamo4131
 * @refact 2025-02-06
 */
import ja from 'dayjs/locale/ja'
import GBtnPrev from '../atoms/btns/GBtnPrev.vue'
import GBtnNext from '../atoms/btns/GBtnNext.vue'
import GBtnRegist from '../atoms/btns/GBtnRegist.vue'
import GBtnCancel from '../atoms/btns/GBtnCancel.vue'
import GIconEdit from '../atoms/icons/GIconEdit.vue'
import GIconStar from '../atoms/icons/GIconStar.vue'
import GIconDay from '../atoms/icons/GIconDay.vue'
import GIconNight from '../atoms/icons/GIconNight.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GSiteOperationScheduleCalendar from '../atoms/calendars/GSiteOperationScheduleCalendar.vue'
import GCollectionManagerSiteOperationSchedules from '../managers/GCollectionManagerSiteOperationSchedules.vue'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnPrev,
    GBtnNext,
    GBtnRegist,
    GBtnCancel,
    GIconEdit,
    GIconStar,
    GIconDay,
    GIconNight,
    GInputSiteOperationSchedule,
    GSiteOperationScheduleCalendar,
    GCollectionManagerSiteOperationSchedules,
  },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象の現場IDです。
     */
    siteId: { type: String, required: true },

    /**
     * `カレンダーの期間を決定する日付` です。
     * v-model でのバインドが可能です。
     */
    value: {
      type: [String, Number, Date],
      default: undefined,
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 現場稼働予定ドキュメントの配列です。
       */
      items: [],

      /**
       * 現場稼働予定ドキュメントのクラスインスタンスです。
       */
      schema: new SiteOperationSchedule(),

      /**
       * コンポーネント内部で管理する `カレンダーの期間を決定する日付` です。
       * 当該日付を含む期間のカレンダーが表示されます。
       */
      internalValue: this.$dayjs().format('YYYY-MM-DD'),

      /**
       * カレンダーでクリックされた日の日付文字列です。
       */
      selectedDate: undefined,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネント内部で使用する `カレンダーの期間を決定する日付` です。
     * - 更新されると input イベントを emit します。
     */
    computedValue: {
      get() {
        return this.internalValue
      },
      set(v) {
        this.internalValue = v
        this.$emit('input', v)
      },
    },

    /**
     * カレンダーで日付が選択されているかどうかです。
     * - data.selectedDate に値が設定されているかどうかを Bool 値で返します。
     * - false をセットすると、data.selectedDate が初期化されます。
     * - リスト表示のためのダイアログ制御に使用しています。
     */
    dateIsSelected: {
      get() {
        return !!this.selectedDate
      },
      set(v) {
        if (!v) this.selectedDate = undefined
      },
    },

    /**
     * data.selectedDate で選択された日の現場稼働予定ドキュメントの配列を返します。
     */
    selectedSchedules() {
      if (!this.selectedDate) return []
      return this.items
        .filter((item) => item.date === this.selectedDate)
        .sort((a, b) => a.item.workShift.localeCompare(b.item.workShift))
    },

    /**
     * 基準日月初を含む週の開始日を返します。
     * - 現場稼働予定ドキュメントを抽出対象となる日付範囲の開始日になります。
     */
    from() {
      return this.$dayjs(this.computedValue)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },

    /**
     * 基準日の年月を返します。
     */
    month() {
      return this.$dayjs(this.computedValue).format('YYYY年MM月')
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
      return this.$dayjs(this.computedValue)
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
     * props.value を監視します。
     * - data.internalValue と同期します。
     * - 値が null または undefined の場合は強制的に現在の data.internalValue を
     *   input イベントで emit します。
     */
    value: {
      handler(v) {
        if (v === null || v === undefined) {
          this.$emit('input', this.internalValue)
        } else {
          this.internalValue = v
        }
      },
      immediate: true,
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
    /**
     * Manager に引き渡す処理です。
     */
    beforeEdit({ isCreate }) {
      return new Promise((resolve) => {
        if (isCreate) {
          this.schema.dates = this.selectedDate ? [this.selectedDate] : []
        }
        resolve()
      })
    },
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
      this.computedValue = this.$dayjs(this.computedValue)
        .startOf('month')
        .add(1, 'month')
        .format('YYYY-MM-DD')
    },

    /**
     * 基準日（computedValue）を前月月初に設定します。
     */
    prev() {
      this.computedValue = this.$dayjs(this.computedValue)
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
  <g-collection-manager-site-operation-schedules
    v-bind="$attrs"
    :before-edit="beforeEdit"
    :items="items"
    :instance="schema"
    v-on="$listeners"
  >
    <template #default="props">
      <slot name="header">
        <v-toolbar flat>
          <v-spacer />
          <g-btn-prev :color="props.color" icon @click="prev" />
          <span class="text-h6">{{ month }}</span>
          <g-btn-next :color="props.color" icon @click="next" />
          <v-spacer />
        </v-toolbar>
      </slot>
      <slot name="default" v-bind="props">
        <g-site-operation-schedule-calendar
          v-model="computedValue"
          :color="props.color"
          :items="items"
          @click:date="selectedDate = $event.date"
          @click:event="
            ($event) => props.table.on['click:edit']($event.event.item)
          "
        />
      </slot>
      <slot name="list">
        <v-dialog v-model="dateIsSelected" max-width="360">
          <v-card>
            <v-toolbar :color="props.color" dark dense flat>
              <v-toolbar-title>
                {{ listTitle }}
              </v-toolbar-title>
              <v-spacer />
              <g-btn-cancel icon @click="dateIsSelected = false" />
            </v-toolbar>
            <v-list>
              <v-list-item
                v-for="(item, index) of selectedSchedules"
                :key="index"
              >
                <v-list-item-icon>
                  <g-icon-day v-if="item.workShift === 'day'" />
                  <g-icon-night v-else />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-if="item.isClosed">
                    <span>休工</span>
                  </v-list-item-title>
                  <v-list-item-title v-else>
                    {{ `${item.startTime} ～ ${item.endTime}` }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-content v-if="!item.isClosed">
                  <v-list-item-title>
                    <g-icon-star
                      v-if="item.qualification"
                      color="yellow darken-3"
                      small
                    />
                    {{ `${item.requiredWorkers} 名` }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <g-icon-edit
                    :color="props.color"
                    @click="() => props.table.on['click:edit'](item)"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <g-btn-regist
                block
                :color="props.color"
                label="新しい予定を登録"
                small
                @click="props.activator.on['click']"
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </slot>
      <slot name="footer">
        <v-toolbar dense flat>
          <v-spacer />
          <g-btn-regist
            :color="props.color"
            icon
            @click="props.activator.on['click']"
          />
        </v-toolbar>
      </slot>
    </template>
    <template #inputs="{ attrs, on }">
      <g-input-site-operation-schedule
        v-bind="attrs"
        :hide-site="!!siteId"
        v-on="on"
      />
    </template>
  </g-collection-manager-site-operation-schedules>
</template>

<style></style>
