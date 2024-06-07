<script>
import { collection, getDocs, query, where } from 'firebase/firestore'
import GAutocomplete from './GAutocomplete.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GAutocomplete },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    cacheItems: { type: Boolean, default: true, required: false },
    itemText: {
      type: [String, Array, Function],
      default: 'abbr',
      required: false,
    },
    itemValue: {
      type: [String, Array, Function],
      default: 'docId',
      required: false,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      model: this.$Customer(),
      items: [],
      lazySearch: null,
      loading: false,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    '$attrs.value': {
      async handler(newVal, oldVal) {
        if (!newVal || newVal === oldVal) return
        const addItem = (item) => {
          if (!this.items.some(({ docId }) => docId === item.docId)) {
            this.items.push(item)
          }
        }
        /* newVal is Array */
        if (Array.isArray(newVal)) {
          if (!newVal.length) return
          /* element is object */
          if (typeof newVal[0] === 'object') {
            newVal.forEach(addItem)
          } else {
            /* element is not object */
            const uniqueIds = [...new Set(newVal.map((docId) => docId))].filter(
              (docId) => !this.items.some((item) => item.docId === docId)
            )
            if (!uniqueIds.length) return
            this.loading = true
            try {
              const chunkedIds = uniqueIds.flatMap((_, i, a) =>
                i % 30 ? [] : [a.slice(i, i + 30)]
              )
              const promises = chunkedIds.map(async (ids) => {
                const colRef = collection(
                  this.$firestore,
                  this.model.collection
                )
                const q = query(colRef, where('docId', 'in', ids))
                const querySnapshot = await getDocs(q)
                return querySnapshot.docs.map((doc) => doc.data())
              })
              const querySnapshots = await Promise.all(promises)
              querySnapshots.forEach((data) => this.items.push(...data))
            } catch (err) {
              // eslint-disable-next-line
              console.error(err)
              alert(err.message)
            } finally {
              this.loading = false
            }
          }
        } else if (typeof newVal === 'object') {
          /* newVal is Object */
          addItem(newVal)
        } else if (typeof newVal === 'string') {
          /* newVal is String */
          if (!this.items.some((item) => item.docId === newVal)) {
            const item = await this.model.fetchDoc(newVal)
            this.items.push(item)
          }
        }
      },
      immediate: true,
    },
    lazySearch: {
      async handler(newVal, oldVal) {
        if (!newVal || newVal === oldVal) return
        this.items.splice(0)
        this.loading = true
        try {
          this.items = await this.model.fetchDocs(newVal)
        } catch (err) {
          // eslint-disable-next-line
          console.error(err)
          alert(err.message)
        } finally {
          this.loading = false
        }
      },
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <g-autocomplete
    v-bind="{ ...$props, ...$attrs }"
    :items="items"
    :lazy-search.sync="lazySearch"
    :loading="loading"
    v-on="$listeners"
  >
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
  </g-autocomplete>
</template>

<style></style>
