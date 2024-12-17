<script>
import ja from 'dayjs/locale/ja'
import SiteBilling from '~/models/SiteBilling'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import Customer from '~/models/Customer'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
import GTextFieldMonth from '~/components/molecules/inputs/GTextFieldMonth.vue'
import { generatePDF } from '~/plugins/pdf-generator'

export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MonthlyBillings',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GDataTable, GTemplateFixed, GTextFieldMonth },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * 現場請求ドキュメントを保存する配列
       */
      items: [],
      listener: new SiteBilling(),
      loading: false,
      month: this.$dayjs().format('YYYY-MM'),
      // 以下、pdfMake での出力に関わる定数定義
      operationDetailsTableHeader: [
        { text: '日付', alignment: 'center' },
        { text: '勤務', alignment: 'center' },
        { text: '区分', alignment: 'center' },
        { text: '結果', alignment: 'center' },
        { text: '数量', alignment: 'center' },
        { text: '単価', alignment: 'center' },
        { text: '残業時間', alignment: 'center' },
        { text: '単価', alignment: 'center' },
        { text: '金額', alignment: 'center' },
      ],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 現場請求ドキュメントを取引先別に集計し、取引先IDをキーとしたオブジェクトを返します。
     * { amount, billingTotal, code, consumptioinTax, consumptionTaxs, customer, customerId, details }
     */
    billingsByCustomer() {
      return Object.values(
        this.items.reduce((acc, item) => {
          if (acc[item.customerId]) {
            // 既存の customerId に対して、amount と consumptionTax を合計
            acc[item.customerId].amount += item.amount.operationResults
            acc[item.customerId].consumptionTax += item.consumptionTax
            acc[item.customerId].billingTotal +=
              item.amount.operationResults + item.consumptionTax

            // consumptionTaxs を rate ごとに合計
            item.consumptionTaxs.forEach((tax) => {
              const existingTax = acc[item.customerId].consumptionTaxs.find(
                (t) => t.rate === tax.rate
              )
              if (existingTax) {
                // 既存の rate に対して amount を合計
                existingTax.amount += tax.amount
              } else {
                // 新しい rate の場合は追加
                acc[item.customerId].consumptionTaxs.push({
                  rate: tax.rate,
                  amount: tax.amount,
                })
              }
            })

            // details に item を追加
            acc[item.customerId].details.push(item)
          } else {
            // 初めての customerId の場合、初期化
            const customer = this.$store.getters['customers/get'](
              item.customerId
            )
            acc[item.customerId] = {
              customerId: item.customerId,
              amount: item.amount.operationResults,
              code: customer.code,
              customer,
              details: [item],
              consumptionTax: item.consumptionTax,
              consumptionTaxs: [...item.consumptionTaxs], // 初期化
              billingTotal: item.amount.operationResults + item.consumptionTax,
            }
          }
          return acc
        }, {})
      )
    },

    /**
     * 月次請求計算が処理中であれば true, そうでなければ false を返します。
     */
    isCalculating() {
      return this.$store.state.systems.calcSiteBillings?.status !== 'ready'
    },

    /**
     * 月次請求計算の最終処理時刻を返します。
     */
    lastExecutedAt() {
      const timestamp =
        this.$store.state.systems?.calcSiteBillings?.lastExecutedAt
      return timestamp
        ? this.$dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
        : null
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.month を監視します。
     * - 変更されたら subscribe を実行し、指定された年月の現場請求ドキュメントへの購読を開始します。
     */
    month: {
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
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * data.month 限定で現場請求ドキュメントへの購読を開始します。
     */
    subscribe() {
      const condition = [['where', 'month', '==', this.month]]
      this.items = this.listener.subscribeDocs(condition)
    },

    /**
     * 現場請求ドキュメントへの購読を解除します。
     */
    unsubscribe() {
      this.listener.unsubscribe()
    },

    /**
     * 月別現場請求額更新処理を実行します。
     */
    async recalc() {
      this.loading = true

      try {
        // 処理前に現場稼働ドキュメントへの購読を解除
        this.unsubscribe()

        // 現場請求ドキュメントの更新処理を実行
        const result = await SiteBilling.recalc(this.month)

        // 処理結果をログに出力
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        this.subscribe()
        this.loading = false
      }
    },

    /*************************************************************************
     * 請求書 PDF 出力処理
     *************************************************************************/
    async generatePdf(item) {
      const content = [
        // タイトル
        {
          text: 'ご請求書',
          bold: true,
          fontSize: 16,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // 宛先
        ...(await this.customerLines(item)),

        // 自社情報
        this.companyTable({ x: 0, y: 84 }),

        // 総請求額
        {
          text: `以下のとおりご請求申し上げます。`,
          fontSize: 9,
          margin: [0, 0, 0, 20],
        },

        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: '税抜請求額', alignment: 'center' },
                { text: '消費税額（10%）', alignment: 'center' },
                { text: '税込請求額', alignment: 'center' },
              ],
              [
                {
                  text: `￥ ${item.amount.toLocaleString()} -`,
                  alignment: 'right',
                },
                {
                  text: `￥ ${item.consumptionTax.toLocaleString()} -`,
                  alignment: 'right',
                },
                {
                  text: `￥ ${item.billingTotal.toLocaleString()} -`,
                  alignment: 'right',
                },
              ],
            ],
          },
          margin: [0, 0, 0, 20],
        },

        // 現場別請求明細
        this.siteBillingsTable(item),

        // 稼働明細タイトル
        {
          text: '稼働明細',
          bold: true,
          fontSize: 16,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // 稼働明細の明細部
        this.operationDetailsTable(item),
      ]

      // logo.pngをBase64に変換
      const logoBase64 = await fetch('/logo.png') // staticディレクトリ内のlogo.pngを取得
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
        )
      const background = function (currentPage) {
        if (currentPage === 1) {
          return {
            image: logoBase64,
            width: 150,
            opacity: 0.3,
            absolutePosition: { x: 400, y: 72 },
          } // 背景にロゴを配置
        } else {
          return null
        }
      }

      // PDF を生成
      await generatePDF({ content, background })
    },
    /*************************************************************************
     * 背景画像を生成して返します。
     *************************************************************************/
    async backbround() {
      // logo.pngをBase64に変換
      const logoBase64 = await fetch('/logo.png') // staticディレクトリ内のlogo.pngを取得
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
        )
      const background = function (currentPage) {
        if (currentPage === 1) {
          return {
            image: logoBase64,
            width: 150,
            opacity: 0.3,
            absolutePosition: { x: 400, y: 72 },
          } // 背景にロゴを配置
        } else {
          return null
        }
      }
      return background
    },
    /*************************************************************************
     * 宛先情報を生成して返します。
     *************************************************************************/
    async customerLines(item) {
      const customer = new Customer()
      await customer.fetch(item.customer.docId)
      return [
        { text: `〒${customer.zipcode}`, fontSize: 10 },
        { text: customer.address1, fontSize: 10 },
        { text: customer.address2, margin: [0, 0, 0, 10], fontSize: 10 },
        { text: `${customer.name1} 御中` },
        { text: customer.name2 || ' ', margin: [0, 0, 0, 20] },
      ]
    },
    /*************************************************************************
     * 自社情報テーブルを生成して返します。
     *************************************************************************/
    companyTable({ x = 0, y = 0 } = {}) {
      const rows = [
        { text: '〒1110022 東京都台東区清川1-23-1', fontSize: 10 },
        { text: '株式会社 唯心', fontSize: 12 },
        { text: '警備事業部', fontSize: 10 },
        { text: 'T0000000000000', fontSize: 10 },
        {
          text: '城北信用金庫 浅草支店 普通 9999999',
          fontSize: 10,
          noWrap: true,
        },
        { text: 'お振込み手数料はご負担ください。', fontSize: 8, noWrap: true },
      ]

      const result = {
        table: {
          widths: ['100%'],
          body: rows.map((row) => [{ ...row, alignment: 'right' }]), // 各行の生成を簡略化
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
        ...(x || y ? { absolutePosition: { x, y } } : {}),
      }

      return result
    },
    /*************************************************************************
     * 現場別請求明細部を生成して返します。
     *************************************************************************/
    siteBillingsTable(item) {
      const fontSize = 9
      const header = ['現場名', { text: 'ご請求額', alignment: 'right' }]

      // 明細部の生成
      const siteSalesBody = item.details.map((detail) => {
        const siteName = this.$store.getters['sites/get'](detail.siteId).name
        const billing = detail.amount.operationResults.toLocaleString()
        return [siteName, { text: billing, alignment: 'right' }]
      })

      // table として返す
      return {
        table: {
          headerRows: 1,
          widths: ['*', 84],
          body: [header, ...siteSalesBody],
        },
        fontSize,
        layout: {
          hLineWidth: (i, node) => 0.1, // 水平方向の線幅
          vLineWidth: (i, node) => 0.1, // 垂直方向の線幅
          paddingTop: (i, node) => 5, // 上方向のパディング
          paddingBottom: (i, node) => 5, // 下方向のパディング
        },
        pageBreak: 'after',
      }
    },
    /*************************************************************************
     * 取引先の請求データ (billingsByCustomer) を受け取り、稼働明細となる table を
     * 生成して返します。
     *************************************************************************/
    operationDetailsTable(item) {
      const header = [
        { text: '日付', alignment: 'center' },
        { text: '曜日', alignment: 'center' },
        { text: '勤務', alignment: 'center' },
        { text: '配置', alignment: 'center' },
        { text: '結果', alignment: 'center' },
        { text: '数量', alignment: 'center' },
        { text: '単価', alignment: 'center' },
        { text: '残業', alignment: 'center' },
        { text: '単価', alignment: 'center' },
        { text: '金額', alignment: 'center' },
      ]
      const fontSize = 9
      return {
        table: {
          headerRows: 1,
          widths: [60, '*', '*', 60, '*', '*', '*', '*', '*', '*'],
          body: [header, ...item.details.map(this.operationDetailsBody).flat()],
        },
        fontSize,
        // layout: {
        //   hLineWidth: (i, node) => 0.1, // 水平方向の線幅
        //   vLineWidth: (i, node) => 0.1, // 垂直方向の線幅
        //   paddingTop: (i, node) => 5, // 上方向のパディング
        //   paddingBottom: (i, node) => 5, // 下方向のパディング
        // },
        layout: 'lightHorizontalLines', // optional
      }
    },
    /*************************************************************************
     * 現場単位の明細データを受け取り pdfMake で出力する稼働明細の明細部を生成して返します。
     *
     * - 1行目は現場名が出力されます。
     * - 出力項目は以下のとおりです。
     * | 日付 | 曜日区分 | 勤務区分 | 勤務結果 | 数量 | 単価 | 残業時間 | 単価 | 金額 |
     *************************************************************************/
    operationDetailsBody(detail) {
      const cols = 10
      const result = []
      const siteId = detail.siteId
      const site = this.$store.getters['sites/get'](siteId)

      // 現場名の出力
      result.push([
        { text: site.name, colSpan: cols, alignment: 'left' },
        ...Array(cols - 1).fill(null), // colSpan のために空のセルを出力
      ])

      // detail が保有する operationResults を date, workShift の昇順で並べ替える
      const operationResults = detail.operationResults.slice().sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        if (a.workShift !== b.workShift)
          return a.workShift < b.workShift ? -1 : 1
        return 0
      })

      // 明細部の出力
      operationResults.forEach((operationResult) => {
        const date = `${this.$dayjs(operationResult.date)
          .locale(ja)
          .format('MM-DD (ddd)')}`
        const dayDiv = this.$DAY_DIV[operationResult.dayDiv]
        const operationCount = operationResult.operationCount
        const unitPrice = operationResult.unitPrice
        const types = [
          { text: 'A', value: 'qualified' },
          { text: 'B', value: 'standard' },
        ]
        const workResults = this.$WORK_RESULT_ARRAY
        types.forEach((type) => {
          workResults.forEach((workResult) => {
            if (operationCount[type.value][workResult.value] > 0) {
              const workShift = this.$WORK_SHIFT[operationResult.workShift]
              const volume = operationCount[type.value][workResult.value]
              const price = unitPrice[type.value][workResult.value]

              // 残業時間は workResult が normal の場合にのみ出力
              const overtimeMinutes =
                workResult.value === 'normal'
                  ? operationCount[type.value].overtimeMinutes
                  : 0

              // 残業単価は workResult が normal の場合にのみ出力
              const priceOvertime =
                workResult.value === 'normal'
                  ? unitPrice[type.value].overtime
                  : 0

              // 金額は workResult が normal の場合は 売上 + 残業代、それ以外は売上のみ
              const amount =
                workResult.value === 'normal'
                  ? operationResult.sales[type.value][workResult.value] +
                    operationResult.sales[type.value].overtime
                  : operationResult.sales[type.value][workResult.value]

              // 出力部生成
              result.push([
                { text: date, alignment: 'center' },
                { text: dayDiv, alignment: 'center' },
                { text: workShift, alignment: 'center' },
                { text: `交通誘導員${type.text}`, alignment: 'center' },
                { text: workResult.text, alignment: 'center' },
                { text: volume.toLocaleString(), alignment: 'center' },
                { text: price.toLocaleString(), alignment: 'right' },
                {
                  text: (overtimeMinutes / 60).toFixed(2),
                  alignment: 'center',
                },
                { text: priceOvertime.toLocaleString(), alignment: 'right' },
                { text: amount.toLocaleString(), alignment: 'right' },
              ])
            }
          })
        })
      })

      return result
    },
  },
}
</script>

<template>
  <g-template-fixed v-slot="{ height }">
    <v-sheet class="d-flex flex-column overflow-y-hidden" :height="height">
      <v-toolbar class="flex-grow-0" color="secondary" flat dense dark>
        <v-icon left>mdi-currency-jpy</v-icon>
        <v-toolbar-title>月次請求</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            :disabled="isCalculating || loading"
            :loading="isCalculating || loading"
            text
            @click="recalc"
            ><v-icon left>mdi-update</v-icon>実績更新</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-toolbar class="flex-grow-0" flat>
        <g-text-field-month
          v-model="month"
          :options="{
            outlined: false,
            soloInverted: true,
            hideDetails: true,
            flat: true,
          }"
        />
        <v-spacer />
        <div class="flex-grow-0 px-4 text-right text-subtitle-2 grey--text">
          <div>最終更新:</div>
          <div>{{ lastExecutedAt }}</div>
        </div>
      </v-toolbar>
      <v-divider />
      <v-container class="d-flex flex-grow-1 overflow-y-hidden">
        <g-data-table
          class="flex-table"
          :headers="[
            { text: '取引先', value: 'code' },
            { text: '税抜金額', value: 'amount', align: 'right' },
            {
              text: '消費税額',
              value: 'consumptionTax',
              align: 'right',
            },
            { text: '請求額', value: 'billingTotal', align: 'right' },
            {
              text: 'PDF',
              value: 'action',
              align: 'right',
              sortable: false,
            },
          ]"
          :items="billingsByCustomer"
          :items-per-page="-1"
          sort-by="code"
        >
          <template #[`item.amount`]="{ item }">
            {{ item.amount.toLocaleString() }}
          </template>
          <template #[`item.consumptionTax`]="{ item }">
            {{ item.consumptionTax.toLocaleString() }}
          </template>
          <template #[`item.billingTotal`]="{ item }">
            {{ item.billingTotal.toLocaleString() }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-icon @click="generatePdf(item)">mdi-file-pdf-box</v-icon>
          </template>
        </g-data-table>
      </v-container>
    </v-sheet>
  </g-template-fixed>
</template>

<style></style>
