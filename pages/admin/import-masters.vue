<script>
/**
 * ### pages.import-masters
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-16 - Employeesのインポート機能を実装
 * - version 1.0.0 - 2024-07-04 - 初版作成
 */
import { ref, update } from 'firebase/database'
import { database } from 'air-firebase/dist/firebase.init'
import employeeAbbr from '~/assets/abbr.json' // 従業員の略称を強制変換するためのJSON

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
              attrs: { ...this.$attrs, color: 'secondary', label: true },
            },
            this.$slots.default
          )
        } else {
          return createElement(
            `VChip`,
            {
              attrs: { ...this.$attrs, color: 'secondary', label: true },
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
        { name: 'customers.txt', collectionId: 'Customers' },
        { name: 'sites.txt', collectionId: 'Sites' },
        { name: 'employees.txt', collectionId: 'Employees' },
        { name: 'outsourcers.txt', collectionId: 'Outsourcers' },
      ],
      files: [],
      filesRule: (v) =>
        !v.length ||
        v.every(({ name }) =>
          this.allowedFiles.some((file) => file.name === name)
        ) ||
        'インポートできないファイルが含まれています。',
      loading: false,
      processingText: null,
      snackbar: false,
      step: 1,
    }
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
    getCollectionId(file) {
      const result = this.allowedFiles.find((item) => item.name === file.name)
      return result?.collectionId || undefined
    },
    async submit() {
      this.loading = true
      try {
        for (const file of this.files) {
          const csvData = await this.readCsv(file)
          const collectionId = this.getCollectionId(file)
          if (!collectionId)
            throw new Error('コレクションIDが取得できませんでした。')
          this.processingText = `${collectionId}をインポートしています。`
          const updates = csvData.reduce((acc, i) => {
            Object.keys(i).forEach((key) => {
              /**
               * 従業員の略称を強制的に変換
               * - 2024-11-28 - 従業員マスタを刷新しようとすると略称が書き換えられてしまい不都合がある
               */
              // acc[`/AirGuard/${collectionId}/${i.code}/${key}`] = i[key]
              if (collectionId === 'Employees' && key === 'abbr') {
                const abbr = employeeAbbr[i.code]?.abbr ?? i[key]
                acc[`/AirGuard/${collectionId}/${i.code}/${key}`] = abbr
                const abbrKana =
                  employeeAbbr[i.code]?.abbrKana ?? i.lastNameKana
                acc[`/AirGuard/${collectionId}/${i.code}/abbrKana`] = abbrKana
              } else {
                acc[`/AirGuard/${collectionId}/${i.code}/${key}`] = i[key]
              }
            })
            return acc
          }, {})
          await update(ref(database), updates)
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
        this.processingText = null
      }
    },
  },
}
</script>

<template>
  <v-container>
    <v-card max-width="720">
      <v-card-title>Access版AirGuardマスタインポート</v-card-title>
      <v-card-text>
        <p>
          MS-Access版AirGuardから出力されたCSVデータを、RealtimeDatabaseにインポートします。<br />
          データは`AirGuard/{collectionId}/{code}`以下に保存され、以下の条件を満たす場合、Cloud
          Functionsによって自動的にFirestoreの各種ドキュメントと同期されます。
        </p>
        <ul>
          <li>`AirGuard/{collectionId}/{code}/docId`が存在する場合</li>
        </ul>
        <p>
          docIdが存在しない場合は同期処理が行われません。別途、データ同期設定にて処理してください。
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
              :indeterminate="loading"
              color="yellow darken-2"
            ></v-progress-linear>
            <v-subheader>{{ processingText }}</v-subheader>
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
