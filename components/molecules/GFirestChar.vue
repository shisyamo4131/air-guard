<script>
/**
 * ### GFirstChar
 * @author shisyamo4131
 */
export default {
  props: {
    value: {
      type: undefined,
      default: undefined,
      validator: (v) => {
        if (!v) return true
        return [
          '全',
          'ア',
          'カ',
          'サ',
          'タ',
          'ナ',
          'ハ',
          'マ',
          'ヤ',
          'ラ',
          'ワ',
        ].includes(v)
      },
      required: false,
    },
  },
  data() {
    return {
      chars: ['全', 'ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ'],
      lazyValue: null,
    }
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.lazyValue = newVal || '全'
        if (!newVal) this.$emit('input', '全')
      },
      immediate: true,
    },
  },
  methods: {
    onClick(e) {
      this.lazyValue = e
      this.$emit('input', e)
    },
  },
}
</script>

<template>
  <div class="first-charactor text-caption">
    <v-card
      v-for="(item, index) of chars"
      :key="index"
      :color="`${lazyValue === item ? 'blue lighten-5' : ''}`"
      flat
      outlined
      @click="onClick(item)"
    >
      <span>{{ item }}</span>
    </v-card>
  </div>
</template>

<style scoped>
.first-charactor {
  width: 24px;
}

.first-charactor >>> div {
  /* border: 1px solid red; */
  text-align: center;
  color: #2196f3;
}
</style>
