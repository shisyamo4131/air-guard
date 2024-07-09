<template>
  <v-container>
    <v-btn @click="use">use</v-btn>
    <v-btn @click="noUse">no use</v-btn>
  </v-container>
</template>

<script>
export default {
  methods: {
    use() {
      const model = this.$Customer()
      model.create()
    },
    noUse() {
      const model = this.$Customer()
      model.create({ useAutonum: false })
    },
  },
}
</script>

<style></style>
