<template>
  <div style="display: flex; width: 100%">
    <span
      class="mr-2"
      :style="{ minWidth: `${width}px`, maxWidth: `${width}px` }"
    >
      <a-text-field
        v-bind="$attrs"
        :value="code"
        class="center-input"
        :error-messages="internalErrorMessages"
        label="code"
        v-on="listeners"
      />
    </span>
    <div
      class="d-flex align-center"
      style="height: 40px; width: 100%; overflow: hidden"
    >
      <div v-if="!loading" class="text-truncate">
        {{ model.abbr }}
      </div>
      <v-icon v-else>mdi-loading mdi-spin</v-icon>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import ATextField from '~/components/atoms/inputs/ATextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { ATextField },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    width: { type: [String, Number], default: 84, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      cache: [],
      code: null,
      loading: false,
      errorMessages: [],
      model: this.$Customer(),
    }
  },
  computed: {
    internalErrorMessages() {
      if (this.loading) return ['検索中']
      return this.errorMessages
    },
    listeners() {
      return {
        ...this.$listeners,
        input: ($event) => {
          this.code = $event
        },
        change: async ($event) => {
          this.errorMessages.splice(0)
          this.code = $event ? this.formatCode($event) : ''
          await this.fetchByCode(this.code)
          this.$emit('input', this.model.docId)
          if (this.code && !this.model.docId) {
            this.errorMessages.push('該当なし')
          }
          this.$emit('change', this.model.docId)
        },
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * value (= docId) が変更された際の処理です。
     * 変更前後で値に変化があった場合、fetchByDocId() をコールします。
     * ドキュメントの取得に成功した場合、data.code が model.code に更新されます。
     */
    '$attrs.value': {
      async handler(newVal, oldVal) {
        if (newVal === oldVal) return
        await this.fetchByDocId(newVal)
        if (this.model.docId) this.code = this.model.code
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * data.model を強制的に初期化し、指定された code で ドキュメントを読み込み、
     * 結果にもとづいて data.model を初期化します。
     * code が有効な値でない場合、ドキュメントの読み込みは行われません。
     */
    async fetchByCode(code) {
      this.model.initialize()
      if (!code) return
      this.loading = true
      const colRef = collection(this.$firestore, 'Customers')
      const q = query(colRef, where('code', '==', code))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        this.model.initialize(snapshot.docs[0].data())
      }
      this.loading = false
    },
    /**
     * data.model を強制的に初期化し、指定された docId で data.model.fetch() をコールします。
     * docId が有効な値でない場合、data.model.fetch() はコールされません。
     */
    async fetchByDocId(docId) {
      this.model.initialize()
      if (!docId) return
      this.loading = true
      await this.model.fetch(docId)
      this.loading = false
    },
    /**
     * 引数で受け取った値を既定の桁数で0埋めして返します。
     */
    formatCode(inputString) {
      return (Array(4).join('0') + (inputString || '0')).slice(-4)
    },
  },
}
</script>

<style></style>
