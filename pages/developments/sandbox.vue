<template>
  <div><v-btn @click="test">test</v-btn></div>
</template>

<script>
import System from '~/models/System'
export default {
  data() {
    return {
      instance: new System(),
    }
  },
  methods: {
    async test() {
      await this.instance.fetch('System')
      console.log(this.instance.toObject())
    },
  },
}
</script>

<style></style>
