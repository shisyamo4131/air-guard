<script>
/**
 * ### pages.import-transactions
 *
 * Access版AirGuardから出力されたトランザクションデータをインポートします。
 *
 * #### 注意事項:
 * - SiteContractの取り込みについて、
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-13 - 初版作成
 */
import { collection, getDocs, query, where } from 'firebase/firestore'
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
             * 現場ドキュメントを検索しdocIdを返します。
             * 該当するものがない場合、undefinedを返します。
             */
            const getSiteId = (code) => {
              const fetched = this.fetchedItems.sites.find(
                (item) => item.code === code
              )
              return fetched ? fetched.docId : undefined
            }

            // 1. dataに含まれる現場ドキュメントを取得しておく
            await fetchSites(data)
            const dayDivs = ['weekdays', 'saturday', 'sunday', 'holiday']
            const types = ['standard', 'qualified']
            const nums = ['price', 'overtime']
            this.progress.max = data.length
            this.progress.current = 0
            try {
              for (const item of data) {
                const siteId = await getSiteId(item.siteCode)
                if (!siteId) {
                  throw new Error(
                    `未登録現場の取極めが含まれています。処理を中断します。現場code: ${item.code}`
                  )
                }
                const model = this.$SiteContract({ siteId, ...item })
                const docId = `${item.startDate}-${item.workShift}`
                await model.fetch(docId)
                model.endAtNextday = item.endAtNextday === 1
                model.breakTime = parseInt(item.breakTime)
                model.halfRate = parseInt(item.halfRate) * 100
                model.cancelRate = parseInt(item.cancelRate) * 100
                // 単価情報をセット
                dayDivs.forEach((dayDiv) => {
                  types.forEach((type) => {
                    nums.forEach((num) => {
                      model.unitPrices[dayDiv][type][num] = parseInt(
                        item[`unitPrice-${dayDiv}-${type}-${num}`]
                      )
                    })
                  })
                })
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
      ],
      fetchedItems: {
        sites: [],
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
          const csvData = await this.readCsv(file)
          const handler = this.getHandler(file)
          if (!handler) throw new Error('handlerが取得できませんでした。')
          this.progress.text = `${file.name}をインポートしています。`
          await handler(csvData, this.fetchedItems)
          this.progress.max = 0
          this.progress.current = 0
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