<script>
/**
 * 稼働予定管理ページです。
 *
 * - 現場-勤務区分の表示順序を制御するため、SiteOperationSchedules/siteOrder を
 *   読み込みます。
 * - 稼働予定ドキュメントに対するリアルタイムリスナーを設定し、稼働予定を表示します。
 *   - 稼働予定ドキュメントに対するリアルタイムリスナーは月ごとに分割されています。
 *   - 表示月数を変更することで、対応する月のリアルタイムリスナーをセットします。
 *   - 表示月数が減少しても、リスナーは解除されません。
 *   - ページから離れる際にすべてのリスナーが解除されます。
 * - 新しい稼働予定ドキュメントの読み込み時、現場-勤務区分が siteOrder に存在しない場合
 *   これを追加すると同時に Realtime Database の値を更新します。
 * - 同じく、現場-勤務区分の表示順序が変更された際も Realtime Database を更新します。
 *
 * @author shisyamo4131
 */
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { database, firestore } from 'air-firebase'
import ja from 'dayjs/locale/ja'
import { onValue, ref, set } from 'firebase/database'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GInputSiteOperationSchedule from '~/components/molecules/inputs/GInputSiteOperationSchedule.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
import GChipWorkShift from '~/components/atoms/chips/GChipWorkShift.vue'
import GSosRequiredWorkersChip from '~/components/organisms/site-operation-schedules/GSosRequiredWorkersChip.vue'
import GSiteOrderManager from '~/components/organisms/GSiteOrderManager.vue'
import GIconCancel from '~/components/atoms/icons/GIconCancel.vue'
import GSnackbarError from '~/components/atoms/snackbars/GSnackbarError.vue'

export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SiteOperationSchedulesIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GSelect,
    GDialogInput,
    GInputSiteOperationSchedule,
    GChipWorkShift,
    GSosRequiredWorkersChip,
    GSiteOrderManager,
    GIconCancel,
    GSnackbarError,
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * ASYNCDATA
   * - SiteOperationSchedules/siteOrder を読み込み、data.siteOrder を準備します。
   ***************************************************************************/
  asyncData({ app }) {
    try {
      let siteOrder = []

      // siteOrder の取得
      const dbRef = ref(database, `SiteOperationSchedules/siteOrder`)
      const listener = onValue(dbRef, (snapshot) => {
        siteOrder = snapshot.val() ?? []
      })
      return { siteOrderListener: listener, siteOrder }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message)
    }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dbRef: ref(database, `SiteOperationSchedules/siteOrder`),
      columns: [],
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
      dialog: false,
      instance: new SiteOperationSchedule(),
      listeners: {},
      months: [
        { text: '1ヶ月', value: 1 },
        { text: '2ヶ月', value: 2 },
        { text: '3ヶ月', value: 3 },
        { text: '4ヶ月', value: 4 },
        { text: '5ヶ月', value: 5 },
        { text: '6ヶ月', value: 6 },
      ],
      schedules: [],
      scrollContainerRef: null,
      selectedMonths: 3,
      siteOrder: [],
      siteOrderListener: null,
      snackbar: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * data.currentDate, data.selectedMonths をもとに当該コンポーネントで管理すべき
     * 稼働予定期間を、YYYY-MM-DD 形式文字列の配列で返します。
     */
    dates() {
      const start = this.$dayjs(this.from)
      const end = this.$dayjs(this.to)
      const dayCount = end.diff(start, 'day') + 1
      return [...Array(dayCount)].map((_, i) =>
        start.add(i, 'day').format('YYYY-MM-DD')
      )
    },

    /**
     * 当該コンポーネントに表示すべき管理対象の最初の日を返します。
     */
    from() {
      return this.$dayjs(this.currentDate).startOf('month').format('YYYY-MM-DD')
    },

    /**
     * 稼働予定があるにも関わらず、サイトオーダーに存在しないオーダーIDの配列を返します。
     */
    hiddenOrders() {
      const requiredOrderIds = [
        ...this.schedules
          .map((schedule) => ({
            id: `${schedule.siteId}-${schedule.workShift}`,
            siteId: schedule.siteId,
            workShift: schedule.workShift,
          }))
          .reduce((unique, item) => {
            if (!unique.some((u) => u.id === item.id)) {
              unique.push(item)
            }
            return unique
          }, []),
      ]

      const result = requiredOrderIds.filter((idObj) => {
        return !this.siteOrder.some((order) => order.id === idObj.id)
      })

      return result
    },

    /**
     * 当該コンポーネントに表示すべき管理対象の最後の日を返します。
     */
    to() {
      return this.$dayjs(this.currentDate)
        .add(this.selectedMonths - 1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
    },

    computedSiteOrder: {
      get() {
        return this.siteOrder
      },
      set(v) {
        this.updateSiteOrder(v)
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.dates を監視します。
     * - 出力対象の日付群が変更されたことを意味するため、updateColumns をコールして
     *   テーブルの列定義を更新します。
     * - 現在日付の列までスクロールします。（描画が完了するまで待機してから）
     */
    dates: {
      async handler() {
        await this.updateColumns()
        this.$nextTick(async () => {
          await this.scrollToCurrentColumn(true)
        })
      },
      immediate: true,
    },

    /**
     * data.dialog を監視します。
     * - 稼働予定編集画面が閉じられたことを意味するため、data.instance を初期化し、
     *   editMode を CREATE に初期化します。
     */
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },

    /**
     * data.selectedMonth を監視します。
     * - 対象月のリスナーが存在しなければ subscribe を実行します。
     */
    selectedMonths: {
      handler(v) {
        ;[...Array(v)].forEach((_, i) => {
          if (!this.listeners[`month-${i}`]) this.subscribe(i)
        })
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    try {
      // siteOrder の購読を開始
      this.siteOrderListener = onValue(this.dbRef, (snapshot) => {
        this.siteOrder = snapshot.val() ?? []
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message)
    }
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.cleanUpListeners()
    if (!this.siteOrderListener) this.siteOrderListener()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    showHiddenOrders() {
      if (!this.hiddenOrders.length) return
      this.computedSiteOrder = [...this.siteOrder, ...this.hiddenOrders]
      this.snackbar = false
    },

    /**
     * サイトオーダーから指定されたオーダーを削除します。
     */
    async deleteSite(order) {
      const newOrder = this.siteOrder.filter(({ id }) => id !== order.id)
      await set(ref(database, `SiteOperationSchedules/siteOrder`), newOrder)
    },

    /**
     * 各月の稼働予定ドキュメントに対するリアルタイムリスナーの購読を解除します。
     */
    async cleanUpListeners() {
      const promises = Object.values(this.listeners)
        .filter((listener) => listener)
        .map((listener) => listener())

      await Promise.all(promises).then(() => {
        // eslint-disable-next-line no-console
        console.log('All listeners have been removed')
      })
    },

    /**
     * 当日日付の列までスクロールします。
     * @param {boolean} scrollToTop - true の場合、縦方向に一番上までスクロールします。
     */
    scrollToCurrentColumn(scrollToTop = false) {
      return new Promise((resolve) => {
        const wrapper = this.$el.querySelector('div.v-data-table__wrapper')
        const column = wrapper.querySelector(`th.g-col-${this.currentDate}`)
        const firstColumn = wrapper.querySelector('th:first-child')
        const secondColumn = wrapper.querySelector('th:nth-child(2)')

        if (!wrapper) {
          // eslint-disable-next-line no-console
          console.error('Wrapper element not found.')
          return
        }
        if (!column) {
          // eslint-disable-next-line no-console
          console.warn(
            `Column for currentDate (${this.currentDate}) not found.`
          )
          return
        }

        // 1列目と2列目の幅を取得
        const firstColumnWidth = firstColumn
          ? firstColumn.getBoundingClientRect().width
          : 0
        const secondColumnWidth = secondColumn
          ? secondColumn.getBoundingClientRect().width
          : 0

        // スクロール位置を計算
        const stickyOffset = firstColumnWidth + secondColumnWidth
        const offsetLeft = column.offsetLeft - stickyOffset

        // デバッグ用ログ
        // eslint-disable-next-line no-console
        // console.log({
        //   firstColumnWidth,
        //   secondColumnWidth,
        //   stickyOffset,
        //   columnOffsetLeft: column.offsetLeft,
        //   targetScrollLeft: offsetLeft,
        // })

        // 横スクロールと縦スクロールを実行
        wrapper.scrollTo({
          left: offsetLeft,
          top: scrollToTop ? 0 : wrapper.scrollTop, // scrollToTop が true の場合に一番上へ
        })
        resolve()
      })
    },

    /**
     * 編集ボタン（稼働数表示チップコンポーネント）がクリックされた時の処理です。
     * 引数に現場稼働予定のインスタンスを受け取り、稼働予定編集画面を UPDATE モードで開きます。
     */
    onClickEdit(instance) {
      this.instance.initialize(instance)
      if (instance.docId) {
        this.editMode = this.UPDATE
      }
      this.dialog = true
    },

    /**
     * 引数で指定された日付（YYYY-MM-DD 形式）の総稼働数を返します。
     */
    dayWorkersCount(date) {
      return this.schedules
        .filter((schedule) => schedule.date === date)
        .reduce((sum, i) => (sum += i.requiredWorkers), 0)
    },

    /**
     * 引数で指定された日付までの、その月の累計稼働数を返します。
     */
    monthTotalCount(date) {
      const from = this.$dayjs(date).startOf('month').format('YYYY-MM-DD')
      const to = date
      return this.schedules
        .filter((schedule) => {
          return schedule.date >= from && schedule.date <= to
        })
        .reduce((sum, i) => (sum += i.requiredWorkers), 0)
    },

    /**
     * 引数で受け取った値（現場-勤務区分の配列）で SiteOperationSchedules/siteOrder を上書きします。
     * - watcher.siteOrder からコールされます。
     */
    async updateSiteOrder(newOrder) {
      try {
        await set(this.dbRef, newOrder)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },

    /**
     * data.columns を更新します。
     * - `columns` イベントで更新した columns の内容を emit します。
     * NOTE:
     * 祝日判断の為の非同期関数を実行するため、columns の生成に computed は使えません。
     */
    async updateColumns() {
      // isHoliday を並列で取得
      const isHolidayResults = await Promise.all(
        this.dates.map((date) => this.$holiday.isHoliday(date))
      )
      const columns = await Promise.all(
        this.dates.map((date, index) => {
          const isHoliday = isHolidayResults[index]
          const dayOfWeek = this.$dayjs(date).format('ddd').toLowerCase()
          const isPreviousDay = date < this.currentDate
          const isToday = date === this.currentDate
          return {
            date,
            index,
            col: this.$dayjs(date).locale(ja).format('MM/DD'),
            colDay: this.$dayjs(date).locale(ja).format('(ddd)'),
            isHoliday, // 祝日情報を追加
            isToday,
            isPreviousDay,
            dayOfWeek: isHoliday ? 'holi' : dayOfWeek,
            class: {
              'g-col': true,
              [`g-col-${isHoliday ? 'holi' : dayOfWeek}`]: true,
              'g-col-previous': isPreviousDay,
              'g-col-today': isToday,
            },
          }
        })
      )
      this.columns = columns
      this.$emit('columns', columns)
    },

    /**
     * 現場の稼働予定ドキュメントに対するリアルタイムリスナーをセットします。
     * - ドキュメントが追加された場合、当該現場-勤務区分が siteOrder に存在しない場合、これを追加します。
     * - 引数には抽出条件となる月を指定します。
     * @param {number} month - 抽出条件となる月数（0: 当月, 1: 翌月, 2: 2ヶ月後, ・・・）
     */
    subscribe(month) {
      // eslint-disable-next-line no-console
      console.log(`Subscribe schedules on month-${month}`)
      const from = this.$dayjs(this.currentDate)
        .startOf('month')
        .add(month, 'month')
        .format('YYYY-MM-DD')
      const to = this.$dayjs(from).endOf('month').format('YYYY-MM-DD')
      const colRef = collection(firestore, 'SiteOperationSchedules')
      const queryRef = query(
        colRef,
        where('date', '>=', from),
        where('date', '<=', to)
      )
      this.listeners[`month-${month}`] = onSnapshot(queryRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const instance = new SiteOperationSchedule(change.doc.data())
          const index = this.schedules.findIndex(
            ({ docId }) => docId === instance.docId
          )
          if (change.type === 'added') {
            this.schedules.push(instance)
            const id = `${instance.siteId}-${instance.workShift}`

            // サイトオーダーに存在しないオーダーであれば追加
            if (!this.computedSiteOrder.some((order) => order.id === id)) {
              this.computedSiteOrder = [
                ...this.siteOrder,
                {
                  id,
                  siteId: instance.siteId,
                  workShift: instance.workShift,
                },
              ]
            }
          } else if (change.type === 'modified') {
            this.schedules.splice(index, 1, instance)
          } else {
            this.schedules.splice(index, 1)
          }
        })
      })
    },

    /**
     * 現場の稼働予定ドキュメントに対するリスナーを解除します。
     */
    unsubscribe() {
      if (this.listener) this.listener()
      this.listener = null
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-card class="d-flex flex-column" height="100%">
      <v-toolbar class="flex-grow-0" flat>
        <g-select
          v-model="selectedMonths"
          style="max-width: 120px"
          label="表示月数"
          :items="months"
          hide-details
        />
        <v-toolbar-items>
          <v-btn
            class="ml-2"
            color="primary"
            text
            @click="scrollToCurrentColumn"
          >
            <v-icon left>mdi-target</v-icon>
            今日
          </v-btn>
        </v-toolbar-items>
        <v-spacer />
        <v-toolbar-items>
          <g-dialog-input
            v-model="dialog"
            :edit-mode.sync="editMode"
            :instance="instance"
            max-width="480"
          >
            <template #activator="{ attrs, on }">
              <v-btn v-bind="attrs" color="primary" text v-on="on">
                <v-icon left>mdi-plus</v-icon>
                新規追加
              </v-btn>
            </template>
            <template #default="{ attrs, on }">
              <g-input-site-operation-schedule v-bind="attrs" v-on="on" />
            </template>
          </g-dialog-input>
          <g-site-order-manager
            v-model="computedSiteOrder"
            color="primary"
            text
          />
        </v-toolbar-items>
      </v-toolbar>
      <div class="px-2 pb-2 overflow-hidden d-flex flex-column flex-grow-1">
        <div
          class="d-flex flex-grow-1 overflow-hidden"
          style="border: 1px solid lightgray"
        >
          <v-simple-table
            id="site-operation-schedule-table"
            :ref="(el) => (scrollContainerRef = el)"
            fixed-header
            class="flex-table"
          >
            <thead>
              <tr>
                <th>現場名</th>
                <th>勤務区分</th>
                <th
                  v-for="column of columns"
                  :key="column.date"
                  :class="{ ...column.class, [`g-col-${column.date}`]: true }"
                >
                  <div>{{ column.col }}</div>
                  <div>
                    <v-icon v-if="column.isHoliday" color="red" small
                      >mdi-flag-variant</v-icon
                    >{{ column.colDay }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) of siteOrder" :key="index">
                <td>
                  <div class="site-name">
                    <g-icon-cancel small @click="deleteSite(order)" />
                    {{
                      $store.getters['sites/get'](order.siteId)?.abbr || 'N/A'
                    }}
                  </div>
                </td>
                <td>
                  <g-chip-work-shift :value="order.workShift" x-small />
                </td>
                <td
                  v-for="column of columns"
                  :key="column.date"
                  :class="column.class"
                >
                  <div class="d-flex justify-center">
                    <g-sos-required-workers-chip
                      v-bind="{ date: column.date, ...order }"
                      :schedules="schedules"
                      @click="onClickEdit"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>稼働数</th>
                <th></th>
                <th
                  v-for="column of columns"
                  :key="column.date"
                  :class="column.class"
                >
                  <div class="grey--text text--darken-2 text-subtitle-2">
                    {{ dayWorkersCount(column.date) }}
                  </div>
                  <div class="grey--text text--darken-2 text-subtitle-2">
                    {{ `(${monthTotalCount(column.date)})` }}
                  </div>
                </th>
              </tr>
            </tfoot>
          </v-simple-table>
        </div>
      </div>

      <!-- スナックバー -->
      <g-snackbar-error :value="!!hiddenOrders.length" :timeout="-1" centered>
        <span>表示されていない現場があります。</span>
        <template #action="{ attrs }">
          <v-btn v-bind="attrs" outlined small @click="showHiddenOrders">
            表示
          </v-btn>
        </template>
      </g-snackbar-error>
    </v-card>
  </g-template-default>
</template>

<style scoped>
/* --- テーブルの設定 --- */
#site-operation-schedule-table {
  position: relative !important; /* スクロール処理の offsetParent にするために必要 */
  table-layout: fixed;
}

/* --- 列固定 --- */
#site-operation-schedule-table th:nth-child(-n + 2) {
  position: sticky !important;
  z-index: 3 !important;
  background-color: #fff;
}

#site-operation-schedule-table td:nth-child(-n + 2) {
  position: sticky !important;
  z-index: 2 !important;
  background-color: #fff;
}

/* --- 1列目のセル設定 --- */
#site-operation-schedule-table th:nth-child(1),
#site-operation-schedule-table td:nth-child(1) {
  min-width: 180px !important;
  max-width: 180px !important;
  width: 180px !important;
  left: 0; /* 列固定位置 */
}

/* --- 2列目のセル設定 --- */
#site-operation-schedule-table th:nth-child(2),
#site-operation-schedule-table td:nth-child(2) {
  min-width: 96px !important;
  max-width: 96px !important;
  width: 96px !important;
  left: 180px; /* 列固定位置 */
}

/* --- 3列目以降のセル設定 --- */
#site-operation-schedule-table th:nth-child(n + 2),
#site-operation-schedule-table td:nth-child(n + 2) {
  min-width: 68px !important;
  max-width: 68px !important;
  width: 68px !important;
  text-align: center !important;
  padding: 0px 4px !important;
}

/* --- tbody の3列目以降のセル余白を調整 --- */
#site-operation-schedule-table tbody td:nth-child(n + 3) {
  padding: 0px 8px !important;
}

/* --- フッターの行固定 --- */
#site-operation-schedule-table tfoot {
  position: sticky;
  bottom: 0;
  z-index: 4;
}

/* --- フッターの列設定 --- */
#site-operation-schedule-table tfoot {
  background: #fff;
  text-align: center;
}

/* ホバー時の背景色処理 */
#site-operation-schedule-table tbody tr:hover td:nth-child(-n + 2) {
  background-color: inherit;
}

/* --- サイト名スタイル --- */
#site-operation-schedule-table .site-name {
  width: calc(180px - 32px); /* 1列目の幅から TD の padding を差し引く */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
