<script>
// import { writeBatch } from 'firebase/firestore'
// import { firestore } from 'air-firebase'
import Autonumber from '~/models/Autonumber'
import Employee from '~/models/Employee'
import EmployeeContract from '~/models/EmployeeContract'
import OperationResultForImport from '~/models/OperationResultForImport'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
import OperationResultWorker from '~/models/OperationResultWorker'
import Outsourcer from '~/models/Outsourcer'
import Site from '~/models/Site'
import SiteContract from '~/models/SiteContract'
import WorkRegulation from '~/models/WorkRegulation'
/**
 * ### pages.import-transactions
 *
 * Access版AirGuardから出力されたトランザクションデータをインポートします。
 *
 * #### 注意事項:
 * - トランザクションデータのインポートは、既存ドキュメントがあれば上書きを、なければ作成を、
 *   直接Firestoreに行います。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-08-07 - `OperationResults`のインポート機能を追加。
 * - version 1.1.0 - 2024-07-22 - データモデルの仕様変更に伴い、EmployeeContractsの取り込み時に`employee`をセットするように修正。
 *                              - データモデルの仕様変更に伴い、SiteContractsの取り込み時に`site`をセットするように修正。
 *                              - EmployeeContractsの取り込み時、`hasPeriod`プロパティのBool値の判定に誤りがあったのを修正。
 * - version 1.0.0 - 2024-07-13 - 初版作成
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    FileChip: {
      render(createElement) {
        if (this.$attrs.disabled) {
          return createElement(
            `VChip`,
            {
              attrs: { ...this.$attrs, color: 'info', label: true },
            },
            this.$slots.default
          )
        } else {
          return createElement(
            `VChip`,
            {
              attrs: { ...this.$attrs, color: 'info', label: true },
            },
            [
              createElement(
                'VIcon',
                { attrs: { small: true, left: true } },
                'mdi-check'
              ),
              this.$slots.default,
            ]
          )
        }
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      allowedFiles: [
        {
          name: 'site-contracts.txt',
          handler: async (data) => {
            /**
             * `data.fetchedItems.sites`から、引数で指定されたcodeに一致する
             * 現場ドキュメントを検索し該当するものを返します。
             * 該当するものがない場合、undefinedを返します。
             */
            const getSite = (code) => {
              const fetched = this.fetchedItems.sites.find(
                (item) => item.code === code
              )
              return fetched || undefined
            }
            const dayDivs = ['weekdays', 'saturday', 'sunday', 'holiday']
            const types = ['standard', 'qualified']
            const nums = ['price', 'overtime']
            this.progress.max = data.length
            this.progress.current = 0
            try {
              // 1. dataに含まれる現場ドキュメントを取得しておく
              this.fetchedItems.sites = await new Site().fetchByCodes(
                data.map(({ siteCode }) => siteCode)
              )
              // 2. dataにsite、siteIdを付与
              data.forEach((item) => {
                // item.site = getSite(item.siteCode)
                // item.siteId = item.site?.docId || undefined
                item.siteId = getSite(item.siteCode)?.docId || undefined
              })
              // 3. siteIdが取得できなかったdataが存在すればエラー
              const unknownSite = data.filter((item) => !item.siteId)
              if (unknownSite.length) {
                // eslint-disable-next-line
                console.log(unknownSite)
                throw new Error(
                  `未登録現場の取極めが含まれています。処理を中断します。`
                )
              }
              // 4. 既登録の取極め情報を取得
              const SiteContractInstance = new SiteContract()
              this.fetchedItems.siteContracts =
                await SiteContractInstance.fetchBySiteIds(
                  data.map(({ siteId }) => siteId)
                )
              for (const item of data) {
                item.endAtNextday = item.endAtNextday === '1'
                item.breakMinutes = parseInt(item.breakTime)
                item.halfRate = parseInt(item.halfRate) * 100
                item.cancelRate = parseInt(item.cancelRate) * 100
                // 単価情報をセット
                item.unitPrices = {}
                dayDivs.forEach((dayDiv) => {
                  item.unitPrices[dayDiv] = {}
                  types.forEach((type) => {
                    item.unitPrices[dayDiv][type] = {}
                    nums.forEach((num) => {
                      item.unitPrices[dayDiv][type][num] = parseInt(
                        item[`unitPrice-${dayDiv}-${type}-${num}`]
                      )
                    })
                  })
                })
                const existDoc = this.fetchedItems.siteContracts.find(
                  ({ siteId, startDate, workShift }) =>
                    siteId === item.siteId &&
                    startDate === item.startDate &&
                    workShift === item.workShift
                )
                SiteContractInstance.initialize(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
                SiteContractInstance.docId
                  ? await SiteContractInstance.update()
                  : await SiteContractInstance.create()
                this.progress.current++
              }
            } catch (err) {
              // eslint-disable-next-line
              console.error(err)
              alert(err.message)
            }
          },
        },
        {
          name: 'employee-contracts.txt',
          handler: async (data) => {
            /**
             * `data.fetchedItems.employees`から、引数で指定されたcodeに一致する
             * 従業員ドキュメントを検索し該当するものを返します。
             * 該当するものがない場合、undefinedを返します。
             */
            const getEmployee = (code) => {
              const fetched = this.fetchedItems.employees.find(
                (item) => item.code === code
              )
              return fetched || undefined
            }
            const getWorkRegulations = async () => {
              const instance = new WorkRegulation()
              const result = await instance.fetchDocs([
                ['where', 'year', '>=', '2024'],
              ])
              return result
            }
            const workRegulations = await getWorkRegulations()
            this.progress.max = data.length
            this.progress.current = 0
            try {
              // 1. dataに含まれる従業員ドキュメントを取得
              this.fetchedItems.employees = await new Employee().fetchByCodes(
                data.map(({ employeeCode }) => employeeCode)
              )
              // 2. dataにemployeeId、employee、workRegulation、providesTransportationAllowanceを付与
              data.forEach((item) => {
                item.employee = getEmployee(item.employeeCode)
                item.employeeId = item.employee?.docId || undefined
                const workRegulation = workRegulations.find(
                  ({ contractType, year }) =>
                    contractType === item.contractType &&
                    item.startDate.slice(0, 4) === year
                )
                if (!workRegulation) {
                  throw new Error(`就業規則が取得できませんでした。`)
                }
                item.workRegulationId = workRegulation.docId
                item.providesTransportationAllowance =
                  item.contractType !== 'part-time' &&
                  item.basicWage !== '10000'
              })
              // 3. employeeIdが取得できなかったdataが存在すればエラー
              const unknown = data.filter((item) => !item.employeeId)
              if (unknown.length) {
                // eslint-disable-next-line
                console.log(unknown)
                throw new Error(
                  `未登録従業員の雇用契約が含まれています。処理を中断します。`
                )
              }
              // 4. 既登録の雇用契約情報を取得
              const EmployeeContractInstance = new EmployeeContract()
              this.fetchedItems.employeeContracts =
                await EmployeeContractInstance.fetchByEmployeeIds(
                  data.map(({ employeeId }) => employeeId)
                )
              for (const item of data) {
                item.hasPeriod = item.hasPeriod === '1'
                item.basicWage = parseInt(item.basicWage)
                const existDoc = this.fetchedItems.employeeContracts.find(
                  ({ employeeId, startDate }) =>
                    employeeId === item.employeeId &&
                    startDate === item.startDate
                )
                EmployeeContractInstance.initialize(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
                EmployeeContractInstance.docId
                  ? await EmployeeContractInstance.update()
                  : await EmployeeContractInstance.create()
                this.progress.current++
              }
            } catch (err) {
              // eslint-disable-next-line
              console.error(err)
              alert(err.message)
            }
          },
        },
        {
          name: 'operation-results.txt',
          handler: async (csv) => {
            let data = csv
            this.progress.max = data.length
            this.progress.current = 0

            try {
              /****************************************************************
               * 1. workers, outsourcers の csv 読み込み
               ****************************************************************/
              const workersFile = this.files.find(
                ({ name }) => name === 'operation-result-details.txt'
              )
              let workersData = workersFile
                ? await this.readCsv(workersFile)
                : []
              const outsourcersFile = this.files.find(
                ({ name }) => name === `operation-result-outsourcers.txt`
              )
              let outsourcersData = outsourcersFile
                ? await this.readCsv(outsourcersFile)
                : []

              /****************************************************************
               * 2. sites, workers, outsourcers, operationResults, siteContracts ドキュメントの読み込み
               ****************************************************************/
              // siteContracts の読み込みに必要なため、先に sites を読み込んでおく
              const sites = await new Site().fetchByCodes(
                data.map(({ siteCode }) => siteCode)
              )

              // sites の docId をチャンク（30件）
              const siteIds = [...new Set(sites.map(({ docId }) => docId))]
              const chunkedSiteIds = []
              for (let i = 0; i < siteIds.length; i += 30) {
                chunkedSiteIds.push(siteIds.slice(i, i + 30))
              }

              // employees, outsourcers, operationResults, siteContracts を非同期で取得
              const [
                employees,
                outsourcers,
                operationResults,
                ...siteContractsArray
              ] = await Promise.all([
                new Employee().fetchByCodes(
                  workersData.map(({ employeeCode }) => employeeCode)
                ),
                new Outsourcer().fetchByCodes(
                  outsourcersData.map(({ outsourcerCode }) => outsourcerCode)
                ),
                new OperationResultForImport().fetchByCodes(
                  data.map(({ code }) => code)
                ),
                ...chunkedSiteIds.map((docIds) => {
                  return new SiteContract().fetchDocs([
                    ['where', 'siteId', 'in', docIds],
                  ])
                }),
              ])
              const siteContracts = siteContractsArray.flat()

              this.fetchedItems.employees = employees
              this.fetchedItems.outsourcers = outsourcers
              this.fetchedItems.sites = sites
              this.fetchedItems.operationResults = operationResults

              /****************************************************************
               * 3. workers, outsourcers, sites で存在しないものがあればエラーを返して終了
               ****************************************************************/
              const missingItems = {
                unknownEmployees: workersData.filter(
                  ({ employeeCode }) =>
                    !this.fetchedItems.employees.some(
                      ({ code }) => code === employeeCode
                    )
                ),
                unknownOutsourcers: outsourcersData.filter(
                  ({ outsourcerCode }) =>
                    !this.fetchedItems.outsourcers.some(
                      ({ code }) => code === outsourcerCode
                    )
                ),
                unknownSites: data.filter(
                  ({ siteCode }) =>
                    !this.fetchedItems.sites.some(
                      ({ code }) => code === siteCode
                    )
                ),
              }

              // エラーがある場合の処理
              if (Object.values(missingItems).some((arr) => arr.length)) {
                const message =
                  '未登録の従業員、外注先、または現場があります。インポートできません。'
                // console.error(message, missingItems)
                throw new Error(
                  `${message} 詳細: ${JSON.stringify(missingItems)}`
                )
              }

              /****************************************************************
               * workers の変換
               * - code から docId を取得してセット
               * - 型変換を行い、すべてのデータを OperationResultWorker クラスに変換
               ****************************************************************/
              workersData = workersData.map((item) => {
                const employee = this.fetchedItems.employees.find(
                  ({ code }) => code === item.employeeCode
                )
                return {
                  ...item,
                  employeeId: employee?.docId, // employee が見つからない可能性を考慮
                  endAtNextday: item.endAtNextday === '1',
                  breakMinutes: parseInt(item.breakMinutes, 10),
                  workMinutes: parseInt(item.workMinutes, 10),
                  overtimeMinutes: parseInt(item.overtimeMinutes, 10),
                  nighttimeMinutes: parseInt(item.nighttimeMinutes, 10),
                  qualification: item.qualification === '1',
                  ojt: item.ojt === '1',
                }
              })

              /****************************************************************
               * outsourcers の用意
               * - operation-result-outsourcers を読み込み、fetchedItems.outsourcers に外注先データを読み込んでおく
               * - code から docId を取得してセット
               * - docId が取得できないデータが存在したらエラーを返して終了
               * - 型変換を行い、すべてのデータを OperationResultOutsourcer クラスに変換
               *   -> id を付与するために branch として index を付与
               ****************************************************************/
              outsourcersData = outsourcersData.map((item, branch) => {
                const outsourcer = this.fetchedItems.outsourcers.find(
                  ({ code }) => code === item.outsourcerCode
                )
                return {
                  ...item,
                  outsourcerId: outsourcer?.docId || undefined,
                  endAtNextday: item.endAtNextday === '1',
                  breakMinutes: parseInt(item.breakMinutes, 10),
                  workMinutes: parseInt(item.workMinutes, 10),
                  overtimeMinutes: parseInt(item.overtimeMinutes, 10),
                  nighttimeMinutes: parseInt(item.nighttimeMinutes, 10),
                  qualification: item.qualification === '1',
                  ojt: item.ojt === '1',
                  branch, // 引数の branch を追加
                }
              })

              // 7. dataにsite、siteIdを付与し、`workers`、`outsourcers` をセット
              data.forEach((item) => {
                item.site = sites.find(({ code }) => code === item.siteCode)
                item.siteId = item.site?.docId || undefined
                item.operationCount = {
                  standard: {
                    normal: parseInt(item.standardNormal),
                    half: parseInt(item.standardHalf),
                    cancel: parseInt(item.standardCancel),
                    total: parseInt(item.standardTotal),
                    overtimeMinutes:
                      parseFloat(item.standardOvertimeMinutes) * 60,
                  },
                  qualified: {
                    normal: parseInt(item.qualifiedNormal),
                    half: parseInt(item.qualifiedHalf),
                    cancel: parseInt(item.qualifiedCancel),
                    total: parseInt(item.qualifiedTotal),
                    overtimeMinutes:
                      parseFloat(item.qualifiedOvertimeMinutes) * 60,
                  },
                  total: 0,
                  overtimeMinutes: 0,
                }
                item.operationCount.total =
                  item.operationCount.standard.total +
                  item.operationCount.qualified.total
                item.operationCount.overtimeMinutes =
                  item.operationCount.standard.overtimeMinutes +
                  item.operationCount.qualified.overtimeMinutes
                item.unitPrice = {
                  standard: {
                    normal: parseInt(item.unitPriceStandardNormal),
                    half: parseInt(item.unitPriceStandardHalf),
                    cancel: parseInt(item.unitPriceStandardCancel),
                    overtime: parseInt(item.unitPriceStandardOvertime),
                  },
                  qualified: {
                    normal: parseInt(item.unitPriceQualifiedNormal),
                    half: parseInt(item.unitPriceQualifiedHalf),
                    cancel: parseInt(item.unitPriceQualifiedCancel),
                    overtime: parseInt(item.unitPriceQualifiedOvertime),
                  },
                }
                item.workers = workersData
                  .filter(({ code }) => code === item.code)
                  .map((worker) => new OperationResultWorker(worker))
                item.outsourcers = outsourcersData
                  .filter(({ code }) => code === item.code)
                  .map(
                    (outsourcer) => new OperationResultOutsourcer(outsourcer)
                  )
                item.closingDate = item.deadline
              })

              // data の中身をすべて OperationResultForImport インスタンスにする
              data = data.map((item) => {
                const existDoc = this.fetchedItems.operationResults.find(
                  ({ code }) => code === item.code
                )
                return new OperationResultForImport(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
              })

              // data の中身のインスタンスについて、siteContract を適用
              data.forEach((item) => {
                item.siteContract = siteContracts
                  .filter(
                    ({ siteId, workShift, startDate }) =>
                      siteId === item.siteId &&
                      workShift === item.workShift &&
                      startDate <= item.date
                  )
                  .sort(
                    (a, b) => new Date(b.startDate) - new Date(a.startDate)
                  )[0]
              })
              const noContract = data.filter((item) => !item.siteContract)
              if (noContract.length) {
                const message = `契約情報が存在しません。`
                // eslint-disable-next-line no-console
                console.error(message, noContract)
                throw new Error(
                  `${message} 詳細: ${JSON.stringify(noContract)}`
                )
              }

              /**
               * Promise を使ったインポート処理
               */
              const promises = []
              // for (const item of data.filter((_, index) => index < 10)) {
              for (const item of data) {
                promises.push(item.docId ? item.update() : item.create())
                this.progress.current++
                if (promises.length % 10 === 0) {
                  await Promise.all(promises)
                  promises.splice(0)
                }
              }
              await Promise.all(promises)
              await Autonumber.refresh('OperationResults')
            } catch (err) {
              // eslint-disable-next-line
              console.error(err)
              alert(err.message)
            }
          },
        },
        {
          name: 'operation-result-details.txt',
        },
        {
          name: 'operation-result-outsourcers.txt',
        },
      ],
      fetchedItems: {
        employees: [],
        employeeContracts: [],
        operationResults: [],
        outsourcers: [],
        sites: [],
        siteContracts: [],
      },
      files: [],
      filesRule: (v) =>
        !v.length ||
        v.every(({ name }) =>
          this.allowedFiles.some((file) => file.name === name)
        ) ||
        'インポートできないファイルが含まれています。',
      loading: false,
      progress: {
        text: null,
        max: null,
        current: null,
      },
      snackbar: false,
      step: 1,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    progressRate() {
      if (!this.progress.current || !this.progress.max) return 0
      const result = (this.progress.current / this.progress.max) * 100
      return result.toFixed(2)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 引数で指定されたファイルが、`data.allowedFiles`で定義されているかどうかを
     * 返します。
     *
     * @return 定義されていればtrueを、されていなければfalseを返します。
     */
    fileIsAllowed(file) {
      return this.allowedFiles.map((item) => item.name).includes(file.name)
    },
    /**
     * `data.files`配列内のすべてのファイルオブジェクトが`data.allowedFiles`に
     * 定義されているかを返します。
     *
     * @return 定義されていない要素が1つでもあればfalseを、そうでなければtrueを返します。
     */
    allFilesAllowed() {
      return this.files.every(({ name }) =>
        this.allowedFiles.some((file) => file.name === name)
      )
    },
    /**
     * divにファイルがドロップされた時の処理です。
     * - 既定のイベント、親への伝播をキャンセルします。
     * - `data.files`を初期化し、ファイルオブジェクトのみを`data.files`に格納します。
     */
    onDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      // this.isDragging = false;
      // D&Dが複数回行われるケースに対応するため、一旦`data.files`を初期化
      this.files.splice(0)
      /**
       * D&Dによって受け取るデータはvalueをファイルオブジェクトとしたkey-valueオブジェクト。
       * keyが数値であればvalueはファイルオブジェクトなので、これを抜き出して`data.files`に追加する
       */
      const _files = e.dataTransfer.files
      for (const file in _files) {
        if (!isNaN(file)) this.files.push(_files[file])
      }
    },
    /**
     * 引数に指定されたファイルオブジェクトを読み込み、データを配列で返す。
     */
    readCsv(file) {
      return new Promise((resolve, reject) => {
        this.$papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err),
        })
      })
    },
    /**
     * 引数に指定されたファイルオブジェクトから、`data.allowedFiles`で定義されている
     * オブジェクトを検索し、該当するものがあればコレクションIDを返します。
     *
     * @return 指定されたファイルのインポート先コレクション名
     */
    getHandler(file) {
      const result = this.allowedFiles.find((item) => item.name === file.name)
      return result?.handler || undefined
    },
    async submit() {
      this.loading = true
      try {
        for (const file of this.files) {
          if (
            file.name !== `operation-result-details.txt` &&
            file.name !== `operation-result-outsourcers.txt`
          ) {
            const csvData = await this.readCsv(file)
            const handler = this.getHandler(file)
            if (!handler) throw new Error('handlerが取得できませんでした。')
            this.progress.text = `${file.name}をインポートしています。`
            await handler(csvData, this.fetchedItems)
            this.progress.max = 0
            this.progress.current = 0
          }
        }
        this.snackbar = true
        this.step = 1
        this.files.splice(0)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
        this.progress.text = null
      }
    },
  },
}
</script>

<template>
  <v-container>
    <v-card max-width="720">
      <v-card-title>Access版AirGuardトランザクションインポート</v-card-title>
      <v-card-text>
        <p>
          MS-Access版AirGuardから出力されたCSVデータを、Firestoreにインポートします。<br />
          データは直接Firestoreドキュメントを更新します。
        </p>
      </v-card-text>
      <v-container>
        <v-stepper v-model="step" vertical>
          <v-stepper-step step="1"> ファイル選択 </v-stepper-step>
          <v-stepper-content step="1">
            <div @dragover.prevent @drop="onDrop">
              <v-file-input v-model="files" multiple :rules="[filesRule]" />
            </div>
            <div class="d-flex flex-wrap pa-5" style="gap: 12px">
              <file-chip
                v-for="(file, index) of files"
                :key="index"
                :disabled="!fileIsAllowed(file)"
                >{{ file.name }}</file-chip
              >
            </div>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="!allFilesAllowed || !files.length"
                @click="step++"
                >次へ</v-btn
              >
            </v-card-actions>
          </v-stepper-content>

          <v-stepper-step step="2"> 確認 </v-stepper-step>
          <v-stepper-content step="2">
            <v-card-subtitle>
              以下のファイルをインポートします。
            </v-card-subtitle>
            <div class="d-flex flex-wrap pa-5" style="gap: 12px">
              <file-chip v-for="(file, index) of files" :key="index">
                {{ file.name }}
              </file-chip>
            </div>
            <v-progress-linear
              color="info"
              height="25"
              striped
              :value="progressRate"
            >
              <span>{{ progressRate }}%</span>
            </v-progress-linear>
            <v-subheader>{{ progress.text }}</v-subheader>
            <v-card-actions class="justify-space-between">
              <v-btn :disabled="loading" @click="step--">戻る</v-btn>
              <v-btn
                color="primary"
                :disabled="loading"
                :loading="loading"
                @click="submit"
                >実行</v-btn
              >
            </v-card-actions>
          </v-stepper-content>
        </v-stepper>
      </v-container>
    </v-card>
    <v-snackbar v-model="snackbar" centered>
      インポート処理が完了しました。
    </v-snackbar>
  </v-container>
</template>

<style></style>
