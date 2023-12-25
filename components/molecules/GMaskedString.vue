<template>
  <span>
    {{ beforeText }}<span :class="className">{{ lineText }}</span
    >{{ afterText }}
  </span>
</template>

<script>
export default {
  props: {
    className: { type: String, default: 'v-list-item__mask', required: false },
    search: { type: [String, Object], default: null, required: false },
    value: { type: String, default: undefined, reuqired: false },
  },
  computed: {
    beforeText() {
      if (!this.search) return this.value
      const index = this.value.indexOf(this.search)
      if (index !== -1) {
        return this.value.substring(0, index)
      }
      return this.value
    },
    afterText() {
      if (!this.search || !this.value) return ''
      const index = this.value.indexOf(this.search)
      if (index !== -1) {
        return this.value.substring(index + this.search.length)
      }
      return ''
    },
    lineText() {
      if (!this.search || !this.value) return ''
      const index = this.value.indexOf(this.search)
      if (index !== -1) {
        return this.value.substring(index, index + this.search.length)
      }
      return ''
    },
  },
}
</script>

<style></style>
