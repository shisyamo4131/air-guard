<template>
  <g-template-default label="import">
    <v-container>
      <v-card>
        <v-card-title>import</v-card-title>
        <v-card-text> Click the submit button and import data. </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="submit" @click="submit">submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import { doc, setDoc } from 'firebase/firestore'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import customers from '~/assets/customers.json'
import employees from '~/assets/employees.json'
import sites from '~/assets/sites.json'
export default {
  components: { GTemplateDefault },
  data() {
    return {
      customers,
      employees,
      sites,
    }
  },
  methods: {
    submit() {
      this.importCustomers()
      this.importEmployees()
      this.importSites()
    },
    async importCustomers() {
      const promises = []
      this.customers.forEach((item) => {
        const docRef = doc(this.$firestore, `AirGuardCustomers/${item.code}`)
        promises.push(setDoc(docRef, { ...item }, { merge: true }))
      })
      await Promise.all(promises)
    },
    async importEmployees() {
      const promises = []
      this.employees.forEach((item) => {
        const docRef = doc(this.$firestore, `AirGuardEmployees/${item.code}`)
        promises.push(setDoc(docRef, { ...item }, { merge: true }))
      })
      await Promise.all(promises)
    },
    async importSites() {
      const promises = []
      this.sites.forEach((item) => {
        const docRef = doc(this.$firestore, `AirGuardSites/${item.code}`)
        promises.push(setDoc(docRef, { ...item }, { merge: true }))
      })
      await Promise.all(promises)
    },
  },
}
</script>

<style></style>
