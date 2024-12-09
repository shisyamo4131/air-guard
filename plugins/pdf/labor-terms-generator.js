import EmployeeContract from '~/models/EmployeeContract'

export default (context, inject) => {
  inject('GENERATE_LABOR_TERMS', async (data, options = { download: true }) => {
    const employeeContract = new EmployeeContract()
    await employeeContract.fetch('EU2L6jH6Q9zguSYloCK3-2022-09-01')

    // PDFコンテンツ定義
    const content = [
      {
        table: {
          widths: ['*'], // 1列の幅を全体に広げる
          body: [
            [
              {
                text: '労働条件通知書',
                style: 'header',
                alignment: 'center',
                fillColor: '#001f4d', // 紺色背景
                color: '#ffffff', // 白文字
                margin: [0, 5, 0, 5], // 上下余白
              },
            ],
          ],
        },
        layout: 'noBorders', // 表の枠線を非表示にする
        margin: [0, 0, 0, 20], // 全体の余白設定
      },
      // { text: `〒${data.postalCode}\n${data.address}`, margin: [0, 10, 0, 10] },
      // { text: `${data.name} 殿`, margin: [0, 10, 0, 10] },
      {
        text: `労働条件を次のとおりとします。`,
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              '契約期間の定め',
              `なし （${employeeContract.startDate} ～ ${employeeContract.expiredDate}）`,
            ],
            [
              '雇用形態',
              context.app.$CONTRACT_TYPE[employeeContract.contractType],
            ],
            [
              '就業の場所',
              `（雇入れ直後）\n${employeeContract.workRegulation.initialWorkLocation}\n（変更の範囲）\n${employeeContract.workRegulation.locationChangeScope}`,
            ],
            [
              '従事する業務の内容',
              `（雇入れ直後）\n${employeeContract.workRegulation.initialJob}\n（変更の範囲）\n${employeeContract.workRegulation.jobChangeScope}`,
            ],
            [
              '支給形態',
              context.app.$PAYMENT_TYPE[employeeContract.paymentType],
            ],
            ['基本給', `${employeeContract.basicWage.toLocaleString()} 円`],
            // ['役職手当', `${employeeContract.positionAllowance} 円`],
            // ['資格手当', `${employeeContract.qualificationAllowance} 円`],
            // ['家族手当', `${employeeContract.familyAllowance} 円`],
            [
              '賞与',
              `${
                employeeContract.workRegulation.bonusEligibility ? '有' : '無'
              }`,
            ],
            [
              '始業・終業の時刻',
              `${employeeContract.workRegulation.startTime} ～ ${employeeContract.workRegulation.endTime}`,
            ],
            ['休憩時間', `${employeeContract.workRegulation.breakMinutes} 分`],
            ['法定休日', employeeContract.workRegulation.legalHoliday],
            // ['法定外休日', employeeContract.nonLegalHoliday],
            [
              '健康保険',
              `${
                employeeContract.isHealthInsuranceRequired ? '加入' : '非加入'
              }`,
            ],
            [
              '厚生年金',
              `${employeeContract.isPensionRequired ? '加入' : '非加入'}`,
            ],
            [
              '雇用保険',
              `${
                employeeContract.isEmploymentInsuranceRequired
                  ? '加入'
                  : '非加入'
              }`,
            ],
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
      {
        text: `摘要: ${employeeContract.remarks}`,
        margin: [0, 10, 0, 10],
      },
      {
        text: `所在地: 東京都台東区清川1-23-1`,
        margin: [0, 10, 0, 10],
      },
      {
        text: `株式会社唯心\n代表取締役 丸山 大三`,
        margin: [0, 10, 0, 10],
      },
    ]

    // PDF生成を実行
    context.app.$generatePdf({
      content, // コンテンツを設定
      options: {
        styles: {
          header: { fontSize: 16 }, // ヘッダーのフォントスタイル
        },
        defaultStyle: {
          fontSize: 9, // 全体のフォントサイズを小さく設定
        },
      },
      download: options.download, // オプションを渡す
    })
  })
}
