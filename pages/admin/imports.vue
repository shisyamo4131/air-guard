<template>
  <g-template-default label="import">
    <template #default>
      <v-container fluid>
        <v-card>
          <v-card-title>import</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col>
                  <a-select
                    v-model="selectedCollection"
                    :items="collections"
                    label="collection"
                    required
                  />
                </v-col>
                <v-col>
                  <v-file-input
                    v-model="file"
                    label="file"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'required.']"
                  />
                </v-col>
              </v-row>
            </v-form>
            <v-data-table :headers="headers" :items="csvData" />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="submit"
              >submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import ASelect from '~/components/atoms/inputs/ASelect.vue'
export default {
  components: { GTemplateDefault, ASelect },
  data() {
    return {
      selectedCollection: null,
      collections: ['Customers', 'Sites', 'Employees', 'OperationResults'],
      file: null,
      csvData: [],
      loading: false,
    }
  },
  computed: {
    headers() {
      if (!this.csvData.length) return []
      const result = Object.keys(this.csvData[0])
        .map((key) => {
          return { text: key, value: key }
        })
        .filter((item, index) => index < 5)
      return result
    },
  },
  watch: {
    async file(v) {
      if (!v) return
      this.csvData = await this.readCsv()
    },
  },
  methods: {
    readCsv() {
      return new Promise((resolve) => {
        this.$papa.parse(this.file, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            return resolve(results.data)
          },
        })
      })
    },
    async submit() {
      const autonumber = this.$Autonumber()
      try {
        this.loading = true
        await autonumber.stop(this.selectedCollection)
        await this[`import${this.selectedCollection}`]()
        // eslint-disable-next-line
        console.info(`[imports.vue] インポート処理が正常に完了しました。`)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        await autonumber.refresh(this.selectedCollection)
        await autonumber.start(this.selectedCollection)
        this.loading = false
      }
    },
    chunkedArr(arr, size) {
      return arr.flatMap((_, i, a) =>
        i % size ? [] : [arr.slice(i, i + size)]
      )
    },
    async getExistDocsFromArray(arr, collectionId, field) {
      /* eslint-disable */
      console.info(
        `[imports.vue] ${collectionId}からドキュメントを取得します。`
      )
      console.info(arr)
      const chunkedIds = this.chunkedArr(arr, 10)
      const result = []
      for (const arr of chunkedIds) {
        const colRef = collection(this.$firestore, collectionId)
        const q = query(colRef, where(field, 'in', arr))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty)
          result.push(...querySnapshot.docs.map((doc) => doc.data()))
      }
      console.info(
        `[imports.vue] ${collectionId}から${result.length}件のドキュメントを取得しました。`
      )
      /* eslint-enable */
      return result
    },
    async importCustomers() {
      const existDocs = await this.getExistDocsFromArray(
        this.csvData.map(({ code }) => code),
        'Customers',
        'code'
      )
      const promises = []
      for (const data of this.csvData) {
        const model = this.$Customer()
        data.depositMonth = Number(data.depositMonth)
        const existDoc = existDocs.find(({ code }) => code === data.code)
        if (existDoc) {
          model.initialize({ ...data, docId: existDoc.docId })
          promises.push(model.update())
        } else {
          model.initialize(data)
          promises.push(model.create())
        }
      }
      await Promise.all(promises)
    },
    async importSites() {
      const customerCodes = [
        ...new Set(this.csvData.map(({ customerCode }) => customerCode)),
      ]
      const customers = await this.getExistDocsFromArray(
        customerCodes,
        'Customers',
        'code'
      )
      if (customers.length !== customerCodes.length) {
        const customerNotExist = this.csvData.filter((data) => {
          return !customers.some(({ code }) => code === data.customerCode)
        })
        // eslint-disable-next-line
        console.table(customerNotExist)
        throw new Error(
          'CSVデータに取引先が未登録である現場が含まれています。処理を中断します。'
        )
      }
      const existDocs = await this.getExistDocsFromArray(
        this.csvData.map(({ code }) => code),
        'Sites',
        'code'
      )
      const promises = []
      for (const data of this.csvData) {
        const model = this.$Site()
        data.customer = customers.find(({ code }) => code === data.customerCode)
        const existDoc = existDocs.find(({ code }) => code === data.code)
        if (existDoc) {
          model.initialize({ ...data, docId: existDoc.docId })
          promises.push(model.update())
        } else {
          model.initialize(data)
          promises.push(model.create())
        }
      }
      await Promise.all(promises)
    },
    async importEmployees() {
      const existDocs = await this.getExistDocsFromArray(
        this.csvData.map(({ code }) => code),
        'Employees',
        'code'
      )
      const promises = []
      for (const data of this.csvData) {
        const model = this.$Employee()
        const existDoc = existDocs.find(({ code }) => code === data.code)
        if (existDoc) {
          model.initialize({ ...data, docId: existDoc.docId })
          promises.push(model.update())
        } else {
          model.initialize(data)
          promises.push(model.create())
        }
      }
      await Promise.all(promises)
    },
    async importOperationResults() {
      const siteCodes = [
        ...new Set(this.csvData.map(({ siteCode }) => siteCode)),
      ]
      const sites = await this.getExistDocsFromArray(siteCodes, 'Sites', 'code')
      if (sites.length !== siteCodes.length) {
        const siteNotExist = this.csvData.filter((data) => {
          return !sites.some(({ code }) => code === data.siteCode)
        })
        // eslint-disable-next-line
        console.table(siteNotExist)
        throw new Error(
          'CSVデータに現場が未登録である稼働実績が含まれています。処理を中断します。'
        )
      }
      const existDocs = await this.getExistDocsFromArray(
        this.csvData.map(({ code }) => code),
        'OperationResults',
        'code'
      )
      const promises = []
      for (const data of this.csvData) {
        const model = this.$OperationResult()
        data.site = sites.find(({ code }) => code === data.siteCode)
        data.sales = Number(data.sales)
        data.workers = {}
        data.workersQualified = {}
        data.workers.normal = Number(data.workersNormal)
        data.workers.half = Number(data.workersHalf)
        data.workers.canceled = Number(data.workersCanceled)
        data.workersQualified.normal = Number(data.workersQualifiedNormal)
        data.workersQualified.half = Number(data.workersQualifiedHalf)
        data.workersQualified.canceled = Number(data.workersQualifiedCanceled)
        const existDoc = existDocs.find(({ code }) => code === data.code)
        if (existDoc) {
          model.initialize({ ...data, docId: existDoc.docId })
          promises.push(model.update())
        } else {
          model.initialize(data)
          promises.push(model.create())
        }
      }
      await Promise.all(promises)
    },
  },
}
</script>

<style></style>
