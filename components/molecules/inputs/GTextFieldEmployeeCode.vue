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
          従業員のCODEを登録すると、<br />MS-Access版AirGuardの従業員情報と同期されます。
        </span>
      </v-tooltip>
    </template>
  </a-text-field>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore'
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
      if (!this.fetchedItem) return 'AirGuardの従業員CODEを入力してください。'
      return `${this.fetchedItem.lastName}${this.fetchedItem.firstName}と一致しました。`
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
      const docRef = doc(this.$firestore, `AirGuardEmployees/${this.value}`)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) this.fetchedItem = snapshot.data()
    },
  },
}
</script>

<style></style>
