<template>
  <a-text-field-search
    :value="internalValue"
    :loading="loading"
    @input="internalValue = $event"
  />
</template>

<script>
import {
  collectionGroup,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import ATextFieldSearch from '../atoms/inputs/ATextFieldSearch.vue'
export default {
  components: { ATextFieldSearch },
  props: {
    collectionId: { type: String, required: true },
    items: { type: Array, default: () => [], required: false },
    value: { type: [String, Object], default: null, required: false },
  },
  data() {
    return {
      internalItems: [],
      lazyValue: null,
      loading: false,
      timerId: null,
    }
  },
  computed: {
    internalValue: {
      get() {
        return this.lazyValue
      },
      set(v) {
        this.lazyValue = v
        this.$emit('input', v)
      },
    },
    grams() {
      if (!this.internalValue) return []
      if (!(typeof this.internalValue === 'string')) return []
      const gramLength = this.internalValue.length === 1 ? 1 : 2
      const searchGrams = Array.from(this.internalValue).reduce(
        (sum, _, index) => {
          if (index > this.internalValue.length - gramLength) return sum
          sum.push(this.internalValue.substring(index, index + gramLength))
          return sum
        },
        []
      )
      const result = [...new Set(searchGrams)]
      return result
    },
  },
  watch: {
    internalValue() {
      clearTimeout(this.timerId)
      this.internalItems.splice(0)
      if (!this.grams.length) return
      this.loading = true
      this.timerId = setTimeout(async () => {
        await this.fetch()
        this.loading = false
      }, 500)
    },
    items: {
      handler(v) {
        this.internalItems = v
      },
      immediate: true,
    },
    internalItems(v) {
      this.$emit('update:items', v)
    },
    value: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) this.lazyValue = newVal
      },
      immediate: true,
    },
  },
  methods: {
    async fetch() {
      try {
        const colRef = collectionGroup(this.$firestore, 'TokenMap')
        const wheres = this.grams.map((gram) =>
          where(`tokenMaps.${gram}`, '==', true)
        )
        wheres.push(where('collection', '==', this.collectionId))
        const q = query(colRef, ...wheres)
        const snapshot = await getDocs(q)
        if (snapshot.empty) return
        const promises = snapshot.docs.map((doc) => getDoc(doc.data().parent))
        const fetchedDocSnaps = await Promise.all(promises)
        this.internalItems = fetchedDocSnaps.map((doc) => doc.data())
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<style></style>
