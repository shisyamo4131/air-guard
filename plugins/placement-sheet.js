import { database, firestore } from 'air-firebase'
import { get, ref } from 'firebase/database'
import { collection, getDocs, query, where } from 'firebase/firestore'
import ja from 'dayjs/locale/ja'
import dayjs from 'dayjs'

/*****************************************************************************
 * PDFファイルの用紙定義
 *****************************************************************************/
const OPTIONS = {
  header: {
    text: '配置表',
    fontSize: 16,
    alignment: 'center',
    margin: [0, 8, 0, 0],
  },
  pageMargins: [16, 40, 16, 16],
  pageOrientation: 'landscape',
}

/*****************************************************************************
 * テーブルのレイアウト設定
 *****************************************************************************/
const FONT_SIZE = 6
const COLUMNS = 10 // 配置表の1列に出力する隊員数
const WORKER_WIDTH = 13 // 隊員名の列幅

// 各列の幅
const widths = ['*', 42, 12, 12].concat(
  Array.from({ length: COLUMNS * 3 }).map(() => WORKER_WIDTH)
)

// その他のレイアウト設定
const layout = {
  hLineWidth: (i, node) => {
    if (i === 0 || i % 6 === 0) return 1
    return 0.1
  },
  vLineWidth: (i, node) => {
    if (i === 0 || i === node.table.widths.length) return 1
    return 0.1
  },
  paddingTop: (i, node) => 1.7,
  paddingBottom: (i, node) => 1.7,
}

/*****************************************************************************
 * 引数 text を maxLength の長さで切り取り、省略記号を付与して返します。
 * 引数 text の長さが maxLength に満たない場合はそのまま返します。
 * @param {string} text
 * @param {number} maxLength
 * @returns
 ******************************************************************************/
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '…' // 「…」を追加してトランケートを示す
  }
  return text
}

/*****************************************************************************
 * Realtime Database から Placements/siteOrder のデータを取得して返します。
 * @returns {Promise<Array<SiteOrder>>} - 取得したデータ
 * @typedef {Object} SiteOrder
 * @property {string} id - 現場IDと勤務区分を組み合わせたキー
 * @property {string} siteId - 現場ID
 * @property {string} workShift - 勤務区分（`day` または `night`）
 ******************************************************************************/
const getSiteOrder = async () => {
  try {
    const dbRef = ref(database, `Placements/siteOrder`)
    const snapshot = await get(dbRef)
    return snapshot.val()
  } catch (err) {
    console.error(`siteOrderの取得に失敗しました。`, err) // eslint-disable-line
    throw err
  }
}

/*****************************************************************************
 * Realtime Database から Placements/${date} のデータを取得して返します。
 * @param {string} date - 取得対象の日（YYYY-MM-DD形式）
 * @returns {Promise<Object>} - 取得したデータ
 ******************************************************************************/
const getPlacements = async (date) => {
  try {
    const dbRef = ref(database, `Placements/${date}`)
    const snapshot = await get(dbRef)
    return snapshot.val()
  } catch (err) {
    console.error(`placementsの取得に失敗しました。`, err) // eslint-disable-line
    throw err
  }
}

/*****************************************************************************
 * Firestore から SiteOperationSchedules ドキュメントを取得して返します。
 * @param {string} date - 取得対象の日（YYYY-MM-DD形式）
 * @returns
 ******************************************************************************/
const getSiteOperationSchedules = async (date) => {
  try {
    const colRef = collection(firestore, `SiteOperationSchedules`)
    const queryRef = query(colRef, where('date', '==', date))
    const querySnapshot = await getDocs(queryRef)
    return querySnapshot.docs.map((doc) => doc.data())
  } catch (err) {
    console.error(`siteOperationSchedulesの取得に失敗しました。`, err) // eslint-disable-line
    throw err
  }
}

/*****************************************************************************
 * 日付を和暦に変換して返します。
 * @param {string} dateString - 取得対象の日（YYYY-MM-DD形式）
 * @returns
 ******************************************************************************/
const dateTimeFormat = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = dayjs(dateString).locale(ja).format('dddd')
  const localeDateString = date.toLocaleDateString('ja-JP-u-ca-japanese', {
    dateStyle: 'long',
  })
  return `${localeDateString} ${dayOfWeek}`
}

/*****************************************************************************
 * INJECT
 *****************************************************************************/
export default (context, inject) => {
  inject('GENERATE_PLACEMENT_SHEET', async (date) => {
    /**
     * 現場-勤務区分単位の1行目を返します。
     * @returns {Array<Object>}
     */
    const getFirstRow = () => {
      return [
        { text: '取引先', alignment: 'center' },
        { text: '住所', rowSpan: 2, alignment: 'center' },
        { text: '日勤', alignment: 'center' },
        { text: '人数', rowSpan: 2, alignment: 'center' },
        // 1 ~ 10
        ...Array.from({ length: COLUMNS }).flatMap((_, i) => [
          { text: `${i + 1}`, colSpan: 3, alignment: 'center' },
          {},
          {},
        ]),
      ]
    }

    /**
     * 現場-勤務区分単位の2行目を返します。
     * @returns {Array<Object>}
     */
    const getSecondRow = () => {
      return [
        { text: '現場', alignment: 'center' },
        {},
        { text: '夜勤', alignment: 'center' },
        {},
        // `隊員名`
        ...Array.from({ length: COLUMNS }).flatMap(() => [
          { text: `隊員名`, colSpan: 3, alignment: 'center' },
          {},
          {},
        ]),
      ]
    }

    /**
     * 現場-勤務区分単位の3行目を返します。
     * @param {Object} args
     * @param {string} args.siteId - 現場ID
     * @param {string} args.workShift - 勤務区分
     * @param {Array<string>} args.employeeIds - 出力対象の従業員IDの配列
     * @param {Array<number>} args.requiredWorkers - 必要人数
     * @returns
     */
    const getThirdRow = ({
      siteId,
      workShift,
      employeeIds,
      requiredWorkers,
    }) => {
      const site = context.store.getters['sites/get'](siteId)
      const customerId = site ? site.customerId : null
      const customer = customerId
        ? context.store.getters['customers/get'](customerId)
        : null
      const customerName = customer ? customer.abbr : 'N/A'
      const siteAddress = site ? site.address : 'N/A'
      const filledEmployees = employeeIds
        .concat(new Array(Math.max(0, COLUMNS - employeeIds.length)).fill(''))
        .map((employeeId) => {
          if (!employeeId) return employeeId
          return (
            context.store.getters[`employees/get`](employeeId)?.abbr || 'N/A'
          )
        })
      return [
        { text: truncateText(customerName, 12) },
        { text: siteAddress, rowSpan: 2 },
        { text: workShift === 'day' ? '○' : '', alignment: 'center' },
        { text: requiredWorkers, rowSpan: 4, alignment: 'center' },
        ...filledEmployees.flatMap((employee) => [
          { text: employee, colSpan: 3, alignment: 'center' },
          {},
          {},
        ]),
      ]
    }

    /**
     * 現場-勤務区分単位の4行目を返します。
     * @returns {Array<Object>}
     */
    const get4thRow = (siteId, workShift) => {
      const siteName = context.store.getters['sites/get'](siteId)?.abbr || 'N/A'
      return [
        truncateText(siteName, 12),
        {},
        { text: workShift === 'night' ? '●' : '', alignment: 'center' },
        {},
        ...Array.from({ length: COLUMNS }).flatMap(() => [
          `早出`,
          `昼残`,
          `残業`,
        ]),
      ]
    }

    /**
     * 現場-勤務区分単位の5行目を返します。
     * @returns {Array<Object>}
     */
    const get5thRow = () => {
      return [
        {
          text: `基本定時時間`,
          rowSpan: 2,
          alignment: 'center',
          border: [true, true, false, true],
        },
        {
          text: '後で修正',
          colSpan: 2,
          rowSpan: 2,
          border: [false, true, true, true],
        },
        {},
        {},
        ...Array.from({ length: COLUMNS }).flatMap(() => [``, ``, ``]),
      ]
    }

    /**
     * 現場-勤務区分単位の6行目を返します。
     * @returns {Array<Object>}
     */
    const get6thRow = () => {
      return [
        {},
        {},
        {},
        {},
        ...Array.from({ length: COLUMNS }).flatMap(() => [
          { text: '～', colSpan: 3, alignment: 'center' },
          ``,
          ``,
        ]),
      ]
    }

    /**
     * 現場-勤務区分単位の行（body）を出力します。
     * @param {Object} args
     * @param {string} args.siteId - 現場ID
     * @param {string} args.workShift - 勤務区分
     * @param {Array<string>} args.employeeIds - 従業員IDの配列
     * @param {number} args.requiredWorkers - 必要人数
     * @returns {Array} 現場-勤務区分単位の行を返します。
     */
    const getSiteWorkShiftRows = ({
      siteId,
      workShift,
      employeeIds,
      requiredWorkers,
    }) => {
      const row1 = getFirstRow()
      const row2 = getSecondRow()
      const row3 = getThirdRow({
        siteId,
        workShift,
        employeeIds,
        requiredWorkers,
      })
      const row4 = get4thRow(siteId, workShift)
      const row5 = get5thRow()
      const row6 = get6thRow()
      return [row1, row2, row3, row4, row5, row6]
    }

    const getPlacementTableRows = async (date) => {
      // siteOrder, placements, siteOperationSchedules を取得
      const [siteOrder, placements, siteOperationSchedules] = await Promise.all(
        [getSiteOrder(), getPlacements(date), getSiteOperationSchedules(date)]
      )

      const siteWorkShifts = siteOrder.map(({ siteId, workShift }) => {
        return { siteId, workShift }
      })

      const body = siteWorkShifts.map(({ siteId, workShift }) => {
        const placement = placements?.[siteId]?.[workShift] || {}
        const siteOperationSchedule = siteOperationSchedules.find(
          (schedule) =>
            schedule.siteId === siteId && schedule.workShift === workShift
        )

        const employeeIds = placement?.employeeOrder || []
        const chunkedEmployeeIds = employeeIds.flatMap((_, i, a) =>
          i % COLUMNS ? [] : [a.slice(i, i + COLUMNS)]
        )

        return chunkedEmployeeIds
          .map((employeeIds) => {
            return getSiteWorkShiftRows({
              siteId,
              workShift,
              employeeIds,
              requiredWorkers: siteOperationSchedule?.requiredWorkers || 0,
            })
          })
          .flat()
      })
      return body
    }

    OPTIONS.header.text = `${dateTimeFormat(date)}`
    const body = (await getPlacementTableRows(date)).flat()

    const chunked = body.flatMap((_, i, a) =>
      i % 42 ? [] : [a.slice(i, i + 42)]
    )

    const content = chunked.reduce((acc, body, index, arr) => {
      acc.push({
        borderLines: [[0, 0, 0]],
        table: { widths, body },
        fontSize: FONT_SIZE,
        layout,
      })
      if (index < arr.length - 1) {
        acc.push({ text: '', pageBreak: 'after' })
      }
      return acc
    }, [])

    await context.$generatePdf({ content, options: OPTIONS })
  })
}
