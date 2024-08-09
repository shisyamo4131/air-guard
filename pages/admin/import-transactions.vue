<script>
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
import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
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
             * dataに含まれるsiteCodeから、現場情報を一括取得し、
             * `data.fetchedItems.sites`にセットします。
             */
            const fetchSites = async (data) => {
              this.fetchedItems.sites.splice(0)
              const uniqueCodes = [
                ...new Set(data.map(({ siteCode }) => siteCode)),
              ]
              const chunkedCodes = uniqueCodes.flatMap((_, i) =>
                i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedCodes.map(async (codes) => {
                  const colRef = collection(this.$firestore, 'Sites')
                  const q = query(colRef, where('code', 'in', codes))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.sites = snapshots.flat()
            }

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

            const getExistContracts = async (data) => {
              this.fetchedItems.siteContracts.splice(0)
              const uniqueIds = [...new Set(data.map(({ siteId }) => siteId))]
              const chunkedIds = uniqueIds.flatMap((_, i) =>
                i % 30 ? [] : [uniqueIds.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedIds.map(async (siteIds) => {
                  const colRef = collectionGroup(
                    this.$firestore,
                    'SiteContracts'
                  )
                  const q = query(colRef, where('siteId', 'in', siteIds))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.siteContracts = snapshots.flat()
            }
            const dayDivs = ['weekdays', 'saturday', 'sunday', 'holiday']
            const types = ['standard', 'qualified']
            const nums = ['price', 'overtime']
            this.progress.max = data.length
            this.progress.current = 0
            try {
              // 1. dataに含まれる現場ドキュメントを取得しておく
              await fetchSites(data)
              // 2. dataにsiteIdを付与
              data.forEach((item) => {
                item.site = getSite(item.siteCode)
                item.siteId = item.site?.docId || undefined
              })
              // 3. siteIdが取得できなかったdataが存在すればエラー
              const unknown = data.filter((item) => !item.siteId)
              if (unknown.length) {
                // eslint-disable-next-line
                console.log(unknown)
                throw new Error(
                  `未登録現場の取極めが含まれています。処理を中断します。`
                )
              }
              // 4. 既登録の取極め情報を取得
              await getExistContracts(data)
              for (const item of data) {
                item.endAtNextday = item.endAtNextday === 1
                item.breakMinutes = parseInt(item.breakMinutes)
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
                const model = this.$SiteContract(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
                model.docId ? await model.update() : await model.create()
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
             * dataに含まれるsiteCodeから、現場情報を一括取得し、
             * `data.fetchedItems.employees`にセットします。
             */
            const fetchEmployees = async (data) => {
              this.fetchedItems.employees.splice(0)
              const uniqueCodes = [
                ...new Set(data.map(({ employeeCode }) => employeeCode)),
              ]
              const chunkedCodes = uniqueCodes.flatMap((_, i) =>
                i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedCodes.map(async (codes) => {
                  const colRef = collection(this.$firestore, 'Employees')
                  const q = query(colRef, where('code', 'in', codes))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.employees = snapshots.flat()
            }
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

            const getExistContracts = async (data) => {
              this.fetchedItems.employeeContracts.splice(0)
              const uniqueIds = [
                ...new Set(data.map(({ employeeId }) => employeeId)),
              ]
              const chunkedIds = uniqueIds.flatMap((_, i) =>
                i % 30 ? [] : [uniqueIds.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedIds.map(async (employeeIds) => {
                  const colRef = collectionGroup(
                    this.$firestore,
                    'EmployeeContracts'
                  )
                  const q = query(
                    colRef,
                    where('employeeId', 'in', employeeIds)
                  )
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.employeeContracts = snapshots.flat()
            }
            this.progress.max = data.length
            this.progress.current = 0
            try {
              // 1. dataに含まれる従業員ドキュメントを取得
              await fetchEmployees(data)
              // 2. dataにemployeeId、employeeを付与
              data.forEach((item) => {
                item.employee = getEmployee(item.employeeCode)
                item.employeeId = item.employee?.docId || undefined
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
              await getExistContracts(data)
              for (const item of data) {
                item.hasPeriod = item.hasPeriod === '1'
                item.basicWage = parseInt(item.basicWage)
                const existDoc = this.fetchedItems.employeeContracts.find(
                  ({ employeeId, startDate }) =>
                    employeeId === item.employeeId &&
                    startDate === item.startDate
                )
                const model = this.$EmployeeContract(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
                model.docId ? await model.update() : await model.create()
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
          handler: async (data) => {
            /**
             * dataに含まれるsiteCodeから、現場情報を一括取得し、
             * `data.fetchedItems.sites`にセットします。
             */
            const fetchSites = async (data) => {
              this.fetchedItems.sites.splice(0)
              const uniqueCodes = [
                ...new Set(data.map(({ siteCode }) => siteCode)),
              ]
              const chunkedCodes = uniqueCodes.flatMap((_, i) =>
                i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedCodes.map(async (codes) => {
                  const colRef = collection(this.$firestore, 'Sites')
                  const q = query(colRef, where('code', 'in', codes))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.sites = snapshots.flat()
            }
            /**
             * dataに含まれるemployeeIdから、従業員情報を一括取得し、
             * `data.fetchedItems.employees`にセットします。
             */
            const fetchEmployees = async (data) => {
              this.fetchedItems.employees.splice(0)
              const uniqueCodes = [
                ...new Set(data.map(({ employeeId }) => employeeId)),
              ]
              const chunkedCodes = uniqueCodes.flatMap((_, i) =>
                i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedCodes.map(async (codes) => {
                  const colRef = collection(this.$firestore, 'Employees')
                  const q = query(colRef, where('code', 'in', codes))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.employees = snapshots.flat()
            }
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
            /**
             * `data.fetchedItems.sites`から、引数で指定されたcodeに一致する
             * 現場ドキュメントを検索し該当するものを返します。
             * 該当するものがない場合、undefinedを返します。
             */
            const getEmployee = (code) => {
              const fetched = this.fetchedItems.employees.find(
                (item) => item.code === code
              )
              return fetched || undefined
            }
            /**
             * `data.fetchedItems.operationResults`から、引数で指定されたcodeに一致する
             * 稼働実績ドキュメントを検索し、該当するものを返します。
             * 該当するものがない場合、undefinedを返します。
             */
            const getExistOperationResults = async (data) => {
              this.fetchedItems.operationResults.splice(0)
              const uniqueCodes = [...new Set(data.map(({ code }) => code))]
              const chunkedCodes = uniqueCodes.flatMap((_, i) =>
                i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
              )
              const snapshots = await Promise.all(
                chunkedCodes.map(async (codes) => {
                  const colRef = collectionGroup(
                    this.$firestore,
                    'OperationResults'
                  )
                  const q = query(colRef, where('code', 'in', codes))
                  const snapshot = await getDocs(q)
                  return snapshot.docs.map((doc) => doc.data())
                })
              )
              this.fetchedItems.operationResults = snapshots.flat()
            }
            this.progress.max = data.length
            this.progress.current = 0
            try {
              // 1. `data.files`に`operation-result-details`が含まれていればこれを読み込んでおく
              const workersFile = this.files.find(
                ({ name }) => name === 'operation-result-details.txt'
              )
              const workersData = workersFile
                ? await this.readCsv(workersFile)
                : []
              // 2. `workersData`に含まれる従業員データを取得しておく
              await fetchEmployees(workersData)
              // 3. `workersData`の`employeeId`を実際のドキュメントidに置換
              workersData.forEach((item) => {
                const employee = getEmployee(item.employeeId)
                item.employeeId = employee?.docId || undefined
              })
              // 4. `employeeId`が取得できなかったレコードがあればエラー
              const unknownEmployee = workersData.filter(
                (item) => !item.employeeId
              )
              if (unknownEmployee.length) {
                // eslint-disable-next-line
                console.log(unknownEmployee)
                throw new Error(
                  `未登録の従業員が含まれています。処理を中断します。`
                )
              }
              // 5. 型置換など
              workersData.forEach((item) => {
                item.endAtNextday = item.endAtNextday === '1'
                item.breakMinutes = parseInt(item.breakMinutes)
                item.workMinutes = parseInt(item.workMinutes)
                item.overtimeMinutes = parseInt(item.overtimeMinutes)
                item.nighttimeMinutes = parseInt(item.nighttimeMinutes)
                item.qualification = item.qualification === '1'
                item.ojt = item.ojt === '1'
              })
              // 6. dataに含まれる現場ドキュメントを取得しておく
              await fetchSites(data)
              // 7. dataにsite、siteIdを付与し、workersをセット
              data.forEach((item) => {
                item.site = getSite(item.siteCode)
                item.siteId = item.site?.docId || undefined
                item.workers = workersData
                  .filter(({ code }) => code === item.code)
                  .map((item) => {
                    return { ...this.$OperationResultWorker(item) }
                  })
              })
              // 8. siteIdが取得できなかったdataが存在すればエラー
              const unknown = data.filter((item) => !item.siteId)
              if (unknown.length) {
                // eslint-disable-next-line
                console.log(unknown)
                throw new Error(
                  `未登録現場の稼働実績が含まれています。処理を中断します。`
                )
              }
              // 9. 既登録の稼働実績を取得
              await getExistOperationResults(data)
              for (const item of data) {
                const existDoc = this.fetchedItems.operationResults.find(
                  ({ code }) => code === item.code
                )
                const model = this.$OperationResult(
                  existDoc ? { ...existDoc, ...item } : { ...item }
                )
                model.docId ? await model.update() : await model.create()
                this.progress.current++
              }
              await this.$Autonumber().refresh(
                'OperationResults',
                undefined,
                true
              )
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
      ],
      fetchedItems: {
        employees: [],
        employeeContracts: [],
        operationResults: [],
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
          if (file.name !== `operation-result-details.txt`) {
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
