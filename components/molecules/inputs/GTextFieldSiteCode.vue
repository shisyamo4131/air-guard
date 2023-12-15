<template>
  <a-text-field
    v-bind="$attrs"
    :error-messages="errorMessages"
    :loading="loading"
    :hint="hint"
    persistent-hint
    :value="value"
    :append-outer-icon="fetchedItem ? 'mdi-content-copy' : ''"
    v-on="$listeners"
  >
    <template #prepend>
      <v-tooltip top>
        <template #activator="{ attrs, on }">
          <v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon>
        </template>
        <span>
          現場のCODEを登録すると、<br />MS-Access版AirGuardの現場情報と同期されます。
        </span>
      </v-tooltip>
    </template>
  </a-text-field>
</template>

<script>
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
export default {
  components: { ATextField },
  props: {
    value: { type: undefined, default: null, required: false },
  },
  data() {
    return {
      fetchedItem: null,
      loading: false,
      timeId: null,
    }
  },
  computed: {
    errorMessages() {
      if (!this.value) return ''
      if (this.loading) return 'CODEをチェックしています...'
      return this.fetchedItem ? '' : '存在しないCODEです。'
    },
    hint() {
      if (!this.fetchedItem) return 'AirGuardの現場CODEを入力してください。'
      return `${this.fetchedItem.name}と一致しました。`
    },
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.fetchedItem = null
        if (!newVal || newVal === oldVal) return
        this.loading = true
        clearTimeout(this.timeId)
        this.timeId = setTimeout(async () => {
          await this.fetchItem()
          this.loading = false
        }, 500)
      },
      immediate: true,
    },
  },
  methods: {
    async fetchItem() {
      const docRef = doc(this.$firestore, `AirGuardSites/${this.value}`)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        const customerCode = snapshot.data().customerCode
        const customerId = await this.fetchCustomer(customerCode)
        if (!customerId) return
        this.fetchedItem = { ...snapshot.data(), customerId }
      }
    },
    async fetchCustomer(code) {
      const colRef = collection(this.$firestore, 'Customers')
      const q = query(colRef, where('code', '==', code), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) return undefined
      return snapshot.docs[0].id
    },
  },
}
</script>

<style></style>
