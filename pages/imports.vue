<template>
  <g-template-default label="import">
    <template #default>
      <v-container fluid>
        <v-card>
          <v-card-title>import</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="2">
                <v-form ref="form">
                  <a-select
                    v-model="selectedCollection"
                    :items="collections"
                    label="collection"
                    required
                  />
                  <v-file-input
                    v-model="file"
                    label="file"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'required.']"
                  />
                </v-form>
              </v-col>
              <v-col cols="10">
                <v-data-table :headers="headers" :items="csvData" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="primary" @click="submit">submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </template>
  </g-template-default>
</template>

<script>
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import ASelect from '~/components/atoms/inputs/ASelect.vue'
export default {
  components: { GTemplateDefault, ASelect },
  data() {
    return {
      selectedCollection: null,
      collections: ['Customers', 'Sites', 'Employees'],
      file: null,
      csvData: [],
    }
  },
  computed: {
    headers() {
      if (!this.csvData.length) return []
      const result = Object.keys(this.csvData[0]).map((key) => {
        return { text: key, value: key }
      })
      return result
    },
  },
  watch: {
    async file(v) {
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
    submit() {
      this[`import${this.selectedCollection}`]()
    },
    async importCustomers() {
      if (
        this.$store.getters['masters/Customers'].filter(({ code }) => !code)
          .length
      ) {
        throw new Error('関連付けが行われていない取引先があります。')
      }
      const notExistData = this.csvData.filter((item) => {
        return !this.$store.getters['masters/Customers'].some(
          ({ code }) => code === item.code
        )
      })
      const promises = []
      for (const item of notExistData) {
        const model = this.$Customer(item)
        promises.push(model.create())
      }
      await Promise.all(promises)
    },
    async importEmployees() {
      if (
        this.$store.getters['masters/Employees'].filter(({ code }) => !code)
          .length
      ) {
        throw new Error('関連付けが行われていない従業員があります。')
      }
      const notExistData = this.csvData.filter((item) => {
        return !this.$store.getters['masters/Employees'].some(
          ({ code }) => code === item.code
        )
      })
      const promises = []
      for (const item of notExistData) {
        const model = this.$Employee(item)
        promises.push(model.create())
      }
      await Promise.all(promises)
    },
    async importSites() {
      if (
        this.$store.getters['masters/Sites'].filter(({ code }) => !code).length
      ) {
        throw new Error('関連付けが行われていない現場があります。')
      }
      const notExistData = this.csvData
        .filter((item) => {
          return !this.$store.getters['masters/Sites'].some(
            ({ code }) => code === item.code
          )
        })
        .map((item) => {
          const customer = this.$store.getters['masters/Customers'].find(
            ({ code }) => code === item.customerCode
          )
          if (customer) item.customerId = customer.docId
          return item
        })
        .filter(({ customerId }) => !!customerId)
      // notExistData.forEach((item) => {
      //   const customer = this.$store.getters['masters/Customers'].find(
      //     ({ code }) => code === item.customerCode
      //   )
      //   if (customer) item.customerId = customer.docId
      // })
      this.$store.dispatch('masters/unsubscribe')
      const promises = []
      let counter = 0
      for (const item of notExistData) {
        const model = this.$Site(item)
        promises.push(model.create())
        counter++
        if (counter === 50) {
          await Promise.all(promises)
          promises.splice(0)
          counter = 0
        }
      }
      await Promise.all(promises)
      this.$store.dispatch('masters/subscribe')
    },
  },
}
</script>

<style></style>
