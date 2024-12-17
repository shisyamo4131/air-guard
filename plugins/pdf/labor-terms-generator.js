import { generatePDF } from '../pdf-generator'
import Employee from '~/models/Employee'
import EmployeeContract from '~/models/EmployeeContract'

export default (context, inject) => {
  inject(
    'GENERATE_LABOR_TERMS',
    async (employeeContractId, options = { download: true }) => {
      // Vuex から自社情報を取得
      const companyInfo = context.store.state['company-info'].item

      // 雇用契約情報を取得
      const employeeContract = new EmployeeContract()
      await employeeContract.fetch(employeeContractId)
      const startDate = context.app.$dayjs(employeeContract.startDate)
      const expiredDate = employeeContract.expiredDate
        ? context.app.$dayjs(employeeContract.expiredDate)
        : null

      const isHealthInsuranceRequired = `健康保険: ${
        employeeContract.isHealthInsuranceRequired ? '加入' : '非加入'
      }`

      const isPensionRequired = `厚生年金: ${
        employeeContract.isPensionRequired ? '加入' : '非加入'
      }`

      const isEmploymentInsuranceRequired = `雇用保険: ${
        employeeContract.isEmploymentInsuranceRequired ? '加入' : '非加入'
      }`

      const workRegulation = employeeContract.workRegulation
      const legalHoliday =
        context.app.$DAY_OF_WEEK_JA[workRegulation.legalHoliday].long
      const scheduledWorkDays = workRegulation.scheduledWorkDays.map((day) => {
        return context.app.$DAY_OF_WEEK_JA[day].long
      })

      // 手当情報を取得
      const allowances = employeeContract.allowances.map(
        ({ docId, amount }) => {
          const allowance = context.store.getters['allowances/get'](docId)
          const span = allowance.paymentType === 'dayly' ? '/日' : '/月'
          return [allowance.name, `${amount.toLocaleString()} 円${span}`]
        }
      )

      // 従業員情報を取得
      const employeeId = employeeContract.employeeId
      const employee = new Employee()
      await employee.fetch(employeeId)

      // 角印を取得してBase64に変換
      const kaku = await fetch('/kaku.png')
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

      // 背景（角印）を用意
      const background = function (currentPage) {
        if (currentPage === 1) {
          return {
            image: kaku,
            width: 60,
            opacity: 0.8,
            absolutePosition: { x: 492, y: 84 },
          }
        } else {
          return null
        }
      }

      /*************************************************************************
       * 自社情報テーブルを生成して返します。
       *************************************************************************/
      const companyTable = ({ x = 0, y = 0 } = {}) => {
        const rows = [
          {
            text: `${companyInfo.address1}${
              companyInfo.address2 ? '\n' + companyInfo.address2 : ''
            }`,
            margin: [0, 0, 24, 0],
          },
          {
            text: `${companyInfo.name1}\n${companyInfo.executiveTitle} ${companyInfo.executiveName}`,
            margin: [0, 0, 24, 0],
          },
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
      }

      // PDFコンテンツ定義
      const content = [
        // タイトル部
        {
          table: {
            widths: ['*'], // 1列の幅を全体に広げる
            body: [
              [
                {
                  text: '労働条件通知書',
                  style: 'header',
                  alignment: 'right',
                  fillColor: '#001f4d', // 紺色背景
                  color: '#ffffff', // 白文字
                  margin: [0, 0, 12, 0], // 上下余白
                },
              ],
            ],
          },
          layout: 'noBorders', // 表の枠線を非表示にする
          margin: [0, 0, 0, 10], // 全体の余白設定
        },

        // 宛先
        {
          text: `〒${employee.zipcode}\n${employee.address1}\n${employee.address2}`,
          margin: [36, 0, 0, 10],
        },
        { text: `${employee.fullName} 殿`, margin: [36, 10, 0, 10] },

        {
          text: `労働条件を次のとおりとします。`,
          margin: [10, 20, 0, 10],
        },
        companyTable({ x: 0, y: 84 }),
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                '契約期間の定め',
                `なし （${startDate.format('YYYY年MM月DD日')} ～ ${
                  expiredDate ? expiredDate.format('YYYY年MM月DD日') : ''
                }）`,
              ],
              [
                '雇用形態',
                context.app.$CONTRACT_TYPE[employeeContract.contractType],
              ],
              [
                '就業の場所',
                `（雇入れ直後）\n${workRegulation.initialWorkLocation}\n（変更の範囲）\n${workRegulation.locationChangeScope}`,
              ],
              [
                '従事する業務の内容',
                `（雇入れ直後）\n${workRegulation.initialJob}\n（変更の範囲）\n${workRegulation.jobChangeScope}`,
              ],
              [
                '支給形態',
                context.app.$PAYMENT_TYPE[employeeContract.paymentType],
              ],
              ['基本給', `${employeeContract.basicWage.toLocaleString()} 円`],
              ...allowances,
              ['賞与', `${workRegulation.bonusEligibility ? '有' : '無'}`],
              [
                '始業・終業の時刻',
                `${workRegulation.startTime} ～ ${workRegulation.endTime}`,
              ],
              ['休憩時間', `${workRegulation.breakMinutes} 分`],
              ['所定労働日', scheduledWorkDays.join(', ')],
              ['法定休日', legalHoliday],
              [
                '社会保険',
                `${isHealthInsuranceRequired} | ${isPensionRequired} | ${isEmploymentInsuranceRequired}`,
              ],
              [
                '交通費',
                `${
                  employeeContract.providesTransportationAllowance
                    ? '実費精算'
                    : '基本給に含む'
                }`,
              ],
              ['摘要', employeeContract.remarks],
            ],
          },
          margin: [0, 10, 0, 10],
          layout: {
            hLineWidth: () => 0.5, // 横線の太さ
            vLineWidth: () => 0.5, // 縦線の太さ
            hLineColor: () => '#aaaaaa', // 横線の色
            vLineColor: () => '#aaaaaa', // 縦線の色
          },
        },
      ]

      // PDF生成を実行
      await generatePDF({
        content, // コンテンツを設定
        background,
        defaultStyle: {
          fontSize: 9, // 全体のフォントサイズを小さく設定
        },
        styles: {
          header: { fontSize: 16 }, // ヘッダーのフォントスタイル
        },
      })
    }
  )
}
